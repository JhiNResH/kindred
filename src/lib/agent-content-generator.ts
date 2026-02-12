import { GoogleGenerativeAI } from '@google/generative-ai'

// Agent 配置
export const AGENT_PROFILES = {
  jensen: {
    id: 'jensen-huang',
    name: 'Jensen Huang',
    wallet: '0x1111111111111111111111111111111111111111',
    persona: 'Product strategy and market positioning expert. Focus on competitive advantage, growth potential, and product-market fit.',
    tone: 'Strategic and forward-looking',
    minRating: 3,
    maxRating: 5,
  },
  steve: {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    wallet: '0x2222222222222222222222222222222222222222',
    persona: 'Technical architecture and engineering excellence critic. Deep dive into code quality, scalability, and technical innovation.',
    tone: 'Technical and detail-oriented',
    minRating: 2,
    maxRating: 5,
  },
  patrick: {
    id: 'patrick-collins',
    name: 'Patrick Collins',
    wallet: '0x3333333333333333333333333333333333333333',
    persona: 'Security auditor and risk assessor. Prioritize smart contract safety, attack vectors, and compliance risks.',
    tone: 'Critical and risk-focused',
    minRating: 1,
    maxRating: 4,
  },
  buffett: {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    wallet: '0x4444444444444444444444444444444444444444',
    persona: 'Long-term value investor. Analyze tokenomics, team credibility, moat, and sustainable competitive advantage.',
    tone: 'Conservative and value-focused',
    minRating: 2,
    maxRating: 5,
  },
} as const

export type AgentId = keyof typeof AGENT_PROFILES

interface GenerateReviewParams {
  agentId: AgentId
  projectName: string
  projectCategory: string
  projectDescription?: string
}

interface GeneratedReview {
  content: string
  rating: number
  agentId: string
  authorAddress: string
}

export class AgentContentGenerator {
  private genAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY')
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  /**
   * 生成單個評論
   */
  async generateReview(params: GenerateReviewParams): Promise<GeneratedReview> {
    const { agentId, projectName, projectCategory, projectDescription } = params
    const profile = AGENT_PROFILES[agentId]

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = this.buildPrompt(profile, projectName, projectCategory, projectDescription)

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // 解析回應（期望格式: RATING: X\nCONTENT: ...）
      const parsed = this.parseResponse(text)
      
      // 驗證評分範圍
      let rating = parsed.rating
      if (rating < profile.minRating) rating = profile.minRating
      if (rating > profile.maxRating) rating = profile.maxRating

      return {
        content: parsed.content,
        rating,
        agentId: profile.id,
        authorAddress: profile.wallet,
      }
    } catch (error) {
      console.error(`Error generating review for ${agentId}:`, error)
      throw new Error(`Failed to generate review: ${error}`)
    }
  }

  /**
   * 批量生成評論（為多個項目）
   */
  async generateBulkReviews(
    projects: Array<{ id: string; name: string; category: string; description?: string }>,
    agentIds: AgentId[],
    reviewsPerProject: number = 1
  ): Promise<Array<GeneratedReview & { projectId: string }>> {
    const results: Array<GeneratedReview & { projectId: string }> = []

    for (const project of projects) {
      // 為每個項目隨機選擇 N 個 agents
      const selectedAgents = this.selectRandomAgents(agentIds, reviewsPerProject)

      for (const agentId of selectedAgents) {
        try {
          const review = await this.generateReview({
            agentId,
            projectName: project.name,
            projectCategory: project.category,
            projectDescription: project.description,
          })

          results.push({
            ...review,
            projectId: project.id,
          })

          // Rate limit: 延遲避免 API throttle
          await this.delay(500)
        } catch (error) {
          console.error(`Failed to generate review for ${project.name} by ${agentId}:`, error)
          // 繼續處理其他項目
        }
      }
    }

    return results
  }

  /**
   * 建立 prompt
   */
  private buildPrompt(
    profile: typeof AGENT_PROFILES[AgentId],
    projectName: string,
    projectCategory: string,
    projectDescription?: string
  ): string {
    const categoryPrompts: Record<string, string> = {
      'k/defi': `Focus on:
1. **Security** - Smart contract audits, TVL safety, oracle risks
2. **Innovation** - Protocol mechanics, what's unique vs competitors
3. **Yield & Sustainability** - Are returns sustainable or inflationary?
4. **Risk** - Impermanent loss, liquidation risks, composability risks`,

      'k/perp-dex': `Focus on:
1. **Execution** - Latency, slippage, order types, funding rates
2. **Liquidity** - Depth, spread, open interest
3. **Security** - Insurance fund, socialized loss, oracle manipulation risk
4. **UX** - Trading interface, mobile support, onboarding`,

      'k/memecoin': `Focus on:
1. **Community** - Telegram/Discord activity, holder count, engagement rate
2. **Narrative** - Meme strength, viral potential, cultural relevance
3. **On-chain** - Holder distribution, whale concentration, LP locked?
4. **Risk** - Contract backdoors (mint/blacklist), team wallet %, rug potential
NOTE: This is a memecoin. Don't analyze "technology" — analyze community, narrative, and risk.`,

      'k/ai-agents': `Focus on:
1. **Agent Capability** - What can the agent actually do? Autonomous actions?
2. **Token Utility** - Does the token have real utility or is it speculative?
3. **Team & Ecosystem** - Who built it? What platform (Virtuals, etc.)?
4. **Risk** - AI hype bubble risk, actual usage vs narrative, token unlock schedule
NOTE: AI agent tokens are part meme, part utility. Evaluate both honestly.`,

      'k/bnb-meme': `Focus on:
1. **Community** - BSC community strength, Telegram activity, holder growth
2. **Ecosystem** - PancakeSwap integration, BNB Chain ecosystem support
3. **Narrative** - What's the meme? Does it have staying power?
4. **Risk** - Contract safety, LP status, team transparency, BNB Chain specific risks`,
    }

    const focusPrompt = categoryPrompts[projectCategory] || categoryPrompts['k/defi']

    return `You are ${profile.name}, ${profile.persona}

Review the following project:
- Name: ${projectName}
- Category: ${projectCategory}
${projectDescription ? `- Description: ${projectDescription}` : ''}

Write a review (100-250 words) with your unique perspective. Your tone is ${profile.tone}.

${focusPrompt}

**Important:**
- Be opinionated and specific (no generic statements)
- Rate 1-5 based on your expertise (${profile.minRating}-${profile.maxRating} typical range)
- Conversational tone, not robotic
- Do NOT repeat the project name excessively

Output format:
RATING: [1-5]
CONTENT: [Your review here]`
  }

  /**
   * 解析 Gemini 回應
   */
  private parseResponse(text: string): { rating: number; content: string } {
    const lines = text.trim().split('\n')
    let rating = 3 // default
    let content = ''

    for (const line of lines) {
      if (line.startsWith('RATING:')) {
        const match = line.match(/RATING:\s*(\d)/)
        if (match) rating = parseInt(match[1])
      } else if (line.startsWith('CONTENT:')) {
        content = line.replace('CONTENT:', '').trim()
      } else if (content) {
        // 多行內容
        content += '\n' + line
      }
    }

    // 如果沒有 CONTENT: 標記，使用整段文字（去掉第一行的 RATING）
    if (!content) {
      content = lines.slice(1).join('\n').trim()
    }

    return { rating, content: content.trim() }
  }

  /**
   * 隨機選擇 agents（不重複）
   */
  private selectRandomAgents(agentIds: AgentId[], count: number): AgentId[] {
    const shuffled = [...agentIds].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, agentIds.length))
  }

  /**
   * 延遲工具
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const agentContentGenerator = new AgentContentGenerator()
