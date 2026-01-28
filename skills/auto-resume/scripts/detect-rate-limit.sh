#!/bin/bash
# detect-rate-limit.sh - Check if a log file contains rate limit errors
#
# Usage: detect-rate-limit.sh <logfile>
# Exit code: 0 = rate limit found, 1 = no rate limit

if [[ -z "$1" ]]; then
    echo "Usage: detect-rate-limit.sh <logfile>"
    exit 2
fi

if [[ ! -f "$1" ]]; then
    echo "Error: File not found: $1"
    exit 2
fi

# Rate limit patterns to detect
PATTERNS=(
    "rate.?limit"
    "quota.?exceed"
    "too.?many.?requests"
    "429"
    "retry.?after"
    "capacity"
    "throttl"
    "slow.?down"
)

# Build grep pattern
PATTERN=$(IFS="|"; echo "${PATTERNS[*]}")

if grep -iE "$PATTERN" "$1" > /dev/null 2>&1; then
    echo "Rate limit detected in $1"
    exit 0
else
    echo "No rate limit found in $1"
    exit 1
fi
