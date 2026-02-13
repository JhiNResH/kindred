/**
 * Maat Experience Points System
 * Gamified rewards for authentic Web3 participation
 */

// ============ EXP Actions & Rewards ============
export const EXP_REWARDS = {
  // 📝 Review Actions
  WRITE_REVIEW: { exp: 20, reputation: 0, description: 'Write a review' },
  WRITE_DETAILED_REVIEW: { exp: 35, reputation: 2, description: 'Detailed review (>200 chars)' },
  FIRST_REVIEW: { exp: 30, reputation: 5, description: 'First reviewer bonus' },
  VERIFIED_USER_REVIEW: { exp: 50, reputation: 10, description: 'Review with on-chain verification' },

  // 💰 Staking Actions
  STAKE_REVIEW: { exp: 25, reputation: 3, description: 'Stake $KIND on review' },
  STAKE_HIGH: { exp: 50, reputation: 5, description: 'Stake 1000+ $KIND' },

  // 👥 Engagement
  UPVOTE_REVIEW: { exp: 2, reputation: 0, description: 'Upvote a review' },
  RECEIVE_UPVOTE: { exp: 5, reputation: 1, description: 'Receive upvote' },
  REVIEW_TRENDING: { exp: 25, reputation: 5, description: 'Review becomes trending' },

  // 📅 Daily Activities
  DAILY_CHECK_IN: { exp: 5, reputation: 0, description: 'Daily check-in' },
  STREAK_BONUS_3: { exp: 10, reputation: 0, description: '3-day streak' },
  STREAK_BONUS_7: { exp: 25, reputation: 2, description: '7-day streak' },
  STREAK_BONUS_30: { exp: 100, reputation: 10, description: '30-day streak' },

  // 🔗 Referral
  REFERRAL_SIGNUP: { exp: 100, reputation: 5, description: 'Referral signup' },
  REFERRAL_ACTIVE: { exp: 200, reputation: 10, description: 'Referral writes first review' },

  // 🏆 Milestones
  REVIEWS_5: { exp: 50, reputation: 5, description: '5 reviews milestone' },
  REVIEWS_10: { exp: 100, reputation: 10, description: '10 reviews milestone' },
  REVIEWS_25: { exp: 200, reputation: 15, description: '25 reviews milestone' },
  REVIEWS_50: { exp: 500, reputation: 20, description: '50 reviews milestone' },
  VERIFIED_5: { exp: 100, reputation: 10, description: '5 verified reviews' },
  VERIFIED_10: { exp: 250, reputation: 20, description: '10 verified reviews' },
} as const

export type ExpAction = keyof typeof EXP_REWARDS

// ============ Tier System ============
export const TIERS = [
  { level: 1, name: 'Newcomer', icon: '🦐', minExp: 0, perks: [] },
  { level: 2, name: 'Contributor', icon: '🦞', minExp: 100, perks: ['+10% review weight'] },
  { level: 3, name: 'Trusted', icon: '⚡', minExp: 500, perks: ['+25% review weight', 'Priority verification'] },
  { level: 4, name: 'Expert', icon: '💎', minExp: 1500, perks: ['+50% review weight', 'Exclusive badge'] },
  { level: 5, name: 'Legend', icon: '👑', minExp: 3000, perks: ['+100% review weight', 'Gold badge', 'VIP access'] },
] as const

// ============ Achievements ============
export const ACHIEVEMENTS = [
  {
    id: 'first_review',
    icon: '📝',
    label: 'First Steps',
    desc: 'Write your first review',
    check: (stats: UserStats) => stats.reviewCount >= 1,
    target: 1,
    getValue: (stats: UserStats) => stats.reviewCount,
  },
  {
    id: 'explorer',
    icon: '🔍',
    label: 'Explorer',
    desc: 'Review 5 different projects',
    check: (stats: UserStats) => stats.reviewCount >= 5,
    target: 5,
    getValue: (stats: UserStats) => stats.reviewCount,
  },
  {
    id: 'verified_user',
    icon: '✅',
    label: 'Verified User',
    desc: 'Complete on-chain verification',
    check: (stats: UserStats) => stats.verifiedReviews >= 1,
    target: 1,
    getValue: (stats: UserStats) => stats.verifiedReviews,
  },
  {
    id: 'staker',
    icon: '💰',
    label: 'True Believer',
    desc: 'Stake 1000+ $KIND total',
    check: (stats: UserStats) => stats.totalStaked >= 1000,
    target: 1000,
    getValue: (stats: UserStats) => stats.totalStaked,
  },
  {
    id: 'influencer',
    icon: '🔥',
    label: 'Influencer',
    desc: 'Receive 100 upvotes',
    check: (stats: UserStats) => stats.totalUpvotes >= 100,
    target: 100,
    getValue: (stats: UserStats) => stats.totalUpvotes,
  },
  {
    id: 'streak_master',
    icon: '📅',
    label: 'Streak Master',
    desc: 'Maintain a 7-day streak',
    check: (stats: UserStats) => stats.longestStreak >= 7,
    target: 7,
    getValue: (stats: UserStats) => stats.longestStreak,
  },
  {
    id: 'trusted',
    icon: '⭐',
    label: 'Trusted Voice',
    desc: 'Reach 500 reputation',
    check: (stats: UserStats) => stats.reputation >= 500,
    target: 500,
    getValue: (stats: UserStats) => stats.reputation,
  },
  {
    id: 'legend',
    icon: '👑',
    label: 'Maat Legend',
    desc: 'Reach 3000 EXP',
    check: (stats: UserStats) => stats.exp >= 3000,
    target: 3000,
    getValue: (stats: UserStats) => stats.exp,
  },
]

export interface UserStats {
  exp: number
  reputation: number
  reviewCount: number
  verifiedReviews: number
  totalStaked: number
  totalUpvotes: number
  currentStreak: number
  longestStreak: number
}

// ============ Helper Functions ============

export function getTierForExp(exp: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (exp >= TIERS[i].minExp) return TIERS[i]
  }
  return TIERS[0]
}

export function getNextTier(exp: number) {
  const currentTier = getTierForExp(exp)
  const nextIndex = TIERS.findIndex(t => t.level === currentTier.level) + 1
  return nextIndex < TIERS.length ? TIERS[nextIndex] : null
}

export function getExpProgress(exp: number) {
  const current = getTierForExp(exp)
  const next = getNextTier(exp)
  if (!next) return { current, next: null, progress: 100, remaining: 0 }

  const rangeStart = current.minExp
  const rangeEnd = next.minExp
  const progress = ((exp - rangeStart) / (rangeEnd - rangeStart)) * 100
  const remaining = rangeEnd - exp

  return { current, next, progress: Math.min(progress, 100), remaining }
}

export function getUnlockedAchievements(stats: UserStats) {
  return ACHIEVEMENTS.filter(a => a.check(stats))
}

export function calculateReviewBonus(content: string, hasVerification: boolean, isFirst: boolean, stakeAmount: number) {
  let totalExp = EXP_REWARDS.WRITE_REVIEW.exp
  let totalRep = EXP_REWARDS.WRITE_REVIEW.reputation
  const bonuses: string[] = ['Base review +20']

  // Detailed review bonus (>200 chars)
  if (content.length > 200) {
    totalExp += EXP_REWARDS.WRITE_DETAILED_REVIEW.exp - EXP_REWARDS.WRITE_REVIEW.exp
    totalRep += EXP_REWARDS.WRITE_DETAILED_REVIEW.reputation
    bonuses.push('Detailed +15')
  }

  // On-chain verification bonus
  if (hasVerification) {
    totalExp += EXP_REWARDS.VERIFIED_USER_REVIEW.exp - EXP_REWARDS.WRITE_REVIEW.exp
    totalRep += EXP_REWARDS.VERIFIED_USER_REVIEW.reputation
    bonuses.push('Verified +30')
  }

  // First reviewer bonus
  if (isFirst) {
    totalExp += EXP_REWARDS.FIRST_REVIEW.exp
    totalRep += EXP_REWARDS.FIRST_REVIEW.reputation
    bonuses.push('First reviewer +30')
  }

  // High stake bonus
  if (stakeAmount >= 1000) {
    totalExp += EXP_REWARDS.STAKE_HIGH.exp
    totalRep += EXP_REWARDS.STAKE_HIGH.reputation
    bonuses.push('High stake +50')
  }

  return { totalExp, totalRep, bonuses }
}
