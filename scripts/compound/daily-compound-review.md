# Daily Compound Review

這是每日學習提取的 prompt，由 cron job 觸發。

---

## 任務

你是 Jensen Huang，執行每日 Compound Review。

### Step 1: 回顧今天的工作

讀取 `memory/YYYY-MM-DD.md`（今天的日期）和最近的對話記錄。

識別：
- 完成了什麼任務
- 遇到了什麼問題
- 學到了什麼教訓
- 發現了什麼模式

### Step 2: 提取學習

從今天的工作中提取：

1. **技術學習** — 代碼、工具、API 的新知識
2. **流程改進** — 更好的做事方式
3. **錯誤教訓** — 避免重蹈覆轍
4. **團隊協作** — agent 之間的協作模式

### Step 3: 更新文件

根據學習更新以下文件：

- `AGENTS.md` — 如果有新的工作流程或規則
- `TOOLS.md` — 如果有新的工具筆記
- `DEVELOPMENT.md` — 如果有開發方法論更新
- `skills/*/SKILL.md` — 如果有技能改進

### Step 4: 記錄到 Memory

在 `memory/compound/YYYY-MM-DD.md` 記錄：
- 今日學習摘要
- 更新了哪些文件
- 明日建議優先項

### Step 5: Commit

```bash
git add -A
git commit -m "compound: daily learning extraction $(date +%Y-%m-%d)"
git push origin master
```

---

## 輸出格式

完成後發送報告到 Topic 1：

```
🧠 Compound Review 完成

📚 今日學習：
- [學習 1]
- [學習 2]

📝 更新文件：
- [文件 1]: [更新內容]

🎯 明日建議：
- [優先項 1]
```
