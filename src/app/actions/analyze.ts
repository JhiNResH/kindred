'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google GenAI with the API Key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

export interface Web3ProjectResult {
  name: string
  type: 'DEX' | 'DeFi' | 'NFT' | 'Infrastructure' | 'Mobile' | 'AI' | 'Meme' | 'Other'
  chain: string[]
  score: number
  status: 'VERIFIED' | 'UNSTABLE' | 'RISKY' // Ma'at Status
  summary: string
  tvl?: string
  website?: string
  twitter?: string
  github?: string
  tokenSymbol?: string
  tokenPrice?: string
  launchDate?: string
  investors?: string[]
  features: string[]
  warnings: string[]
  audits?: { auditor: string; date?: string }[]
  recentNews?: { title: string; date?: string }[]
}

export async function analyzeProject(query: string): Promise<Web3ProjectResult> {
  try {
    const isUrl = /^https?:\/\//i.test(query.trim())
    
    const prompt = isUrl
      ? `Analyze this Web3/DeFi project from the URL: "${query}"\n\nExtract the project name and research comprehensive data about it.`
      : `Search for comprehensive information about the Web3/DeFi project: "${query}"`

    // Use Gemini 3.0 Flash Preview for fastest, grounded results
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", 
      tools: [{ googleSearch: {} } as any] 
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: `You are Ma'at, the Egyptian goddess of Truth, now analyzing Web3 and blockchain projects.

TASK: Research and verify Web3/DeFi/NFT projects from multiple sources (official website, DeFiLlama, CoinGecko, Twitter, news articles).

CRITICAL RULES:
1. NO HALLUCINATIONS: Only report data you actually find. If you cannot find real data, return status "UNSTABLE".
2. VERIFY THE PROJECT: Make sure the project matches the query. Check official sources.
3. Check for security audits, team background, and TVL data.
4. Look for any red flags: rug pulls, hacks, or suspicious activity.
5. RESPONSE LANGUAGE: All text fields (summary, features, warnings, etc.) MUST be in English.

RETURN JSON FORMAT ONLY:
{
  "name": "Project Name",
  "type": "DEX|DeFi|NFT|Infrastructure|Other",
  "chain": ["BNB Chain", "Ethereum"],
  "score": 0.0-5.0,
  "status": "VERIFIED|UNSTABLE|RISKY",
  "summary": "2-3 sentence summary of the project, its legitimacy, and key value proposition.",
  "tvl": "$500M",
  "website": "https://example.com",
  "twitter": "@projecthandle",
  "github": "https://github.com/org/repo",
  "tokenSymbol": "TOKEN",
  "tokenPrice": "$1.23",
  "launchDate": "2023-01",
  "investors": ["a16z", "Binance Labs"],
  "features": ["Perpetual trading", "Up to 100x leverage", "Low fees"],
  "warnings": ["Previously hacked", "Anonymous team"],
  "audits": [
    {"auditor": "CertiK", "date": "2024-01"},
    {"auditor": "SlowMist", "date": "2023-12"}
  ],
  "recentNews": [
    {"title": "Project raises $10M Series A", "date": "2024-01"}
  ]
}

SCORING GUIDE:
- 4.0-5.0 (VERIFIED): Well-established, audited, high TVL, known team, no major incidents
- 2.5-3.9 (UNSTABLE): Some concerns, limited audits, newer project, or anonymous team
- 0-2.4 (RISKY): Red flags found, hack history, rug pull warnings, or unverified

IMPORTANT:
- If the project cannot be found or verified, set status to "UNSTABLE" and explain in summary.
- Focus on TRUTH and RISK verification.`
    })

    console.log('Ma\'at Raw Response:', result.response.text())

    const text = result.response.text() || ''
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', text)
      throw new Error('No JSON found')
    }

    const data = JSON.parse(jsonMatch[0])
    
    const score = data.score || 0
    const status = data.status || (score >= 4.0 ? 'VERIFIED' : score < 2.5 ? 'RISKY' : 'UNSTABLE')

    return {
      name: data.name || query,
      type: data.type || 'Other',
      chain: data.chain || [],
      score,
      status: status,
      summary: data.summary || '無法完成分析',
      tvl: data.tvl,
      website: data.website,
      twitter: data.twitter,
      github: data.github,
      tokenSymbol: data.tokenSymbol,
      tokenPrice: data.tokenPrice,
      launchDate: data.launchDate,
      investors: data.investors || [],
      features: data.features || [],
      warnings: data.warnings || [],
      audits: data.audits || [],
      recentNews: data.recentNews || [],
    }
  } catch (error) {
    console.error('Ma\'at Verification Failed:', error)
    return {
      name: query,
      type: 'Other',
      chain: [],
      score: 0,
      status: 'UNSTABLE',
      summary: '系統無法連線至 Ma\'at 節點 (Search Service Unavailable)',
      features: ['請檢查 API Key 或網路連線'],
      warnings: ['分析服務暫時無法使用'],
    } as Web3ProjectResult
  }
}
