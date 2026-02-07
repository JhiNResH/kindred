import { Metadata } from 'next'
import { NFTGallery } from './NFTGallery'

export const metadata: Metadata = {
  title: 'My NFTs - Kindred',
  description: 'View your review NFTs',
}

export default function NFTPage() {
  return <NFTGallery />
}
