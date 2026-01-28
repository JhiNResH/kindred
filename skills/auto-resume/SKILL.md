---
name: auto-resume
description: This skill should be used when the user asks to "auto-resume tasks", "handle rate limits", "continue after quota reset", "run overnight tasks", "auto-retry on rate limit", or needs scripts that automatically wait and resume when API quotas are exhausted. Provides bash scripts and strategies for uninterrupted AI-assisted work.
version: 0.1.0
---

# Auto-Resume Scripts

Handle API rate limits gracefully by automatically waiting and resuming tasks when quotas reset.

## Problem

Many developers encounter "quota exhausted" errors mid-task, especially during overnight work. Manual intervention is required to restart, breaking workflow and wasting time.

## Solution

Use wrapper scripts that detect rate limits, wait until quota resets, and automatically resume the task.

## Quick Start

### Basic Auto-Resume Loop

```bash
# Simple retry loop - retries every hour until success
~/clawd/skills/auto-resume/scripts/auto-resume.sh "claude 'Continue the refactoring task'"
```

### With Custom Reset Time

```bash
# Wait until 3 AM PST when quotas typically reset
~/clawd/skills/auto-resume/scripts/auto-resume.sh \
  --reset-time "03:00" \
  "claude 'Finish building the API integration'"
```

### With Max Retries

```bash
# Try up to 5 times before giving up
~/clawd/skills/auto-resume/scripts/auto-resume.sh \
  --max-retries 5 \
  "claude 'Complete the test suite'"
```

## Script Usage

### auto-resume.sh

Main wrapper script for auto-resuming tasks.

```bash
auto-resume.sh [options] "<command>"
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `--reset-time HH:MM` | Wait until specific time (24h format) | None (uses interval) |
| `--interval SECONDS` | Retry interval in seconds | 3600 (1 hour) |
| `--max-retries N` | Maximum retry attempts | 0 (infinite) |
| `--on-success CMD` | Command to run on success | None |
| `--on-failure CMD` | Command to run on final failure | None |
| `--log FILE` | Log output to file | None |
| `--quiet` | Suppress status messages | Off |

**Exit Codes:**
- `0` - Task completed successfully
- `1` - Max retries exceeded
- `2` - Invalid arguments

### detect-rate-limit.sh

Utility to detect rate limit errors in output.

```bash
detect-rate-limit.sh <logfile>
```

Returns exit code 0 if rate limit detected, 1 otherwise.

## Common Patterns

### Overnight Development Task

Run a long task that might hit rate limits overnight:

```bash
~/clawd/skills/auto-resume/scripts/auto-resume.sh \
  --reset-time "03:00" \
  --on-success "terminal-notifier -message 'Task completed!'" \
  --log ~/logs/overnight-task.log \
  "claude 'Build the entire authentication system with tests'"
```

### Continuous Integration Style

Retry with exponential backoff simulation:

```bash
for i in 1 2 4 8; do
  claude "Continue the migration" && exit 0
  echo "Rate limited, waiting ${i}h..."
  sleep $((i * 3600))
done
echo "Failed after all retries"
```

### Clawdbot Integration

For Clawdbot cron jobs, add rate limit handling:

```bash
# In cron job payload
~/clawd/skills/auto-resume/scripts/auto-resume.sh \
  --max-retries 3 \
  --interval 1800 \
  "npx clawdbot run 'Complete the nightly build task'"
```

### Multiple Sequential Tasks

Chain tasks with auto-resume:

```bash
#!/bin/bash
RESUME="~/clawd/skills/auto-resume/scripts/auto-resume.sh"

$RESUME "claude 'Task 1: Set up database schema'" && \
$RESUME "claude 'Task 2: Create API endpoints'" && \
$RESUME "claude 'Task 3: Write integration tests'"
```

## Rate Limit Detection

The script detects rate limits by looking for common patterns:

- `rate limit` (case insensitive)
- `quota exceeded`
- `too many requests`
- `429` status codes
- `retry after`
- `capacity` errors

## Best Practices

1. **Set realistic expectations** — Long tasks may need multiple retries
2. **Use logging** — Always log overnight tasks for debugging
3. **Add notifications** — Use `--on-success` to alert when done
4. **Keep scope small** — Break large tasks into resumable chunks
5. **Use reset-time for overnight** — Quotas often reset at specific times

## Troubleshooting

### Task never completes

- Check if task itself has errors (not just rate limits)
- Review logs with `--log` flag
- Try smaller task scope

### Script exits immediately

- Ensure command is properly quoted
- Check for syntax errors in command

### Notifications not working

- Install notifier: `brew install terminal-notifier` (macOS)
- Or use: `--on-success "echo 'Done' | mail -s 'Task Complete' you@email.com"`

## Integration with Clawdbot

For nightly builds and automated tasks, wrap commands with auto-resume:

```json
{
  "name": "nightly-build",
  "payload": {
    "message": "Run: ~/clawd/skills/auto-resume/scripts/auto-resume.sh --reset-time '03:00' 'claude \"Build tonight's tool\"'"
  }
}
```

## Script Location

```
~/clawd/skills/auto-resume/
├── SKILL.md
└── scripts/
    ├── auto-resume.sh      # Main wrapper script
    └── detect-rate-limit.sh # Rate limit detection utility
```
