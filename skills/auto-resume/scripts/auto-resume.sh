#!/bin/bash
# auto-resume.sh - Automatically retry commands on rate limit errors
# 
# Usage: auto-resume.sh [options] "<command>"
#
# Options:
#   --reset-time HH:MM    Wait until specific time (24h format)
#   --interval SECONDS    Retry interval (default: 3600)
#   --max-retries N       Maximum retries (default: 0 = infinite)
#   --on-success CMD      Command to run on success
#   --on-failure CMD      Command to run on final failure
#   --log FILE            Log output to file
#   --quiet               Suppress status messages

set -e

# Defaults
RESET_TIME=""
INTERVAL=3600
MAX_RETRIES=0
ON_SUCCESS=""
ON_FAILURE=""
LOG_FILE=""
QUIET=false
COMMAND=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --reset-time)
            RESET_TIME="$2"
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --max-retries)
            MAX_RETRIES="$2"
            shift 2
            ;;
        --on-success)
            ON_SUCCESS="$2"
            shift 2
            ;;
        --on-failure)
            ON_FAILURE="$2"
            shift 2
            ;;
        --log)
            LOG_FILE="$2"
            shift 2
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

if [[ -z "$COMMAND" ]]; then
    echo "Error: No command specified"
    echo "Usage: auto-resume.sh [options] \"<command>\""
    exit 2
fi

# Logging function
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    if [[ "$QUIET" != true ]]; then
        echo "$msg"
    fi
    if [[ -n "$LOG_FILE" ]]; then
        echo "$msg" >> "$LOG_FILE"
    fi
}

# Detect rate limit in output
detect_rate_limit() {
    local output="$1"
    echo "$output" | grep -iE "(rate.?limit|quota.?exceed|too.?many.?requests|429|retry.?after|capacity)" > /dev/null 2>&1
    return $?
}

# Calculate seconds until reset time
seconds_until() {
    local target_time="$1"
    local now=$(date +%s)
    local target=$(date -j -f "%H:%M" "$target_time" +%s 2>/dev/null || date -d "$target_time" +%s)
    
    # If target is in the past, add 24 hours
    if [[ $target -le $now ]]; then
        target=$((target + 86400))
    fi
    
    echo $((target - now))
}

# Main retry loop
retry_count=0
while true; do
    log "Attempt $((retry_count + 1)): Running command..."
    
    # Capture output
    TEMP_OUTPUT=$(mktemp)
    if eval "$COMMAND" 2>&1 | tee "$TEMP_OUTPUT"; then
        # Success!
        log "✅ Command completed successfully!"
        rm -f "$TEMP_OUTPUT"
        
        if [[ -n "$ON_SUCCESS" ]]; then
            log "Running success callback..."
            eval "$ON_SUCCESS"
        fi
        exit 0
    fi
    
    OUTPUT=$(cat "$TEMP_OUTPUT")
    rm -f "$TEMP_OUTPUT"
    
    # Check if it's a rate limit error
    if detect_rate_limit "$OUTPUT"; then
        log "⚠️ Rate limit detected"
        
        retry_count=$((retry_count + 1))
        
        # Check max retries
        if [[ $MAX_RETRIES -gt 0 && $retry_count -ge $MAX_RETRIES ]]; then
            log "❌ Max retries ($MAX_RETRIES) exceeded"
            if [[ -n "$ON_FAILURE" ]]; then
                eval "$ON_FAILURE"
            fi
            exit 1
        fi
        
        # Calculate wait time
        if [[ -n "$RESET_TIME" ]]; then
            WAIT_SECONDS=$(seconds_until "$RESET_TIME")
            log "⏰ Waiting until $RESET_TIME ($WAIT_SECONDS seconds)..."
        else
            WAIT_SECONDS=$INTERVAL
            log "⏰ Waiting $WAIT_SECONDS seconds before retry..."
        fi
        
        sleep $WAIT_SECONDS
    else
        # Non-rate-limit error
        log "❌ Command failed with non-rate-limit error"
        if [[ -n "$ON_FAILURE" ]]; then
            eval "$ON_FAILURE"
        fi
        exit 1
    fi
done
