# 專案特色 Brainstorm
> 2026-01-27

## 🎯 目標：脫穎而出

Hookathon 評審 (a16z, Variant, Dragonfly) 看過太多普通專案
需要：**獨特機制 + 強敘事 + 技術創新**

---

## 💡 特色方向

### 方向 A: 「預測收益」敘事 (Prediction Yield)

**概念**: kUSDC - 你的閒置穩定幣自動從預測市場賺錢

```
存入 USDC
    ↓
kUSDC (yield-bearing)
    ↓
底層策略:
  • 跨市場套利 (Polymarket vs Opinion 價差)
  • 做市收益 (bid-ask spread)
  • 確定性收割 (結算前買入勝方)
    ↓
年化 8-15%+ 的「預測收益」
```

**特色**:
- 不需要用戶自己預測
- 完全被動收益
- 像 Lido 但收益來自預測市場

**Hook 用法**:
- beforeSwap: 檢測套利機會
- afterSwap: 執行策略
- Custom Accounting: 管理收益分配

---

### 方向 B: 預測指數 Token (Prediction Index)

**概念**: 一個 Token 代表多個預測市場的加權曝險

```
$MACRO = 
  30% 通膨預測 +
  30% 利率預測 +
  20% 選舉預測 +
  20% 經濟指標

一鍵買入整個「宏觀經濟觀點組合」
```

**特色**:
- 像 ETF 但是預測市場
- 分散單一預測風險
- 可以做多/做空「整體敘事」

**Hook 用法**:
- beforeSwap: 計算組合權重
- afterSwap: rebalance 底層持倉
- 支援動態調整權重

---

### 方向 C: LMSR 定價曲線 (學術級創新)

**概念**: 用預測市場學術標準 (LMSR) 取代 x*y=k

```
傳統 AMM: price = y/x (恆定乘積)

LMSR: price = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))

優勢:
  • 學術界公認最優預測市場定價
  • 價格永遠在 0-1 之間
  • 有界損失 (LP 最大虧損可計算)
```

**特色**:
- 首個 v4 Hook 實現 LMSR
- 學術背書，更「正統」
- 對預測市場更合適的定價

**Hook 用法**:
- beforeSwapReturnDelta: 完全自定義價格計算
- Custom Curve 實現

---

### 方向 D: Intent-Based 預測交易

**概念**: 用戶只說「我想買 YES」，系統自動找最優執行

```
用戶 Intent:
  "買 $100 的 Trump 勝選 YES"
      ↓
OmniPredict Solver:
  • 查 Polymarket: 0.58
  • 查 Opinion: 0.60  
  • 查 Kalshi: 0.57
  • 計算 gas + 滑點
      ↓
最優執行:
  Kalshi $70 @ 0.57 + Polymarket $30 @ 0.58
  平均價格: 0.573 (比單一市場更好)
```

**特色**:
- Intent-based 是 2024/25 最熱趨勢
- 真正的「聚合器」體驗
- 跨鏈、跨平台最優執行

**Hook 用法**:
- beforeSwap: 解析 intent
- Custom Accounting: 路由到多個來源

---

### 方向 E: 預測對沖 LP (Hedged LP)

**概念**: LP 倉位自動對沖預測結果

```
傳統 LP 問題:
  如果市場結算 YES=1, NO=0
  持有 NO 的 LP 血本無歸

Hedged LP:
  Hook 自動監控結算概率
  當 YES > 80% 時，開始減持 NO
  保護 LP 不被「結算」打爆
```

**特色**:
- 解決預測市場 LP 的核心痛點
- 真正的「智能」流動性
- 更安全的被動收益

**Hook 用法**:
- beforeSwap: 檢查結算風險
- afterSwap: 動態調整持倉
- 可整合 Oracle 監控

---

### 方向 F: 社交預測 + Copy Trading

**概念**: 追蹤成功預測者，自動跟單

```
排行榜:
  1. @whale_predictor - 78% 準確率
  2. @macro_guru - 72% 準確率
  ...

一鍵跟單:
  "跟 @whale_predictor 的下一筆交易"
  Hook 自動執行
```

**特色**:
- 社交 + DeFi + 預測市場
- 降低預測門檻
- 可能爆紅的消費者應用

---

## 🏆 推薦組合

### 最強特色組合

```
OmniPredict = 
  方向 A (Prediction Yield) 
  + 方向 D (Intent-Based)
  + 方向 E (Hedged LP)
```

**敘事**:
> "OmniPredict 是預測市場的 Lido"
> 
> 存入 USDC，獲得 opUSDC
> 底層通過 Intent-based 聚合器跨市場套利
> Hedged LP 機制保護你的本金
> 年化 8-15% 的「預測收益」，完全被動

**為什麼這組合最強**:

1. **清晰敘事**: "預測市場的 Lido" 一聽就懂
2. **技術創新**: Intent + Hedging 都是前沿
3. **Hook 深度使用**: 不只是包裝，真正用到 Hook 能力
4. **解決真問題**: LP 風險、執行分散、被動收益
5. **VC 喜歡**: 有 token economics 空間

---

## 📊 特色對比

| 方向 | 敘事強度 | 技術難度 | 創新性 | VC 興趣 |
|------|----------|----------|--------|---------|
| A. Prediction Yield | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| B. Prediction Index | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| C. LMSR Curve | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| D. Intent-Based | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| E. Hedged LP | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| F. Social/Copy | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎬 Demo 場景

### 最佳 Demo 流程

```
1. "這是 Alice，她有 1000 USDC 閒置"
   → Alice 存入 OmniPredict
   → 獲得 1000 opUSDC

2. "幾秒後..."
   → 顯示 Hook 自動發現套利機會
   → Polymarket YES = 0.58, Opinion YES = 0.62
   → 自動執行跨市場套利

3. "24 小時後..."
   → opUSDC 價值: 1000.42 (+0.042%)
   → 年化: ~15%
   → "完全被動，Alice 什麼都不用做"

4. "如果市場要結算了..."
   → 顯示 Hedged LP 自動減持風險倉位
   → "保護 Alice 的本金"

5. "這就是 OmniPredict - 預測市場的 Lido"
```

---

## 🏷️ 命名建議

| 名稱 | 感覺 |
|------|------|
| OmniPredict | 全能、聚合 |
| PredictFi | DeFi 感 |
| YieldOracle | 收益 + 預測 |
| Augur 2.0 | 致敬經典 |
| Forecast Protocol | 專業 |
| Prophecy | 神秘 |
| **opUSDC** | 產品名，像 stETH |

---

## ⚡ 快速決策

如果要最大化 Hookathon 勝率：

**選 A + D + E 組合**
- 敘事: "預測市場的 Lido"
- 產品: opUSDC (yield-bearing 預測收益)
- 技術: Intent-based 聚合 + Hedged LP
- Hook: beforeSwap 路由 + afterSwap 套利 + Custom Accounting

這給你一個**清晰定位**、**技術深度**、**商業潛力**的完整故事。
