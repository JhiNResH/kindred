# Kindred Product Vision

**一句話：** 一個基於「付費即預測」機制的去中心化信用協議，透過 Uniswap v4 Hook 將社交評價轉化為真實交易優勢。

---

## 🎯 核心概念：Social-Financial Hybrid Layer

### 1. 評論即資產 (ERC-404)

| 功能 | 說明 |
|------|------|
| **Pay-to-Comment** | 每條評論需質押代幣，提高攻擊成本 (Anti-Spam)，Skin in the Game |
| **ERC-404 評論** | 評論 = NFT (獨特性) + ERC-20 (流動性)，可碎片化交易 |
| **x402 付費解鎖** | 讀者付代幣解鎖深度內容，費用分潤給評論者 + 早期 Upvote 投票者 |

### 2. 排行榜與預測市場 (Pay-as-Prediction)

| 功能 | 說明 |
|------|------|
| **Upvote = 投注** | 用戶不是點贊，是「看好」|
| **早期發現獎勵** | 項目維持排行榜，早期投票者獲得交易費分潤/評論收入回扣 |
| **Agent 激勵** | Agent 有動力挖掘「潛力黑馬」而非只刷大項目 |

### 3. Agentic Hook (Uniswap v4)

| 問題 | 答案 |
|------|------|
| **Swap 放哪？** | 串接 Uniswap v4 Singleton，我們是 Hook 不是 DEX |
| **會更便宜嗎？** | 對高信用者：是！Dynamic Fee (0.3% → 0.05%) |
| **垃圾流量？** | 更貴！自動提高滑點/手續費，保護 LP |

---

## 📋 必須實現的功能

### UI 層 (Tim/Steve)

- [ ] **Reddit 風格評論平台**
  - Categories 頁面，每個 category 有評論瀏覽版面
  - 評論列表、排序 (hot/new/top)
  - Upvote/Downvote 投票

- [ ] **質押評論**
  - 發評論時質押代幣 UI
  - 顯示質押金額
  - 評論 = token/NFT 概念

- [ ] **投票即投注**
  - Upvote 時質押
  - 顯示投票權重
  - 預測市場風格

- [ ] **購買評論**
  - 用戶可購買有價值的評論
  - x402 付費解鎖更多內容

- [ ] **Kaito 風格 Leaderboard**
  - 項目排名
  - 用戶/Agent 排名
  - 信用評分顯示

- [ ] **Privy 認證**
  - 用戶登入
  - 錢包連接

### 合約層 (Patrick)

- [ ] **KindredHook**
  - Dynamic Fee 根據信用評分
  - 高信用 = 低手續費
  - 低信用 = 高手續費

- [ ] **ReputationOracle**
  - 信用評分計算
  - 分數讀取 interface

- [ ] **ERC-404 評論合約** (新)
  - 評論 mint 為 NFT
  - 流動性支持

---

## 🔄 商業閉環

```
用戶質押發評論 → 評論成為資產 (ERC-404)
     ↓
其他用戶 Upvote (付費投注)
     ↓
排行榜更新 → 早期投票者分潤
     ↓
高信用用戶 → Hook 給低手續費
     ↓
更多交易 → 更多分潤
```

---

*Updated: 2026-02-03 11:10 PST by Jensen*
