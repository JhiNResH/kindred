# The Edge - Prediction Market Trading

Use this skill when JhiNResH asks about prediction market opportunities, Polymarket bets, sports betting edges, or trading opportunities.

## Overview

The Edge is our systematic approach to finding +EV (positive expected value) opportunities on Polymarket and other prediction markets.

## ⚠️ 重要教訓 (Lessons Learned)

### 2026-01-27: Pistons vs Nuggets
- **情況**: Jokic + 3 starters OUT，推薦活塞
- **結果**: 活塞贏 109-107（只贏 2 分）
- **問題**: 下了 Spread -6.5，不是 Moneyline
- **虧損**: -$11.24

**教訓:**
1. **傷病 edge = 會贏，但不保證大勝**
2. **永遠推薦 MONEYLINE，不是 SPREAD**
3. **下注前確認用戶下的是什麼類型**

---

## Data Sources

### Sports
- **NBA Lineups:** https://www.rotowire.com/basketball/nba-lineups.php
- **NHL Lineups:** https://www.rotowire.com/hockey/nhl-lineups.php
- **NBA Injuries:** https://www.espn.com/nba/injuries
- **NHL Injuries:** https://www.espn.com/nhl/injuries
- **Polymarket NBA:** https://polymarket.com/sports/nba/games
- **Polymarket NHL:** https://polymarket.com/sports/nhl/games

### Politics / Finance / Crypto
- **Polymarket Trending:** https://polymarket.com/
- **Polymarket Politics:** https://polymarket.com/politics
- **Polymarket Finance:** https://polymarket.com/finance
- **Polymarket Crypto:** https://polymarket.com/crypto
- **Polymarket Earnings:** https://polymarket.com/earnings
- **News:** Reuters, CoinDesk, Yahoo Finance

---

## 🏀 Sports Betting Rules

### MONEYLINE vs SPREAD

| 類型 | 說明 | 何時用 |
|------|------|--------|
| **Moneyline** | 只要贏就行 | ✅ 傷病 edge（推薦）|
| **Spread** | 要贏超過 X 分 | ❌ 風險太高 |
| **Total O/U** | 總分高/低 | 特定情況 |

### ⚠️ 永遠推薦 MONEYLINE

傷病優勢 = 對方會輸，但不代表會輸很多
- 板凳球員會更努力
- 比賽節奏可能變慢
- 最後幾分鐘追分常見

### 下注前確認清單

```
✅ 確認是 MONEYLINE 不是 SPREAD
✅ 確認下注金額
✅ 確認比賽時間
✅ 截圖確認
```

---

## Workflow

### 1. Sports Opportunities (Highest Edge)

**傷病資訊是最大的 edge 來源**

Steps:
1. Check Polymarket for upcoming games (today + tomorrow)
2. Cross-reference with injury reports (ESPN, Rotowire)
3. Look for games where:
   - Star player(s) OUT but odds haven't adjusted
   - Multiple starters missing on one team
   - Late injury news (within hours of game)
4. Compare team records and recent form
5. **推薦 MONEYLINE，明確說不要 SPREAD**

**Key Injuries to Watch:**
- MVP-level players (Jokic, Giannis, Luka, etc.)
- Multiple starters out on same team
- Back-to-back games with rest considerations

### 2. Politics / Geopolitics

**Look for:**
- Government shutdown deadlines
- Cabinet changes / nominations
- Fed decisions
- International events with clear timelines

**Edge Sources:**
- Breaking news not yet priced in
- Extreme probabilities (>90% or <10%) that might be wrong
- Time-sensitive events with new information

**⚠️ 注意:** 長期市場（如 Fed Chair）會鎖住資金太久

### 3. Finance / Earnings

**Look for:**
- Earnings reports (check expectations vs. reality)
- M&A rumors (acquisition targets)
- IPO timing
- Fed rate decisions

**⚠️ 每日股票市場沒有 edge** - 價格已經很準確

### 4. Crypto

**Look for:**
- Regulatory news
- Fed Chair nominations (crypto-friendly candidates)
- ETF approvals
- Major protocol updates

---

## Decision Framework

### Bet Sizing

| Confidence | Edge Size | Bet Size |
|------------|-----------|----------|
| Very High | Clear info asymmetry | 30-40% of bankroll |
| High | Strong edge | 20-30% of bankroll |
| Medium | Moderate edge | 10-15% of bankroll |
| Speculative | Small edge | 5% of bankroll |

### Risk Rules
- **Never all-in on single bet**
- **單場比賽最多 30%**（之前 50% 太高）
- Politics: Max 20% on single event
- **只下有明確 edge 的市場**
- **不賭沒有資訊優勢的比賽**

---

## Trade Logging

Record all trades in Google Sheet:
```
URL: https://docs.google.com/spreadsheets/d/1wMhgG_3vD8VcUmVsEQlHsgEc-eCqPcHxBH-oS1kie7g/edit?gid=987289467
```

Log format:
- Date/Time
- Market
- **Bet Type (Moneyline/Spread/Total)**
- Position (Yes/No)
- Entry Price
- Amount
- Outcome
- P&L

---

## Fund Status

Track in: `/Users/jhinresh/clawd/memory/kindred-fund.md`

- Starting: $50
- Current: ~$22 (after 1/27 losses)
- Goal: $1000 (Mac Mini fund)

---

## Example Analysis (Updated)

### Sports (Best Edge)
```
Game: Pistons vs Nuggets
Nuggets OUT: Jokic, Gordon, Johnson, Braun (4 starters!)
Pistons OUT: LeVert (1 role player)
Records: Pistons 33-11, Nuggets 31-15
Edge: Clear information asymmetry

⚠️ 推薦: MONEYLINE 活塞贏（不是 Spread！）
金額: $10 (約 30% bankroll)
```

### Politics
```
Event: Government Shutdown
Current Odds: 75% Yes
Analysis: Already priced high, limited upside
Recommendation: Pass
```

---

## Response Format

Always provide:
1. **Market**: What to bet on
2. **Bet Type**: ⚠️ MONEYLINE（明確說明）
3. **Position**: Which side (Team name)
4. **Amount**: Specific dollar amount
5. **Edge**: Why this has positive EV
6. **Risk**: What could go wrong
7. **Timeline**: When result is known

### 下注前最後確認
```
🎯 [Team] MONEYLINE
💰 $X
⏰ 結算時間
✅ 確認是 Moneyline 不是 Spread？
```

---

## 不要做的事 ❌

1. ❌ 推薦 Spread（傷病 edge 不夠大）
2. ❌ 賭沒有傷病資訊的比賽
3. ❌ 賭每日股票價格（沒 edge）
4. ❌ 賭地緣政治日常事件（難預測）
5. ❌ 單場超過 30% bankroll
6. ❌ 長期鎖住資金的市場
