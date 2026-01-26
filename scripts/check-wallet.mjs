import { ethers } from 'ethers';
import fs from 'fs';

// Load wallet
const secrets = JSON.parse(fs.readFileSync('.secrets/polymarket-wallet.json', 'utf8'));
const wallet = new ethers.Wallet(secrets.privateKey);

console.log('=== Wallet Info ===');
console.log('Address:', wallet.address);

// Connect to Polygon
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
const connectedWallet = wallet.connect(provider);

// Check MATIC balance
const maticBalance = await provider.getBalance(wallet.address);
console.log('MATIC Balance:', ethers.formatEther(maticBalance));

// Check USDC balance (Polygon USDC)
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // USDC on Polygon
const USDC_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
const usdcBalance = await usdc.balanceOf(wallet.address);
const decimals = await usdc.decimals();
console.log('USDC Balance:', ethers.formatUnits(usdcBalance, decimals));

// Also check USDC.e (bridged USDC)
const USDCE_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC.e on Polygon
const usdce = new ethers.Contract(USDCE_ADDRESS, USDC_ABI, provider);
const usdceBalance = await usdce.balanceOf(wallet.address);
console.log('USDC.e Balance:', ethers.formatUnits(usdceBalance, decimals));
