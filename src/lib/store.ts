import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  id: string
  name: string
  ticker: string
  category: string
  score: number // Ma'at Score
  tvl?: string
  change24h?: string
  reviewsCount: number
  logo?: string // URL or generated placeholder
}

export interface Review {
  id: string
  projectId: string
  projectName: string
  author: string
  content: string
  rating: number // 0-5
  upvotes: number // Equals "Buy" count
  timestamp: string
  isERC404: boolean // Flag for "Buy" mechanic
  stakedAmount: number // Amount of $OPENWORK staked to write this
}

export interface Community {
  id: string // usually same as project ID or "r/name"
  name: string
  category: string
  memberCount: number
  isJoined: boolean
}

interface AppState {
  // Data
  projects: Project[]
  reviews: Review[]
  communities: Community[]
  
  // User State
  userStakedBalance: number // Mock $OPENWORK balance
  joinedCommunityIds: string[]

  // Loading State
  loadingOperations: Record<string, boolean>

  // Actions
  addProject: (project: Project) => void
  joinCommunity: (communityId: string) => void
  leaveCommunity: (communityId: string) => void
  addReview: (review: Omit<Review, 'id' | 'timestamp' | 'upvotes' | 'isERC404'>) => boolean // Returns success (check staking)
  buyReview: (reviewId: string) => void // Upvote = Buy logic
  
  // Loading Actions
  setLoading: (key: string, value: boolean) => void
  isLoading: (key: string) => boolean
  anyLoading: () => boolean
  
  // Helpers
  getProject: (id: string) => Project | undefined
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [], // Start empty per user request (remove hardcoded)
      reviews: [],
      communities: [],
      userStakedBalance: 1000, // Give user some initial mock tokens to test staking
      joinedCommunityIds: [],
      loadingOperations: {},

      // Loading Actions
      setLoading: (key, value) => set((state) => ({
        loadingOperations: { ...state.loadingOperations, [key]: value }
      })),
      isLoading: (key) => get().loadingOperations[key] ?? false,
      anyLoading: () => Object.values(get().loadingOperations).some(v => v),

      addProject: (newProject) => set((state) => {
        // Prevent duplicates
        if (state.projects.find(p => p.id === newProject.id)) return state
        
        // Auto-create community for the project
        const newCommunity: Community = {
          id: newProject.id,
          name: `r/${newProject.name.toLowerCase().replace(/\s+/g, '')}`,
          category: newProject.category,
          memberCount: 1, // Start with 1
          isJoined: false
        }

        return {
          projects: [newProject, ...state.projects],
          communities: [newCommunity, ...state.communities]
        }
      }),

      joinCommunity: (id) => set((state) => {
        if (state.joinedCommunityIds.includes(id)) return state
        return {
          joinedCommunityIds: [...state.joinedCommunityIds, id],
          communities: state.communities.map(c => 
            c.id === id ? { ...c, memberCount: c.memberCount + 1, isJoined: true } : c
          )
        }
      }),

      leaveCommunity: (id) => set((state) => {
        return {
          joinedCommunityIds: state.joinedCommunityIds.filter(cid => cid !== id),
          communities: state.communities.map(c => 
            c.id === id ? { ...c, memberCount: Math.max(0, c.memberCount - 1), isJoined: false } : c
          )
        }
      }),

      addReview: (reviewData) => {
        const state = get()
        // Staking Requirement Check
        if (state.userStakedBalance < reviewData.stakedAmount) {
          console.error("Insufficient $OPENWORK staked")
          return false
        }

        const newReview: Review = {
          ...reviewData,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          upvotes: 0,
          isERC404: true
        }

        set((state) => ({
          reviews: [newReview, ...state.reviews],
          // Deduct stake or lock it? Usually lock. We'll just update projects count.
          projects: state.projects.map(p => 
            p.id === reviewData.projectId 
              ? { ...p, reviewsCount: p.reviewsCount + 1 } 
              : p
          )
        }))
        return true
      },

      buyReview: (reviewId) => set((state) => ({
        reviews: state.reviews.map(r => 
          r.id === reviewId 
            ? { ...r, upvotes: r.upvotes + 1 } // "Buying" adds an upvote/share
            : r
        )
      })),

      getProject: (id) => get().projects.find(p => p.id === id)
    }),
    {
      name: 'kindred-storage', // name of the item in the storage (must be unique)
    }
  )
)
