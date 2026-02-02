# 🔬 Gary Vee 自主研究系統 v1.0

> 從「執行者」升級為「研究員 + 增長顧問」

---

## 🎯 核心理念

**Gary Vee 哲學：Document, Don't Create**
- 不是憑空創造內容，而是記錄正在發生的事
- 研究市場 → 發現趨勢 → 提供價值 → 建立影響力

---

## 📡 話題發現機制

### 1️⃣ 即時信號源（每日掃描）

| 來源 | 用途 | 工具/方法 |
|------|------|-----------|
| **Twitter Trending** | Crypto/Tech 熱點 | `bird trending`, `bird news --ai-only` |
| **Crypto Twitter** | 新協議、敘事轉變 | 監控 KOL list |
| **GitHub Trending** | 開發者關注什麼 | web_fetch GitHub trending |
| **Hacker News** | Tech 圈話題 | web_fetch HN front page |
| **Farcaster/Lens** | Web3 native 社區 | 手動或 API |
| **中文圈** | 小紅書、即刻、微信公眾號 | 需要設置 |

### 2️⃣ 深度監控清單

**Crypto/Web3:**
- @VitalikButerin — Ethereum 方向
- @balaboris — Macro + Network State
- @cdixon — a16z crypto 投資邏輯
- @hasufl — 深度研究
- @coaborators — ERC 新標準

**AI/Tech:**
- @kaborais — AI 工程
- @AndrewYNg — AI 教育
- @sama — OpenAI 動向

**一人企業:**
- @naval — 哲學 + 財富
- @danlock — 一人公司
- @alexhormozi — 商業增長

### 3️⃣ 敘事週期追蹤

| 階段 | 特徵 | 行動 |
|------|------|------|
| 🌱 萌芽 | 少數 builder 討論 | 深度研究，早期佈局 |
| 🌿 成長 | KOL 開始提及 | 寫解讀文，建立權威 |
| 🌳 成熟 | 大眾討論 | 寫入門指南，獲取流量 |
| 🍂 衰退 | 話題疲勞 | 避開或寫總結 |

---

## 📊 話題評估框架

### 值不值得寫？5 個問題：

1. **時效性** (1-5分)
   - 5分：剛發生 24h 內
   - 3分：本週熱點
   - 1分：舊話題

2. **獨特角度** (1-5分)
   - 5分：有獨特見解 / 可連結到我們項目
   - 3分：可以寫得更清楚
   - 1分：已經被寫爛了

3. **目標受眾匹配** (1-5分)
   - 5分：完美匹配（Crypto + AI builders）
   - 3分：部分匹配
   - 1分：不相關

4. **可執行性** (1-5分)
   - 5分：可以今天寫完發
   - 3分：需要 1-2 天研究
   - 1分：需要大量準備

5. **項目關聯** (Bonus +3)
   - 能連結到 Maat/Kindred/The Edge？

**決策：**
- 總分 ≥ 15：立即寫
- 總分 10-14：排入 queue
- 總分 < 10：跳過

---

## 🔄 內容生產 Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    DAILY RESEARCH LOOP                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [早晨 8-9 AM]                                               │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                  │
│  │ Scan    │───▶│ Evaluate│───▶│ Queue   │                  │
│  │ Sources │    │ Topics  │    │ Ideas   │                  │
│  └─────────┘    └─────────┘    └─────────┘                  │
│                                                              │
│  [研究時間]                                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                  │
│  │ Deep    │───▶│ Draft   │───▶│ Review  │                  │
│  │ Research│    │ Content │    │ & Edit  │                  │
│  └─────────┘    └─────────┘    └─────────┘                  │
│                                                              │
│  [發佈時間: 8-10 AM 或 7-9 PM PST]                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                  │
│  │ Publish │───▶│ Engage  │───▶│ Track   │                  │
│  │         │    │ Replies │    │ Metrics │                  │
│  └─────────┘    └─────────┘    └─────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 內容類型矩陣

| 類型 | 時間 | 適用場景 | 範例 |
|------|------|----------|------|
| 🧵 Thread | 1h | 熱點解讀、教程 | ERC-8004 explainer |
| 📝 Article | 2-3h | 深度分析 | Naval 翻譯系列 |
| 🎨 Infographic | 1h | 複雜概念視覺化 | 3 registries 圖解 |
| 💬 Quote Tweet | 10min | 快速評論 | 對 KOL 觀點發表看法 |
| 🔁 Curation | 30min | 每週精選 | "本週 5 個值得關注的..." |

---

## 🚀 項目增長建議

### 🍽️ Maat (神秘客)

**定位:** AI 驅動的餐廳驗證平台

**目標用戶:**
1. **餐廳老闆** — 想證明自己是真的好
2. **消費者** — 厭倦虛假評論
3. **平台方** — 需要可信評論數據

**GTM 策略:**
```
Phase 1: 冷啟動 (Hackathon)
├─ 選 3-5 家配合餐廳
├─ 產出 AI 驗證報告
└─ 做成 case study 內容

Phase 2: 內容驅動
├─ "揭秘大眾點評刷單" 系列
├─ "AI 如何識別假評論" 教育內容
└─ 合作餐廳的 before/after

Phase 3: B2B 擴展
├─ 接洽外賣平台
├─ 餐廳聯盟合作
└─ API 服務
```

**內容角度:**
- 寫 "為什麼餐廳評論不可信" → 引流到 Maat
- 做 "AI 驗證 vs 人工驗證" 對比
- 餐廳老闆訪談系列

---

### ⚓ Kindred (虎克船長)

**定位:** 預測市場 + DeFi 聚合

**目標用戶:**
1. **DeFi Degens** — 尋找收益
2. **Prediction Market 玩家** — Polymarket users
3. **開發者** — 想用預測市場 data

**GTM 策略:**
```
Phase 1: 開發者優先
├─ 技術 blog 系列 (Uniswap v4 hooks)
├─ 開源 SDK
└─ Discord 開發者社區

Phase 2: 用戶獲取
├─ "預測市場入門" 教育內容
├─ 收益策略分享 (The Edge 角色)
└─ Polymarket 數據分析 dashboard

Phase 3: 產品發布
├─ Beta 用戶計劃
├─ Yield competition
└─ Integration partnerships
```

**內容角度:**
- ERC-8004 thread 可以連結到 Kindred（agent 經濟 → agent 交易）
- 寫 "Uniswap v4 Hooks 開發日記"
- 預測市場策略分享 → The Edge 專欄

---

### 💰 The Edge (投資策略)

**定位:** 預測市場套利 + 資訊差

**目標用戶:**
1. **投資客** — 想要 alpha
2. **數據分析愛好者** — 喜歡看 edge case
3. **內容消費者** — 娛樂 + 教育

**GTM 策略:**
```
Phase 1: 建立信譽
├─ 公開交易記錄 (Google Sheet)
├─ Win/Loss 透明分享
└─ "今日 Edge" 每日更新

Phase 2: 內容系列化
├─ "我如何用資訊差賺 X%" 案例
├─ 傷病消息 → 賠率變化 分析
└─ 預測市場入門課

Phase 3: 社區
├─ Discord/Telegram group
├─ 收費 alpha 群（未來）
└─ 工具分享 (edge calculator)
```

**內容角度:**
- 每日/每週交易覆盤
- "資訊差" 概念教育
- 結合 Kindred 做工具推廣

---

## 📅 執行計劃

### 本週 (Week 1)

| 日期 | 任務 | Owner |
|------|------|-------|
| Day 1 | 設置話題監控 (Twitter lists, RSS) | Gary |
| Day 2 | ERC-8004 中文版 + 圖解 | Gary |
| Day 3 | 建立評估模板，試跑一次 | Gary |
| Day 4-5 | 持續內容產出 + 數據追蹤 | Gary |
| 週末 | Week 1 覆盤，調整流程 | Gary + Jensen |

### 每日 Routine

```
08:00  掃描 trending + 信號源
08:30  評估話題，更新 queue
09:00  深度研究 (如需要)
10:00  開始寫作
12:00  發佈 (如有內容)
19:00  第二輪發佈 (給中文圈)
21:00  追蹤數據，回覆評論
```

---

## 📈 Success Metrics

| 指標 | Week 1 目標 | Month 1 目標 |
|------|------------|--------------|
| 內容產出 | 3-5 篇 | 15-20 篇 |
| Engagement Rate | 2%+ | 5%+ |
| Follower Growth | +50 | +300 |
| 項目連結點擊 | Track baseline | 2x baseline |

---

## 🔧 工具清單

- [x] `bird` CLI — Twitter 操作
- [x] `web_search` — 研究
- [x] `web_fetch` — 抓取內容
- [ ] Twitter Lists — 需設置監控 list
- [ ] RSS feeds — Hacker News, GitHub
- [ ] Notion/Obsidian — 研究筆記（可選）

---

*Last Updated: 2026-01-30*
*Owner: Gary Vee 📝*
