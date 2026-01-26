import { ClobClient } from '@polymarket/clob-client';
import { ethers } from 'ethers';
import fs from 'fs';

const HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137; // Polygon

// Load config
const config = JSON.parse(fs.readFileSync('.secrets/polymarket-wallet.json', 'utf8'));
const wallet = new ethers.Wallet(config.privateKey);

console.log('=== Polymarket Trading Bot ===');
console.log('EOA Wallet:', wallet.address);
console.log('Proxy Wallet:', config.proxyAddress);
console.log('Budget: $' + config.budget);

// Initialize client with signature type GNOSIS_SAFE (2) for browser wallet connections
async function initClient() {
  // Step 1: Create basic client
  const basicClient = new ClobClient(HOST, CHAIN_ID, wallet);
  
  // Step 2: Derive API credentials
  console.log('\nDeriving API credentials...');
  const creds = await basicClient.deriveApiKey();
  
  // Step 3: Reinitialize with full auth
  const client = new ClobClient(
    HOST,
    CHAIN_ID,
    wallet,
    creds,
    config.signatureType, // GNOSIS_SAFE = 2
    config.proxyAddress   // Funder address (proxy wallet)
  );
  
  console.log('Client initialized successfully!');
  return client;
}

// Get today's NBA games
async function getNBAGames() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`https://gamma-api.polymarket.com/events?tag=nba&active=true&closed=false`);
  const events = await response.json();
  
  // Filter for today's games (moneyline only)
  return events.filter(e => {
    const isToday = e.endDate?.startsWith(today) || e.startTime?.startsWith(today);
    const hasMoneyline = e.markets?.some(m => m.sportsMarketType === 'moneyline');
    return isToday && hasMoneyline;
  });
}

// Place a bet
async function placeBet(client, tokenId, side, amount, price) {
  console.log(`\nPlacing order: ${side} $${amount} @ ${price}`);
  
  const order = await client.createOrder({
    tokenID: tokenId,
    price: price,
    size: amount / price, // Convert to shares
    side: side, // BUY or SELL
  });
  
  const result = await client.postOrder(order);
  console.log('Order result:', result);
  return result;
}

// Main
async function main() {
  try {
    const client = await initClient();
    
    // Check balance
    console.log('\n=== Checking positions ===');
    
    // Get NBA games
    console.log('\n=== Today\'s NBA Games ===');
    const games = await getNBAGames();
    
    if (games.length === 0) {
      console.log('No NBA games today.');
      return;
    }
    
    for (const game of games) {
      const moneyline = game.markets?.find(m => m.sportsMarketType === 'moneyline');
      if (moneyline) {
        const outcomes = JSON.parse(moneyline.outcomes);
        const prices = JSON.parse(moneyline.outcomePrices);
        console.log(`\n${game.title}`);
        console.log(`  ${outcomes[0]}: ${(parseFloat(prices[0]) * 100).toFixed(1)}%`);
        console.log(`  ${outcomes[1]}: ${(parseFloat(prices[1]) * 100).toFixed(1)}%`);
        console.log(`  Volume: $${Math.round(moneyline.volumeNum).toLocaleString()}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
