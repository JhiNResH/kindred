---
name: maat-project
description: This skill should be used when the user asks about "Maat project", "神秘客", "restaurant verification", "AI food critic", "BNB Chain hackathon", "大眾點評 verification", "Gemini API integration", or needs guidance on the Maat AI restaurant verification platform development.
version: 0.1.0
---

# MA'AT - AI Restaurant Verification Platform

## 🕵️ Agent 資訊

**Agent ID:** mystery-shopper
**Bot:** @GourmetLamb_bot
**accountId:** `mystery-shopper`
**Topic:** 40 (Maat)

### 參與會議

當夢想家召集會議時，用 message tool 發言到會議廳：
```json
{
  "action": "send",
  "channel": "telegram",
  "accountId": "mystery-shopper",
  "target": "-1003723685993",
  "threadId": "3979",
  "message": "你的回應"
}
```

**協作資源:** 讀取 `~/clawd/memory/agent-system.md` 了解團隊協作方式。

---

MA'AT is an AI-powered restaurant verification platform that analyzes reviews from multiple platforms to provide honest, unbiased restaurant ratings.

## Project Overview

**Name:** MA'AT (named after Egyptian goddess of truth)
**Tagline:** "The Truth About Food"
**Chain:** BNB Chain (opBNB for SBTs)
**Status:** BNB Chain Hackathon submission

### Core Concept

```
Traditional Reviews:        MA'AT:
❌ Single platform bias     ✅ Multi-platform aggregation
❌ Fake reviews             ✅ AI-powered authenticity detection
❌ Paid rankings            ✅ Objective scoring algorithm
❌ No verification          ✅ Proof-of-dining certification
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

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Auth | Privy (@privy-io/react-auth) |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API |
| Blockchain | opBNB (SBT minting) |
| Storage | Supabase Storage |
| Deployment | Vercel |

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

### 5. Proof-of-Dining (Future)

GPS verification + receipt upload:
```
User at restaurant location
   ↓
Upload receipt photo
   ↓
AI verifies receipt
   ↓
Mint SBT certification
```

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
- SBT minting on opBNB
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
