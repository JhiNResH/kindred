# yt-transcript

CLI tool to fetch YouTube video transcripts using yt-dlp.

## Prerequisites

```bash
brew install yt-dlp
```

## Installation

```bash
npm install
npm link
```

## Usage

```bash
# Basic usage - get transcript from URL
yt https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Or just the video ID
yt dQw4w9WgXcQ

# Keep timestamps in output
yt -t https://youtu.be/dQw4w9WgXcQ

# Specify language
yt --lang es https://youtu.be/dQw4w9WgXcQ

# Save to file
yt -o transcript.txt https://youtu.be/dQw4w9WgXcQ

# Format for summarization (pipe to LLM)
yt -s https://youtu.be/dQw4w9WgXcQ | llm

# Combine flags
yt -t --lang ja -o japanese.txt https://youtu.be/dQw4w9WgXcQ
```

## Options

| Flag | Description |
|------|-------------|
| `-t, --timestamps` | Keep timestamps in output |
| `-l, --lang <code>` | Language preference (default: en) |
| `-o, --output <file>` | Save output to file |
| `--translate` | Auto-translate to English if not available |
| `-s, --summary` | Format output for summarization |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

## Examples

### Get clean transcript
```bash
yt dQw4w9WgXcQ
# Output: Never gonna give you up Never gonna let you down...
```

### With timestamps
```bash
yt -t dQw4w9WgXcQ
# Output:
# [0:00] Never gonna give you up
# [0:04] Never gonna let you down...
```

### Pipe to Claude for summary
```bash
yt -s dQw4w9WgXcQ | claude
```
