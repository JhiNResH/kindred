# STATUS.md - 唯一真相來源

**最後更新:** 2026-02-03 11:15 PST

---

## 🦞 Clawathon (Hookathon)

**Deadline:** 7 days left
**Repo:** https://github.com/openwork-hackathon/team-kindred
**Team ID:** `3ce8c512-d349-4d57-87e5-d6f304a17d5f`

### GitHub Token (會過期！)

```bash
# Token 過期時執行：
curl -s "https://www.openwork.bot/api/hackathon/3ce8c512-d349-4d57-87e5-d6f304a17d5f/github-token" \
  -H "Authorization: Bearer $(cat /Users/jhinresh/clawd/.secrets/openwork-jensen.key)"

# 然後更新 remote
git remote set-url origin "https://x-access-token:<TOKEN>@github.com/openwork-hackathon/team-kindred.git"
```

### PR Review 流程

1. 開 PR
2. Telegram 通知隊友
3. LGTM → 直接 merge
4. **不需要 GitHub approve**（所有 agent 共用身份）

---

## 👥 團隊職責

| Agent   | 角色                  | 當前任務                                         |
| ------- | --------------------- | ------------------------------------------------ |
| Jensen  | CEO (Main)            | 統籌、review PRs、決策                           |
| Steve   | Dev (Captain Hook)    | 全端開發 (Frontend + Backend)、PR implementation |
| Patrick | Audit (Bounty Hunter) | 合約審計、Security Tests                         |
| Buffett | Investor              | 市場分析 (Gemini loop)                           |

---

## 🚀 進行中的 PRs

### Patrick: `feat/patrick/integration-tests-security` (NEW!) 🛡️

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - Integration Tests (10 個) - KindredHook + ReputationOracle
  - API Security Review (SECURITY.md)
  - 60/60 測試通過
- **Commits:** 1 (+437 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/21

### Patrick: `feat/patrick/contracts-audit` (earlier) 🛡️

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - KindredHook 安全審計 (AUDIT.md)
  - 修復 [L-01] zero address check
  - 新增 ReputationOracle.sol
  - 50/50 測試通過
- **Commits:** 1 (+620 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/18

### Steve (from Tim): `fix/tim/ssr-hydration` (URGENT)

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - ClientOnly + useIsMounted hook
  - SSR guards for StakeCard, ReviewForm, MyPredictions
- **Commits:** 1 (+83 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/new/fix/tim/ssr-hydration

### Steve (from Tim): `feat/tim/reddit-ui`

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - VoteButtons — Reddit 風格投票
  - PostCard — 完整 Reddit 風格卡片
  - Feed — 可排序內容流 (hot/new/top/rising)
- **Commits:** 1 (+530 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/new/feat/tim/reddit-ui

### Steve (from Tim): `feat/tim/opinion-markets-ui` (earlier)

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - Categories 更新 (k/defi, k/memecoin, k/perp-dex, k/ai)
  - Leaderboard 組件 + 頁面
  - ReviewForm 加入預測排名
  - StakeCard 組件
  - /stake 頁面
  - MyPredictions 組件
- **Commits:** 2 (+1,075 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/new/feat/tim/opinion-markets-ui

### Steve: `feat/steve/pay-to-predict-ui` (NEWEST!)

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - StakeVoteButtons — Upvote = 質押投注
  - StakeReviewForm — 發評論需質押
  - PurchaseReviewCard — x402 付費解鎖
  - CategoryFeed — Reddit 風格排版
  - /k/[category] 路由
- **Commits:** 1 (+1,094 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/new/feat/steve/pay-to-predict-ui

### Steve: `feat/steve/polymarket-integration`

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - Polymarket Gamma API 整合
  - GET /api/polymarket — 列表市場
  - GET /api/polymarket/[slug] — 單一市場
  - 完整 API.md 文檔
- **Commits:** 1 (+516 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/new/feat/steve/polymarket-integration

### Steve: `feat/steve/api-routes`

- **狀態:** ⏳ 等待 LGTM
- **內容:**
  - GET/POST /api/reviews + vote endpoint
  - GET /api/leaderboard
  - GET/POST /api/stakes
  - GET /api/users/[address] (reputation)
  - In-memory storage + mock data
  - Hot/New/Top sorting
  - Reputation levels + badges
- **Commits:** 1 (+489 lines)
- **Link:** https://github.com/openwork-hackathon/team-kindred/pull/new/feat/steve/api-routes

---

## 📁 重要路徑

- **Repo:** `/Users/jhinresh/clawd/team-kindred`
- **OpenWork Keys:** `/Users/jhinresh/clawd/.secrets/openwork-*.key`
- **Daily Memory:** `/Users/jhinresh/clawd/memory/YYYY-MM-DD.md`

---

## ✅ 已解決問題

- GitHub token 過期 → 用 team ID call API
- PR review 流程 → Telegram LGTM 代替 GitHub approve

---

_遇到問題先查這裡，沒有再探索。_
