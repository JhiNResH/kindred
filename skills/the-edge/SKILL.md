# The Edge - Prediction Market Trading

Use this skill when JhiNResH asks about prediction market opportunities, Polymarket bets, sports betting edges, or trading opportunities.

## Overview

The Edge is our systematic approach to finding +EV (positive expected value) opportunities on Polymarket and other prediction markets.

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
5. Recommend bet if clear information asymmetry exists

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

### 3. Finance / Earnings

**Look for:**
- Earnings reports (check expectations vs. reality)
- M&A rumors (acquisition targets)
- IPO timing
- Fed rate decisions

**Key Markets:**
- Company acquisitions (Ubisoft, GitLab, etc.)
- Earnings beats/misses
- Stock price targets

### 4. Crypto

**Look for:**
- Regulatory news
- Fed Chair nominations (crypto-friendly candidates)
- ETF approvals
- Major protocol updates

**Current Tracking:**
- Rick Rieder as Fed Chair candidate (pro-crypto)
- BTC/ETH price targets
- Stablecoin developments

## Decision Framework

### Bet Sizing

| Confidence | Edge Size | Bet Size |
|------------|-----------|----------|
| Very High | Clear info asymmetry | 40-50% of bankroll |
| High | Strong edge | 25-35% of bankroll |
| Medium | Moderate edge | 10-20% of bankroll |
| Speculative | Small edge | 5-10% of bankroll |

### Risk Rules
- Never all-in on single bet
- Sports: Max 50% on single game
- Politics: Max 30% on single event
- Always keep reserve for new opportunities

## Trade Logging

Record all trades in Google Sheet:
```
URL: https://docs.google.com/spreadsheets/d/1wMhgG_3vD8VcUmVsEQlHsgEc-eCqPcHxBH-oS1kie7g/edit?gid=987289467
```

Log format:
- Date/Time
- Market
- Position (Yes/No)
- Entry Price
- Amount
- Outcome
- P&L

## Fund Status

Track in: `/Users/jhinresh/clawd/memory/kindred-fund.md`

- Starting: $50
- Goal: $1000 (Mac Mini fund)

## Example Analysis

### Sports (Best Edge)
```
Game: Pistons vs Nuggets
Nuggets OUT: Jokic, Gordon, Johnson, Braun (4 starters!)
Pistons OUT: LeVert (1 role player)
Records: Pistons 33-11, Nuggets 31-15
Edge: Clear information asymmetry
Recommendation: Buy Pistons, $15-20
```

### Politics
```
Event: Government Shutdown
Current Odds: 75% Yes
Analysis: Already priced high, limited upside
Recommendation: Pass or small contrarian bet
```

## Quick Commands

When asked "今天有什麼機會":
1. Check Polymarket sports (NBA/NHL)
2. Pull injury reports
3. Cross-reference odds vs. injuries
4. Check politics/finance for breaking news
5. Present top 3-5 opportunities with edge analysis
6. Give specific recommendation with bet size

## Response Format

Always provide:
1. **Market**: What to bet on
2. **Position**: Which side (Yes/No, Team name)
3. **Amount**: Specific dollar amount
4. **Edge**: Why this has positive EV
5. **Risk**: What could go wrong
6. **Timeline**: When result is known
