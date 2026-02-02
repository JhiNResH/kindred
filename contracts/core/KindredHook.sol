// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/base/hooks/BaseHook.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/types/BeforeSwapDelta.sol";
import {IReputationOracle} from "../interfaces/IReputationOracle.sol";

/// @title KindredHook
/// @notice Uniswap v4 Hook that adjusts fees based on reputation scores
/// @dev Implements the trust layer for DeFi - higher reputation = lower fees
contract KindredHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // ============ State ============
    
    /// @notice The reputation oracle contract
    IReputationOracle public immutable reputationOracle;
    
    /// @notice Minimum reputation score required to trade (0-1000)
    uint256 public constant MIN_SCORE_TO_TRADE = 100;
    
    /// @notice Score thresholds for fee tiers
    uint256 public constant ELITE_THRESHOLD = 900;     // 0.1% fee
    uint256 public constant TRUSTED_THRESHOLD = 700;   // 0.2% fee
    uint256 public constant NORMAL_THRESHOLD = 400;    // 0.3% fee
    // Below 400: 0.5% fee (risky)
    // Below 100: blocked
    
    /// @notice Fee rates in basis points (1 bp = 0.01%)
    uint24 public constant FEE_ELITE = 10;      // 0.1%
    uint24 public constant FEE_TRUSTED = 20;    // 0.2%
    uint24 public constant FEE_NORMAL = 30;     // 0.3%
    uint24 public constant FEE_RISKY = 50;      // 0.5%
    
    // ============ Errors ============
    
    error ReputationTooLow(address account, uint256 score);
    error AccountBlocked(address account);
    
    // ============ Events ============
    
    event SwapWithReputation(
        address indexed trader,
        uint256 reputationScore,
        uint24 feeApplied
    );

    // ============ Constructor ============
    
    constructor(
        IPoolManager _poolManager,
        IReputationOracle _reputationOracle
    ) BaseHook(_poolManager) {
        reputationOracle = _reputationOracle;
    }

    // ============ Hook Permissions ============
    
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,           // Check reputation before swap
            afterSwap: true,            // Log swap with reputation
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ============ Hook Implementations ============
    
    /// @notice Called before a swap - checks reputation and determines fee
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        // Get trader address (could be sender or decoded from hookData)
        address trader = sender;
        
        // Check if account is blocked
        if (reputationOracle.isBlocked(trader)) {
            revert AccountBlocked(trader);
        }
        
        // Get reputation score
        uint256 score = reputationOracle.getScore(trader);
        
        // Check minimum score
        if (score < MIN_SCORE_TO_TRADE) {
            revert ReputationTooLow(trader, score);
        }
        
        // Calculate dynamic fee based on reputation
        uint24 fee = _calculateFee(score);
        
        // Return the hook selector, no delta modification, and the fee override
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, fee);
    }
    
    /// @notice Called after a swap - logs the trade with reputation info
    function afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override returns (bytes4, int128) {
        address trader = sender;
        uint256 score = reputationOracle.getScore(trader);
        uint24 fee = _calculateFee(score);
        
        emit SwapWithReputation(trader, score, fee);
        
        return (BaseHook.afterSwap.selector, 0);
    }

    // ============ Internal Functions ============
    
    /// @notice Calculate fee based on reputation score
    /// @param score The reputation score (0-1000)
    /// @return fee The fee in basis points
    function _calculateFee(uint256 score) internal pure returns (uint24) {
        if (score >= ELITE_THRESHOLD) {
            return FEE_ELITE;      // 0.1% for elite
        } else if (score >= TRUSTED_THRESHOLD) {
            return FEE_TRUSTED;    // 0.2% for trusted
        } else if (score >= NORMAL_THRESHOLD) {
            return FEE_NORMAL;     // 0.3% for normal
        } else {
            return FEE_RISKY;      // 0.5% for risky
        }
    }
    
    // ============ View Functions ============
    
    /// @notice Get the fee that would be applied for a given account
    /// @param account The address to check
    /// @return fee The fee in basis points
    function getFeeForAccount(address account) external view returns (uint24) {
        uint256 score = reputationOracle.getScore(account);
        return _calculateFee(score);
    }
    
    /// @notice Check if an account can trade
    /// @param account The address to check
    /// @return canTrade True if account can trade
    function canTrade(address account) external view returns (bool) {
        if (reputationOracle.isBlocked(account)) {
            return false;
        }
        uint256 score = reputationOracle.getScore(account);
        return score >= MIN_SCORE_TO_TRADE;
    }
}
