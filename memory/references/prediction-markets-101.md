# Prediction Markets 101: Where Beliefs Get a Dollar Sign

**來源:** https://x.com/zethesx/status/2016928194537062610
**作者:** @zethesx
**日期:** 2026-01-29
**相關項目:** Kindred, The Edge, 投資客

---

## 核心概念

預測市場 = 把不確定性變成價格

- **Yes 合約:** 事件發生付 $1，不發生付 $0
- **價格即機率:** $0.63 ≈ 63% 機率
- **價格驅動:** 供需 + 新信息

---

## 基本數學

```
買 100 股 Yes @ $0.40
成本 = 100 × $0.40 = $40

如果 Yes 發生:
  回報 = 100 × $1.00 = $100
  利潤 = $60

如果 No 發生:
  回報 = $0
  虧損 = $40
```

---

## 市場設計

| 類型 | 優點 | 缺點 |
|------|------|------|
| **Order Book** | 流動性好時價差小 | 小市場可能不流動 |
| **AMM** | 總是有價格 | 定價效率較低，滑點大 |

---

## 5 大策略類型

### 1. 定價錯誤 (Mispricing)
找市場定錯價的地方
- 小眾領域（小聯盟、特定政策）
- 複雜的結算規則
- 你有專業知識的領域

### 2. 時間差 (Timing/Latency)
比別人更快拿到資訊
- 現場體育/電競最明顯
- 需要更快的數據源
- 自動化執行

### 3. 跨平台套利 (Arbitrage)
同事件不同平台價差
- 這邊買低估的 Yes
- 那邊賣高估的 Yes
- 隨著市場成熟會變難

### 4. 做市 (Market Making)
提供流動性賺 spread
- 需要紀律
- 需要風控
- 需要資本和一致性

### 5. 組合交易 (Portfolio/Correlation)
相關市場的關聯性
- 宏觀結果影響選舉
- 政策結果影響行業
- 更高階的策略

---

## 常見錯誤

- ❌ 把市場價格當真理（是共識，不是確定）
- ❌ 忽略流動性、滑點、手續費
- ❌ 不讀結算規則
- ❌ All-in 長射因為「便宜」
- ❌ 混淆「對」和「賺錢」

---

## 關鍵洞察

> "Prediction markets reward correct **probability**, not just correct **direction**."

在 $0.90 買 Yes，即使 Yes 發生也可能是壞交易 — upside 小，downside 大。

> "Most people think in stories. Markets think in odds."

---

## 對我們項目的應用

### Kindred (聚合器/借貸)
- **跨平台套利** = 聚合器核心價值
- **做市** = Hook 可以賺 spread
- **AMM vs Order Book** = 設計參考

### The Edge / 投資客
- **定價錯誤** = 傷病信息差
- **時間差** = 第一時間拿到消息
- **組合交易** = 進階策略

### 增長 / Gary Vee
- 預測市場作為內容主題
- 教育用戶「機率思考」

---

## 延伸閱讀

- Polymarket
- Kalshi
- Futarchy (治理實驗)

---

*Saved: 2026-01-29*
