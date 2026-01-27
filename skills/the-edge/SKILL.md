# THE EDGE 🎯

> 量化交易輔助系統 | Polymarket Alpha Capture System

## Identity

**Name:** The Edge
**Type:** Quantitative Sports Betting Analysis System
**Version:** 1.0.0
**Last Updated:** 2026-01-27

## Core Mission

利用資訊不對稱與數據模型，在 Polymarket 捕捉 Alpha。

**覆蓋範圍:** NBA | NHL (可擴展)

## When To Use This Skill

- 分析 Polymarket 體育盤口
- 執行每日市場掃描
- 生成交易信號 (Trade Signals)
- 管理 Kindred Fund 投資組合
- 發布 Twitter 自動化推文

---

## 📋 強制前置檢核協議 (Mandatory Pre-Flight Protocol)

在輸出任何『每日精選』或『分析建議』前，**必須執行以下 SOP**：

### Step 1: 賽事與陣容確認 (Matchup & Lineup Verification)

#### 🟢 Mode: 2025 Reality (實戰)
```
1. 訪問 Rotowire NBA Lineups
   URL: https://www.rotowire.com/basketball/nba-lineups.php
   
2. 訪問 Rotowire NHL Lineups  
   URL: https://www.rotowire.com/hockey/nhl-lineups.php

3. 確認核心球員狀態:
   - Active → ✅ 正常計算
   - GTD/Questionable → 🟡 降低信心度
   - OUT/IR → ⚠️ 重新計算 model probability
   
4. 若主力球員狀態不明:
   - 標記為 ⚠️ High Risk
   - 降低注碼 1 tier
```

#### 🔵 Mode: 2026 Simulation (模擬)
```
掃描 nba_2026_totals.csv (如有)
- 健康定義: G > 30 且 MP > 1000
- 受傷/衰退定義: G < 10 或效率值暴跌
```

### Step 2: 盤口流動性檢查 (Liquidity Check)

```
1. 訪問 Polymarket Sports
   URL: https://polymarket.com/sports/nba/games
   URL: https://polymarket.com/sports/nhl/games

2. 檢查項目:
   - Volume > $100k → ✅ 流動性佳
   - Volume $50k-$100k → 🟡 可接受
   - Volume < $50k → ⚠️ 小心滑點

3. 若預期滑點 > 5%:
   - 建議使用限價單 (Limit Order)
   - 或降低注碼
```

### Step 3: Edge 計算

```
Edge = Model_Probability - Market_Implied_Probability

Market Implied = Price in cents (e.g., 70¢ = 70%)

分類:
- Edge > 15% → 🚀 SNIPER
- Edge 5-15% → 🥇 STRONG  
- Edge 1-5%  → 🥈 VALUE
- Edge < 1%  → ❌ NO TRADE
```

---

## 💰 資金管理 (Bankroll & Staking)

### 基本原則
```
1 Unit (1u) = 總資金 5%

當前資金: $44.90
1u = $2.25
```

### 注碼分級

| 分類 | Edge | 注碼 | 說明 |
|------|------|------|------|
| 🚀 **Sniper** | > 15% | 3.0u | 資訊延遲套利，高信心 |
| 🥇 **Strong** | 5-15% | 2.0u | 數據與邏輯一致 |
| 🥈 **Value** | 1-5% | 1.0u | 賠率賠付比優 |
| 🛡️ **Split** | 特殊 | 70/30 | 看好冷門但對方有巨星 |

### 風險控制
```
- 單日最大曝險: 25% of bankroll
- 單筆最大: 3.0u (15%)
- 連續虧損 3 筆: 暫停 1 天重新評估
- 勝率 < 55% 持續 2 週: 檢討模型
```

---

## 🧠 量化模型核心 (Quant Logic)

### NBA Model

```python
# 基礎勝率計算
base_win_prob = team_record_pct * 0.4 + home_advantage * 0.15 + recent_form * 0.2 + h2h * 0.1 + rest_days * 0.15

# 傷病調整
if star_player_out:
    win_prob -= player_impact_rating * 0.1  # 通常 5-20%
    
# 2026 特殊考量
- Kevin Durant 轉隊 HOU 影響
- Bradley Beal 傷病扣除 LAC 20% 進攻火力
- 使用 EFF/36 衡量真實影響力
```

### NHL Model

```python
# 門將優先
goalie_gsax_weight = 0.35  # Goals Saved Above Expected

# 若先發門將缺陣
if backup_goalie:
    # 傾向 Over 或對家 ML
    adjust_total_over = True
    reduce_team_win_prob = 0.08
    
# 主場優勢 NHL 較小
home_advantage = 0.03  # vs NBA 0.06
```

---

## 🖥️ 交互指令 (Commands)

| 指令 | 功能 |
|------|------|
| `Scan 2025` | 聯網執行實時陣容檢查 + Polymarket 掃描 |
| `Scan 2026` | 基於模擬數據分析 |
| `Check Lineups` | 顯示特定賽事的陣容判讀 |
| `Show Signals` | 顯示當前所有交易信號 |
| `Portfolio Status` | 顯示 Kindred Fund 狀態 |
| `Execute [bet]` | 確認執行交易 |

---

## 📊 輸出格式 (Output Templates)

### Trade Signal Template
```
┌──────────────────────────────────────────────────────┐
│  🚀 SNIPER PICK (EDGE > 15%)                         │
│                                                      │
│  BET:       [Team] [ML/Spread]                      │
│  PRICE:     [XX]¢                                   │
│  STAKE:     [X.X]u ($[XX.XX])                       │
│  RETURN:    $[XX.XX] (+$[XX.XX])                    │
│                                                      │
│  EDGE:      +[XX]%                                  │
│  REASON:    [Key injury / info]                    │
│                                                      │
│  EXECUTE? [Y/N]                                     │
└──────────────────────────────────────────────────────┘
```

### Daily Summary Template
```
┌──────────────────────────────────────────────────────┐
│  THE EDGE | DAILY SUMMARY                            │
│  Date: YYYY-MM-DD                                   │
│                                                      │
│  Signals Generated: X                               │
│  Executed: X                                        │
│  Pending Results: X                                 │
│                                                      │
│  Bankroll: $XX.XX                                   │
│  Today P/L: +$X.XX                                  │
│  Weekly P/L: +$X.XX                                 │
│  Win Rate: XX.X%                                    │
└──────────────────────────────────────────────────────┘
```

---

## 🐦 Twitter 自動化

### 發文時機
1. **Pre-Game Signal** (賽前 2-4 小時)
   - 只發 🚀 Sniper 和 🥇 Strong picks
   - 延遲 30 分鐘避免被抄盤

2. **Result Update** (賽後)
   - 公布結果 ✅/❌
   - 更新累積戰績

### Tweet Template
```
🎯 THE EDGE | [SNIPER/STRONG] ALERT

🏀 [Team] ML @ [XX]¢
📊 Edge: +[XX]% | Model: [XX]%
⚠️ Key: [Injury info]

#NBA #SportsBetting #Polymarket
```

---

## 📁 相關文件

- **Fund Tracking:** `/Users/jhinresh/clawd/memory/kindred-fund.md`
- **Trade Log:** Google Sheet (see TOOLS.md)
- **Daily Notes:** `/Users/jhinresh/clawd/memory/YYYY-MM-DD.md`

---

## 🔄 每日例行 (Daily Routine)

### Morning (Market Open)
```
1. Check overnight results
2. Update fund balance
3. Scan today's games (Polymarket)
4. Check lineups (Rotowire) - may be incomplete early
```

### Afternoon (Pre-Game)
```
1. Re-scan lineups (confirmed starters)
2. Calculate final Edge
3. Generate Trade Signals
4. Post to Twitter (if 🚀 or 🥇)
5. Execute trades
6. Log to Google Sheet
```

### Evening (Post-Game)
```
1. Check results
2. Update P/L
3. Tweet results
4. Review any model errors
```

---

## 📈 Performance Tracking

### KPIs
- **Win Rate Target:** > 58%
- **ROI Target:** > 8% monthly
- **Sharpe Ratio:** Track variance

### Monthly Review
- Analyze losing bets for patterns
- Adjust model weights if needed
- Update this SKILL.md with learnings

---

## ⚠️ Risk Disclaimers

1. 這是真金白銀，不是遊戲
2. 過去表現不代表未來
3. 永遠只用能承受損失的錢
4. 資訊可能有延遲，市場會調整
5. 保持紀律，不追損失

---

*Last reviewed: 2026-01-27 by Kindred 🐺*
