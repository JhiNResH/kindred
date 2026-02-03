'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Star, Coins, AlertCircle, Send } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'

export function WriteReview() {
  const { isConnected } = useAccount()
  const [projectName, setProjectName] = useState('')
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [stakeAmount, setStakeAmount] = useState('100')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) return
    
    setIsSubmitting(true)
    // TODO: Submit to API + sign transaction
    await new Promise(r => setTimeout(r, 2000))
    setIsSubmitting(false)
    
    // Reset form
    setProjectName('')
    setRating(0)
    setReview('')
  }

  if (!isConnected) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#6b6b70] opacity-50" />
        <p className="text-[#6b6b70]">Connect your wallet to write a review</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <Input 
            label="Project Name"
            placeholder="e.g., Uniswap, Hyperliquid, Jupiter..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-[#adadb0] mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-[#2a2a2e]'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-[#6b6b70] self-center">
                {rating > 0 ? `${rating}/5` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-[#adadb0] mb-2">
              Your Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your honest experience with this project..."
              className="w-full h-32 px-4 py-3 bg-[#111113] border border-[#1f1f23] rounded-lg text-white text-sm placeholder:text-[#6b6b70] focus:outline-none focus:border-purple-500 transition resize-none"
              required
            />
            <p className="text-xs text-[#6b6b70] mt-1">
              Min 50 characters. Be specific and constructive.
            </p>
          </div>

          {/* Stake Amount */}
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" />
                <span className="font-medium">Stake $KIND</span>
              </div>
              <span className="text-xs text-[#6b6b70]">
                Balance: 1,250 $KIND
              </span>
            </div>
            <div className="flex gap-2">
              {['50', '100', '250', '500'].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setStakeAmount(amount)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    stakeAmount === amount
                      ? 'bg-purple-500 text-white'
                      : 'bg-[#111113] border border-[#2a2a2e] text-[#adadb0] hover:border-purple-500/50'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#6b6b70] mt-2">
              Higher stakes = higher visibility & rewards
            </p>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            loading={isSubmitting}
            disabled={!projectName || !rating || review.length < 50}
          >
            <Send className="w-4 h-4" />
            Submit Review & Stake {stakeAmount} $KIND
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
