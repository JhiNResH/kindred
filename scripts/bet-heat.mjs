/**
 * Polymarket 下注腳本 - Heat vs Suns
 * 
 * 使用方式：
 * 1. 確保有 Node.js
 * 2. npm install @polymarket/clob-client ethers@5
 * 3. 設置環境變量或直接修改下面的私鑰
 * 4. node bet-heat.mjs
 */

import { ClobClient, Side } from '@polymarket/clob-client';
import { ethers } from 'ethers';

// ========== 配置 ==========
const PRIVATE_KEY = process.env.POLY_PRIVATE_KEY || '0x96818f5ca344d1515b6a3010e6fb473ec9b8a906ee23498996995faa9f505593';
const PROXY_ADDRESS = process.env.POLY_PROXY || '0xbA0d03a5294377F0CeA34eD606d567262449ec8b';
const SIGNATURE_TYPE = 2; // GNOSIS_SAFE for browser wallet connections

// Heat vs Suns 市場
const HEAT_TOKEN_ID = "21827872241696053247582886890692030689422997779690701371127538486134300946073"; // 需要確認
const BET_AMOUNT = 4.42; // Kelly Criterion 計算結果
const PRICE = 0.39; // Heat 當前價格

const HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137;

// ========== 主程式 ==========
async function main() {
  console.log('=== Polymarket 自動下注 ===');
  console.log('標的：Heat 贏');
  console.log('金額：$' + BET_AMOUNT);
  console.log('價格：' + PRICE);
  console.log('預期回報：$' + (BET_AMOUNT / PRICE).toFixed(2));
  
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  console.log('\n錢包地址：', wallet.address);
  console.log('Proxy 地址：', PROXY_ADDRESS);

  // Step 1: 初始化基本客戶端
  console.log('\n[1/4] 初始化客戶端...');
  const basicClient = new ClobClient(HOST, CHAIN_ID, wallet);

  // Step 2: 獲取 API 憑證
  console.log('[2/4] 獲取 API 憑證...');
  const creds = await basicClient.deriveApiKey();
  console.log('API Key:', creds.apiKey ? '✓' : '✗');

  // Step 3: 用完整憑證重新初始化
  console.log('[3/4] 重新初始化帶憑證的客戶端...');
  const client = new ClobClient(
    HOST,
    CHAIN_ID,
    wallet,
    creds,
    SIGNATURE_TYPE,
    PROXY_ADDRESS
  );

  // Step 4: 創建並提交訂單
  console.log('[4/4] 創建訂單...');
  
  try {
    // 先獲取正確的 token ID
    const marketResponse = await fetch('https://gamma-api.polymarket.com/events?slug=nba-mia-phx-2026-01-25');
    const marketData = await marketResponse.json();
    const moneyline = marketData[0]?.markets?.find(m => m.sportsMarketType === 'moneyline');
    
    if (!moneyline) {
      console.error('找不到市場數據');
      return;
    }

    const tokenIds = JSON.parse(moneyline.clobTokenIds);
    const heatTokenId = tokenIds[0]; // Heat 是第一個
    
    console.log('Heat Token ID:', heatTokenId);
    console.log('當前價格:', JSON.parse(moneyline.outcomePrices)[0]);

    // 創建訂單
    const order = await client.createOrder({
      tokenID: heatTokenId,
      price: PRICE,
      size: BET_AMOUNT / PRICE,
      side: Side.BUY,
    });

    console.log('\n訂單已創建，提交中...');
    
    // 提交訂單
    const result = await client.postOrder(order);
    
    console.log('\n========== 結果 ==========');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success || result.orderID) {
      console.log('\n✅ 下單成功！');
      console.log('訂單 ID:', result.orderID);
    } else {
      console.log('\n❌ 下單失敗');
      console.log('錯誤:', result.error || result);
    }

  } catch (error) {
    console.error('\n❌ 錯誤:', error.message);
    if (error.response?.data) {
      console.error('詳情:', typeof error.response.data === 'string' 
        ? error.response.data.substring(0, 500) 
        : JSON.stringify(error.response.data));
    }
  }
}

main().catch(console.error);
