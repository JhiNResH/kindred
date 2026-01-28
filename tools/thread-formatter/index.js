#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Parse command line arguments
function parseArgs(args) {
  const options = {
    preview: false,
    json: false,
    copy: false,
    text: null,
    file: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--preview' || arg === '-p') {
      options.preview = true;
    } else if (arg === '--json' || arg === '-j') {
      options.json = true;
    } else if (arg === '--copy' || arg === '-c') {
      options.copy = true;
    } else if (arg === '--text' || arg === '-t') {
      options.text = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      options.file = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
thread-formatter - Convert text into Twitter threads

Usage:
  thread-formatter [options] [file]
  echo "text" | thread-formatter [options]
  thread-formatter --text "your text here" [options]

Options:
  -t, --text <text>   Input text directly
  -p, --preview       Show without tweet numbers
  -j, --json          Output as JSON
  -c, --copy          Copy to clipboard (macOS)
  -h, --help          Show this help message

Examples:
  echo "Long text here" | thread-formatter
  thread-formatter input.txt
  thread-formatter --text "Your thread content" --json
  thread-formatter input.txt --copy
`);
}

// Split text into sentences
function splitIntoSentences(text) {
  // Match sentences ending with . ! ? followed by space or end
  // Preserve the punctuation with the sentence
  const sentences = [];
  const regex = /[^.!?]*[.!?]+[\s]*/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    sentences.push(match[0]);
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text that doesn't end with punctuation
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      sentences.push(remaining);
    }
  }

  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

// Split a sentence into words
function splitIntoWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0);
}

// Calculate the numbering overhead for a given tweet count
function getNumberingLength(tweetNum, estimatedTotal) {
  // Format: "1/ " - number, slash, space
  return `${tweetNum}/`.length + 1;
}

// Create tweets from text with smart splitting
function createTweets(text, maxLength = 280) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (!normalizedText) {
    return [];
  }

  // First pass: estimate total tweets to calculate numbering overhead
  // Use a conservative estimate (assume 2-digit numbers)
  const conservativeOverhead = 4; // "99/ " = 4 chars
  const availableLength = maxLength - conservativeOverhead;

  const sentences = splitIntoSentences(normalizedText);
  const tweets = [];
  let currentTweet = '';

  for (const sentence of sentences) {
    const potentialTweet = currentTweet
      ? currentTweet + ' ' + sentence
      : sentence;

    if (potentialTweet.length <= availableLength) {
      currentTweet = potentialTweet;
    } else if (sentence.length <= availableLength) {
      // Sentence fits on its own, start new tweet
      if (currentTweet) {
        tweets.push(currentTweet);
      }
      currentTweet = sentence;
    } else {
      // Sentence is too long, need to split by words
      if (currentTweet) {
        tweets.push(currentTweet);
        currentTweet = '';
      }

      const words = splitIntoWords(sentence);
      for (const word of words) {
        if (word.length > availableLength) {
          // Word is too long, split by characters
          if (currentTweet) {
            tweets.push(currentTweet);
            currentTweet = '';
          }

          let remaining = word;
          while (remaining.length > availableLength) {
            tweets.push(remaining.slice(0, availableLength));
            remaining = remaining.slice(availableLength);
          }
          if (remaining) {
            currentTweet = remaining;
          }
        } else {
          const potentialWithWord = currentTweet
            ? currentTweet + ' ' + word
            : word;

          if (potentialWithWord.length <= availableLength) {
            currentTweet = potentialWithWord;
          } else {
            tweets.push(currentTweet);
            currentTweet = word;
          }
        }
      }
    }
  }

  // Don't forget the last tweet
  if (currentTweet) {
    tweets.push(currentTweet);
  }

  // Second pass: recalculate with actual numbering
  // If we have more than 9 tweets, we need to account for longer numbers
  const totalTweets = tweets.length;
  if (totalTweets > 9) {
    // Recalculate with correct overhead
    return createTweetsWithOverhead(normalizedText, maxLength, totalTweets);
  }

  return tweets;
}

// Create tweets with known total count for accurate numbering overhead
function createTweetsWithOverhead(text, maxLength, estimatedTotal) {
  const numberingLength = `${estimatedTotal}/`.length + 1;
  const availableLength = maxLength - numberingLength;

  const sentences = splitIntoSentences(text);
  const tweets = [];
  let currentTweet = '';

  for (const sentence of sentences) {
    const potentialTweet = currentTweet
      ? currentTweet + ' ' + sentence
      : sentence;

    if (potentialTweet.length <= availableLength) {
      currentTweet = potentialTweet;
    } else if (sentence.length <= availableLength) {
      if (currentTweet) {
        tweets.push(currentTweet);
      }
      currentTweet = sentence;
    } else {
      if (currentTweet) {
        tweets.push(currentTweet);
        currentTweet = '';
      }

      const words = splitIntoWords(sentence);
      for (const word of words) {
        if (word.length > availableLength) {
          if (currentTweet) {
            tweets.push(currentTweet);
            currentTweet = '';
          }

          let remaining = word;
          while (remaining.length > availableLength) {
            tweets.push(remaining.slice(0, availableLength));
            remaining = remaining.slice(availableLength);
          }
          if (remaining) {
            currentTweet = remaining;
          }
        } else {
          const potentialWithWord = currentTweet
            ? currentTweet + ' ' + word
            : word;

          if (potentialWithWord.length <= availableLength) {
            currentTweet = potentialWithWord;
          } else {
            tweets.push(currentTweet);
            currentTweet = word;
          }
        }
      }
    }
  }

  if (currentTweet) {
    tweets.push(currentTweet);
  }

  // If tweet count changed significantly, recurse
  if (tweets.length > estimatedTotal * 1.5) {
    return createTweetsWithOverhead(text, maxLength, tweets.length);
  }

  return tweets;
}

// Format tweets for output
function formatTweets(tweets, options) {
  const total = tweets.length;

  if (options.json) {
    const result = tweets.map((content, i) => {
      const number = i + 1;
      const numberedContent = `${number}/ ${content}`;
      return {
        number,
        content: options.preview ? content : numberedContent,
        charCount: options.preview ? content.length : numberedContent.length,
        raw: content,
      };
    });
    return JSON.stringify(result, null, 2);
  }

  // Plain text output
  const lines = tweets.map((content, i) => {
    const number = i + 1;
    const numberedContent = `${number}/ ${content}`;
    const displayContent = options.preview ? content : numberedContent;
    const charCount = displayContent.length;

    return `${displayContent}\n[${charCount}/280 chars]`;
  });

  return lines.join('\n\n---\n\n');
}

// Get clipboard-ready format (just the numbered tweets, one per line)
function getClipboardFormat(tweets) {
  return tweets.map((content, i) => `${i + 1}/ ${content}`).join('\n\n');
}

// Copy to clipboard using pbcopy (macOS)
function copyToClipboard(text) {
  try {
    execSync('pbcopy', { input: text });
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err.message);
    return false;
  }
}

// Read input from various sources
async function getInput(options) {
  // Priority: --text flag > file argument > stdin
  if (options.text) {
    return options.text;
  }

  if (options.file) {
    try {
      return fs.readFileSync(options.file, 'utf8');
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      process.exit(1);
    }
  }

  // Read from stdin
  return new Promise((resolve) => {
    let data = '';

    // Check if stdin is a TTY (no piped input)
    if (process.stdin.isTTY) {
      printHelp();
      process.exit(0);
    }

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const input = await getInput(options);

  if (!input || !input.trim()) {
    console.error('Error: No input text provided');
    process.exit(1);
  }

  const tweets = createTweets(input.trim());

  if (tweets.length === 0) {
    console.error('Error: Could not create any tweets from input');
    process.exit(1);
  }

  // Handle --copy flag
  if (options.copy) {
    const clipboardText = getClipboardFormat(tweets);
    if (copyToClipboard(clipboardText)) {
      console.log(`✓ Copied ${tweets.length} tweet(s) to clipboard`);
    }
  }

  // Output formatted tweets
  const output = formatTweets(tweets, options);
  console.log(output);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
