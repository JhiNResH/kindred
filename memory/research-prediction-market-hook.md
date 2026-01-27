# 預測市場 x Uniswap v4 Hook 研究筆記
> 2026-01-27 by Kindred 🐺
> Updated: 2026-01-27

## 🎯 專案目標

### 背景
- JhiNResH 參加 [Atrium Academy Uniswap Hook Incubator](https://atrium.academy/uniswap)
- **Hookathon 3 月開始，3/15 前要做出一個 hook**
- 獎金池 $25k，有 VC 評審 (a16z, Variant, Dragonfly, USV)

### 核心概念
1. **預測市場聚合器** - 整合 Polymarket, Opinion Labs, Kalshi
2. **Uniswap v4 / PancakeSwap v4 Hook** - 可以兩邊都做
3. **kUSDC** - yield-bearing USDC wrapper
4. **套利自動化** - 閒置 USDC 在預測市場上獲利

---

## 1. Uniswap v4 Hooks 機制

### 核心概念
- **Singleton 設計**: 所有 pool 都在一個 PoolManager 合約內
- **Flash Accounting**: 用 EIP-1153 transient storage 優化 gas
- **Hook 是外部合約**: 可以在 swap lifecycle 插入自訂邏輯

### Hook 觸發點 (可選擇性實現)
```
Pool 初始化:
  - beforeInitialize / afterInitialize

流動性操作:
  - beforeAddLiquidity / afterAddLiquidity
  - beforeRemoveLiquidity / afterRemoveLiquidity

Swap:
  - beforeSwap / afterSwap  ⭐ 最關鍵

Donate:
  - beforeDonate / afterDonate
```

### Counter.sol 範例結構
```solidity
contract Counter is BaseHook {
    // 每個 pool 分開追蹤狀態
    mapping(PoolId => uint256) public beforeSwapCount;
    
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeSwap: true,
            afterSwap: true,
            // ... 其他 flags
        });
    }
    
    function _beforeSwap(...) internal override returns (...) {
        // 在 swap 前執行自訂邏輯
        beforeSwapCount[key.toId()]++;
        return (selector, ZERO_DELTA, 0);
    }
}
```

### 可實現功能
- **Limit Orders** - 價格觸發的訂單
- **Dynamic Fees** - 根據市場狀況調整手續費
- **Custom Oracles** - 自訂價格來源
- **Custom Curves** - 不用 x*y=k，可做其他曲線
- **Hook Swap Fees** - 在 swap 時收取額外費用

### 開發資源
- Template: https://github.com/uniswapfoundation/v4-template
- Docs: https://docs.uniswap.org/contracts/v4/overview
- Examples: https://v4-by-example.org

---

## 2. Polymarket / 預測市場合約

### Polymarket 技術架構
- **基礎**: Gnosis Conditional Token Framework (CTF)
- **Token**: ERC1155 outcome tokens
- **Collateral**: USDC (ERC20)
- **鏈**: Polygon
- **合約地址**: `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E`

### CTF Exchange 核心概念

#### Assets
- `A` = ERC1155 outcome token (例: YES)
- `A'` = 對立的 outcome token (例: NO)
- `C` = 抵押品 (USDC)

#### 關鍵公式
```
A + A' = C (可隨時 mint/merge)
```
- **Mint**: 用 1 USDC 鑄造 1 YES + 1 NO
- **Merge**: 1 YES + 1 NO 換回 1 USDC

#### 匹配場景

**場景 1 - NORMAL (直接匹配)**
- UserA: BUY 100 A @ $0.50
- UserB: SELL 50 A @ $0.50
- 直接交換 token

**場景 2 - MINT (雙方都是買家)**
- UserA: BUY 100 A @ $0.50
- UserB: BUY 50 A' @ $0.50
- 用雙方的 USDC 鑄造新 token set，分配給各自

**場景 3 - MERGE (雙方都是賣家)**
- UserA: SELL 50 A @ $0.50
- UserB: SELL 100 A' @ $0.50
- 合併 token 換回 USDC，分配給各自

### 費用機制
- **對稱費率**: 確保買 A @ $0.99 和買 A' @ $0.01 的費用相等
- `usdcFee = baseRate * min(price, 1-price) * outcomeShareCount`

---

## 3. Yield-Bearing Stablecoin (kUSDC 參考)

### sDAI 實現 (MakerDAO)
- **合約**: `0x83F20F44975D03b1b09e64809B757c47f942BEeA`
- **機制**: DAI → DSR (Dai Savings Rate) → sDAI
- **ERC-4626 Vault 標準**

### 核心函數
```solidity
deposit(uint256 assets, address receiver) → shares
withdraw(uint256 assets, address receiver, address owner) → shares
redeem(uint256 shares, address receiver, address owner) → assets
```

### kUSDC 設計思路
```
用戶存入 USDC
    ↓
鑄造 kUSDC (1:1 或按匯率)
    ↓
USDC 投入 yield 策略 (Aave/Compound/預測市場)
    ↓
kUSDC 價值隨時間增長
    ↓
用戶贖回時獲得 principal + yield
```

---

## 4. 整合架構設計

### 方案 A: Hook + 預測市場套利
```
                    ┌─────────────────┐
                    │  Uniswap v4     │
                    │  PoolManager    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Custom Hook    │
                    │  (beforeSwap)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌──────▼──────┐  ┌────▼─────┐
     │  Polymarket │  │  其他預測    │  │  Yield   │
     │  CTF        │  │  市場        │  │  Protocol│
     └─────────────┘  └─────────────┘  └──────────┘
```

### 方案 B: kUSDC Vault + 策略
```
用戶 → deposit USDC → kUSDC Vault
                         ↓
              ┌──────────┴──────────┐
              │                     │
        Polymarket 套利        Aave/Compound
        (低風險策略)           (穩定利息)
```

---

## 5. 套利策略細節

### 預測市場套利機會

#### 策略 1: 跨平台套利
- Polymarket YES = $0.60
- 另一平台 YES = $0.55
- 買低賣高

#### 策略 2: Mint/Merge 套利
- 如果 YES + NO < $1.00
  - 買入 YES + NO，merge 成 USDC，獲利差價
- 如果 YES + NO > $1.00
  - Mint USDC 成 YES + NO，賣出，獲利差價

#### 策略 3: 結算確定性套利
- 某市場即將結算，勝方明確
- 買入接近 $1 的 winning outcome
- 等結算獲得 $1

### 風險考量
- **流動性風險**: 預測市場深度不夠
- **結算風險**: Oracle 出錯或爭議
- **Gas 成本**: Polygon 便宜但仍需計算
- **智能合約風險**: CTF 合約 bug

---

## 6. 技術實現路徑

### Phase 1: 研究驗證
- [x] Uniswap v4 Hook 機制
- [x] Polymarket 合約接口
- [x] Yield-bearing token 模式
- [ ] 寫 PoC 測試套利策略可行性

### Phase 2: 核心開發
- [ ] kUSDC ERC-4626 Vault
- [ ] 套利策略合約
- [ ] Uniswap v4 Hook (如果需要)

### Phase 3: 整合測試
- [ ] 部署到測試網
- [ ] 模擬套利執行
- [ ] Gas 優化

---

## 7. 開放問題

1. **Hook 的必要性**: 如果只是套利，可能不需要 Hook？Hook 更適合做 pool 層面的邏輯

2. **鏈的選擇**: Polymarket 在 Polygon，v4 主要在主網，跨鏈怎麼處理？

3. **資金效率**: 閒置資金放預測市場 vs Aave/Compound，哪個風險調整後收益更好？

4. **監控和執行**: 套利機會轉瞬即逝，需要 Keeper/Bot 系統

---

---

## 8. 三大預測市場平台詳解

### 🔵 Polymarket (最大 crypto 預測市場)
| 項目 | 詳情 |
|------|------|
| **鏈** | Polygon |
| **架構** | Hybrid-decentralized CLOB |
| **合約** | CTF Exchange (ERC1155 outcome tokens) |
| **Builder Program** | ✅ 有 gasless 交易、API attribution |
| **文檔** | https://docs.polymarket.com/developers/CLOB/introduction |

**技術特點:**
- 用 EIP712 簽名訂單
- Operator 做鏈下 matching，鏈上結算
- 支持 mint/merge 操作
- 目前 0 手續費 (maker & taker)

---

### 🟡 Opinion Labs (BNB Chain 預測市場)
| 項目 | 詳情 |
|------|------|
| **鏈** | BNB Chain (Chain ID: 56) |
| **架構** | CLOB + AI Oracle |
| **Builder Program** | ✅ API key + elevated rate limits |
| **SDK** | Python CLOB SDK |
| **文檔** | https://docs.opinion.trade/developer-guide/opinion-open-api |

**技術特點:**
- **Opinion Stack 四層架構:**
 - Opinion AI - 去中心化多代理 AI oracle
 - Opinion Metapool - 統一流動性
 - Opinion Protocol - 通用 token 標準
- Rate limit: 15 req/sec
- REST API + WebSocket

**API Endpoints:**
```
/market - 市場列表
/token/latest-price - 最新價格
/token/orderbook - 訂單簿
/token/price-history - 歷史價格
```

---

### 🔴 Kalshi (美國合規預測市場)
| 項目 | 詳情 |
|------|------|
| **鏈** | 中心化 (非鏈上) |
| **監管** | ✅ CFTC DCM |
| **Builder Program** | ✅ Trading API |
| **文檔** | https://docs.kalshi.com/ |

**技術特點:**
- 完整 REST API
- 支持 Orders, Portfolio, Market Data
- 有 WebSocket 實時數據
- **限制**: 非 on-chain，無法直接做 DeFi 整合

**API 能力:**
- Create/Cancel/Amend Orders
- Get Positions, Fills, Settlements
- Market Orderbook, Candlesticks
- Batch operations

---

### 平台整合可行性對比

| 平台 | On-chain 整合 | API 整合 | Hook 可行性 |
|------|---------------|----------|-------------|
| Polymarket | ✅ (Polygon) | ✅ | 需跨鏈 |
| Opinion | ✅ (BNB) | ✅ | ⭐ 最佳 (同 BNB 生態) |
| Kalshi | ❌ | ✅ | 僅 off-chain aggregation |

---

## 9. PancakeSwap v4 (Infinity)

PancakeSwap 的 v4 叫做 **Infinity**，架構類似 Uniswap v4：
- Repo: https://github.com/pancakeswap/infinity-core
- 同樣支援 Hooks
- 部署在 BNB Chain

### 跨鏈策略
- Uniswap v4 → Ethereum mainnet
- PancakeSwap Infinity → BNB Chain
- Polymarket → Polygon

可能需要跨鏈 messaging (LayerZero, Axelar) 或分開部署

---

## 10. 類似專案分析

### 現有整合
目前**沒有找到**直接把預測市場 + Uniswap Hook 整合的專案

### 相關概念
1. **Gnosis Conditional Token AMM** - 專門為預測市場做的 AMM
2. **Azuro Protocol** - 預測市場基礎設施層
3. **Rubicon** - 訂單簿 + 聚合執行

### 創新空間 ⭐
這是**藍海**！沒有人做過：
- 預測市場聚合器 + v4 Hook
- kUSDC yield 來自預測市場套利
- 跨平台流動性整合

---

## 11. Hookathon 專案方向建議

### 方向 A: 預測市場 LP Hook
```
用戶存 USDC 到 v4 Pool
    ↓
beforeAddLiquidity Hook
    ↓
部分資金自動部署到預測市場做 LP
    ↓
afterSwap Hook
    ↓
自動 rebalance 預測市場倉位
```

### 方向 B: 聚合套利 Hook
```
用戶 swap USDC ↔ PM_TOKEN
    ↓
beforeSwap Hook
    ↓
查詢多個預測市場價格
    ↓
路由到最優價格的市場
    ↓
afterSwap 結算
```

### 方向 C: kUSDC Vault + Hook
```
kUSDC Vault (ERC-4626)
    ↓
底層資金由 Hook 管理
    ↓
Hook 監控套利機會
    ↓
自動執行 mint/merge 套利
```

---

## 12. 下一步 Action Items

### 本週
- [ ] 深入研究 Atrium Academy 課程內容
- [ ] 設置 v4-template 開發環境
- [ ] 研究 Polymarket API/合約接口細節

### 開發前
- [ ] 確定主攻方向 (A/B/C)
- [ ] 畫架構圖
- [ ] 寫簡單 PoC

### Hookathon 準備 (3 月前)
- [ ] 完成核心 Hook 邏輯
- [ ] 測試套利策略
- [ ] 準備 Demo

---

## 參考資料

### 核心文檔
- Uniswap v4 Docs: https://docs.uniswap.org/contracts/v4/overview
- v4 Template: https://github.com/uniswapfoundation/v4-template
- v4 by Example: https://v4-by-example.org

### 預測市場
- Polymarket CTF: https://github.com/Polymarket/ctf-exchange
- Gnosis CTF: https://github.com/gnosis/conditional-tokens-market-makers
- Seer: https://seer.pm/

### Yield Bearing
- sDAI: https://etherscan.io/address/0x83F20F44975D03b1b09e64809B757c47f942BEeA
- ERC-4626: https://eips.ethereum.org/EIPS/eip-4626

### 課程
- Atrium Academy: https://atrium.academy/uniswap

### 其他
- PancakeSwap Infinity: https://github.com/pancakeswap/infinity-core
- Azuro: https://azuro.org/
- Kalshi: https://kalshi.com/
