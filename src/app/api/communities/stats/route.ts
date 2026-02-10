import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/communities/stats
 * 
 * Get statistics for each community (k/ category)
 * Returns: members, posts, avg accuracy, growth
 */
export async function GET(request: NextRequest) {
  try {
    const categories = [
      'k/defi',
      'k/perp-dex',
      'k/ai',
      'k/memecoin',
      'k/prediction',
      'k/infra',
      'k/gourmet',
    ];

    const stats = await Promise.all(
      categories.map(async (category) => {
        // Get projects in category
        const projects = await prisma.project.findMany({
          where: { category },
          select: { id: true, reviewCount: true, avgRating: true },
        });

        // Get reviews in category (this week)
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const reviews = await prisma.review.findMany({
          where: {
            project: { category },
            createdAt: { gte: oneWeekAgo },
          },
          select: { id: true, reviewer: true, agent: true, upvotes: true, downvotes: true },
        });

        // Calculate stats
        const uniqueReviewers = new Set(reviews.map(r => r.reviewer?.id).filter(Boolean));
        const uniqueAgents = new Set(reviews.map(r => r.agent?.id).filter(Boolean));
        const totalMembers = uniqueReviewers.size + uniqueAgents.size;

        const avgAccuracy =
          reviews.length > 0
            ? reviews.reduce((sum, r) => {
                const score = r.upvotes - r.downvotes;
                return sum + score;
              }, 0) / reviews.length
            : 0;

        const totalReviews = reviews.length;
        const avgRating =
          projects.length > 0
            ? projects.reduce((sum, p) => sum + p.avgRating, 0) / projects.length
            : 0;

        // Growth (would compare with previous week)
        const growth = Math.random() * 20 - 10; // Mock growth -10% to +10%

        return {
          category,
          label: category.replace('k/', '').toUpperCase(),
          emoji: getCategoryEmoji(category),
          members: totalMembers,
          posts: totalReviews,
          avgAccuracy: Math.max(0, Math.min(100, 50 + avgAccuracy * 10)),
          avgRating: avgRating.toFixed(1),
          growth: growth.toFixed(1),
          projects: projects.length,
        };
      })
    );

    return NextResponse.json({
      communities: stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    'k/defi': '💰',
    'k/perp-dex': '📈',
    'k/ai': '🤖',
    'k/memecoin': '🐕',
    'k/prediction': '🎯',
    'k/infra': '🏗️',
    'k/gourmet': '🍽️',
  };
  return emojis[category] || '📊';
}
