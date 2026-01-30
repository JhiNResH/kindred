# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## 📊 The Edge - Trading System

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
- Current: $23.66 + $10 active bet (updated 2026-01-30)
- Active: Pistons ML @ 59¢
- Goal: $1000 (Mac Mini fund)
- 策略 v2.0: 只打 Moneyline，EV>10%，明確傷病 edge 才下

---

## 🐦 Twitter (Pending Setup)
- Tool: `bird` CLI (installed)
- Account: TBD (The Edge dedicated account)
- Auth: Need to configure cookies

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
