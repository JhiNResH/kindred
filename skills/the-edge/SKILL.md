---
name: the-edge
description: Prediction market trading system for Polymarket. Use when JhiNResH asks about betting opportunities, Polymarket, sports betting, prediction markets, 有什麼機會, or 預測市場. Focuses on finding +EV opportunities through injury information asymmetry in sports, and breaking news in politics/finance.
---

# The Edge

## ⚠️ 核心規則

1. **永遠推薦 MONEYLINE，不是 SPREAD**
2. **下注前確認類型**
3. **單場最多 30% bankroll**
4. **只賭有資訊優勢的市場**

## 教訓記錄

| 日期 | 事件 | 教訓 |
|------|------|------|
| 2026-01-27 | Pistons 贏但沒 cover -6.5 | 傷病 edge = 會贏，不保證大勝 |

---

## Workflow

### 收到「有什麼機會」時：

1. 查 Polymarket 運動 → `polymarket.com/sports/nba/games`
2. 查傷病報告 → `espn.com/nba/injuries`
3. 找資訊不對稱（星級球員 OUT）
4. **推薦 MONEYLINE + 確認**

### 推薦格式

```
🎯 [Team] MONEYLINE（不是 Spread！）
💰 $X（最多 30% bankroll）
📊 Edge: [原因]
⏰ 結算: [時間]
✅ 確認是 Moneyline？
```

---

## 數據源

**運動（最佳 edge）:**
- 傷病: espn.com/nba/injuries, espn.com/nhl/injuries
- 陣容: rotowire.com/basketball/nba-lineups.php
- 賠率: polymarket.com/sports/nba/games

**其他:**
- 政治: polymarket.com/politics
- 財經: polymarket.com/finance
- Crypto: polymarket.com/crypto

---

## Edge 來源

| 類型 | Edge 強度 | 說明 |
|------|-----------|------|
| 運動傷病 | ⭐⭐⭐⭐⭐ | MVP 級球員 OUT |
| Breaking news | ⭐⭐⭐ | 新聞還沒 price in |
| 極端賠率 | ⭐⭐ | >95% 或 <5% 可能錯 |

---

## ❌ 不做

- Spread（傷病不保證大勝）
- 每日股價（沒 edge）
- 地緣政治日常（難預測）
- 長期市場（鎖資金）
- 沒有資訊優勢的比賽

---

## Fund 追蹤

檔案: `memory/kindred-fund.md`
表格: [Google Sheet](https://docs.google.com/spreadsheets/d/1wMhgG_3vD8VcUmVsEQlHsgEc-eCqPcHxBH-oS1kie7g/edit?gid=987289467)
