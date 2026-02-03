# API Security Review

**Auditor:** Patrick Collins 🛡️  
**Date:** 2026-02-03  
**Scope:** `/apps/web/src/app/api/*`

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 2 |
| 🟡 Medium | 3 |
| 🔵 Low | 2 |

**Status:** Demo/hackathon quality. Needs hardening before production.

---

## Findings

### [H-01] No Authentication on POST Endpoints

**Severity:** High  
**Location:** `/api/reviews`, `/api/stakes`

**Description:** POST endpoints accept `reviewerAddress` and `stakerAddress` from the request body without verifying the sender owns that address.

```typescript
// Current (vulnerable)
const review: Review = {
  reviewerAddress: body.reviewerAddress, // Anyone can claim any address!
  // ...
}
```

**Impact:** Anyone can:
- Create fake reviews impersonating other users
- Manipulate reputation scores
- Create fraudulent stakes

**Recommendation:** Require wallet signature verification:

```typescript
import { verifyMessage } from 'viem'

// In POST handler
const { address, signature, message } = body
const isValid = await verifyMessage({ address, message, signature })
if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

---

### [H-02] No Rate Limiting

**Severity:** High  
**Location:** All API routes

**Description:** No rate limiting implemented. Attacker can:
- Spam reviews/stakes
- DoS the API
- Exhaust server resources

**Recommendation:** Add rate limiting middleware:

```typescript
// Using Vercel KV or Upstash Redis
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

// In handler
const { success } = await ratelimit.limit(ip)
if (!success) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

---

### [M-01] Unsanitized photoUrls Array

**Severity:** Medium  
**Location:** `/api/reviews` POST

**Description:** `photoUrls` array is stored without validation, allowing:
- XSS via `javascript:` URLs
- SSRF via internal URLs
- Data exfiltration

```typescript
photoUrls: body.photoUrls || [], // No validation!
```

**Recommendation:**

```typescript
function validatePhotoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol) &&
           !parsed.hostname.includes('localhost') &&
           !parsed.hostname.match(/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/)
  } catch {
    return false
  }
}

const validUrls = (body.photoUrls || []).filter(validatePhotoUrl)
```

---

### [M-02] In-Memory Storage Race Conditions

**Severity:** Medium  
**Location:** All routes using arrays

**Description:** In-memory arrays (`reviews`, `stakes`) are not thread-safe. Concurrent requests may cause data inconsistency.

**Recommendation:** Use proper database (Postgres, SQLite) or atomic operations.

---

### [M-03] Missing Input Sanitization

**Severity:** Medium  
**Location:** `/api/reviews` - `content` and `targetName`

**Description:** User-provided strings are stored without sanitization, enabling stored XSS.

**Recommendation:**

```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizedContent = DOMPurify.sanitize(body.content)
```

---

### [L-01] Predictable Review/Stake IDs

**Severity:** Low  
**Location:** ID generation

```typescript
id: `rev_${Date.now()}` // Predictable
```

**Recommendation:** Use UUIDs:

```typescript
import { randomUUID } from 'crypto'
id: `rev_${randomUUID()}`
```

---

### [L-02] Missing Content-Type Validation

**Severity:** Low  
**Location:** POST handlers

**Description:** Should verify `Content-Type: application/json`.

---

## Recommended Security Checklist

### Before Production:

- [ ] Implement wallet signature verification (SIWE)
- [ ] Add rate limiting (Upstash/Vercel KV)
- [ ] Sanitize all user inputs
- [ ] Validate photoUrls
- [ ] Use UUIDs for IDs
- [ ] Add request logging
- [ ] Implement CORS properly
- [ ] Add Content-Security-Policy headers
- [ ] Move to proper database

### For Hackathon (Acceptable):

- [x] Basic input validation ✅
- [x] Address format validation ✅
- [ ] Rate limiting (nice to have)
- [ ] Signature verification (nice to have)

---

## Quick Wins (5 min each)

### 1. Add UUID generation

```bash
pnpm add uuid
```

### 2. Add basic URL validation

Already provided above.

### 3. Add Content-Type check

```typescript
if (request.headers.get('content-type') !== 'application/json') {
  return NextResponse.json({ error: 'Invalid content type' }, { status: 415 })
}
```

---

**Conclusion:** API is acceptable for hackathon demo. Address [H-01] and [H-02] before any real users/funds.
