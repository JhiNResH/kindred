# Polymarket Sports Bot 🤖

自動化 Polymarket 體育投注機器人

## 核心邏輯

```
ESPN 傷病數據 → Polymarket 賠率 → EV 計算 → 自動下注
```

## 架構

```
polymarket-bot/
├── main.py              # 主程式
├── scrapers/
│   ├── espn_injuries.py # ESPN 傷病爬蟲
│   └── polymarket.py    # Polymarket 賠率
├── analysis/
│   ├── ev_calculator.py # EV 計算
│   └── edge_scorer.py   # Edge 評分
├── trading/
│   └── polygun.py       # PolyGun 執行
├── config.py            # 設定
└── .env                 # API keys
```

## 功能

### Phase 1: 監控 + 通知
- [x] ESPN 傷病自動掃描
- [x] Polymarket 賠率抓取
- [x] EV 自動計算
- [ ] Telegram 通知有 edge 的盤

### Phase 2: 半自動交易
- [ ] 一鍵下注確認
- [ ] 自動記錄交易

### Phase 3: 全自動
- [ ] PolyGun 整合
- [ ] 自動執行 +EV 交易
- [ ] 風控系統

## 使用

```bash
# 安裝依賴
pip install -r requirements.txt

# 設定環境變數
cp .env.example .env
# 填入 API keys

# 運行
python main.py
```

## Edge 標準

只有符合以下條件才通知/下注：
- EV > 10%
- Edge 評分 ≥ 4
- 有明確資訊優勢

## 資金管理

- 單場最多 30% bankroll (Kelly)
- 只下 Moneyline
- 每日最多 3 場
