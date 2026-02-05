# Kindred Verification System

## Overview

Kindred uses a multi-layer verification approach combining AI analysis, on-chain data, and community consensus.

---

## 1. User Verification

### 1.1 Wallet Authentication (Current)
- Connect wallet via WalletConnect/MetaMask
- Sign message to prove ownership
- Store lowercase address in `User.address`

### 1.2 On-Chain Activity Score (Proposed)
```typescript
interface UserVerification {
  walletAge: number        // Days since first tx
  txCount: number          // Total transactions
  defiInteractions: number // Unique protocols used
  holdingsValue: string    // Estimated portfolio value
  nftCount: number         // NFTs owned
}
```

**Verification Levels:**
| Level | Criteria | Fee Tier |
|-------|----------|----------|
| Elite | 1000+ txs, 50+ protocols, 2+ years | 0.1% |
| Trusted | 100+ txs, 10+ protocols, 6+ months | 0.2% |
| Normal | Verified wallet | 0.3% |
| New | < 10 txs | 0.5% |

### 1.3 Social Verification (Future)
- ENS name ownership
- Twitter/Discord OAuth
- GitHub contribution history
- Existing protocol reputation (Gitcoin, DegenScore)

---

## 2. Project Verification

### 2.1 Ma'at AI Analysis (Current)
The Ma'at system uses Gemini AI with Google Search grounding to verify:

```typescript
interface ProjectVerification {
  name: string
  type: 'DEX' | 'DeFi' | 'NFT' | 'Infrastructure' | 'AI' | 'Meme'
  chain: string[]
  score: number        // 0-5
  status: 'VERIFIED' | 'UNSTABLE' | 'RISKY'
  
  // Data points
  tvl?: string
  audits?: { auditor: string; date?: string }[]
  investors?: string[]
  warnings?: string[]
}
```

**Status Criteria:**
- **VERIFIED (4.0-5.0):** High TVL, audited, known team, no incidents
- **UNSTABLE (2.5-3.9):** Some concerns, limited audits, or newer
- **RISKY (0-2.4):** Red flags, hack history, rug warnings

### 2.2 On-Chain Verification (Proposed)
```typescript
interface OnChainProjectData {
  contractAddress: string
  isVerified: boolean     // Etherscan verified
  creationDate: Date
  totalTxCount: number
  uniqueUsers: number
  tvlUSD: string
  
  // Security signals
  hasUpgradeability: boolean
  hasTimelock: boolean
  hasMultisig: boolean
  pausable: boolean
}
```

### 2.3 Community Verification (Proposed)
- Projects with 10+ reviews from verified users
- Avg rating > 3.5
- No unresolved "RISKY" flags

---

## 3. Review Verification

### 3.1 Stake-Based Trust (Current)
- Higher stake = more skin in the game
- Stake is locked until settlement
- Slash stake if review is flagged by community

### 3.2 Verification Signals
```typescript
interface ReviewTrust {
  reviewerReputation: number  // User's total score
  stakeAmount: string         // ETH staked
  upvoteRatio: number         // upvotes / (upvotes + downvotes)
  reviewerHasUsed: boolean    // Did reviewer interact with protocol?
}
```

### 3.3 On-Chain Proof (Future)
- Prove reviewer actually used the protocol
- Check for token holdings
- Verify LP positions or staking activity

---

## 4. Implementation Plan

### Phase 1 (MVP - Current)
- [x] Wallet connection
- [x] Ma'at AI analysis
- [x] Basic reputation scoring
- [x] Stake-based reviews

### Phase 2 (Post-Hackathon)
- [ ] On-chain activity scoring via API (Etherscan, DeFiLlama)
- [ ] User verification badges
- [ ] Project verification badges

### Phase 3 (Future)
- [ ] ENS integration
- [ ] Social verification (OAuth)
- [ ] On-chain proof of usage
- [ ] Decentralized oracle for TVL/audit data

---

## 5. API Endpoints

### Check User Verification
```
GET /api/users/:address/verification
```

### Check Project Verification
```
GET /api/projects/:address/verification
```

### Refresh Ma'at Analysis
```
POST /api/projects/:query/analyze
```

---

## 6. Security Considerations

1. **Sybil Resistance:** On-chain activity scoring makes fake accounts expensive
2. **Gaming Prevention:** Multi-factor verification (stake + history + social)
3. **Privacy:** Only public on-chain data, no KYC required
4. **Decentralization:** Community can override AI judgments via consensus

---

*Last updated: 2026-02-04*
