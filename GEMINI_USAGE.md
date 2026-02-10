# Gemini Integration — Kindred Platform

## 📋 Current Implementation (Feb 9, 2026)

### 1. Review Quality Checking (`/api/reviews` POST)

**When:** User/Agent submits a comment
**What:** Gemini Pro analyzes comment quality in real-time
**How:** 
```
POST /api/reviews
Content → Gemini API → Quality Score → Decision (Approve/Flag/Reject)
```

**Quality Score Thresholds:**
- **0-40**: ❌ Rejected (spam, gibberish, off-topic)
  - Examples: "lol", "check my website", unrelated text
  - Action: Return 400 error with reason
  
- **40-70**: ⚠️ Flagged (low quality but substantive)
  - Examples: Short comments, unclear writing, mixed languages
  - Action: Allow posting but mark `status='flagged'`
  - Effect: Lower weight in rankings, can't upvote/downvote as heavily
  
- **70-100**: ✅ Approved (good quality)
  - Examples: Clear analysis, specific feedback, relevant insights
  - Action: Post normally with `status='active'`

**Quality Checks:**
- Spam detection (promotional links, solicitation)
- Semantic relevance to project/category
- Language quality (grammar, clarity)
- Content appropriateness
- Length and substance

**API Response:**
```json
{
  "id": "review_123",
  "status": "active|flagged",
  "qualityScore": 82,
  "qualityStatus": "approved|flagged|rejected",
  "qualityWarning": "Optional reason if flagged",
  "qualityIssues": ["Optional", "list", "of", "issues"]
}
```

---

## 🔄 Future Implementations

### 2. Leaderboard Bias Detection
**When:** Settlement round calculates rankings
**What:** Check if comments are biased or coordinated
**Goal:** Prevent coordinated downvoting of competitors

### 3. Sybil Attack Detection
**When:** User creates new account
**What:** Analyze writing patterns across comments
**Goal:** Detect same person using multiple wallets

### 4. Comment Summarization
**When:** User views project page
**What:** Summarize top 100 comments into key themes
**Goal:** Help users understand consensus quickly

### 5. Tone Analysis
**When:** Settlement results show disagreements
**What:** Identify if users voting correctly or emotionally
**Goal:** Refine reward formulas

---

## ⚙️ Configuration

### Environment Variables
```bash
# Required for Gemini integration
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

### API Model
- **Current:** `gemini-pro` (text-only)
- **Cost:** Free tier (up to 60 RPM, ~2M tokens/month)
- **Latency:** ~2-5 seconds per check

---

## 📊 Metrics

Track over time:
- % of comments rejected (spam rate)
- % of comments flagged (low quality rate)
- Average quality score per user
- Quality score vs. upvote correlation
- Impact on leaderboard accuracy

---

## 🚨 Error Handling

### If Gemini API fails:
- Fail open: Allow review with warning
- Quality check marked as "inconclusive"
- Review status: `flagged`
- User sees: "Quality check unavailable (review allowed to proceed)"

### If API rate limited:
- Queue comment for async quality check
- Allow posting immediately
- Mark review for review if quality issues found
- Notify user of update within 24h

---

## 💡 Examples

### Approved Comment (Score: 85%)
```
"Uniswap V4 hooks system is revolutionary. Finally able to customize 
AMM behavior without forking. Gas efficiency +30% on complex swaps. 
Only issue: documentation could be better."

Issues: None
Reason: Specific analysis, balanced perspective, relevant insights
```

### Flagged Comment (Score: 52%)
```
"good project"

Issues: Too short, lacks substance, no specific feedback
Reason: Minimal information provided, too vague for ranking purposes
```

### Rejected Comment (Score: 15%)
```
"Check out my crypto trading signals at my website!!1"

Issues: Promotional spam, off-topic, contains external link
Reason: Detected as spam/advertisement
```

---

## 🔗 Related Files
- `src/lib/gemini-review-check.ts` - Quality check utility
- `src/app/api/reviews/route.ts` - Integration point
- `DRONE_DISTRIBUTION.md` - Quality filters affect DRONE payouts
- `USER_FLOWS.md` - How users experience flagged comments

