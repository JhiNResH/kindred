import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// API Documentation endpoint
// Helps frontend team understand available endpoints

const apiDocs = {
  name: 'Kindred API',
  version: '0.1.0',
  baseUrl: '/api',
  endpoints: {
    // Health
    'GET /health': {
      description: 'Health check endpoint',
      response: { status: 'ok', service: 'string', version: 'string' },
    },
    
    // Stats
    'GET /stats': {
      description: 'Platform statistics for dashboard',
      response: {
        totalReviews: 'number',
        totalStaked: 'string (wei)',
        activeUsers: 'number',
        projectsRated: 'number',
        avgRating: 'number',
        winRate: 'number (percentage)',
      },
    },
    
    // Categories
    'GET /categories': {
      description: 'List all categories (k/defi, k/memecoin, etc)',
      response: {
        categories: 'Category[]',
        total: 'number',
      },
    },
    
    // Reviews
    'GET /reviews': {
      description: 'List reviews with pagination and filtering',
      params: {
        limit: 'number (default: 10)',
        offset: 'number (default: 0)',
        category: 'string (optional)',
        sort: 'hot | new | top (default: hot)',
      },
      response: { reviews: 'Review[]', total: 'number' },
    },
    'POST /reviews': {
      description: 'Create a new review',
      body: {
        targetAddress: 'string (0x...)',
        rating: 'number (1-5)',
        content: 'string',
        category: 'k/defi | k/memecoin | k/perp-dex | k/ai',
        predictedRank: 'number (optional)',
        stakeAmount: 'string (wei, optional)',
      },
      response: { success: true, review: 'Review' },
    },
    'POST /reviews/[id]/vote': {
      description: 'Upvote or downvote a review',
      body: { direction: 'up | down', voterAddress: 'string' },
    },
    
    // Leaderboard
    'GET /leaderboard': {
      description: 'Project leaderboard by category',
      params: {
        category: 'string (optional)',
        limit: 'number (default: 10)',
      },
      response: { leaderboard: 'LeaderboardEntry[]' },
    },
    
    // Stakes
    'GET /stakes': {
      description: 'List stakes for a user',
      params: { address: 'string' },
      response: { stakes: 'Stake[]' },
    },
    'POST /stakes': {
      description: 'Create a new stake on a project ranking prediction',
      body: {
        projectAddress: 'string',
        predictedRank: 'number',
        amount: 'string (wei)',
      },
    },
    
    // Markets (Polymarket integration)
    'GET /markets': {
      description: 'List prediction markets',
      params: {
        category: 'string (optional)',
        source: 'polymarket | kindred | all',
        limit: 'number',
        q: 'string (search query)',
      },
    },
    'GET /markets/[id]': {
      description: 'Get single market details',
    },
    'GET /markets/trending': {
      description: 'Get trending markets by volume',
    },
    
    // Positions
    'GET /positions': {
      description: 'Get user market positions',
      params: { address: 'string' },
    },
    
    // Users
    'GET /users/[address]': {
      description: 'Get user profile and reputation',
      response: {
        address: 'string',
        reputationScore: 'number',
        level: 'newcomer | contributor | trusted | expert | authority',
        badges: 'string[]',
        totalReviews: 'number',
        winRate: 'number',
      },
    },
    
    // Token
    'GET /token': {
      description: 'KIND token info and bonding curve data',
    },
  },
  
  types: {
    Review: {
      id: 'string',
      targetAddress: 'string',
      targetName: 'string',
      reviewerAddress: 'string',
      rating: 'number',
      content: 'string',
      category: 'string',
      predictedRank: 'number | null',
      stakeAmount: 'string',
      upvotes: 'number',
      downvotes: 'number',
      createdAt: 'string (ISO)',
    },
    Category: {
      id: 'string (k/defi, etc)',
      name: 'string',
      description: 'string',
      icon: 'string (emoji)',
      projectCount: 'number',
      color: 'string (hex)',
    },
  },
}

// GET /api/docs
export async function GET() {
  return NextResponse.json(apiDocs)
}
