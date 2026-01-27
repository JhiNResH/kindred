# 最佳整合方案：Prediction Liquidity Protocol
> 2026-01-27 by Kindred 🐺

## 🎯 核心洞察

### 現狀問題
1. **預測市場 = CLOB (訂單簿)** → 流動性分散、需要主動做市
2. **DeFi = AMM** → 被動流動性、可組合
3. **兩者沒有整合** → 預測市場無法享受 DeFi 的可組合性

### 創新機會
**用 v4 Hook 把 AMM 流動性帶到預測市場**

---

## 💡 專案概念：OmniPredict

**一句話**: AMM-style 流動性協議，為預測市場提供統一流動性，讓 LP 被動賺取做市收益

```
傳統預測市場:
  用戶 ←→ CLOB 訂單簿 ←→ 做市商
  
OmniPredict:
  用戶 ←→ v4 AMM Pool ←→ Hook ←→ 預測市場 (Opinion/Polymarket)
                ↑
              LP 被動提供流動性
```

---

## 🏗️ 架構設計

### 系統概覽

```
┌─────────────────────────────────────────────────────────────────┐
│                        OmniPredict                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PancakeSwap Infinity Pool                   │    │
│  │         USDT ←────────→ PM_TOKEN (Wrapped)               │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │              OmniPredict Hook                            │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  beforeSwap:                                     │    │    │
│  │  │  - 查詢預測市場價格                              │    │    │
│  │  │  - 計算最優路由                                  │    │    │
│  │  │  - 決定用 Pool 還是外部市場                      │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  afterSwap:                                      │    │    │
│  │  │  - 如果有價差，執行套利                          │    │    │
│  │  │  - 自動 rebalance 庫存                           │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Inventory Management:                           │    │    │
│  │  │  - 持有 YES + NO tokens                          │    │    │
│  │  │  - 自動 split/merge 維持平衡                     │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │   Opinion   │  │ Polymarket  │  │   Kalshi    │
     │ (BNB Chain) │  │  (Oracle)   │  │  (Oracle)   │
     │             │  │             │  │             │
     │ split()     │  │  價格 feed  │  │  價格 feed  │
     │ merge()     │  │             │  │             │
     │ redeem()    │  │             │  │             │
     └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🔑 核心創新

### 1. 統一流動性 (Unified Liquidity)

**傳統**: 每個預測市場各自為政，流動性分散
**OmniPredict**: 聚合多個市場，提供統一深度

```
用戶買 YES:
  1. Hook 查詢所有市場價格
  2. Opinion: 0.62, Polymarket: 0.60, Pool: 0.61
  3. 路由到 Polymarket (最便宜)
  4. 如果量大，可以分拆到多個市場
```

### 2. 被動做市 (Passive Market Making)

**傳統**: 做市商需要主動掛單、調整報價
**OmniPredict**: LP 只需存入資金，Hook 自動做市

```
LP 存入 1000 USDT:
  ↓
Hook 自動 split 成:
  - 500 YES tokens
  - 500 NO tokens
  ↓
兩邊都提供流動性
  ↓
無論市場往哪走，都賺 swap fee
```

### 3. 自動套利 (Auto Arbitrage)

**傳統**: 套利者手動監控、執行
**OmniPredict**: Hook 自動檢測並執行套利

```
檢測到價差:
  Pool YES = 0.60
  Opinion YES = 0.65
  ↓
afterSwap 觸發:
  - 從 Pool 買 YES @ 0.60
  - 在 Opinion 賣 YES @ 0.65
  - 利潤歸 LP
```

### 4. DeFi 可組合性 (Composability)

**傳統**: 預測市場倉位很難用於其他 DeFi
**OmniPredict**: PM_TOKEN 是標準 ERC20，可以:

- 作為借貸抵押品
- 放入 yield aggregator
- 創建衍生品
- 在其他 DEX 交易

---

## 💰 收益模型

### LP 收益來源

| 來源 | 描述 | 預估 APY |
|------|------|----------|
| Swap 手續費 | 用戶交易支付 | 5-15% |
| Spread 收益 | 買賣價差 | 3-8% |
| 套利收益 | 跨市場價差 | 2-10% |
| 預測結算 | 正確預測收益 | 可變 |

### 風險
- **無常損失**: 如果市場大幅單邊移動
- **結算風險**: 如果持有錯誤方向的 token
- **智能合約風險**: Hook/外部合約 bug

### 風險緩解
- **雙邊持倉**: 同時持有 YES + NO
- **自動 rebalance**: 維持接近 50:50
- **止損機制**: 極端情況下退出

---

## 🛠️ 技術實現

### Phase 1: 核心 Hook (MVP for Hookathon)

```solidity
contract OmniPredictHook is BaseHook {
    
    // Opinion ConditionalTokens 合約
    IConditionalTokens public conditionalTokens = 
        IConditionalTokens(0xAD1a38cEc043e70E83a3eC30443dB285ED10D774);
    
    // USDT collateral
    IERC20 public usdt;
    
    // 市場配置
    struct MarketConfig {
        bytes32 conditionId;
        bytes32 collectionIdYes;
        bytes32 collectionIdNo;
        address wrappedYesToken;
        address wrappedNoToken;
    }
    
    mapping(PoolId => MarketConfig) public marketConfigs;
    
    // ===== HOOK FUNCTIONS =====
    
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        
        MarketConfig memory config = marketConfigs[key.toId()];
        
        // 1. 獲取外部市場價格
        uint256 externalPrice = _getExternalPrice(config);
        
        // 2. 計算 pool 價格
        uint256 poolPrice = _getPoolPrice(key);
        
        // 3. 決定路由策略
        // (這裡可以用 Custom Accounting 來路由到外部市場)
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
    
    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        
        // 檢查並執行套利機會
        _checkAndExecuteArbitrage(key);
        
        // Rebalance 庫存
        _rebalanceInventory(key);
        
        return (BaseHook.afterSwap.selector, 0);
    }
    
    // ===== 核心邏輯 =====
    
    /// @notice 從 Opinion 獲取價格
    function _getExternalPrice(MarketConfig memory config) internal view returns (uint256) {
        // 透過 Oracle 或直接查詢 orderbook
        // ...
    }
    
    /// @notice 執行套利
    function _checkAndExecuteArbitrage(PoolKey calldata key) internal {
        MarketConfig memory config = marketConfigs[key.toId()];
        
        uint256 poolPrice = _getPoolPrice(key);
        uint256 opinionPrice = _getExternalPrice(config);
        
        // 如果價差 > 閾值，執行套利
        if (poolPrice < opinionPrice - ARBITRAGE_THRESHOLD) {
            // Pool 便宜，Opinion 貴
            // → 從 Pool 買，在 Opinion 賣
            _executeArbitrage(config, true, ARBITRAGE_AMOUNT);
        } else if (poolPrice > opinionPrice + ARBITRAGE_THRESHOLD) {
            // Opinion 便宜，Pool 貴
            // → 從 Opinion 買，在 Pool 賣
            _executeArbitrage(config, false, ARBITRAGE_AMOUNT);
        }
    }
    
    /// @notice Split USDT → YES + NO
    function split(PoolId poolId, uint256 amount) external {
        MarketConfig memory config = marketConfigs[poolId];
        
        usdt.transferFrom(msg.sender, address(this), amount);
        usdt.approve(address(conditionalTokens), amount);
        
        conditionalTokens.splitPosition(
            usdt,
            bytes32(0), // parentCollectionId
            config.conditionId,
            partition, // [1, 2] for binary
            amount
        );
        
        // Mint wrapped tokens to user
        // ...
    }
    
    /// @notice Merge YES + NO → USDT
    function merge(PoolId poolId, uint256 amount) external {
        MarketConfig memory config = marketConfigs[poolId];
        
        // Burn wrapped tokens
        // ...
        
        conditionalTokens.mergePositions(
            usdt,
            bytes32(0),
            config.conditionId,
            partition,
            amount
        );
        
        usdt.transfer(msg.sender, amount);
    }
}
```

### Phase 2: 跨鏈整合

```
┌─────────────────┐         ┌─────────────────┐
│    BNB Chain    │         │    Polygon      │
│                 │         │                 │
│  OmniPredict    │◄───────►│  Polymarket     │
│  Hook           │ LayerZero│  Adapter        │
│                 │         │                 │
└─────────────────┘         └─────────────────┘
```

### Phase 3: Yield Vault

```solidity
contract OmniPredictVault is ERC4626 {
    OmniPredictHook public hook;
    
    // 存入 USDT，獲得 opUSDT (yield-bearing)
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        // 1. 接收 USDT
        // 2. 部署到 OmniPredict 策略
        // 3. Mint opUSDT 給用戶
    }
    
    // opUSDT 價值隨時間增長 (做市收益 + 套利收益)
}
```

---

## 🎯 Hookathon 提交策略

### MVP 範圍 (3/15 前完成)

✅ **必做**:
1. PancakeSwap Infinity Hook 框架
2. Opinion Labs 價格查詢整合
3. 基本 split/merge 功能
4. 簡單套利檢測邏輯
5. Demo UI (可選)

⭐ **加分**:
1. 跨市場價格比較 (Opinion vs Oracle)
2. 自動 rebalance
3. LP 收益計算

### Demo 腳本

```
1. LP 存入 1000 USDT
   → Hook 自動 split 成 500 YES + 500 NO
   
2. 用戶買 100 YES
   → Hook 比較價格
   → 路由到最優來源
   → 執行 swap
   
3. 價差出現
   → afterSwap 檢測到套利機會
   → 自動執行，利潤歸 LP
   
4. LP 提取
   → Hook merge YES + NO → USDT
   → 返還本金 + 收益
```

---

## 🆚 競品對比

| 項目 | 類型 | 優勢 | 劣勢 |
|------|------|------|------|
| Polymarket | CLOB | 流動性好 | 需要主動做市 |
| Opinion | CLOB | BNB 生態 | 流動性較小 |
| Gnosis AMM | AMM | 被動做市 | 沒有聚合 |
| **OmniPredict** | AMM + 聚合 | 被動 + 聚合 + 套利 | 新項目 |

### 創新點

1. **首個 v4 Hook 預測市場整合** - 藍海
2. **跨市場聚合** - 更好價格
3. **被動做市** - 更低門檻
4. **自動套利** - LP 額外收益
5. **DeFi 可組合** - 開放新用例

---

## 📋 Action Items

### 本週
- [ ] 設置 PancakeSwap Infinity 開發環境
- [ ] 申請 Opinion Builder API key
- [ ] 研究 ConditionalTokens 合約細節
- [ ] 寫基礎 Hook 框架

### 下週
- [ ] 實現 split/merge 功能
- [ ] 價格查詢整合
- [ ] 套利邏輯

### Hookathon 前
- [ ] 完整 MVP
- [ ] 測試
- [ ] Demo 準備
- [ ] 文檔

---

## 🔗 關鍵資源

### 合約地址 (BNB Chain)
- ConditionalTokens: `0xAD1a38cEc043e70E83a3eC30443dB285ED10D774`
- MultiSend: `0x998739BFdAAdde7C933B942a68053933098f9EDa`
- USDT: BNB Chain 原生

### 文檔
- Opinion SDK: https://docs.opinion.trade/developer-guide/opinion-clob-sdk
- PancakeSwap Infinity: https://github.com/pancakeswap/infinity-core
- Uniswap v4: https://docs.uniswap.org/contracts/v4/overview
