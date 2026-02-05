// Agent API Types and In-Memory Storage
// For MVP, agents are stored in memory. Production would use a database.

export interface Agent {
  id: string
  name: string
  description: string
  walletAddress: string
  apiKey: string
  createdAt: string
  lastActive: string
  reviewsCreated: number
  votesGiven: number
}

// In-memory agent store
const agents: Map<string, Agent> = new Map()
const apiKeyToAgentId: Map<string, string> = new Map()

// Generate API key
function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let key = 'kind_'
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

// Register a new agent
export function registerAgent(
  name: string,
  walletAddress: string,
  description: string
): { agent: Agent; apiKey: string } | { error: string } {
  // Validate inputs
  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }
  if (!walletAddress || !walletAddress.startsWith('0x')) {
    return { error: 'Invalid wallet address' }
  }

  // Check if wallet already registered
  for (const agent of Array.from(agents.values())) {
    if (agent.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      return { error: 'Wallet already registered' }
    }
  }

  const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const apiKey = generateApiKey()
  
  const agent: Agent = {
    id,
    name,
    description,
    walletAddress: walletAddress.toLowerCase(),
    apiKey,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    reviewsCreated: 0,
    votesGiven: 0,
  }

  agents.set(id, agent)
  apiKeyToAgentId.set(apiKey, id)

  return { agent, apiKey }
}

// Validate API key and return agent
export function validateApiKey(apiKey: string): Agent | null {
  const agentId = apiKeyToAgentId.get(apiKey)
  if (!agentId) return null
  
  const agent = agents.get(agentId)
  if (!agent) return null

  // Update last active
  agent.lastActive = new Date().toISOString()
  
  return agent
}

// Get agent by ID
export function getAgent(id: string): Agent | null {
  return agents.get(id) || null
}

// Update agent stats
export function incrementAgentStat(
  agentId: string,
  stat: 'reviewsCreated' | 'votesGiven'
): void {
  const agent = agents.get(agentId)
  if (agent) {
    agent[stat]++
  }
}

// List all agents (for leaderboard)
export function listAgents(): Agent[] {
  return Array.from(agents.values()).map(a => ({
    ...a,
    apiKey: '***hidden***' // Never expose API keys
  }))
}
