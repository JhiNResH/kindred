# How to make your agent learn and ship while you sleep

**來源:** https://x.com/ryancarson/status/2016520542723924279
**作者:** @ryancarson (Ryan Carson)
**日期:** 2026-01-28
**讚數:** 1743

---

## 核心概念

Agent 在你睡覺時：
1. 回顧當天工作，提取學習
2. 更新 AGENTS.md
3. 選擇下一個優先項實作
4. 開 PR

---

## Two-Part Loop

| 時間 | 任務 | 腳本 |
|------|------|------|
| 10:30 PM | Compound Review | `daily-compound-review.sh` |
| 11:00 PM | Auto-Compound | `auto-compound.sh` |

**順序重要：** Review 先更新 AGENTS.md，Implementation 才能受益於新學習。

---

## 工具

1. **[Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin)**
   - 提取學習存到 AGENTS.md
   - 原作者: @kieranklaassen

2. **[Compound Product](https://github.com/snarktank/compound-product)**
   - 自動化層：report → PRD → tasks → PR
   - 包含 auto-compound.sh, loop.sh

3. **[Ralph](https://github.com/snarktank/ralph)**
   - 自主迴圈，持續執行直到完成

---

## Compound Review 腳本

```bash
#!/bin/bash
# scripts/daily-compound-review.sh

cd ~/projects/your-project

git checkout main
git pull origin main

amp execute "Load the compound-engineering skill. Look through and read each Amp thread from the last 24 hours. For any thread where we did NOT use the Compound Engineering skill to compound our learnings at the end, do so now - extract the key learnings from that thread and update the relevant AGENTS.md files so we can learn from our work and mistakes. Commit your changes and push to main."
```

---

## Auto-Compound 腳本

```bash
#!/bin/bash
# scripts/compound/auto-compound.sh

set -e
cd ~/projects/your-project

source .env.local

# Fetch latest (including tonight's AGENTS.md updates)
git fetch origin main
git reset --hard origin/main

# Find the latest prioritized report
LATEST_REPORT=$(ls -t reports/*.md | head -1)

# Analyze and pick #1 priority
ANALYSIS=$(./scripts/compound/analyze-report.sh "$LATEST_REPORT")
PRIORITY_ITEM=$(echo "$ANALYSIS" | jq -r '.priority_item')
BRANCH_NAME=$(echo "$ANALYSIS" | jq -r '.branch_name')

# Create feature branch
git checkout -b "$BRANCH_NAME"

# Create PRD
amp execute "Load the prd skill. Create a PRD for: $PRIORITY_ITEM. Save to tasks/prd-$(basename $BRANCH_NAME).md"

# Convert to tasks
amp execute "Load the tasks skill. Convert the PRD to scripts/compound/prd.json"

# Run the execution loop
./scripts/compound/loop.sh 25

# Create PR
git push -u origin "$BRANCH_NAME"
gh pr create --draft --title "Compound: $PRIORITY_ITEM" --base main
```

---

## 結果

每天早上你會有：
- 更新的 AGENTS.md（含新學習）
- Draft PR（實作下一個優先項）
- 完整 logs

**Compound Effect:** Agent 每天讀自己更新的指令，週一發現的模式會影響週二的工作。

---

## 金句

> "Stop prompting. Start compounding."

> "The goal is a self-improving loop: every unit of work makes future work easier."

---

*Saved: 2026-01-30*
