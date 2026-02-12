#!/usr/bin/env tsx
/**
 * Generate Agent Content - Seed Script
 * 
 * Usage:
 *   npx tsx scripts/generate-agent-content.ts
 * 
 * This script generates reviews for all projects from 4 AI agents
 */

import { PrismaClient } from '@prisma/client'
import { agentContentGenerator, AGENT_PROFILES, AgentId } from '../src/lib/agent-content-generator'

const prisma = new PrismaClient()

interface Stats {
  totalProjects: number
  totalReviews: number
  reviewsByAgent: Record<string, number>
  errors: number
}

async function main() {
  console.log('🤖 Agent Content Generator - Starting...\n')

  const stats: Stats = {
    totalProjects: 0,
    totalReviews: 0,
    reviewsByAgent: {},
    errors: 0,
  }

  try {
    // 1. Fetch all projects
    console.log('📦 Fetching projects...')
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        reviewCount: true,
      },
      orderBy: {
        reviewCount: 'asc', // Prioritize projects with fewer reviews
      },
    })

    stats.totalProjects = projects.length
    console.log(`Found ${projects.length} projects\n`)

    if (projects.length === 0) {
      console.log('⚠️  No projects found. Please seed projects first.')
      return
    }

    // 2. Ensure agents exist in database
    console.log('👥 Setting up agents...')
    const agentIds = Object.keys(AGENT_PROFILES) as AgentId[]
    
    for (const agentId of agentIds) {
      const profile = AGENT_PROFILES[agentId]
      let agent = await prisma.agent.findUnique({
        where: { wallet: profile.wallet },
      })

      if (!agent) {
        agent = await prisma.agent.create({
          data: {
            id: profile.id,
            name: profile.name,
            wallet: profile.wallet,
            chain: 'base',
            description: profile.persona,
            apiKey: `agent-${profile.id}-${Date.now()}`,
            signature: 'auto-generated',
            message: 'System agent',
            claimCode: `claim-${profile.id}`,
          },
        })
        console.log(`  ✅ Created agent: ${profile.name}`)
      } else {
        console.log(`  ✓ Agent exists: ${profile.name}`)
      }

      stats.reviewsByAgent[profile.name] = 0
    }

    console.log()

    // 3. Generate reviews for each project
    console.log('✍️  Generating reviews...\n')

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i]
      const progress = `[${i + 1}/${projects.length}]`

      console.log(`${progress} ${project.name} (${project.category})`)

      // Each project gets 2-4 random agent reviews
      const reviewCount = Math.floor(Math.random() * 3) + 2 // 2-4 reviews
      const selectedAgents = selectRandomAgents(agentIds, reviewCount)

      for (const agentId of selectedAgents) {
        const profile = AGENT_PROFILES[agentId]

        try {
          // Generate review
          const review = await agentContentGenerator.generateReview({
            agentId,
            projectName: project.name,
            projectCategory: project.category,
            projectDescription: project.description || undefined,
          })

          // Find agent in DB
          const agent = await prisma.agent.findUnique({
            where: { wallet: profile.wallet },
          })

          if (!agent) {
            console.error(`  ❌ Agent not found: ${profile.name}`)
            stats.errors++
            continue
          }

          // Check if review already exists (avoid duplicates)
          const existingReview = await prisma.review.findFirst({
            where: {
              agentId: agent.id,
              projectId: project.id,
            },
          })

          if (existingReview) {
            console.log(`  ⏭️  Skip ${profile.name} (already reviewed)`)
            continue
          }

          // Save to database
          await prisma.review.create({
            data: {
              content: review.content,
              rating: review.rating,
              agentId: agent.id,
              projectId: project.id,
              stakeAmount: '1', // 1 DRONE stake
              status: 'active',
            },
          })

          stats.totalReviews++
          stats.reviewsByAgent[profile.name]++

          console.log(`  ✅ ${profile.name} (${review.rating}⭐)`)

          // Rate limit to avoid API throttle
          await delay(600)
        } catch (error) {
          console.error(`  ❌ Error generating review from ${profile.name}:`, error)
          stats.errors++
        }
      }

      console.log() // Blank line between projects
    }

    // 4. Update project review counts
    console.log('📊 Updating project stats...')
    for (const project of projects) {
      const reviewCount = await prisma.review.count({
        where: { projectId: project.id },
      })

      await prisma.project.update({
        where: { id: project.id },
        data: { reviewCount },
      })
    }

    // 5. Print summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ Generation Complete!\n')
    console.log(`📦 Projects processed: ${stats.totalProjects}`)
    console.log(`✍️  Total reviews generated: ${stats.totalReviews}`)
    console.log(`❌ Errors: ${stats.errors}\n`)

    console.log('Reviews by Agent:')
    Object.entries(stats.reviewsByAgent).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}`)
    })
    console.log('='.repeat(50))
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Select random agents without repetition
 */
function selectRandomAgents(agentIds: AgentId[], count: number): AgentId[] {
  const shuffled = [...agentIds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, agentIds.length))
}

/**
 * Delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run
main()
  .then(() => {
    console.log('\n🎉 Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
