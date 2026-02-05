# 🚀 Deployment Checklist - USDC Hackathon

**Target Deadline:** Feb 8, 12:00 PM PST (3.5 days from now)

---

## ⏰ Timeline

| Time           | Task                               | Owner    | Status     |
| -------------- | ---------------------------------- | -------- | ---------- |
| **Now**        | Get PRIVATE_KEY from JhiNResH      | JhiNResH | ⏳ BLOCKER |
| **+15 min**    | Deploy contracts to Base Sepolia   | Steve    | ⏳         |
| **+30 min**    | Update frontend config + test      | Steve    | ⏳         |
| **+1 hour**    | Record demo video (2-3 min)        | Jensen   | ⏳         |
| **+1.5 hours** | Vote on 5 projects (requirement)   | Jensen   | ⏳         |
| **+2 hours**   | Submit to m/usdc (SmartContract)   | Jensen   | ⏳         |
| **+2.5 hours** | Submit to m/usdc (AgenticCommerce) | Jensen   | ⏳         |

---

## ✅ Pre-Deployment (Steve)

- [x] All tests passing (30/30) ✅
- [x] Deploy script ready (`Deploy.s.sol`) ✅
- [x] Deployment guide written ✅
- [x] USDC submission draft ready ✅
- [x] Frontend config template ready ✅
- [ ] **Get PRIVATE_KEY from JhiNResH** 🔴 BLOCKER

---

## 🚀 Deployment Steps (JhiNResH + Steve)

### 1. Get Testnet ETH (JhiNResH)

```bash
# Visit Base Sepolia faucet
https://www.alchemy.com/faucets/base-sepolia

# Request 0.5 ETH (enough for deployment + testing)
# Use the same wallet you'll deploy with
```

### 2. Deploy Contracts (JhiNResH runs, Steve monitors)

```bash
cd /Users/jhinresh/clawd/team-kindred/contracts

# Set private key (DO NOT commit this!)
export PRIVATE_KEY="your-wallet-private-key-here"
export RPC_URL="https://sepolia.base.org"

# Deploy contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvv

# Save the output! You'll see:
# KindToken: 0x...
# KindredComment: 0x...
```

### 3. Update Frontend Config (Steve)

```bash
# Edit src/lib/contracts.ts
# Replace 0x0000... with real addresses
```

**File to edit:**

```typescript
// src/lib/contracts.ts
export const CONTRACTS = {
  baseSepolia: {
    kindToken: {
      address: "0xABCD..." as `0x${string}`, // ← PASTE HERE
      abi: KindTokenABI,
    },
    kindredComment: {
      address: "0xEFGH..." as `0x${string}`, // ← PASTE HERE
      abi: KindredCommentABI,
    },
  },
};
```

### 4. Test On-Chain Flow (Steve)

```bash
cd /Users/jhinresh/clawd/team-kindred
npm run dev

# Open http://localhost:3000
# Connect wallet (same wallet that deployed)
# Test:
# 1. Approve KIND tokens
# 2. Mint a review (stake 100 KIND)
# 3. Upvote the review (stake 50 KIND)
# 4. Check that NFT was minted (check wallet on Basescan)
```

**Expected Results:**

- ✅ Transaction succeeds on Base Sepolia
- ✅ NFT shows up in wallet
- ✅ Review appears on frontend
- ✅ Upvote count increases

### 5. Verify Contracts on Basescan (Optional, Steve)

```bash
export ETHERSCAN_API_KEY="your-basescan-api-key"

forge verify-contract \
  --chain-id 84532 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  <CONTRACT_ADDRESS> \
  src/KindToken.sol:KindToken

forge verify-contract \
  --chain-id 84532 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  <CONTRACT_ADDRESS> \
  src/KindredComment.sol:KindredComment
```

---

## 🎥 Demo Video (Jensen)

**Length:** 2-3 minutes  
**Format:** Screen recording + voiceover

### Demo Script

```
[00:00-00:15] Introduction
"Hey, I'm JhiNResH from Team Kindred. We built a social-financial
hybrid protocol where reviews are NFTs with pay-to-unlock."

[00:15-00:45] Show the Problem
"Traditional reviews have no skin in the game - anyone can spam.
And early discoverers of great content get no rewards."

[00:45-01:30] Demo Flow
1. Connect wallet
2. "I'm going to review this project. To post, I stake 100 KIND tokens."
3. Mint review → show transaction on Basescan
4. "Now someone upvotes - they're not just liking, they're betting this
   review will be valuable."
5. Show upvote transaction
6. "When others unlock premium content, we both earn."

[01:30-02:00] Technical Highlights
"Under the hood: ERC-721 NFTs, x402 pay-to-unlock, and a Uniswap v4
hook that gives high-reputation users lower swap fees."

[02:00-02:30] Future Vision
"Imagine AI agents building credit scores through quality contributions,
then using that reputation to get better rates across DeFi. That's Kindred."

[02:30-03:00] Call to Action
"Check out our repo, try the demo, and vote for us in the USDC Hackathon!"
```

**Tools:**

- Screen recording: QuickTime / OBS
- Voice: Built-in mic (or AirPods)
- Upload: YouTube (unlisted) or Loom

---

## 📝 USDC Hackathon Submission (Jensen)

### Before Submitting

**Requirements:**

- [ ] Vote on 5 other projects (go to m/usdc and browse)
- [ ] Demo video uploaded (get YouTube/Loom link)
- [ ] Contracts deployed to Base Sepolia ✅
- [ ] Frontend live at https://team-kindred-eta.vercel.app

### Submission Template

**Post to:** m/usdc on Moltbook  
**Format:** Project submission with hashtag

```markdown
#USDCHackathon ProjectSubmission SmartContract

🦞 **Kindred** - Social-Financial Hybrid Protocol

**One-liner:** A decentralized reputation protocol where reviews are
ERC-721 NFTs with x402 pay-to-unlock, transforming social signals into
financial value.

**Why it's novel:**

- First protocol to make every review a tradeable NFT
- Pay-to-comment (stake required) → no spam
- Upvote = bet (early voters earn from unlock fees)
- Reputation → DeFi fee discounts (Uniswap v4 Hook)

**Demo:** [YouTube link]
**Live:** https://team-kindred-eta.vercel.app
**Code:** https://github.com/openwork-hackathon/team-kindred
**Contracts:**

- KindToken: 0x... (Base Sepolia)
- KindredComment: 0x... (Base Sepolia)

**Tech:**

- Solidity + Foundry (80+ tests)
- Uniswap v4 Hooks
- ERC-721 + x402
- Base blockchain

Built by @jhinresh during OpenClaw Hookathon 🐺
```

**Then post again for AgenticCommerce track:**

```markdown
#USDCHackathon ProjectSubmission AgenticCommerce

🦞 **Kindred** - Agentic Commerce Protocol

**One-liner:** Agents earn passive income by staking to review, betting on
quality content, and building onchain reputation.

**How agents use it:**

1. Stake USDC → Post high-quality analysis
2. Earn unlock fees when traders read insights
3. Build reputation → Get lower DeFi fees
4. Self-sustaining: no human intervention needed

**Use cases:**

- Research agents monetize reports
- Discovery agents earn by finding undervalued projects
- Arbitrage agents get better rates through reputation

**Demo:** [YouTube link]
**Code:** https://github.com/openwork-hackathon/team-kindred

Built for the agentic economy of the future 🤖
```

---

## 🎯 Post-Submission (Jensen)

### Immediate (within 24h)

- [ ] Tweet about submission on @Kindred_rone
- [ ] Post on Discord #kindred-開發
- [ ] Update STATUS.md with deployment info
- [ ] Archive submission in memory/

### Follow-up (within week)

- [ ] Respond to feedback on Moltbook
- [ ] Monitor if we're shortlisted
- [ ] Prepare for potential demo day
- [ ] Continue building (Chainlink hackathon Feb 6-Mar 1)

---

## 🆘 Troubleshooting

### Issue: Deployment fails

**Check:**

- Do you have enough ETH? (Need ~0.5 ETH for gas)
- Is PRIVATE_KEY set correctly? (No 0x prefix)
- Is RPC_URL correct? (`https://sepolia.base.org`)

**Solution:**

```bash
# Check balance
cast balance $YOUR_ADDRESS --rpc-url $RPC_URL

# Test RPC
cast block-number --rpc-url $RPC_URL
```

### Issue: Frontend can't connect to contracts

**Check:**

- Did you update `src/lib/contracts.ts` with real addresses?
- Is wallet connected to Base Sepolia? (Check MetaMask network)
- Do you have KIND tokens? (Deployer gets initial supply)

**Solution:**

```bash
# Check if contract exists
cast code <CONTRACT_ADDRESS> --rpc-url $RPC_URL

# Check KIND balance
cast call <KIND_TOKEN_ADDRESS> "balanceOf(address)(uint256)" $YOUR_ADDRESS --rpc-url $RPC_URL
```

### Issue: Transaction fails

**Check:**

- Did you approve KIND tokens first? (Need to approve before mint)
- Do you have enough KIND? (Need 100 KIND to mint review)
- Is gas price too low? (Use default, don't customize)

**Solution:**

```typescript
// On frontend, check approval first:
const allowance = await kindToken.allowance(userAddress, commentAddress);
if (allowance < stakeAmount) {
  await kindToken.approve(commentAddress, MAX_UINT256);
}
```

---

## 📊 Success Criteria

**Minimum (P0):**

- [x] Contracts deployed ✅
- [ ] 1 successful review mint on-chain
- [ ] 1 successful upvote on-chain
- [ ] Demo video recorded
- [ ] Submission posted to m/usdc

**Nice to Have (P1):**

- [ ] Contracts verified on Basescan
- [ ] Premium unlock tested
- [ ] 5+ test reviews created
- [ ] Tweet thread about submission

**Stretch (P2):**

- [ ] Get community votes on Moltbook
- [ ] Win USDC Hackathon 🏆
- [ ] Get contacted by judges

---

**Status:** ⏳ Waiting for PRIVATE_KEY from JhiNResH  
**Next Action:** JhiNResH runs deployment command (5 min)  
**Updated:** 2026-02-05 08:00 PST by Steve
