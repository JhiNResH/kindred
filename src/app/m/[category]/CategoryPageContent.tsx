'use client'

import { CategoryFeed } from '@/components/CategoryFeed'
import { CommunityInfo } from '@/components/project/CommunityInfo'

interface CategoryPageContentProps {
  category: string
  categoryIcon: string
  categoryDescription: string
  reviewCount: number
  projectCount: number
}

export function CategoryPageContent({
  category,
  categoryIcon,
  categoryDescription,
  reviewCount,
  projectCount,
}: CategoryPageContentProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white pt-8">{/* Added pt-8 for spacing below ClientLayout header */}
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* SEO-friendly category header */}
          <header className="mb-6">
            <h1 className="sr-only">
              {categoryIcon} {category === 'all' ? 'All Reviews' : `${category.charAt(0).toUpperCase() + category.slice(1)} Reviews`} - Maat
            </h1>
            {/* Stats for SEO and user context */}
            {(reviewCount > 0 || projectCount > 0) && (
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                {projectCount > 0 && (
                  <span>{projectCount} projects</span>
                )}
                {reviewCount > 0 && (
                  <span>{reviewCount} reviews</span>
                )}
              </div>
            )}
          </header>
          
          <CategoryFeed
            category={`k/${category}`}
            categoryIcon={categoryIcon}
            categoryDescription={categoryDescription}
          />
        </div>

        {/* Right Sidebar - Category Community Info */}
        <div className="hidden xl:block">
          <CommunityInfo category={`k/${category}`} />
        </div>
      </div>
    </main>
  )
}
