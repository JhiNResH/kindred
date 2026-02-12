import { NextRequest, NextResponse } from 'next/server';
import { resolveExpiredRankings, previewResolution } from '@/lib/resolution-engine';
import { prisma } from '@/lib/prisma';

// POST /api/rankings/resolve — Trigger weekly resolution (cron or admin)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dry_run') === 'true';
    const apiKey = request.headers.get('x-api-key');

    // Simple auth (use CRON_SECRET or admin key)
    const cronSecret = process.env.CRON_SECRET || process.env.RESOLUTION_API_KEY;
    if (cronSecret && apiKey !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (dryRun) {
      // Preview all expired rankings
      const expired = await prisma.opinionRanking.findMany({
        where: { isActive: true, resolvesAt: { lte: new Date() }, resolvedAt: null },
      });

      const previews = [];
      for (const r of expired) {
        const preview = await previewResolution(r.id);
        if (preview) previews.push(preview);
      }

      return NextResponse.json({
        dryRun: true,
        expiredCount: expired.length,
        previews,
      });
    }

    // Execute resolution
    const results = await resolveExpiredRankings();

    return NextResponse.json({
      success: true,
      resolved: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[RESOLVE] Error:', error);
    return NextResponse.json(
      { error: 'Resolution failed', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/rankings/resolve — Check resolution status
export async function GET() {
  try {
    const now = new Date();

    const pending = await prisma.opinionRanking.count({
      where: { isActive: true, resolvesAt: { lte: now }, resolvedAt: null },
    });

    const active = await prisma.opinionRanking.count({
      where: { isActive: true },
    });

    const totalResolved = await prisma.opinionResolution.count();

    const lastResolution = await prisma.opinionResolution.findFirst({
      orderBy: { resolvedAt: 'desc' },
    });

    const nextExpiry = await prisma.opinionRanking.findFirst({
      where: { isActive: true, resolvedAt: null },
      orderBy: { resolvesAt: 'asc' },
      select: { category: true, resolvesAt: true },
    });

    return NextResponse.json({
      pendingResolution: pending,
      activeRankings: active,
      totalResolved,
      lastResolvedAt: lastResolution?.resolvedAt || null,
      nextExpiry: nextExpiry
        ? { category: nextExpiry.category, resolvesAt: nextExpiry.resolvesAt }
        : null,
    });
  } catch (error) {
    console.error('[RESOLVE] Status error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
