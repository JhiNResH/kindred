const { createPublicClient, createWalletClient, http, parseEther } = require('viem');
const { base } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

const MCV2_BOND_ADDRESS = '0xc5a076cad94176c2996B32d8466Be1cE757FAa27';
const OPENWORK_TOKEN = '0x299c30DD5974BF4D5bFE42C340CA40462816AB07';

const CREATE_TOKEN_ABI = [{
  name: 'createToken',
  type: 'function',
  inputs: [
    { name: 'tp', type: 'tuple', components: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' }
    ]},
    { name: 'bp', type: 'tuple', components: [
      { name: 'mintRoyalty', type: 'uint16' },
      { name: 'burnRoyalty', type: 'uint16' },
      { name: 'reserveToken', type: 'address' },
      { name: 'maxSupply', type: 'uint128' },
      { name: 'stepRanges', type: 'uint128[]' },
      { name: 'stepPrices', type: 'uint128[]' }
    ]}
  ],
  outputs: [{ name: 'token', type: 'address' }]
}];

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY not set');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log('Wallet:', account.address);

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  const tokenParams = { name: 'Kindred', symbol: 'KIND' };
  const bondParams = {
    mintRoyalty: 50,
    burnRoyalty: 100,
    reserveToken: OPENWORK_TOKEN,
    maxSupply: parseEther('10000000'),
    stepRanges: [parseEther('1000000'), parseEther('5000000'), parseEther('10000000')],
    stepPrices: [parseEther('0.0001'), parseEther('0.0005'), parseEther('0.001')]
  };

  console.log('Creating $KIND token...');
  
  try {
    const hash = await walletClient.writeContract({
      address: MCV2_BOND_ADDRESS,
      abi: CREATE_TOKEN_ABI,
      functionName: 'createToken',
      args: [tokenParams, bondParams]
    });
    console.log('TX:', hash);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Confirmed! Block:', receipt.blockNumber);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
