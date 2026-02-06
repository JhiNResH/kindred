// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Minimal Uniswap v4 Hook interfaces for Kindred MVP
/// @dev In production, replace with: import {BaseHook} from "@uniswap/v4-periphery/src/base/hooks/BaseHook.sol";

interface IReputationOracle {
    function getScore(address account) external view returns (uint256);
    function isBlocked(address account) external view returns (bool);
}

interface IPoolManager {
    function getLock(uint256 id) external view returns (address locker, address lockCaller);
}

/// @title KindredHook - Reputation-based Dynamic Fee Hook for Uniswap v4
/// @notice Implements dynamic swap fees based on user reputation scores
/// @dev This is an MVP version with manual v4 interfaces. Production should use official v4 imports.
contract KindredHook is Pausable, Ownable {
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    IReputationOracle public immutable reputationOracle;
    IPoolManager public immutable poolManager;
    
    // Fee tiers (in basis points, where 100 = 1%)
    uint24 public constant FEE_HIGH_TRUST = 15;    // 0.15% for high trust users (score >= 850)
    uint24 public constant FEE_MEDIUM_TRUST = 22;  // 0.22% for medium trust users (score >= 600)
    uint24 public constant FEE_LOW_TRUST = 30;     // 0.30% for low trust users (score < 600)
    
    // Reputation score thresholds
    uint256 public constant HIGH_TRUST_THRESHOLD = 850;
    uint256 public constant MEDIUM_TRUST_THRESHOLD = 600;
    uint256 public constant MIN_SCORE_TO_TRADE = 100;
    
    // ============================================
    // ERRORS
    // ============================================
    
    error ReputationTooLow(address account, uint256 score);
    error AccountBlocked(address account);
    error ZeroAddress();
    error HookPaused();
    error OracleFailure();
    
    // ============================================
    // EVENTS
    // ============================================
    
    event SwapWithReputation(
        address indexed trader,
        uint256 reputationScore,
        uint24 feeApplied,
        uint256 timestamp
    );
    
    event TradeBlocked(
        address indexed trader,
        uint256 reputationScore,
        string reason
    );
    
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor(
        address _reputationOracle,
        address _poolManager
    ) Ownable(msg.sender) {
        if (_reputationOracle == address(0)) revert ZeroAddress();
        if (_poolManager == address(0)) revert ZeroAddress();
        
        reputationOracle = IReputationOracle(_reputationOracle);
        poolManager = IPoolManager(_poolManager);
    }
    
    // ============================================
    // HOOK CALLBACKS (Uniswap v4 Interface)
    // ============================================
    
    /// @notice Called before a swap is executed
    /// @dev This is where we validate trader reputation and determine fee
    /// @param sender The address initiating the swap (may be router)
    /// @param hookData Optional data passed by caller (can contain actual trader address)
    /// @return selector The function selector to confirm execution
    /// @return fee The dynamic fee to apply based on reputation
    function beforeSwap(
        address sender,
        bytes calldata, // key (pool key, not needed for reputation check)
        bytes calldata hookData
    ) external whenNotPaused returns (bytes4 selector, uint24 fee) {
        // Extract actual trader address (router may pass it in hookData)
        address trader = hookData.length >= 20
            ? address(bytes20(hookData[0:20]))
            : sender;
        
        // Get reputation score with error handling
        uint256 score;
        bool isBlocked;
        
        try reputationOracle.getScore(trader) returns (uint256 _score) {
            score = _score;
            
            try reputationOracle.isBlocked(trader) returns (bool _blocked) {
                isBlocked = _blocked;
            } catch {
                // If blocked check fails, treat as not blocked (fail-open for uptime)
                isBlocked = false;
            }
        } catch {
            // Oracle failure: apply highest fee as fallback (fail-safe)
            emit TradeBlocked(trader, 0, "Oracle failure - fallback fee applied");
            return (this.beforeSwap.selector, FEE_LOW_TRUST);
        }
        
        // Block trades if reputation too low or explicitly blocked
        if (isBlocked) {
            emit TradeBlocked(trader, score, "Account blocked by oracle");
            revert AccountBlocked(trader);
        }
        
        if (score < MIN_SCORE_TO_TRADE) {
            emit TradeBlocked(trader, score, "Reputation too low");
            revert ReputationTooLow(trader, score);
        }
        
        // Calculate dynamic fee based on reputation
        fee = calculateFee(score);
        
        // Emit event for monitoring (actual swap details emitted in afterSwap)
        emit SwapWithReputation(trader, score, fee, block.timestamp);
        
        return (this.beforeSwap.selector, fee);
    }
    
    /// @notice Called after a swap is executed
    /// @dev Used for logging and analytics
    /// @param sender The address that initiated the swap
    /// @return selector The function selector to confirm execution
    function afterSwap(
        address sender,
        bytes calldata, // key
        bytes calldata hookData
    ) external view returns (bytes4 selector) {
        // Extract trader for consistent logging
        address trader = hookData.length >= 20
            ? address(bytes20(hookData[0:20]))
            : sender;
        
        // In production, emit detailed swap analytics here
        // For MVP, beforeSwap handles the main event
        
        return this.afterSwap.selector;
    }
    
    // ============================================
    // FEE CALCULATION
    // ============================================
    
    /// @notice Calculate fee tier based on reputation score
    /// @param score The user's reputation score (0-1000)
    /// @return fee The fee in basis points (100 = 1%)
    function calculateFee(uint256 score) public pure returns (uint24 fee) {
        if (score >= HIGH_TRUST_THRESHOLD) {
            return FEE_HIGH_TRUST;      // 0.15% for score >= 850
        } else if (score >= MEDIUM_TRUST_THRESHOLD) {
            return FEE_MEDIUM_TRUST;    // 0.22% for score >= 600
        } else {
            return FEE_LOW_TRUST;       // 0.30% for score < 600
        }
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /// @notice Get the fee that would be applied for an account
    /// @param account The address to check
    /// @return fee The fee in basis points
    function getFeeForAccount(address account) external view returns (uint24 fee) {
        try reputationOracle.getScore(account) returns (uint256 score) {
            return calculateFee(score);
        } catch {
            return FEE_LOW_TRUST; // Fallback fee
        }
    }
    
    /// @notice Check if an account can trade
    /// @param account The address to check
    /// @return allowed True if trading is allowed
    function canTrade(address account) external view returns (bool allowed) {
        try reputationOracle.isBlocked(account) returns (bool blocked) {
            if (blocked) return false;
        } catch {
            // If check fails, assume not blocked
        }
        
        try reputationOracle.getScore(account) returns (uint256 score) {
            return score >= MIN_SCORE_TO_TRADE;
        } catch {
            return false; // Fail closed for canTrade check
        }
    }
    
    /// @notice Validate a trade (used by external integrations)
    /// @param trader The address attempting to trade
    /// @return fee The fee that would be applied
    function validateTrade(address trader) external view returns (uint24 fee) {
        if (reputationOracle.isBlocked(trader)) {
            revert AccountBlocked(trader);
        }
        
        uint256 score = reputationOracle.getScore(trader);
        if (score < MIN_SCORE_TO_TRADE) {
            revert ReputationTooLow(trader, score);
        }
        
        return calculateFee(score);
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /// @notice Pause the hook (emergency stop)
    /// @dev Only owner can pause. Useful if oracle is compromised.
    function pause() external onlyOwner {
        _pause();
    }
    
    /// @notice Unpause the hook
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /// @notice Get hook permissions (for v4 pool initialization)
    /// @return permissions Bitmap of enabled hooks
    function getHookPermissions() external pure returns (uint160 permissions) {
        // beforeSwap: bit 0 (0x0001)
        // afterSwap: bit 1 (0x0002)
        // Total: 0x0003
        return 0x0003;
    }
}
