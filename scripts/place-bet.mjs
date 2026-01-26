import { ClobClient, Side } from '@polymarket/clob-client';
import { ethers } from 'ethers';
import fs from 'fs';

const HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137;

// Config
const config = JSON.parse(fs.readFileSync('.secrets/polymarket-wallet.json', 'utf8'));
const wallet = new ethers.Wallet(config.privateKey);

// Spurs to win - Token ID
const SPURS_TOKEN_ID = "87069058062386204514440746177167230003061183275952307043291532056740705911527";
const BET_AMOUNT = 5; // $5 USDC
const PRICE = 0.79; // 79¢ per share

async function main() {
  console.log('=== Placing Bet: Spurs to Win ===');
  console.log('Amount: $' + BET_AMOUNT);
  console.log('Price: ' + PRICE);
  console.log('Shares: ' + (BET_AMOUNT / PRICE).toFixed(2));
  console.log('Potential return if win: $' + (BET_AMOUNT / PRICE).toFixed(2));
  
  // Initialize client
  const basicClient = new ClobClient(HOST, CHAIN_ID, wallet);
  
  // Derive API creds
  console.log('\nDeriving API credentials...');
  const creds = await basicClient.deriveApiKey();
  
  // Full client with proxy wallet
  const client = new ClobClient(
    HOST,
    CHAIN_ID,
    wallet,
    creds,
    config.signatureType,
    config.proxyAddress
  );
  
  console.log('Creating order...');
  
  try {
    // Create limit order (buy side)
    const order = await client.createOrder({
      tokenID: SPURS_TOKEN_ID,
      price: PRICE,
      size: BET_AMOUNT / PRICE, // Number of shares
      side: Side.BUY,
    });
    
    console.log('Order created!');
    
    // Submit order
    console.log('\nSubmitting order...');
    const result = await client.postOrder(order);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ 下單成功！');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

main();
