import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProjectRedirectPage({ params }: PageProps) {
  const projectId = params.id.toLowerCase()

  // 1. Try to find project in DB to get real category
  const project = await prisma.project.findUnique({
    where: { address: projectId },
    select: { category: true }
  })

  // 2. Determine target category
  // If found, use its category. 
  // If not found, default to 'k/defi' (Ma'at will analyze it there) 
  // OR we could redirect to a search results page? 
  // For now, defaulting to k/defi allows the "Create New Project" flow to work 
  // because the dynamic page at /k/defi/[id] handles the "Analyzing..." state.
  const category = project?.category || 'k/defi'

  // 3. Redirect to the canonical URL
  redirect(`/${category}/${projectId}`)
}
