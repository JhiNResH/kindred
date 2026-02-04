# AUTONOMOUS.md - 自治開發計劃

**啟動:** 2026-02-03 11:00 PST
**Deadline:** 7 天 (2026-02-10)
**目標:** Kindred MVP 完成並可 Demo

---

## ⚖️ Governance (CRITICAL)

**所有開發行為必須嚴格遵守以下文件：**

1. **[項目規則 (Project Rules)](file:///Users/jhinresh/clawd/team-kindred/RULES.md)**
   - GitHub Flow only (Issues -> Branch -> PR -> LGTM -> Merge)
   - Conventional Commits
   - No direct push to main

2. **[黑客松技能 (Hackathon Skill)](file:///Users/jhinresh/clawd/team-kindred/SKILL.md)**
   - 30-minute rule (立即開工)
   - Platform Token creation (Mint Club)
   - Submission requirements

---

## 🎯 產品願景 (Updated 11:10 PST)

**一句話：** 「付費即預測、信用即流動性」的 Social-Financial Hybrid Layer

### 三大支柱：

1. **評論即資產 (ERC-404)** - 質押發評論，評論 = NFT + 流動代幣，x402 付費解鎖
2. **排行榜即預測市場** - Upvote = 投注，早期發現者獲分潤
3. **Agentic Hook** - Dynamic Fee，高信用 = 低手續費

詳細見：`/Users/jhinresh/clawd/team-kindred/PRODUCT_VISION.md`

---

## 🔍 Gap Analysis

### ✅ 已完成

- [x] 基本 UI 框架 (pages, components)
- [x] API routes (reviews, markets, leaderboard, stakes)
- [x] Smart contracts (KindredHook, ReputationOracle)
- [x] 安全審計
- [x] Privy 認證
- [x] Charts, Leaderboard, Navigation

### ❌ 缺口 (優先級排序)

| #   | Gap                                      | 負責        | 重要性      |
| --- | ---------------------------------------- | ----------- | ----------- |
| 1   | **Demo Flow** - 完整可展示的用戶旅程     | Tim         | 🔥 Critical |
| 2   | **Contract Deployment** - 部署到 testnet | Patrick     | 🔥 Critical |
| 3   | **前後端整合** - API 連接真實 UI         | Tim + Steve | 🔥 Critical |
| 4   | **Landing Page** - 專業的首頁            | Tim         | 高          |
| 5   | **Polymarket 數據** - 真實市場數據       | Steve       | 高          |
| 6   | **Wallet Flow** - 連接錢包完整體驗       | Tim         | 高          |
| 7   | **數據持久化** - 從 in-memory 改為 DB    | Steve       | 中          |
| 8   | **Mobile 優化** - 響應式完善             | Tim         | 中          |

---

## 👥 Agent 自治任務

### � Steve Jobs (Full Stack Product Lead)

**自治目標:** Demo Ready & 數據流通

**持續工作:**

1. **Frontend**: 建立完整 Demo Flow (Pages, Wallet, Leaderboard)
2. **Backend**: 整合 Polymarket 數據, API 完善
3. **Integration**: 確保前後端數據串接
4. **Docs**: API 文檔與部署文檔

**自主決策權:**

- UI/UX 與 API 設計全權負責
- 技術棧選擇與優化
- 發現 Bug 直接修復

### 🛡️ Patrick Collins (Contracts & Security)

**自治目標:** 合約部署與安全

**持續工作:**

1. 部署到 testnet (Sepolia/Base)
2. 驗證合約與寫測試
3. 確保前端調用邏輯安全

**自主決策權:**

- 合約架構與 Gas 優化
- 安全審計標準

### 🐺 Jensen (CEO/協調)

**自治目標:** 確保團隊運轉

1. 監控 Steve 與 Patrick 進度
2. 解決 Blockers
3. 更新 STATUS.md 與匯報

---

## 📋 每日自治流程

### Morning (08:00)

- [ ] Jensen: 檢查 overnight 進度
- [ ] 各 agent: 報告昨日完成 + 今日計劃

### Midday (12:00)

- [ ] Jensen: 進度 sync
- [ ] 處理任何 blockers

### Evening (18:00)

- [ ] 各 agent: Push 當日 commits
- [ ] Jensen: 更新 STATUS.md

### Night (22:00)

- [ ] Jensen: 發每日報告給 JhiNResH
- [ ] 規劃明日任務

---

## 🚨 何時需要人類介入

只有以下情況才打擾 JhiNResH：

1. 需要花錢 (部署 gas, API keys)
2. 重大產品方向改變
3. 無法解決的 blocker
4. 外部溝通 (提交 hackathon, 聯繫評審)

其他一切 **自己解決**。

---

## 📊 成功指標

| 指標       | 目標                |
| ---------- | ------------------- |
| Demo 可用  | ✅ 完整用戶旅程     |
| 合約部署   | ✅ Testnet 上線     |
| 所有 PRs   | ✅ Merged           |
| Build 狀態 | ✅ 通過             |
| 文檔完整   | ✅ README, API docs |

---

_這是我們的自治憲法。執行！_
