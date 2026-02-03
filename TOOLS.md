# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## 📊 The Edge - Trading System

### 🛠️ Edge Calculator CLI (新武器！)
```bash
# 位置: ~/clawd/tools/edge-calculator/

# 計算期望值
edge ev --prob 0.65 --price 0.55

# 計算 Kelly 最優下注
edge kelly --prob 0.65 --price 0.55 --bankroll 23.66

# 互動模式
edge
```

### Google Sheet (Trade Log)
```
URL: https://docs.google.com/spreadsheets/d/1wMhgG_3vD8VcUmVsEQlHsgEc-eCqPcHxBH-oS1kie7g/edit?gid=987289467
```

### Polymarket
- Account connected via JhiNResH's wallet
- Use clawd browser profile for viewing
- Execution: Manual (JhiNResH executes, I record)

### Data Sources
- NBA Lineups: https://www.rotowire.com/basketball/nba-lineups.php
- NHL Lineups: https://www.rotowire.com/hockey/nhl-lineups.php
- Polymarket NBA: https://polymarket.com/sports/nba/games
- Polymarket NHL: https://polymarket.com/sports/nhl/games

### Fund Status
- See: `/Users/jhinresh/clawd/memory/kindred-fund.md`
- Current: $23.66 (updated 2026-02-01)
- Active: 無
- Goal: $1000 (Mac Mini fund)
- 策略 v2.0: 只打 Moneyline，EV>10%，明確傷病 edge 才下

---

## 🐦 Twitter
- Tool: `bird` CLI (installed)

### 帳號設定
| 帳號 | Chrome Profile | 模式 | 用途 |
|------|---------------|------|------|
| @JhiNResH | Default | 半自主（要審核） | 你的主帳，專業內容 |
| @0xjh1nr3sh | Profile 5 | 全自主 | Agent 人格帳號 |

### 指令
```bash
# 主帳 @JhiNResH
bird tweet "內容"

# 副帳 @0xjh1nr3sh  
bird --chrome-profile-dir "/Users/jhinresh/Library/Application Support/Google/Chrome/Profile 5" tweet "內容"
```

---

## 🤝 跨 Agent 協作 (Updated 2026-01-30)

### Session Keys (會議廳 Topic 3979)
| Bot | 身份 | accountId | Session Key |
|-----|------|-----------|-------------|
| @LambyAI_bot | Jensen Huang 🐺 | main | `agent:main:telegram:group:-1003723685993:topic:3979` |
| @GourmetLamb_bot | Tim Cook 🏭 | mystery-shopper | `agent:mystery-shopper:telegram:group:-1003723685993:topic:3979` |
| @DriverLamb_bot | Steve Jobs 🍎 | captain-hook | `agent:captain-hook:telegram:group:-1003723685993:topic:3979` |
| @BountyHunterLamb_bot | Patrick Collins 🛡️ | bounty-hunter | `agent:bounty-hunter:telegram:group:-1003723685993:topic:3979` |
| @InvestorLamb_bot | 巴菲特爺爺 💰 | investor | `agent:investor:telegram:group:-1003723685993:topic:3979` |
| @DreamerLamb_bot | Gary Vee 📝 | growth-hacker | `agent:growth-hacker:telegram:group:-1003723685993:topic:3979` |

### 完成開發任務 SOP (Tim → Patrick)
1. 完成開發
2. `sessions_send` 給 Patrick 請求審計
3. 發訊息到 Telegram 群組報告進度

### 審計請求 SOP (Patrick 收到請求時)
1. 收到 Tim 的審計請求（格式: "Patrick，我剛完成 XXX 合約開發，請幫忙審計。路徑: /path/to/contract"）
2. 執行審計：
   - Slither 靜態分析
   - Foundry tests (forge test)
   - 手動 code review
3. `sessions_send` 結果回給 Tim
4. 發訊息到 Telegram 群組報告審計結果

### 範例
```javascript
// Tim 請求審計
sessions_send({
  sessionKey: "agent:bounty-hunter:telegram:group:-1003723685993:topic:40",
  message: "Patrick，我剛完成 [合約名稱] 開發，請幫忙審計。路徑: [檔案路徑]"
})

// Patrick 回報結果給 Tim
sessions_send({
  sessionKey: "agent:mystery-shopper:telegram:group:-1003723685993:topic:40",
  message: "Tim，審計完成。[結果摘要]"
})
```

---

## 🔀 GitHub 協作 SOP (2026-02-02)

### ⚠️ 重要：Token 會過期！

OpenWork 的 GitHub token 約 1 小時過期。遇到 `Invalid username or token` 錯誤時：

```bash
# 1. 用 team ID (不是 name) 拿新 token
curl -s "https://www.openwork.bot/api/hackathon/3ce8c512-d349-4d57-87e5-d6f304a17d5f/github-token" \
  -H "Authorization: Bearer $(cat /Users/jhinresh/clawd/.secrets/openwork-jensen.key)"

# 2. 更新 remote URL
cd /Users/jhinresh/clawd/team-kindred
git remote set-url origin "https://x-access-token:<NEW_TOKEN>@github.com/openwork-hackathon/team-kindred.git"
```

**Team ID:** `3ce8c512-d349-4d57-87e5-d6f304a17d5f` (Kindred)
**Keys:** `/Users/jhinresh/clawd/.secrets/openwork-*.key`

### PR Review 流程（簡化版）

**不需要 GitHub approve！** 流程：
1. 開 PR
2. 在 Telegram 通知隊友
3. 隊友說 LGTM → 直接 merge

### 注意事項
- ⚠️ 所有 agents 共用 `openwork-hackathon[bot]` 身份
- ❌ 不能互相 approve（GitHub 認為是同一人）
- ✅ 用 Telegram LGTM 代替 GitHub approve
- 📝 merge 後發 Telegram 通知

### 🤖 自主開發模式 (2026-02-02)
JhiNResH 授權我們 24/7 自主開發，不需要經過他：
- ✅ 直接 merge PR，不用問
- ✅ 每個 agent 用自己的 key（我用 `openwork-jensen.key`）
- ✅ 自動部署到 Vercel
- ❌ 不要用 JhiNResH 的帳號推（用 bot token）

### 🚀 Vercel 部署
```bash
cd /Users/jhinresh/clawd/team-kindred/apps/web
vercel --prod --yes
```
**Production URL:** https://web-dxwfwyhjf-jhinreshs-projects.vercel.app

---

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
