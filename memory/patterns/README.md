# Self-Learning Patterns

This directory stores the crystallized knowledge from the OpenClaw system's daily `compound-review` process.

## Structure

- **`failures.md`**: Tracks recurring issues, bugs, or inefficiencies.
  - Format: `[Date] Problem -> Root Cause -> Solution`
  - Purpose: Avoid making the same mistake twice.

- **`success.md`**: Records high-leverage strategies and effective workflows.
  - Format: `[Date] Strategy -> Result -> Integration Plan`
  - Purpose: Compound what works.

- **`knowledge_base.md`**: General knowledge and axioms derived from experience.
  - Format: Categorized insights (e.g., ## API Handling, ## Market Analysis)

## Automated Process

The `compound-review` cron job (Daily 22:30) performs the following:

1.  Analyzes the day's activities across all agents.
2.  Identifies failures and successes.
3.  Appends new findings to these files.
4.  Updates `AGENTS.md` if a pattern necessitates a rule change.

## Manual Usage

Humans can manually add insights here to guide the agents. Agents are instructed to read these files when facing relevant tasks.
