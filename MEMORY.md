# MEMORY.md - Long-term Memory

## 🎯 核心使命 (2026-01-28 確立)

```
💰 發大財 — 財務是基礎，讓其他一切成為可能
🔨 建造有價值的東西 — 不是為了賺錢而賺錢
⚡ 用 AI 放大自己 — 效率就是超能力
```

---

## 🤖 Multi-Agent 系統 (2026-01-28 上線)

### Agent 陣容

| Agent | Bot | accountId | Topic | 職責 |
|-------|-----|-----------|-------|------|
| 💭 夢想家 (我) | @LambyAI_bot | main | 1 | 統籌 + 生活 + 內容 |
| 🕵️ 神秘客 | @GourmetLamb_bot | mystery-shopper | 40 | Maat 開發 |
| 💰 投資客 | @InvestorLamb_bot | investor | 43 | Polymarket |
| 🎯 賞金獵人 | @BountyHunterLamb_bot | bounty-hunter | 2262 | Bug Bounty |
| 🪝 虎克船長 | @DriverLamb_bot | captain-hook | 2412 | Hookathon |

### 會議系統

| 類型 | 時間 | Topic | 說明 |
|------|------|-------|------|
| 📋 每日會議 | 02:00 AM | 3979 (會議廳) | 自動召開，10分鐘快速過完 |
| ☀️ 早安報告 | 08:00 AM | 1 (夢想家) | 向 JhiNResH 報告摘要 |
| 🚨 緊急會議 | JhiNResH 說「召開緊急會議」 | 3979 | 即時討論 |

### Agent 間通訊

- **sessions_send**: 我可以發訊息給其他 Agent
- **message tool + accountId**: Agent 可以用自己的 bot 發訊息到 Telegram
- **共享文件**: 所有 Agent 讀取同一個 workspace

---

## 📂 Active Projects

### 🕵️ Ma'at (BNB Chain Hackathon) - 神秘客負責
- **Repo**: `/Users/jhinresh/Desktop/maat`
- **GitHub**: https://github.com/JhiNResH/maat
- **What**: AI-powered restaurant verification app
- **Stack**: React + TypeScript + Vite, Supabase, Privy auth, opBNB
- **Contract**: `0xEa9FE8E5eF0E0671ce5b58b6E3dD4B87f9edFa35` (opBNB Testnet)
- **Status**: 規劃中，需確認 Deadline 和 MVP 範圍
- **阻礙**: Gemini API Key、大眾點評反爬、MVP 範圍未定

### 🪝 Kindred (Uniswap Hookathon) - 虎克船長負責
- **Skill**: `/Users/jhinresh/clawd/skills/kindred-hookathon/`
- **What**: 預測市場 DeFi 層 (借貸/聚合器)
- **Deadline**: March 15, 2026 (約 47 天)
- **Status**: 設計 100%，開發 0%
- **待決定**: 借貸版 vs 聚合器版 (虎克船長建議聚合器優先)

### 💰 Kindred Fund (Polymarket) - 投資客負責
- **目標**: $1000 (Mac Mini fund)
- **當前**: $44.90 (4.49%)
- **策略**: 體育 Moneyline + 傷病資訊不對稱
- **Trade Log**: Google Sheet
- **Skill**: `/Users/jhinresh/clawd/skills/the-edge/`

### 🎯 Bug Bounty - 賞金獵人負責
- **已完成**: PumpFun 審計 (3 CRITICAL + 2 HIGH)
- **下一步**: Alchemix v2 ($300k 賞金)
- **阻礙**: Slither/Semgrep 未安裝
- **Skill**: 使用 Trail of Bits skills

---

## 💭 我額外負責的事務

### 💝 女友事務 (Topic 134)
- 苗棠焯相關
- 重要日期待收集

### 💪 健身追蹤 (Topic 1288)
- JhiNResH 一週健身 4-5 次
- 訓練分配待確認

### 📝 博主 (Topic 47)
- 每日發文
- 深度研究 DeFi/預測市場
- 佐爷風格

---

## 👥 Potential Collaborators

### @iXiaoWu (XiaoWu)
- **Project**: VouchRate - Web3 評價平台
- **Location**: Shanghai
- **Similarity to Maat**: 80%+
- **Note**: 2026-01-26 表示想合作

---

## ⚙️ JhiNResH Preferences

- Prefers fast iteration, wants results quickly
- Communicates in mix of English and Chinese
- Appreciates screenshots of working features
- Web3/blockchain focused developer
- Timezone: PST (America/Los_Angeles)

## Tech Stack
- React + TypeScript + Vite
- Foundry for smart contracts
- Supabase for backend
- Privy for Web3 auth
