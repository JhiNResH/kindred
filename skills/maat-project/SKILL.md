---
name: maat-project
description: This skill should be used when the user asks about "Maat project", "神秘客", "restaurant verification", "AI food critic", "BNB Chain hackathon", "大眾點評 verification", "Gemini API integration", or needs guidance on the Maat AI restaurant verification platform development.
version: 0.1.0
---

# MA'AT - AI Restaurant Verification Platform

## 🕵️ Agent 資訊

**Agent ID:** Tim Cook
**Bot:** @GourmetLamb_bot
**accountId:** `Tim Cook`
**Topic:** 40 (Maat)

### 參與會議

當夢想家召集會議時，用 message tool 發言到會議廳：

```json
{
  "action": "send",
  "channel": "telegram",
  "accountId": "Tim Cook",
  "target": "-1003723685993",
  "threadId": "3979",
  "message": "你的回應"
}
```

**協作資源:** 讀取 `~/clawd/memory/agent-system.md` 了解團隊協作方式。

---

MA'AT is a **Proof of Experience** platform — we verify WHO is speaking, not WHAT they say.

## Project Overview

**Name:** MA'AT (named after Egyptian goddess of truth)
**Tagline:** "Proof of Experience"
**Chain:** BNB Chain (opBNB for SBTs)
**Status:** BNB Chain Hackathon submission

### Core Philosophy (2026-01-29 定位釐清)

| 我們做什麼       | 我們不做什麼       |
| ---------------- | ------------------ |
| 驗證「這人去過」 | 驗證「評論對不對」 |
| 驗證二元事實     | 判斷主觀好壞       |
| 開放所有意見     | 決定誰是對的       |
| 預測未來共識     | 宣稱真理           |

**一句話：** Maat = Proof of Experience — 驗證誰在說話，不驗證說什麼

### Why This Matters

Fake reviews exist because platforms try to judge "is this review accurate?"

We flip the question: "Did this person actually go there?"

- 好不好吃？→ 開放討論，每個人口味不同
- 這人真的去過嗎？→ 我們驗證這個

### Core Concept

```
Traditional Reviews:        MA'AT:
❌ Judge review quality     ✅ Verify reviewer experience
❌ Fake reviews problem     ✅ Proof-of-experience solves this
❌ Paid rankings            ✅ Credibility from verification
❌ Trust the platform       ✅ Trust the cryptographic proof
```

### User Flow

```
1. User enters restaurant name/link
   ↓
2. AI scrapes reviews from:
   • 大眾點評 (Dianping)
   • Google Maps
   • Yelp
   • TripAdvisor
   ↓
3. Gemini AI analyzes:
   • Review authenticity
   • Sentiment patterns
   • Red flags detection
   ↓
4. Returns MA'AT Score:
   • PURE (≥4.0) - Trustworthy
   • UNSTABLE (2.5-3.9) - Mixed
   • DECEPTIVE (<2.5) - Suspicious
```

## Tech Stack

| Component  | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React + TypeScript + Vite    |
| Styling    | Tailwind CSS                 |
| Auth       | Privy (@privy-io/react-auth) |
| Database   | Supabase (PostgreSQL)        |
| AI         | Google Gemini API            |
| Blockchain | opBNB (SBT minting)          |
| Storage    | Supabase Storage             |
| Deployment | Vercel                       |

## Project Structure

```
/Users/jhinresh/Desktop/maat/
├── api/                    # Vercel serverless functions
├── components/             # React components
│   ├── TruthCard.tsx      # Restaurant result display
│   ├── Arena.tsx          # Leaderboard
│   ├── Vault.tsx          # User's saved restaurants
│   └── Passport.tsx       # User profile
├── scripts/               # Utility scripts
│   └── verify-all.ts      # Batch verification script
├── App.tsx                # Main app component
├── constants.ts           # Configuration
└── SKILLS.md              # Development guide
```

## Key Features

### 1. AI Verification Engine

Uses Gemini API to analyze restaurant reviews:

```typescript
// Core verification logic
const prompt = `
Analyze these restaurant reviews and provide:
1. Authenticity score (1-5)
2. Must-try dishes
3. Red flags/warnings
4. Price range estimate
5. Overall MA'AT score
`;
```

### 2. Multi-Platform Aggregation

Scrapes and normalizes data from:

- 大眾點評 (Chinese reviews)
- Google Maps (International)
- Yelp (US-focused)
- TripAdvisor (Tourist-focused)

### 3. Vault (User Saves)

Users can save restaurants with status:

- `want_to_go` - Planning to visit
- `visited` - Already been
- `certified` - Verified with proof

### 4. Arena (Leaderboard)

Community-driven rankings:

- Upvote/downvote restaurants
- Filter by cuisine, location
- Real-time updates

### 5. Proof-of-Experience (Core Feature)

This is the heart of Maat — verifying that someone actually visited:

```
User at restaurant location
   ↓
GPS verification (二元事實: 在/不在)
   ↓
Upload receipt photo
   ↓
AI verifies receipt (二元事實: 有/沒有)
   ↓
Mint SBT certification = Proof of Experience
   ↓
Now user can review with credibility
```

**What we verify (binary facts):**

- ✅ Was this person at this location? (GPS)
- ✅ Do they have a receipt? (Photo)
- ✅ Does the receipt match the restaurant? (AI)

**What we DON'T verify:**

- ❌ Was the food good?
- ❌ Is their opinion correct?
- ❌ Should you trust their taste?

Everyone can still post opinions. We just mark which ones come from verified visitors.

## Database Schema

### Core Tables

```sql
-- Users
users (id, privy_id, wallet_address, display_name, trust_score)

-- Restaurants
restaurants (id, name, cuisine, ai_score, platform_scores, must_try, warnings)

-- User saves
vault_entries (id, user_id, restaurant_id, status, saved_at)

-- Reviews
reviews (id, user_id, restaurant_id, rating, content)

-- Votes
votes (id, user_id, restaurant_id, vote_type)
```

## Development Commands

```bash
# Location
cd /Users/jhinresh/Desktop/maat

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run verification script
npx tsx scripts/verify-all.ts
```

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PRIVY_APP_ID=your_privy_app_id
```

## Cron Jobs

Automated restaurant verification runs nightly:

```
Job: maat-verify-restaurants
Schedule: 0 3 * * * (3:00 AM PST daily)
Script: npx tsx scripts/verify-all.ts
Purpose: Update restaurants without AI summaries
```

## Current Status

### ✅ Completed

- AI verification engine (Gemini)
- Multi-platform review analysis
- Basic UI (TruthCard, search)
- Privy authentication
- Supabase database setup
- Vercel deployment

### 🔄 In Progress

- Vault save functionality
- Arena leaderboard
- User profiles (Passport)

### 📋 Todo

- GPS verification
- Receipt upload + AI parsing
- SBT minting on BSC testnet
- Gamification (XP, tiers)

## API Endpoints

### Verification

```
POST /api/verify
Body: { url: string } | { name: string, location: string }
Response: {
  score: number,
  verdict: "PURE" | "UNSTABLE" | "DECEPTIVE",
  mustTry: string[],
  warnings: string[],
  priceRange: string,
  platformScores: object
}
```

## Scoring Algorithm

```
MA'AT Score = weighted average of:
- Review authenticity (30%)
- Sentiment consistency (25%)
- Platform agreement (25%)
- Red flag detection (20%)

Verdict:
- PURE: score >= 4.0
- UNSTABLE: 2.5 <= score < 4.0
- DECEPTIVE: score < 2.5
```

## Hackathon Strategy

### BNB Chain Focus

- Deploy SBT contract on opBNB
- Use BNB for gas fees
- Integrate with BNB ecosystem

### Demo Script

1. Show restaurant search
2. AI verification in action
3. Save to Vault
4. View in Arena leaderboard
5. (If ready) Mint certification SBT

## Additional Resources

### Reference Files

- **`references/database-schema.md`** - Full Supabase schema
- **`references/api-docs.md`** - API documentation
- **`references/hackathon-checklist.md`** - Competition requirements

### Project Files

- Development guide: `/Users/jhinresh/Desktop/maat/SKILLS.md`
- Main app: `/Users/jhinresh/Desktop/maat/App.tsx`
- Verification script: `/Users/jhinresh/Desktop/maat/scripts/verify-all.ts`
