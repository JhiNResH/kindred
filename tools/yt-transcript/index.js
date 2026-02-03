#!/usr/bin/env node

import { program } from 'commander';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

program
  .name('yt')
  .description('Fetch YouTube video transcripts')
  .version('1.0.0')
  .argument('<url>', 'YouTube URL or video ID')
  .option('-t, --timestamps', 'Keep timestamps in output')
  .option('-l, --lang <code>', 'Language preference', 'en')
  .option('-o, --output <file>', 'Save output to file')
  .option('--translate', 'Auto-translate to English if not already English')
  .option('-s, --summary', 'Output text formatted for summarization (pipe to LLM)')
  .action(async (url, options) => {
    try {
      const transcript = await fetchTranscript(url, options);

      if (options.output) {
        writeFileSync(options.output, transcript);
        console.error(`Saved to ${options.output}`);
      } else {
        console.log(transcript);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();

function extractVideoId(input) {
  // Handle direct video IDs
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  throw new Error('Could not extract video ID from input');
}

async function fetchTranscript(url, options) {
  const videoId = extractVideoId(url);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const tempDir = tmpdir();
  const tempBase = join(tempDir, `yt-transcript-${videoId}`);

  // Build yt-dlp arguments
  const args = [
    '--skip-download',
    '--write-subs',
    '--write-auto-subs',
    '--sub-format', 'vtt',
    '--sub-langs', options.translate ? `${options.lang},en` : options.lang,
    '-o', tempBase,
    videoUrl
  ];

  // Run yt-dlp
  await runCommand('yt-dlp', args);

  // Find the subtitle file
  const possibleFiles = [
    `${tempBase}.${options.lang}.vtt`,
    `${tempBase}.en.vtt`,
  ];

  // Also check for auto-generated subtitles
  const autoFiles = [
    `${tempBase}.${options.lang}.vtt`,
    `${tempBase}.en.vtt`,
  ];

  let subtitleFile = null;
  const allPossible = [...possibleFiles, ...autoFiles];

  // List all files that match our pattern
  const files = await findSubtitleFiles(tempBase);

  if (files.length === 0) {
    throw new Error(`No subtitles found for video. Try a different language with --lang`);
  }

  // Prefer the requested language, fall back to English, then any available
  subtitleFile = files.find(f => f.includes(`.${options.lang}.`))
    || files.find(f => f.includes('.en.'))
    || files[0];

  // Parse the VTT file
  const vttContent = readFileSync(subtitleFile, 'utf-8');
  const transcript = parseVTT(vttContent, options.timestamps);

  // Clean up temp files
  for (const file of files) {
    try { unlinkSync(file); } catch {}
  }

  // Format output
  if (options.summary) {
    return formatForSummary(transcript, videoUrl);
  }

  return transcript;
}

async function findSubtitleFiles(basePattern) {
  const dir = join(basePattern, '..');
  const baseName = basePattern.split('/').pop();

  return new Promise((resolve) => {
    const ls = spawn('ls', ['-1', dir]);
    let output = '';

    ls.stdout.on('data', (data) => output += data);
    ls.on('close', () => {
      const files = output.split('\n')
        .filter(f => f.startsWith(baseName) && f.endsWith('.vtt'))
        .map(f => join(dir, f));
      resolve(files);
    });
    ls.on('error', () => resolve([]));
  });
}

function parseVTT(content, keepTimestamps) {
  const lines = content.split('\n');
  const textLines = [];
  let lastText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip WEBVTT header and empty lines
    if (line === 'WEBVTT' || line === '' || line.startsWith('Kind:') || line.startsWith('Language:')) {
      continue;
    }

    // Skip cue identifiers (just numbers)
    if (/^\d+$/.test(line)) {
      continue;
    }

    // Handle timestamp lines
    if (line.includes('-->')) {
      if (keepTimestamps) {
        const timestamp = line.split('-->')[0].trim();
        // Convert to simpler format: HH:MM:SS or MM:SS
        const simplified = simplifyTimestamp(timestamp);
        textLines.push(`\n[${simplified}]`);
      }
      continue;
    }

    // Clean up the text line
    let text = line
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    // Skip duplicates (common in auto-generated subs)
    if (text && text !== lastText) {
      textLines.push(text);
      lastText = text;
    }
  }

  // Join and clean up
  let result = textLines.join(keepTimestamps ? '\n' : ' ');

  // Clean up extra whitespace
  result = result.replace(/\s+/g, ' ').trim();

  if (keepTimestamps) {
    // Restore newlines after timestamps
    result = result.replace(/\s*\[/g, '\n\n[').replace(/\]\s*/g, '] ').trim();
  }

  return result;
}

function simplifyTimestamp(timestamp) {
  // Input: 00:00:01.234
  // Output: 0:01 or 1:23:45
  const parts = timestamp.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatForSummary(transcript, url) {
  return `VIDEO TRANSCRIPT
Source: ${url}

---

${transcript}

---

Please provide a concise summary of the above transcript.`;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', (data) => stderr += data);

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`yt-dlp failed: ${stderr || 'Unknown error'}`));
      }
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('yt-dlp not found. Install it with: brew install yt-dlp'));
      } else {
        reject(err);
      }
    });
  });
}
