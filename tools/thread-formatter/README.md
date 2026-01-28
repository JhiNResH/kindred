# thread-formatter

A simple CLI tool to convert raw text into formatted Twitter/X threads.

## Features

- Smart sentence-aware splitting (avoids breaking mid-sentence when possible)
- Respects 280 character limit per tweet (accounting for numbering)
- Multiple input methods: stdin, file, or `--text` flag
- Tweet numbering: `1/`, `2/`, etc.
- Character count display for each tweet
- Multiple output formats: plain text, JSON, clipboard-ready

## Installation

```bash
# Clone or download, then:
npm link

# Or run directly:
node index.js
```

## Usage

### Basic Usage

```bash
# Pipe text via stdin
echo "Your long text here that needs to be split into a thread" | thread-formatter

# Read from a file
thread-formatter input.txt

# Pass text directly
thread-formatter --text "Your thread content goes here"
```

### Options

| Flag | Short | Description |
|------|-------|-------------|
| `--text <text>` | `-t` | Input text directly |
| `--preview` | `-p` | Show tweets without numbers |
| `--json` | `-j` | Output as JSON |
| `--copy` | `-c` | Copy to clipboard (macOS) |
| `--help` | `-h` | Show help message |

### Examples

**Basic thread formatting:**
```bash
echo "This is a long piece of text. It has multiple sentences. Each sentence will be kept together when possible. The tool will split this into multiple tweets while respecting the 280 character limit." | thread-formatter
```

Output:
```
1/ This is a long piece of text. It has multiple sentences. Each sentence will be kept together when possible.
[106/280 chars]

---

2/ The tool will split this into multiple tweets while respecting the 280 character limit.
[93/280 chars]
```

**Preview mode (without numbers):**
```bash
thread-formatter input.txt --preview
```

**JSON output:**
```bash
thread-formatter --text "Your content here" --json
```

Output:
```json
[
  {
    "number": 1,
    "content": "1/ Your content here",
    "charCount": 20,
    "raw": "Your content here"
  }
]
```

**Copy to clipboard (macOS):**
```bash
thread-formatter input.txt --copy
```

**Combine options:**
```bash
cat article.txt | thread-formatter --json --copy
```

## How It Works

1. **Input normalization**: Collapses multiple whitespace into single spaces
2. **Sentence detection**: Splits text at `.`, `!`, `?` boundaries
3. **Smart fitting**: Tries to fit complete sentences into each tweet
4. **Word splitting**: If a sentence is too long, splits at word boundaries
5. **Character splitting**: As a last resort, splits very long words
6. **Numbering overhead**: Accounts for `1/`, `2/`, etc. in character count

## Character Limit Calculation

- Base Twitter limit: 280 characters
- Numbering format: `N/ ` (number + slash + space)
- Available content space: 280 - numbering length

For threads with 1-9 tweets: 277 chars available
For threads with 10-99 tweets: 276 chars available
For threads with 100+ tweets: 275 chars available

## License

MIT
