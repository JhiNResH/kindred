/**
 * Circle Programmable Wallets - Unified Export
 * 
 * Exports all Circle wallet functionality:
 * - User-controlled wallets (for end users)
 * - Developer-controlled wallets (for AI agents)
 * - Paymaster (for gasless transactions)
 * - Configuration
 */

// Configuration
export * from './config'

// User wallets (client-side)
export * from './user-wallet'

// Agent wallets (server-side only)
export * from './agent-wallet'

// Paymaster
export * from './paymaster'

// Re-export for convenience
export {
  isCircleConfigured,
  getCircleConfigStatus,
} from './config'
