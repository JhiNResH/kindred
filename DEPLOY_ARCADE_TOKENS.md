# 🎮 Deploy $KINDCLAW Arcade Tokens

**Quick deployment guide for JhiNResH**

---

## Option 1: Deploy via Foundry (Fastest)

```bash
cd /Users/jhinresh/clawd/team-kindred/contracts

# Set private key (one-time)
export PRIVATE_KEY=your_private_key_here

# Deploy both tokens
forge script script/DeployArcadeTokens.s.sol:DeployArcadeTokens \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify

# Copy output addresses
```

---

## Option 2: Deploy via Remix (No CLI)

1. Open https://remix.ethereum.org/
2. Upload files:
   - `contracts/src/KindClawToken.sol`
   - `contracts/src/OpenWorkMock.sol`
3. Compile (Solidity 0.8.24)
4. Deploy to Base Sepolia:
   - Network: Base Sepolia
   - Deploy `KindClawToken` first
   - Deploy `OpenWorkMock` second
5. Copy contract addresses

---

## Update Frontend

After deployment, update `/Users/jhinresh/clawd/team-kindred/src/lib/contracts.ts`:

```typescript
kindClaw: {
  address: 'YOUR_KINDCLAW_ADDRESS_HERE' as `0x${string}`,
  abi: KindClawTokenABI,
},
openwork: 'YOUR_OPENWORK_ADDRESS_HERE' as `0x${string}`,
```

---

## Test Faucet

1. Visit http://localhost:3000
2. Connect wallet
3. Click "Claim 1000 KINDCLAW"
4. Confirm transaction
5. Check balance

---

## Contract Addresses to Update

File: `src/lib/contracts.ts`

Line 44-46:
```typescript
kindClaw: {
  address: '0x__PASTE_KINDCLAW_HERE__' as `0x${string}`,
  abi: KindClawTokenABI,
},
```

Line 49:
```typescript
openwork: '0x__PASTE_OPENWORK_HERE__' as `0x${string}`,
```

---

## Verify Deployment

```bash
# Check KindClaw balance
cast call YOUR_KINDCLAW_ADDRESS "balanceOf(address)" YOUR_WALLET --rpc-url https://sepolia.base.org

# Check faucet cooldown
cast call YOUR_KINDCLAW_ADDRESS "canClaimFaucet(address)" YOUR_WALLET --rpc-url https://sepolia.base.org
```

---

## Quick Command Reference

```bash
# Get RPC endpoint
https://sepolia.base.org

# Get Chain ID
84532

# Get Block Explorer
https://sepolia.basescan.org/
```

---

**Steve Jobs 🍎**  
*Contracts ready. JhiNResH: Deploy & update addresses!*
