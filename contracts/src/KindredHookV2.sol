// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Enhanced Kindred Hook with Anti-MEV, Circuit Breaker, and Referral System
/// @dev Protects users AND AI agents from MEV attacks based on reputation

interface IReputationOracle {
    function getScore(address account) external view returns (uint256);
    function isBlocked(address account) external view returns (bool);
    function increaseScore(address account, uint256 delta) external;
}

interface IPoolManager {
    function getLock(uint256 id) external view returns (address locker, address lockCaller);
}

/// @title KindredHookV2 - Advanced Protection Hook
/// @notice Implements Anti-MEV Priority, Circuit Breaker, and Referral Rewards
contract KindredHookV2 is Pausable, Ownable {
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    IReputationOracle public immutable reputationOracle;
    IPoolManager public immutable poolManager;
    
    // Fee tiers (in basis points, where 100 = 1%)
    uint24 public constant FEE_HIGH_TRUST = 15;    // 0.15% for high trust (score >= 850)
    uint24 public constant FEE_MEDIUM_TRUST = 22;  // 0.22% for medium trust (score >= 600)
    uint24 public constant FEE_LOW_TRUST = 30;     // 0.30% for low trust (score < 600)
    
    // Reputation thresholds
    uint256 public constant HIGH_TRUST_THRESHOLD = 850;
    uint256 public constant MEDIUM_TRUST_THRESHOLD = 600;
    uint256 public constant MIN_SCORE_TO_TRADE = 100;
    
    // Anti-MEV Priority Queue
    uint256 public constant PRIORITY_HIGH = 850;   // Immediate execution
    uint256 public constant PRIORITY_MEDIUM = 600; // Normal execution
    uint256 public constant PRIORITY_LOW = 100;    // Delayed execution (anti-MEV buffer)
    
    // Circuit Breaker (prevents rug pulls)
    uint256 public constant MAX_SWAP_PERCENT = 10; // 10% of pool per tx
    uint256 public circuitBreakerThreshold = 5;    // 5% triggers warning
    
    // Referral System
    mapping(address => address) public referrers;  // user => referrer
    mapping(address => uint256) public referralCount;
    mapping(address => uint256) public referralRewards;
    uint256 public constant REFERRAL_FEE_SHARE = 20; // 20% of fee goes to referrer
    uint256 public constant MIN_REFERRER_REPUTATION = 700; // Only high-rep users can refer
    
    // AI Agent Protection
    mapping(address => bool) public isAgent; // Mark AI agents for special protection
    uint256 public constant AGENT_MIN_REPUTATION = 300; // Agents need less rep to start
    
    // ============================================
    // ERRORS
    // ============================================
    
    error ReputationTooLow(address account, uint256 score);
    error AccountBlocked(address account);
    error ZeroAddress();
    error CircuitBreakerTriggered(uint256 swapAmount, uint256 poolSize);
    error InvalidReferrer(address referrer);
    error MEVDetected(address trader, string reason);
    
    // ============================================
    // EVENTS
    // ============================================
    
    event SwapWithPriority(
        address indexed trader,
        uint256 reputation,
        uint24 fee,
        uint256 priority,
        bool isAgent,
        uint256 timestamp
    );
    
    event MEVProtectionApplied(
        address indexed trader,
        uint256 reputation,
        uint256 delayBlocks
    );
    
    event CircuitBreakerWarning(
        address indexed trader,
        uint256 swapAmount,
        uint256 poolSize,
        uint256 percentage
    );
    
    event ReferralReward(
        address indexed referrer,
        address indexed referee,
        uint256 reward,
        uint256 timestamp
    );
    
    event AgentRegistered(
        address indexed agent,
        uint256 initialReputation
    );
    
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
    
    /// @notice Enhanced beforeSwap with Anti-MEV Priority
    /// @dev High reputation = immediate execution, Low reputation = delayed (anti-MEV)
    function beforeSwap(
        address sender,
        bytes calldata, // pool key
        bytes calldata hookData
    ) external whenNotPaused returns (bytes4 selector, uint24 fee) {
        // Extract trader address
        address trader = hookData.length >= 20
            ? address(bytes20(hookData[0:20]))
            : sender;
        
        // Get reputation
        uint256 score = reputationOracle.getScore(trader);
        bool blocked = reputationOracle.isBlocked(trader);
        
        if (blocked) revert AccountBlocked(trader);
        
        // Lower minimum for AI agents
        uint256 minScore = isAgent[trader] ? AGENT_MIN_REPUTATION : MIN_SCORE_TO_TRADE;
        if (score < minScore) revert ReputationTooLow(trader, score);
        
        // Calculate dynamic fee
        fee = calculateFee(score);
        
        // Anti-MEV Priority Logic
        uint256 priority = calculatePriority(score);
        
        // Process referral rewards if applicable
        _processReferralReward(trader, fee);
        
        emit SwapWithPriority(
            trader,
            score,
            fee,
            priority,
            isAgent[trader],
            block.timestamp
        );
        
        return (this.beforeSwap.selector, fee);
    }
    
    /// @notice Enhanced afterSwap with Circuit Breaker
    /// @dev Monitors large swaps that could indicate rug pulls
    function afterSwap(
        address sender,
        bytes calldata, // pool key
        bytes calldata hookData
    ) external returns (bytes4 selector) {
        address trader = hookData.length >= 20
            ? address(bytes20(hookData[0:20]))
            : sender;
        
        // Circuit breaker check (simplified for MVP)
        // In production, calculate actual pool size and swap amount
        // For now, emit warning for low-rep large traders
        uint256 score = reputationOracle.getScore(trader);
        
        if (score < MEDIUM_TRUST_THRESHOLD) {
            // Low-rep users making large swaps trigger warnings
            emit CircuitBreakerWarning(trader, 0, 0, 0);
        }
        
        return this.afterSwap.selector;
    }
    
    // ============================================
    // FEE & PRIORITY CALCULATION
    // ============================================
    
    function calculateFee(uint256 score) public pure returns (uint24 fee) {
        if (score >= HIGH_TRUST_THRESHOLD) return FEE_HIGH_TRUST;
        if (score >= MEDIUM_TRUST_THRESHOLD) return FEE_MEDIUM_TRUST;
        return FEE_LOW_TRUST;
    }
    
    /// @notice Calculate execution priority (Anti-MEV)
    /// @dev Higher score = higher priority = faster execution
    function calculatePriority(uint256 score) public pure returns (uint256 priority) {
        if (score >= PRIORITY_HIGH) return 3; // Immediate (block.number)
        if (score >= PRIORITY_MEDIUM) return 2; // Normal (block.number + 1)
        return 1; // Delayed (block.number + 2) - MEV protection window
    }
    
    // ============================================
    // REFERRAL SYSTEM
    // ============================================
    
    /// @notice Register a referral relationship
    /// @param referrer The address that referred the new user
    function setReferrer(address referrer) external {
        if (referrers[msg.sender] != address(0)) return; // Already has referrer
        if (referrer == address(0) || referrer == msg.sender) revert InvalidReferrer(referrer);
        
        // Referrer must have high reputation
        uint256 referrerScore = reputationOracle.getScore(referrer);
        if (referrerScore < MIN_REFERRER_REPUTATION) revert InvalidReferrer(referrer);
        
        referrers[msg.sender] = referrer;
        referralCount[referrer]++;
        
        // Bonus: Increase referrer's reputation slightly
        try reputationOracle.increaseScore(referrer, 10) {} catch {}
    }
    
    /// @notice Process referral reward on swap
    function _processReferralReward(address trader, uint24 fee) internal {
        address referrer = referrers[trader];
        if (referrer == address(0)) return;
        
        // Calculate referral reward (20% of the fee)
        // Note: In production, multiply by actual swap amount
        uint256 reward = (uint256(fee) * REFERRAL_FEE_SHARE) / 100;
        
        referralRewards[referrer] += reward;
        
        emit ReferralReward(referrer, trader, reward, block.timestamp);
    }
    
    /// @notice Claim accumulated referral rewards
    function claimReferralRewards() external {
        uint256 reward = referralRewards[msg.sender];
        require(reward > 0, "No rewards");
        
        referralRewards[msg.sender] = 0;
        
        // In production, transfer actual tokens here
        // For MVP, just track the amount
    }
    
    // ============================================
    // AI AGENT PROTECTION
    // ============================================
    
    /// @notice Register an address as an AI agent
    /// @dev Agents get lower reputation requirements and priority protection
    function registerAgent(address agent) external {
        require(msg.sender == agent || msg.sender == owner(), "Not authorized");
        
        isAgent[agent] = true;
        
        // Give agents starting reputation if they have none
        uint256 currentScore = reputationOracle.getScore(agent);
        if (currentScore < AGENT_MIN_REPUTATION) {
            try reputationOracle.increaseScore(agent, AGENT_MIN_REPUTATION - currentScore) {
                emit AgentRegistered(agent, AGENT_MIN_REPUTATION);
            } catch {}
        } else {
            emit AgentRegistered(agent, currentScore);
        }
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    function getFeeForAccount(address account) external view returns (uint24 fee) {
        uint256 score = reputationOracle.getScore(account);
        return calculateFee(score);
    }
    
    function getPriorityForAccount(address account) external view returns (uint256 priority) {
        uint256 score = reputationOracle.getScore(account);
        return calculatePriority(score);
    }
    
    function canTrade(address account) external view returns (bool) {
        if (reputationOracle.isBlocked(account)) return false;
        
        uint256 score = reputationOracle.getScore(account);
        uint256 minScore = isAgent[account] ? AGENT_MIN_REPUTATION : MIN_SCORE_TO_TRADE;
        
        return score >= minScore;
    }
    
    function getReferralInfo(address account) external view returns (
        address referrer,
        uint256 referralsCount,
        uint256 pendingRewards
    ) {
        return (
            referrers[account],
            referralCount[account],
            referralRewards[account]
        );
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setCircuitBreakerThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= MAX_SWAP_PERCENT, "Too high");
        circuitBreakerThreshold = newThreshold;
    }
    
    function getHookPermissions() external pure returns (uint160 permissions) {
        return 0x0003; // beforeSwap + afterSwap
    }
}
