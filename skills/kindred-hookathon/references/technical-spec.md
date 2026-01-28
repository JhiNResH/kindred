# Kindred Technical Specification

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Polygon Network                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Kindred Protocol                     │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │   Vault     │  │ Kindred    │  │  Oracle     │    │ │
│  │  │  Contract   │  │   Hook     │  │  Contract   │    │ │
│  │  │             │  │   (v4)     │  │             │    │ │
│  │  │ - deposits  │  │ - before   │  │ - prices    │    │ │
│  │  │ - borrows   │  │ - after    │  │ - update    │    │ │
│  │  │ - liquidate │  │ - account  │  │ - twap      │    │ │
│  │  └──────┬──────┘  └──────┬─────┘  └──────┬──────┘    │ │
│  │         │                │               │            │ │
│  │         └────────────────┼───────────────┘            │ │
│  │                          │                            │ │
│  └──────────────────────────┼────────────────────────────┘ │
│                             │                              │
│  ┌──────────────────────────┼──────────────────────────┐  │
│  │                          ▼                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │  Uniswap    │  │ Polymarket  │  │    Aave     │ │  │
│  │  │  v4 Pool    │  │    CTF      │  │  (Future)   │ │  │
│  │  │  Manager    │  │  Exchange   │  │             │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │              External Protocols                     │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Contract Interfaces

### KindredVault.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKindredVault {
    // Events
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Liquidate(address indexed liquidator, address indexed user, uint256 collateralSeized, uint256 debtRepaid);

    // User functions
    function depositCollateral(address token, uint256 amount) external;
    function withdrawCollateral(address token, uint256 amount) external;
    function borrow(uint256 amount) external;
    function repay(uint256 amount) external;
    
    // View functions
    function getCollateralValue(address user) external view returns (uint256);
    function getDebtValue(address user) external view returns (uint256);
    function getHealthFactor(address user) external view returns (uint256);
    function getLTV(address user) external view returns (uint256);
    
    // Liquidation
    function liquidate(address user, uint256 debtToCover) external;
    function isLiquidatable(address user) external view returns (bool);
    
    // Admin
    function setMaxLTV(address token, uint256 ltv) external;
    function setLiquidationThreshold(address token, uint256 threshold) external;
    function addSupportedMarket(bytes32 marketId) external;
    function removeSupportedMarket(bytes32 marketId) external;
}
```

### KindredHook.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/BaseHook.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/types/BeforeSwapDelta.sol";

contract KindredHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    
    IKindredVault public vault;
    IKindredOracle public oracle;
    
    constructor(
        IPoolManager _poolManager,
        IKindredVault _vault,
        IKindredOracle _oracle
    ) BaseHook(_poolManager) {
        vault = _vault;
        oracle = _oracle;
    }
    
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: true,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }
    
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        // Decode user from hookData
        address user = abi.decode(hookData, (address));
        
        // Check if this is a collateralized swap
        if (vault.hasCollateral(user)) {
            // Calculate new position value after swap
            uint256 currentDebt = vault.getDebtValue(user);
            uint256 collateralValue = vault.getCollateralValue(user);
            
            // Get swap impact on position
            uint256 swapValue = _calculateSwapValue(params, key);
            uint256 newPositionValue = currentDebt + swapValue;
            
            // Check LTV
            uint256 maxLTV = vault.getMaxLTV(address(key.currency0));
            uint256 newLTV = (newPositionValue * 1e18) / collateralValue;
            
            require(newLTV <= maxLTV, "KindredHook: Insufficient collateral");
        }
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
    
    function _afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        address user = abi.decode(hookData, (address));
        
        // Update user position in vault
        vault.updatePosition(user, delta);
        
        // Check for liquidation opportunity
        if (vault.isLiquidatable(user)) {
            emit LiquidationWarning(user, vault.getHealthFactor(user));
        }
        
        return (BaseHook.afterSwap.selector, 0);
    }
    
    function _beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4) {
        // Validate LP deposit meets requirements
        return BaseHook.beforeAddLiquidity.selector;
    }
}
```

### KindredOracle.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKindredOracle {
    // Get current price of prediction token
    function getPrice(bytes32 marketId, bool isYes) external view returns (uint256);
    
    // Get TWAP price
    function getTWAP(bytes32 marketId, bool isYes, uint32 period) external view returns (uint256);
    
    // Update price (called by relayer or internally)
    function updatePrice(bytes32 marketId, uint256 yesPrice, uint256 noPrice) external;
    
    // Get market info
    function getMarketInfo(bytes32 marketId) external view returns (
        uint256 yesPrice,
        uint256 noPrice,
        uint256 lastUpdate,
        uint256 settlementTime,
        bool isSettled
    );
}

contract KindredOracle is IKindredOracle {
    struct MarketData {
        uint256 yesPrice;
        uint256 noPrice;
        uint256 lastUpdate;
        uint256 settlementTime;
        bool isSettled;
        uint256[] priceHistory;
        uint256[] timestamps;
    }
    
    mapping(bytes32 => MarketData) public markets;
    address public relayer;
    
    // For MVP: Read from Polymarket's last trade price
    IPolymarketCTF public polymarket;
    
    constructor(address _polymarket) {
        polymarket = IPolymarketCTF(_polymarket);
    }
    
    function getPrice(bytes32 marketId, bool isYes) external view returns (uint256) {
        // Option 1: Use cached price
        // return isYes ? markets[marketId].yesPrice : markets[marketId].noPrice;
        
        // Option 2: Read directly from Polymarket (more accurate, more gas)
        return polymarket.getLastTradePrice(marketId, isYes);
    }
    
    function getTWAP(bytes32 marketId, bool isYes, uint32 period) external view returns (uint256) {
        MarketData storage market = markets[marketId];
        require(market.priceHistory.length > 0, "No price history");
        
        uint256 sum = 0;
        uint256 count = 0;
        uint256 cutoff = block.timestamp - period;
        
        for (uint i = market.timestamps.length; i > 0; i--) {
            if (market.timestamps[i-1] < cutoff) break;
            sum += market.priceHistory[i-1];
            count++;
        }
        
        return count > 0 ? sum / count : market.yesPrice;
    }
}
```

## Polymarket Integration

### CTF Contract Interface

```solidity
interface IConditionalTokens {
    // Split collateral into conditional tokens
    function splitPosition(
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint[] calldata partition,
        uint amount
    ) external;
    
    // Merge conditional tokens back to collateral
    function mergePositions(
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint[] calldata partition,
        uint amount
    ) external;
    
    // Redeem winning positions after settlement
    function redeemPositions(
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint[] calldata indexSets
    ) external;
    
    // Get balance of conditional tokens
    function balanceOf(address owner, uint256 positionId) external view returns (uint256);
}
```

### Polymarket Contract Addresses (Polygon)

```
ConditionalTokens: 0x4D97DCd97eC945f40cF65F87097ACe5EA0476045
CTFExchange: 0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E
NegRiskAdapter: 0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296
NegRiskCtfExchange: 0xC5d563A36AE78145C45a50134d48A1215220f80a
USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

## Supported Collateral Types

### MVP (Phase 1)

| Token | Type | LTV | Liquidation Threshold |
|-------|------|-----|----------------------|
| kYES | Prediction YES | 40% | 50% |
| kNO | Prediction NO | 40% | 50% |

### Future (Phase 2)

| Token | Type | LTV | Liquidation Threshold |
|-------|------|-----|----------------------|
| ETH | Native | 70% | 80% |
| WETH | Wrapped | 70% | 80% |
| stETH | LST | 65% | 75% |
| USDC | Stablecoin | 80% | 85% |

## Liquidation Mechanism

### Health Factor Calculation

```
Health Factor = (Collateral Value × Liquidation Threshold) / Debt Value

Health Factor > 1: Safe
Health Factor = 1: At liquidation threshold
Health Factor < 1: Liquidatable
```

### Liquidation Process

```solidity
function liquidate(address user, uint256 debtToCover) external {
    require(isLiquidatable(user), "Not liquidatable");
    
    // Calculate collateral to seize (with bonus)
    uint256 collateralToSeize = (debtToCover * (100 + LIQUIDATION_BONUS)) / 100;
    collateralToSeize = collateralToSeize * 1e18 / oracle.getPrice(collateralToken);
    
    // Transfer debt from liquidator
    USDC.transferFrom(msg.sender, address(this), debtToCover);
    
    // Transfer collateral to liquidator
    collateralToken.transfer(msg.sender, collateralToSeize);
    
    // Update user's debt
    userDebt[user] -= debtToCover;
    userCollateral[user] -= collateralToSeize;
    
    emit Liquidate(msg.sender, user, collateralToSeize, debtToCover);
}
```

### Liquidation Incentives

- **Liquidation Bonus:** 5-10% of seized collateral
- **Gas Compensation:** Protocol covers gas for small liquidations
- **Partial Liquidations:** Allow liquidating portion of position

## Testing Strategy

### Unit Tests

```solidity
// Test collateral deposit
function testDepositCollateral() public {
    uint256 amount = 100e18;
    kYES.approve(address(vault), amount);
    vault.depositCollateral(address(kYES), amount);
    
    assertEq(vault.getCollateralValue(address(this)), amount * oracle.getPrice());
}

// Test borrow
function testBorrow() public {
    // Deposit collateral first
    vault.depositCollateral(address(kYES), 100e18);
    
    // Borrow within LTV
    uint256 borrowAmount = 30e6; // 30 USDC
    vault.borrow(borrowAmount);
    
    assertEq(vault.getDebtValue(address(this)), borrowAmount);
}

// Test liquidation
function testLiquidation() public {
    // Setup position
    vault.depositCollateral(address(kYES), 100e18);
    vault.borrow(40e6);
    
    // Drop price
    oracle.setPrice(address(kYES), 0.3e18); // 50% drop
    
    // Should be liquidatable
    assertTrue(vault.isLiquidatable(address(this)));
    
    // Liquidate
    vm.prank(liquidator);
    vault.liquidate(address(this), 20e6);
}
```

### Integration Tests

1. Full flow: Deposit → Borrow → Repay → Withdraw
2. Hook integration with v4 Pool
3. Oracle price updates
4. Multi-user scenarios
5. Edge cases: settlement approaching, extreme price moves

## Deployment Plan

### Testnet (Polygon Mumbai)

1. Deploy Oracle contract
2. Deploy Vault contract
3. Deploy Hook contract
4. Register Hook with v4 PoolManager
5. Initialize test pool
6. Run integration tests

### Mainnet (Polygon)

1. Audit (optional for hackathon)
2. Deploy with conservative parameters
3. Whitelist initial markets
4. Set low initial caps
5. Gradual parameter relaxation

## Gas Optimization

### Storage Patterns

- Pack related variables in same slot
- Use mappings over arrays where possible
- Cache storage reads in memory

### Hook Efficiency

- Minimize computation in hooks
- Use view functions for checks
- Batch operations where possible

## Security Considerations

1. **Reentrancy:** Use checks-effects-interactions, ReentrancyGuard
2. **Oracle Manipulation:** TWAP, multiple sources
3. **Flash Loan Attacks:** Time-weighted checks
4. **Overflow/Underflow:** Solidity 0.8+ built-in
5. **Access Control:** OpenZeppelin Ownable/AccessControl
