/**
 * Gemini API integration for image analysis
 * Analyzes food/restaurant photos for quality and relevance
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ImageAnalysisResult {
  isFood: boolean;
  quality: number; // 0-100
  cuisine: string;
  description: string;
  relevance: number; // 0-100 (how relevant to restaurant/food)
  reason: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Analyze image content for food/restaurant reviews
 * @param imageUrl - URL of the image
 * @param projectName - Name of the restaurant/project
 */
export async function analyzeImageContent(
  imageUrl: string,
  projectName: string
): Promise<ImageAnalysisResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, skipping image analysis');
      return {
        isFood: true,
        quality: 70,
        cuisine: 'Unknown',
        description: 'Image analysis skipped',
        relevance: 50,
        reason: 'API not configured',
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this image and return ONLY valid JSON (no markdown):

{
  "isFood": <true|false>,
  "quality": <0-100>,
  "cuisine": "<identified cuisine type>",
  "description": "<brief description of what's in the image>",
  "relevance": <0-100>,
  "reason": "<explanation>"
}

Rules:
- isFood: true only if image contains food/dishes
- quality: image clarity, composition, appeal (0=bad, 100=excellent)
- cuisine: type of cuisine if identifiable
- relevance: how relevant to "${projectName}" context (0=irrelevant, 100=perfect)
- Return JSON only, no other text

Context: This image is for reviewing "${projectName}"`;

    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageUrl.split(',')[1] || imageUrl, // Handle data URLs
        },
      },
      { text: prompt },
    ]);

    const responseText = response.response.text();

    // Parse JSON
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('Failed to parse image analysis:', responseText);
      return {
        isFood: false,
        quality: 0,
        cuisine: 'Unknown',
        description: 'Analysis inconclusive',
        relevance: 0,
        reason: 'Parse error',
      };
    }

    const {
      isFood = false,
      quality = 0,
      cuisine = 'Unknown',
      description = '',
      relevance = 0,
      reason = '',
    } = parsed;

    return {
      isFood: isFood === true,
      quality: Math.max(0, Math.min(100, quality)),
      cuisine,
      description,
      relevance: Math.max(0, Math.min(100, relevance)),
      reason,
    };
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    return {
      isFood: false,
      quality: 0,
      cuisine: 'Unknown',
      description: 'Analysis failed',
      relevance: 0,
      reason: 'Error during analysis',
    };
  }
}

/**
 * Batch analyze multiple images
 */
export async function analyzeImagesBatch(
  imageUrls: string[],
  projectName: string
): Promise<ImageAnalysisResult[]> {
  return Promise.all(
    imageUrls.map((url) => analyzeImageContent(url, projectName))
  );
}
