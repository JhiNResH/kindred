/**
 * Gemini API integration for review quality checking
 * Validates reviews for spam, relevance, and quality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ReviewQualityCheck {
  score: number; // 0-100
  status: 'approved' | 'flagged' | 'rejected';
  reason: string;
  isSpam: boolean;
  isRelevant: boolean;
  qualityIssues: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function checkReviewQuality(
  content: string,
  projectName: string,
  projectCategory: string
): Promise<ReviewQualityCheck> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, skipping quality check');
      return {
        score: 80,
        status: 'approved',
        reason: 'Quality check skipped (API not configured)',
        isSpam: false,
        isRelevant: true,
        qualityIssues: [],
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a quality checker for crypto/DeFi project reviews on a prediction market platform called Maat.

Analyze this review and return a JSON response with ONLY these fields (no other text):
{
  "score": <0-100>,
  "isSpam": <true|false>,
  "isRelevant": <true|false>,
  "qualityIssues": [<list of issues if any>],
  "summary": "<brief explanation>"
}

Rules:
- Score 0-100 where:
  - 0-40: Spam, gibberish, or completely irrelevant
  - 40-70: Low quality but partially relevant
  - 70-100: Good quality, substantive feedback
  
- isSpam: true if contains promotional links, gambling solicitation, or off-topic spam
- isRelevant: true if the review relates to "${projectName}" or the "${projectCategory}" category
- qualityIssues: List any issues (e.g., "too short", "excessive emojis", "unclear", "multiple languages mixed")

Project: ${projectName}
Category: ${projectCategory}

Review to check:
"${content}"

Return ONLY valid JSON, no markdown:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      // Default to flagged if parse fails
      return {
        score: 50,
        status: 'flagged',
        reason: 'Quality check inconclusive',
        isSpam: false,
        isRelevant: true,
        qualityIssues: ['Unable to fully validate'],
      };
    }

    const { score = 50, isSpam = false, isRelevant = true, qualityIssues = [], summary = '' } = parsed;

    // Determine status based on score
    let status: 'approved' | 'flagged' | 'rejected' = 'approved';
    if (score < 40 || isSpam) {
      status = 'rejected';
    } else if (score < 70) {
      status = 'flagged';
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      status,
      reason: summary || `Quality score: ${score}%`,
      isSpam,
      isRelevant,
      qualityIssues: Array.isArray(qualityIssues) ? qualityIssues : [],
    };
  } catch (error) {
    console.error('Error checking review quality with Gemini:', error);
    // On error, allow with warning (fail open, not closed)
    return {
      score: 60,
      status: 'flagged',
      reason: 'Quality check error (allowed to proceed)',
      isSpam: false,
      isRelevant: true,
      qualityIssues: ['Quality check failed'],
    };
  }
}

/**
 * Batch check multiple reviews (useful for batch operations)
 */
export async function checkReviewsQualityBatch(
  reviews: Array<{ content: string; projectName: string; projectCategory: string }>
): Promise<ReviewQualityCheck[]> {
  return Promise.all(
    reviews.map((r) => checkReviewQuality(r.content, r.projectName, r.projectCategory))
  );
}
