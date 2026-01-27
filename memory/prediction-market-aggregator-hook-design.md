# 預測市場聚合器 v4 Hook 設計
> 2026-01-27 by Kindred 🐺

## 🎯 專案概念

**一句話**: 用 Uniswap v4 / PancakeSwap Infinity Hook 聚合多個預測市場，提供最優價格和統一流動性

---

## 架構概覽

```
┌─────────────────────────────────────────────────────────────┐
│                    用戶界面 / Frontend                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Prediction Market Aggregator Hook              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    v4 Hook 合約                      │   │
│  │  • beforeSwap: 查詢最優價格                          │   │
│  │  • afterSwap: 執行跨市場套利                         │   │
│  │  • Custom Accounting: 處理不同 token 標準            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Opinion     │ │  Polymarket   │ │    Kalshi     │
│   (BNB)       │ │  (Polygon)    │ │  (Off-chain)  │
│               │ │               │ │               │
│  On-chain     │ │  Cross-chain  │ │  Oracle/API   │
│  Direct call  │ │  via Bridge   │ │  Relayer      │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## 實現策略

### Phase 1: 單鏈版 (BNB Chain) - MVP
**目標**: 3/15 Hookathon 提交

```
PancakeSwap Infinity Pool (BNB Chain)
         │
         ▼
┌─────────────────────────┐
│  Aggregator Hook        │
│  ├─ Opinion Labs 整合   │  ← 直接合約調用
│  └─ Price Oracle        │  ← 鏈下價格 feed
└─────────────────────────┘
```

**核心功能:**
1. 用戶 swap USDC ↔ Prediction Token
2. Hook 查詢 Opinion Labs 價格
3. 比較 pool 價格 vs Opinion 價格
4. 路由到最優價格執行

### Phase 2: 跨鏈版
加入 Polymarket (Polygon) 整合
- LayerZero / Axelar 跨鏈 messaging
- 或者用 intent-based 架構

### Phase 3: 完整聚合器
加入 Kalshi API 整合
- 鏈下 Relayer 監控 Kalshi 價格
- Oracle 上報價格到鏈上

---

## Hook 合約設計

### 核心接口

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";

interface IOpinionMarket {
    function getPrice(bytes32 marketId, bool isYes) external view returns (uint256);
    function buy(bytes32 marketId, bool isYes, uint256 amount) external returns (uint256);
    function sell(bytes32 marketId, bool isYes, uint256 amount) external returns (uint256);
}

contract PredictionAggregatorHook is BaseHook {
    
    // 預測市場 adapters
    IOpinionMarket public opinionMarket;
    
    // 市場 ID 映射
    mapping(address => bytes32) public tokenToMarketId;
    
    // 價格來源 (for off-chain markets like Kalshi)
    mapping(bytes32 => uint256) public oraclePrices;
    
    struct AggregatedQuote {
        uint256 opinionPrice;
        uint256 polymarketPrice;  // via oracle
        uint256 kalshiPrice;      // via oracle
        uint256 poolPrice;
        address bestSource;
        uint256 bestPrice;
    }
    
    constructor(IPoolManager _poolManager, address _opinionMarket) 
        BaseHook(_poolManager) 
    {
        opinionMarket = IOpinionMarket(_opinionMarket);
    }
    
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,      // ⭐ 查詢最優價格
            afterSwap: true,       // ⭐ 執行套利
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: true,  // ⭐ 可能需要修改 swap 金額
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }
    
    /// @notice 在 swap 前查詢所有市場價格
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        
        // 解析 hookData 獲取目標市場
        bytes32 marketId = abi.decode(hookData, (bytes32));
        
        // 聚合價格
        AggregatedQuote memory quote = _getAggregatedQuote(marketId, params);
        
        // 如果外部市場價格更好，可以修改 swap 路由
        // 或者記錄最優價格供 afterSwap 使用
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
    
    /// @notice 獲取聚合報價
    function _getAggregatedQuote(
        bytes32 marketId, 
        SwapParams calldata params
    ) internal view returns (AggregatedQuote memory quote) {
        
        bool isBuying = params.zeroForOne; // 假設 token0 是 USDC
        
        // 1. Opinion Labs 價格 (on-chain)
        quote.opinionPrice = opinionMarket.getPrice(marketId, isBuying);
        
        // 2. Polymarket 價格 (via oracle)
        quote.polymarketPrice = oraclePrices[keccak256(abi.encode(marketId, "polymarket"))];
        
        // 3. Kalshi 價格 (via oracle)
        quote.kalshiPrice = oraclePrices[keccak256(abi.encode(marketId, "kalshi"))];
        
        // 4. 找最優價格
        // ... 比較邏輯
        
        return quote;
    }
    
    /// @notice Oracle 更新價格 (Polymarket, Kalshi)
    function updateOraclePrice(
        bytes32 marketId, 
        string calldata source, 
        uint256 price
    ) external onlyOracle {
        oraclePrices[keccak256(abi.encode(marketId, source))] = price;
    }
}
```

---

## 數據流

### Swap 流程

```
1. 用戶發起 Swap (USDC → YES_TOKEN)
   │
2. beforeSwap Hook 觸發
   │
   ├─→ 查詢 Opinion Labs 價格 (直接合約調用)
   ├─→ 查詢 Polymarket 價格 (Oracle)
   ├─→ 查詢 Kalshi 價格 (Oracle)
   └─→ 計算 Pool 當前價格
   │
3. 比較所有價格，決定最優路由
   │
4. 執行 Swap
   │
   ├─ 如果 Pool 最優 → 正常 swap
   └─ 如果外部市場最優 → Custom Accounting 路由到外部
   │
5. afterSwap Hook
   │
   └─→ 可選: 執行套利 (如果有價差)
```

---

## Oracle 設計

### 價格 Feed 架構

```
┌─────────────────────────────────────────┐
│            Off-chain Relayer            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Polymarket│ │ Kalshi  │ │ Others  │   │
│  │ Listener │ │ Listener│ │         │   │
│  └────┬─────┘ └────┬────┘ └────┬────┘   │
│       │            │           │        │
│       └────────────┼───────────┘        │
│                    │                    │
│            ┌───────▼───────┐            │
│            │  Price        │            │
│            │  Aggregator   │            │
│            └───────┬───────┘            │
└────────────────────┼────────────────────┘
                     │
              ┌──────▼──────┐
              │   Oracle    │
              │   Contract  │
              │  (on-chain) │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  Aggregator │
              │    Hook     │
              └─────────────┘
```

### Relayer 服務 (Node.js/Python)

```javascript
// relayer.js 概念
const opinionSDK = require('opinion-clob-sdk');
const polymarketAPI = require('./polymarket-client');
const kalshiAPI = require('./kalshi-client');

async function updatePrices() {
    const markets = await getTrackedMarkets();
    
    for (const market of markets) {
        // 獲取各平台價格
        const prices = await Promise.all([
            opinionSDK.getPrice(market.opinionId),
            polymarketAPI.getPrice(market.polymarketId),
            kalshiAPI.getPrice(market.kalshiTicker)
        ]);
        
        // 上報到 Oracle 合約
        await oracleContract.updatePrices(
            market.id,
            prices
        );
    }
}

// 每 10 秒更新
setInterval(updatePrices, 10000);
```

---

## Token 標準處理

### 問題
- Polymarket: ERC1155 (CTF)
- Opinion: 待確認 (可能是 ERC20 或 ERC1155)
- v4 Pool: ERC20

### 解決方案: Wrapper Token

```solidity
/// @notice 把預測市場 outcome token 包裝成 ERC20
contract WrappedPredictionToken is ERC20 {
    
    IERC1155 public ctfToken;
    uint256 public tokenId;
    
    function wrap(uint256 amount) external {
        ctfToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        _mint(msg.sender, amount);
    }
    
    function unwrap(uint256 amount) external {
        _burn(msg.sender, amount);
        ctfToken.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
    }
}
```

---

## Hookathon MVP 範圍

### 必做 (3/15 前)
- [ ] Opinion Labs 單一市場整合
- [ ] PancakeSwap Infinity Hook 基本框架
- [ ] 價格比較邏輯
- [ ] 簡單 Demo UI

### 加分項
- [ ] Polymarket Oracle 整合
- [ ] 套利執行邏輯
- [ ] 多市場支持

### 未來 (Hookathon 後)
- [ ] Kalshi 整合
- [ ] kUSDC Yield Vault
- [ ] 完整跨鏈支持

---

## 技術棧

### 合約
- Solidity ^0.8.26
- Foundry
- PancakeSwap Infinity Core
- OpenZeppelin

### Relayer/Backend
- Node.js 或 Python
- Opinion CLOB SDK
- Polymarket API client
- Kalshi API client

### Frontend (可選)
- React + Vite
- wagmi/viem
- TailwindCSS

---

## 下一步

1. **設置開發環境**
   - Clone pancakeswap/infinity-core
   - 或用 uniswapfoundation/v4-template

2. **申請 API Keys**
   - Opinion Labs Builder Program
   - Polymarket Builder Program
   - Kalshi Developer

3. **研究 Opinion 合約**
   - 找到他們的合約地址
   - 理解 token 標準

4. **開始寫 Hook**
   - 先做最簡單的價格查詢
   - 再加套利邏輯
