import { ClobClient } from '@polymarket/clob-client';
import { ethers } from 'ethers';
import fs from 'fs';

const HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137; // Polygon

// Load wallet
const secrets = JSON.parse(fs.readFileSync('.secrets/polymarket-wallet.json', 'utf8'));
const wallet = new ethers.Wallet(secrets.privateKey);

console.log('=== Polymarket Trading Bot ===');
console.log('Wallet:', wallet.address);

// Step 1: Initialize client
const client = new ClobClient(HOST, CHAIN_ID, wallet);

// Step 2: Derive API credentials
console.log('\nDeriving API credentials...');
try {
  const creds = await client.deriveApiKey();
  console.log('API Key:', creds.apiKey);
  console.log('API Secret:', creds.secret ? '[HIDDEN]' : 'N/A');
  console.log('Passphrase:', creds.passphrase ? '[HIDDEN]' : 'N/A');
  
  // Save creds for later use
  fs.writeFileSync('.secrets/polymarket-api-creds.json', JSON.stringify(creds, null, 2));
  console.log('Credentials saved to .secrets/polymarket-api-creds.json');
} catch (e) {
  console.log('Error deriving API key:', e.message);
}

// Let's also fetch the market info
console.log('\n=== Fetching NBA Market ===');
const response = await fetch('https://gamma-api.polymarket.com/events?slug=nba-dal-mil-2026-01-25');
const data = await response.json();
console.log('Market data:', JSON.stringify(data, null, 2));
