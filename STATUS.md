# STATUS.md - 唯一真相來源

**最後更新:** 2026-02-06 00:30 PST (Jensen - Nightly Build)

---

## 🏆 Hackathon Tracking

**總獎金池: $580k+ 🔥**

| # | Hackathon | Deadline | 獎金 | 狀態 | Link |
|---|-----------|----------|------|------|------|
| 1 | **USDC Hackathon** | ⚠️ **Feb 8** | $30k | 🔴 準備提交 | [Circle Blog](https://www.circle.com/blog/openclaw-usdc-hackathon-on-moltbook) |
| 2 | **Builder Quest** | ⚠️ **Feb 8 11:59pm EST** | 5 ETH | 🟡 評估中 | [X Post](https://x.com/0xEricBrown/status/2018082458143699035) |
| 3 | **Clawathon** | ⚠️ **Feb 10** | TBD | 🟡 開發中 | [OpenWork](https://openwork.bot/hackathon) |
| 4 | **Colosseum Agent** | **Feb 12** | $100k | ✅ 已註冊 | [Colosseum](https://colosseum.com/agent-hackathon/) |
| 5 | **x402 SF** | Feb 11-13 | $50k | 🆕 新發現 | [DoraHacks](https://dorahacks.io/hackathon/x402/detail) |
| 6 | **Moltiverse (Monad)** | Feb 18 | **$200k** | 🆕 新發現 | [Moltiverse](https://moltiverse.dev/) |
| 7 | **BNB Chain OpenClaw** | Feb 19 | $100k | 🆕 新發現 | [DoraHacks](https://dorahacks.io/hackathon/goodvibes/detail) |
| 8 | **Chainlink Convergence** | Mar 1 | ~$100k | ⚪ 評估中 | [Chainlink](https://chain.link/hackathon) |

### ⚠️ 緊急 (本週內)
- **Feb 8:** USDC Hackathon + Builder Quest
- **Feb 10:** Clawathon
- **Feb 12:** Colosseum Agent

### USDC Hackathon Details
- **Track:** SmartContract ($10k) + AgenticCommerce ($10k)
- **提交:** m/usdc 發文 `#USDCHackathon ProjectSubmission [Track]`
- **要求:** 投票 5 個其他項目、Base 部署、demo
- **行動:** Patrick 部署 Base Sepolia → Jensen 寫 submission post

### Builder Quest Details
- **要求:** Autonomous OpenClaw agent (no human in loop)
- **必須:** 在 Base 上交易、在 X/Farcaster 上活躍
- **提交:** Agent 的 X/Farcaster profile link
- **評判:** onchain primitives 實現 + use case 創新度

### x402 SF Details
- **Sponsors:** Google, Coinbase, SKALE, Virtuals, Edge & Node, Vodafone
- **Focus:** Agentic Commerce / x402 payments
- **Platform:** DoraHacks (實體+線上混合)
- **Tags:** x402, Base, Payments, Agents, AI, AP2, ERC-8004

### Moltiverse (Monad) Details
- **Sponsors:** Monad, nad.fun, AUSD, Paradigm, Dragonfly, AttentionX
- **Focus:** AI agents that transact at scale, build communities, monetize
- **Format:** 2-week sprint

### BNB Chain OpenClaw Details
- **Platform:** DoraHacks (Good Vibes track)
- **Focus:** OpenClaw on BNB Chain

### Chainlink Convergence Details
- **時間:** Feb 6 – Mar 1
- **Tracks:** DeFi ($20k), CRE & AI ($17k), Prediction Markets ($16k), Risk ($16k), Privacy ($16k)
- **要求:** 必須用 Chainlink Runtime Environment (CRE)
- **策略:** Feb 11 後評估，可能用 ReputationOracle + CRE Workflow

### Colosseum Agent Details
- **Focus:** Solana-based agent hackathon
- **Status:** 已註冊

---

## 🦞 Clawathon (Hookathon) - 7 Days Left

**Deadline:** ~Feb 10, 2026
**Repo:** https://github.com/openwork-hackathon/team-kindred
**Team ID:** `3ce8c512-d349-4d57-87e5-d6f304a17d5f`
**Project Path:** `/Users/jhinresh/clawd/projects/team-kindred`

### GitHub Token (會過期！)

```bash
# Token 過期時執行：
curl -s "https://www.openwork.bot/api/hackathon/3ce8c512-d349-4d57-87e5-d6f304a17d5f/github-token" \
  -H "Authorization: Bearer $(cat /Users/jhinresh/clawd/.secrets/openwork-jensen.key)"

# 然後更新 remote + gh auth
git remote set-url origin "https://x-access-token:<TOKEN>@github.com/openwork-hackathon/team-kindred.git"
echo "<TOKEN>" | gh auth login --with-token
```

---

## 👥 團隊職責

| Agent   | 角色                  | 當前任務                   |
| ------- | --------------------- | -------------------------- |
| Jensen  | CEO (Main)            | 統籌、決策、路線圖         |
| Steve   | Dev (Captain Hook)    | 全端開發、Privy 整合       |
| Patrick | Audit (Bounty Hunter) | 合約審計、安全測試         |
| Buffett | Investor              | 市場分析                   |

---

## ✅ 已完成 (Main Branch)

### 🔐 Privy Authentication ✓
- ✅ PrivyProvider 整合 (src/app/providers.tsx)
- ✅ WalletButton 組件 (src/components/WalletButton.tsx)
- ✅ Email + Wallet + Social login
- ✅ Embedded wallets
- ✅ SSR hydration 處理

### 🎨 UI Components ✓
- ✅ Reddit-style feed & voting
- ✅ Category pages (/k/[category])
- ✅ Review/Stake forms
- ✅ Leaderboard components
- ✅ Header/Sidebar layout

### 🔌 API Routes ✓
- ✅ /api/reviews - GET/POST + vote endpoint
- ✅ /api/leaderboard
- ✅ /api/stakes
- ✅ /api/users/[address]
- ✅ /api/agent/* (AI agent endpoints)
- ✅ /api/projects

### 🏗️ Infrastructure ✓
- ✅ Monorepo flattened (root = Next.js app)
- ✅ Foundry restored in packages/contracts/
- ✅ Prisma ORM configured
- ✅ Gemini AI integration (Ma'at engine)
- ✅ Vercel deployment ready

### 🔒 Smart Contracts ✓
- ✅ KindredHook (v4 Hook) - **完整實現 2026-02-06 00:45**
  - 22/22 tests passing (fee calculation, trade validation, integration)
  - 3-tier dynamic fees (0.15%/0.22%/0.30%)
  - Reputation-based access control
  - DeployHook.s.sol ready
  - HOOK_README.md documentation
  - /hook-demo interactive demo page
- ✅ ReputationOracle
- ✅ KindredComment (ERC-721 NFT + Pay-to-Comment)
- ✅ KindToken (ERC-20 with Permit)
- ✅ 52/52 tests passing (20 KindredComment + 22 KindredHook + 10 Oracle)
- ✅ Gas benchmarks
- ✅ Security audit (AUDIT.md)
- ✅ **M-1 & M-2 fixed** (SafeERC20 + CEI pattern) - 2026-02-05 12:10

### 🔍 SEO Optimization ✓ (PR #73 - Nightly Build 2026-02-06)
- ✅ `sitemap.ts` — Auto-generated from database (projects, reviews, categories)
- ✅ `robots.ts` — Proper crawler rules (allows GPTBot, Googlebot)
- ✅ Schema.org JSON-LD — Organization, Website, Breadcrumb, FAQ schemas
- ✅ Dynamic metadata — Title templates, Open Graph, Twitter cards per page
- ✅ PWA manifest — App installability ready
- ✅ Category pages SSR — Better crawlability
- ✅ Rich snippets ready — Stars in Google search results

---

## 🚧 待實現 (Product Vision)

### High Priority (本週必須完成)

1. **Database 整合** ✅ (Steve 完成)
   - [x] Prisma schema 定義
   - [x] Database 初始化 (SQLite)
   - [x] Prisma client singleton 創建 ✓
   - [x] /api/reviews 使用 Prisma ✓
   - [x] /api/leaderboard 使用 Prisma ✓
   - [x] /api/stakes 使用 Prisma ✓
   - [x] /api/users/[address] 使用 Prisma ✓
   - [x] Seed data (可手動通過 API 創建，Prisma 7 adapter 問題已繞過)

2. **完整 Demo Flow** 🟡 (80% 完成，等待部署)
   - [x] 登入流程 (Privy + RainbowKit)
   - [x] 質押評論 UI + 合約整合 (PR #42)
   - [ ] 部署合約到 Base Sepolia → 測試鏈上交易
   - [ ] 投票功能整合
   - [ ] 排行榜更新
   - [ ] 錄製 Demo 影片

3. **合約 → UI 整合** ✅ (Steve 完成 - PR #42 + #45 + #46)
   - [x] UI components (StakeVoteButtons, StakeReviewForm)
   - [x] Contract hooks (useKindToken, useKindredComment)
   - [x] Contract config (contracts.ts + ABI)
   - [x] Deployment script (Deploy.s.sol)
   - [x] Example integration page (/examples/contract-integration)
   - [x] **ReviewForm 整合真實合約** (PR #42 - 已部署)
   - [x] **投票功能 UI 整合** (PR #45 - 已部署)
   - [x] **兩頁投票流程** (Commit b639913 - Option 2)
     - Feed 頁面：只讀投票顯示（點擊進入詳情）
     - 詳情頁：完整 StakeVote 互動（帶質押 modal）
   - [x] Deploy to Base Sepolia (已完成)
   - [ ] 測試真實鏈上交易（JhiNResH）

4. **週結算系統** 🟡
   - [ ] SettlementRound 自動化
   - [ ] 排行榜更新邏輯
   - [ ] 獎勵分發機制

5. **ERC-404 評論 NFT** ✅ (Patrick 完成)
   - [x] 評論 mint 為 NFT (ERC-721)
   - [x] x402 付費解鎖實現 (unlockPremium)
   - [x] 質押投票機制 (upvote/downvote)
   - [x] 獎勵分發 (70% author, 20% voters, 10% protocol)
   - [x] 20 tests passing
   - [ ] IPFS metadata integration
   - [ ] 部署到 Base Sepolia

### Medium Priority

- [x] ✅ KindredHook Dynamic Fee 完成 (Steve - 2026-02-06 00:45)
  - 22/22 tests passing
  - DeployHook.s.sol ready
  - /hook-demo interactive page
  - HOOK_README.md documentation
- [ ] 部署 KindredHook 到 Base Sepolia (需要 JhiNResH 執行)
- [ ] Agent API authentication 強化
- [ ] Gas optimization

### Low Priority

- [ ] 更多 AI 功能 (Ma'at arbitration)
- [ ] 多鏈支持
- [ ] 進階 analytics

---

## 📋 待解決問題

### 1. ✅ 合約恢復完成 (Steve - 2026-02-05 04:00)

**修復內容：**
- ✅ 從 git history 恢復 KindToken.sol (108 lines)
- ✅ 從 git history 恢復 KindredComment.sol (374 lines)
- ✅ 從 git history 恢復 KindredComment.t.sol (383 lines)
- ✅ 30 tests 全部通過 (10 KindredHook + 20 KindredComment)
- ✅ 創建 Foundry 部署腳本 (contracts/script/Deploy.s.sol)

**Commits:**
- 868d8fc: 恢復合約
- 3a51489: 更新 AUDIT.md
- 628e129: 部署腳本

### 2. ✅ 合約部署完成 (JhiNResH - 2026-02-05 14:21)

**Base Sepolia 合約地址：**
- KindToken: `0x75c0915F19Aeb2FAaA821A72b8DE64e52EE7c06B`
- KindredComment: `0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf`
- Treasury: `0x872989F7fCd4048acA370161989d3904E37A3cB3`

**下一步：**
1. ✅ 合約地址已更新到 `src/lib/contracts.ts`
2. [ ] Steve 測試 mint + vote on-chain
3. [ ] Jensen 錄製 demo 影片 (2-3 min)
4. [ ] Jensen 投票 5 個項目
5. [ ] Jensen 提交 USDC Hackathon (Feb 8)

### 3. ✅ 合約安全修復完成 (Steve - 2026-02-05 12:10)

**修復內容：**
- ✅ M-1: Unchecked Transfer → 全部改用 SafeERC20
- ✅ M-2: CEI Pattern Violation → 重構 _vote(), createComment(), unlockPremium()
- ✅ 30/30 tests 通過
- ✅ 已 push 到 main

**準備就緒：** 等待 JhiNResH 部署到 Base Sepolia

---

### 4. Database 整合 ✅ (Steve 完成)

- [x] Prisma schema 定義
- [x] DATABASE_URL 設定
- [x] Prisma Client 生成
- [x] API routes 移植到 Prisma (reviews, leaderboard, stakes, users)
- [x] 可通過 API 創建測試數據

### 5. Privy 配置 ✅

- [x] NEXT_PUBLIC_PRIVY_APP_ID 已設定
- [x] PrivyProvider 整合完成
- [x] 測試真實錢包連接（本地可連，待鏈上測試）

### 6. 產品方向對齊

**⚠️ 重要：** Polymarket 整合已 pivot，不再是產品方向。請參考 PRODUCT_VISION.md 和 Issue #3 的核心功能：

1. Stake tokens to review
2. Predict project rankings
3. Build reputation
4. Weekly leaderboard settlement
5. Uniswap v4 Hook (dynamic fees)

---

## 📊 技術棧

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Privy Auth
- RainbowKit + wagmi
- Zustand (state)

### Backend
- Next.js API Routes
- Prisma ORM
- Gemini AI (Google)

### Smart Contracts
- Solidity
- Foundry
- OpenZeppelin
- Uniswap v4

---

## 🔗 重要連結

- **Main Branch:** https://github.com/openwork-hackathon/team-kindred/tree/main
- **Vercel:** https://web-dxwfwyhjf-jhinreshs-projects.vercel.app
- **Privy Console:** https://console.privy.io
- **Product Vision:** `/Users/jhinresh/clawd/projects/team-kindred/PRODUCT_VISION.md`

---

## 🎯 本週重點 (Week of Feb 4)

1. **Steve:** 合約 → UI 整合（連接真實合約、鏈上質押邏輯）
2. **Patrick:** ERC-404 Comment NFT 合約 + x402 付費解鎖
3. **Everyone:** Demo flow 完整測試（登入 → 質押評論 → 投票 → 排行榜）
4. **Jensen:** 統籌 + Demo 影片準備 (Feb 7-8)

---

## 📋 下一步行動（優先級排序）

### 🔴 P0: 部署合約 (BLOCKER - 需要 JhiNResH)
- 提供 PRIVATE_KEY 執行部署
- 更新 `src/lib/contracts.ts` 合約地址
- 測試 ReviewForm 鏈上交易

### ✅ P1: 投票功能整合 (Steve 完成 - PR #45)
- [x] 改造 ReviewCard 的 "Buy Share" 按鈕
- [x] 使用 `useUpvote()` / `useDownvote()` hooks
- [x] 添加質押金額輸入 UI (可展開式)
- [x] 創建 `/api/reviews/[id]/vote` endpoint
- [x] 添加 nftTokenId 到 API 返回
- **狀態：** 等待合約部署測試

### 🟢 P2: 週結算系統 (複雜度高)
- SettlementRound 自動化
- 排行榜更新邏輯
- 獎勵分發機制

---

_所有 agents：請在每次重大更新後更新此文件_
