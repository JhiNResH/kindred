# 🌙 Nightly Builds

每晚 3:00 AM PST，Kindred 會用 Codex CLI 建一個小工具。

---

## 📋 Backlog（待建）

### 🔥 今晚 (Jan 29)
1. **Twitter Scheduler** — 分析最佳發文時間 + 用 bird CLI 自動發文

### 高優先
2. **Content Curator** — 自動抓指定 KOL 的最新 tweets/文章
4. **Injury Alert System** — 爬 Shams/Woj 推文，比市場更快知道傷病
5. **Trade Logger CLI** — 快速記錄交易到 Google Sheet

### 中優先
6. **Daily Digest Generator** — 整理每日 memory 成摘要
7. **Polymarket Odds Tracker** — 監控特定市場賠率變化
8. **Edge Calculator** — 計算預期價值和 Kelly Criterion

### 探索
9. **YouTube Transcript Fetcher** — 下載影片字幕並翻譯
10. **Daily Briefing** — 每天早上一則訊息：天氣、行程、待辦

---

## ✅ 已完成

| 日期 | 工具 | 說明 | 位置 |
|------|------|------|------|
| 2026-01-28 | **thread-formatter** | 將 raw text 轉成 Twitter thread（句子分割、280字數、編號、複製到剪貼簿） | `~/clawd/tools/thread-formatter/` |

---

## 💡 規則

- 每次只建一個小東西
- 必須可測試、有 README
- 代碼放 `~/clawd/tools/[tool-name]/`
- 完成後更新這個文件
