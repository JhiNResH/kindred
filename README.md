# 🦞 Kindred

> **"The Trust Layer for Everyone"** — A Web3 review platform where reputation has real value.

🔗 **Live Demo:** [team-kindred-eta.vercel.app](https://team-kindred-eta.vercel.app) _(deployment pending)_

## 🎯 What We're Building

Kindred is a **decentralized review platform** where:

- **Stake to review** — Put your $OPENWORK on the line to prove you're serious
- **Earn reputation** — Quality reviews build your on-chain trust score
- **Get protected** — Uniswap v4 Hook uses reputation to protect trades

### The Problem

- Fake reviews everywhere (Amazon, Yelp, app stores)
- No way to verify if a reviewer is trustworthy
- Reviews are siloed and don't transfer across platforms

### Our Solution

```
Review Platform (humans + agents)
        ↓
Stake $OPENWORK to review
        ↓
Reviews mint as NFTs + earn upvotes
        ↓
On-chain Reputation Score
        ↓
Uniswap v4 Hook protects trades
        ↓
Trust layer for the entire ecosystem
```

---

## 👥 Team

| Role     | Agent              | Status    |
| -------- | ------------------ | --------- |
| PM       | Jensen Huang 🐺    | ✅ Active |
| Frontend | Tim Cook 🏭        | ✅ Active |
| Backend  | Steve Jobs 🍎      | ✅ Active |
| Contract | Patrick Collins 🛡️ | ✅ Active |

---

## 🛠️ Tech Stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Frontend  | Next.js 14, TailwindCSS, wagmi, RainbowKit |
| Backend   | Next.js API Routes                         |
| Contracts | Solidity, Foundry, Uniswap v4              |
| Chain     | Base                                       |
| Token     | $KIND (Mint Club V2 bonding curve)         |

---

## 📂 Project Structure

```
├── src/                  # Next.js frontend + API
│   ├── app/             # App router pages
│   ├── components/      # React components
│   └── pages/api/       # API routes
├── contracts/           # Solidity contracts
│   └── core/           # KindredHook, ReputationOracle
├── scripts/            # Deployment scripts
└── public/             # Static assets
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/openwork-hackathon/team-kindred.git
cd team-kindred

# Install
pnpm install

# Development
pnpm dev
```

---

## 📋 Current Status

| Feature              | Status         | Owner    |
| -------------------- | -------------- | -------- |
| Homepage + Sidebar   | ✅ Done        | Jensen   |
| API Routes           | ✅ Done        | Steve    |
| KindredHook Contract | ✅ Done        | Patrick  |
| $KIND Token          | ⏳ Pending     | -        |
| Vercel Deployment    | 🔧 In Progress | OpenWork |

---

## 🪙 Token Economics

**$KIND** — Platform token backed by $OPENWORK via Mint Club V2

- **Max Supply:** 10,000,000 KIND
- **Bonding Curve:** Exponential (0.0001 → 0.001 OPENWORK/KIND)
- **Royalties:** 0.5% mint, 1% burn

---

## 📄 License

MIT
