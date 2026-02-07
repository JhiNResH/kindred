/**
 * On-chain Voting Test Script
 * Tests voting functionality with newly deployed contracts
 * 
 * Usage: npx tsx test-onchain-voting.ts
 */

import { createPublicClient, createWalletClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { CONTRACTS } from './src/lib/contracts'

// Test configuration
const TEST_PROJECT_ID = 1
const TEST_COMMENT_TEXT = "Great project! Testing on-chain voting 🚀"
const STAKE_AMOUNT = BigInt('1000000000000000000') // 1 KIND token

async function main() {
  console.log('🧪 On-chain Voting Test\n')
  console.log('========================================')
  console.log('Network:', baseSepolia.name)
  console.log('Chain ID:', baseSepolia.id)
  console.log('========================================\n')

  // Setup clients
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  })

  // Load test account from environment
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable not set')
  }

  const account = privateKeyToAccount(privateKey)
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  })

  console.log('👤 Test Account:', account.address)
  console.log('')

  // Contract addresses
  const kindToken = CONTRACTS.baseSepolia.kindToken
  const kindredComment = CONTRACTS.baseSepolia.kindredComment

  console.log('📄 Contract Addresses:')
  console.log('- KindToken:', kindToken.address)
  console.log('- KindredComment:', kindredComment.address)
  console.log('')

  // Step 1: Check KIND balance
  console.log('1️⃣ Checking KIND balance...')
  const balance = await publicClient.readContract({
    address: kindToken.address,
    abi: kindToken.abi,
    functionName: 'balanceOf',
    args: [account.address],
  })
  console.log(`   Balance: ${balance} KIND`)
  
  if (balance < STAKE_AMOUNT) {
    console.log('   ⚠️ Insufficient KIND balance for staking')
    console.log('   Required:', STAKE_AMOUNT.toString())
    console.log('   Available:', balance.toString())
    return
  }
  console.log('')

  // Step 2: Approve KindredComment to spend KIND
  console.log('2️⃣ Approving KIND spending...')
  const approveTx = await walletClient.writeContract({
    address: kindToken.address,
    abi: kindToken.abi,
    functionName: 'approve',
    args: [kindredComment.address, STAKE_AMOUNT],
  })
  console.log('   Tx:', approveTx)
  
  // Wait for confirmation
  const approveReceipt = await publicClient.waitForTransactionReceipt({
    hash: approveTx,
  })
  console.log('   ✅ Approved! Block:', approveReceipt.blockNumber)
  console.log('')

  // Step 3: Create comment with stake
  console.log('3️⃣ Creating comment with stake...')
  const createCommentTx = await walletClient.writeContract({
    address: kindredComment.address,
    abi: kindredComment.abi,
    functionName: 'createComment',
    args: [
      BigInt(TEST_PROJECT_ID),
      TEST_COMMENT_TEXT,
      STAKE_AMOUNT,
    ],
  })
  console.log('   Tx:', createCommentTx)
  
  const commentReceipt = await publicClient.waitForTransactionReceipt({
    hash: createCommentTx,
  })
  console.log('   ✅ Comment created! Block:', commentReceipt.blockNumber)
  
  // Extract comment ID from logs
  const commentLog = commentReceipt.logs.find((log) => 
    log.address.toLowerCase() === kindredComment.address.toLowerCase()
  )
  
  if (!commentLog) {
    console.log('   ⚠️ Could not find comment creation log')
    return
  }
  
  // Decode comment ID from log
  // Assuming CommentCreated(uint256 indexed commentId, address indexed author, ...)
  const commentId = BigInt(commentLog.topics[1] || '0')
  console.log('   Comment ID:', commentId.toString())
  console.log('')

  // Step 4: Upvote the comment
  console.log('4️⃣ Upvoting comment...')
  const upvoteTx = await walletClient.writeContract({
    address: kindredComment.address,
    abi: kindredComment.abi,
    functionName: 'upvote',
    args: [commentId],
  })
  console.log('   Tx:', upvoteTx)
  
  const upvoteReceipt = await publicClient.waitForTransactionReceipt({
    hash: upvoteTx,
  })
  console.log('   ✅ Upvoted! Block:', upvoteReceipt.blockNumber)
  console.log('')

  // Step 5: Check comment stats
  console.log('5️⃣ Fetching comment stats...')
  const comment = await publicClient.readContract({
    address: kindredComment.address,
    abi: kindredComment.abi,
    functionName: 'getComment',
    args: [commentId],
  }) as any

  console.log('   Comment Stats:')
  console.log('   - Author:', comment.author)
  console.log('   - Text:', comment.text)
  console.log('   - Staked:', comment.stakedAmount.toString(), 'KIND')
  console.log('   - Upvotes:', comment.upvotes.toString())
  console.log('   - Downvotes:', comment.downvotes.toString())
  console.log('')

  // Step 6: Test ReputationOracle integration
  console.log('6️⃣ Testing ReputationOracle...')
  const reputationOracle = CONTRACTS.baseSepolia.reputationOracle
  if (reputationOracle) {
    const score = await publicClient.readContract({
      address: reputationOracle.address,
      abi: reputationOracle.abi,
      functionName: 'getScore',
      args: [account.address],
    })
    console.log('   Reputation Score:', score.toString())
    
    // Calculate fee tier
    const { calculateSwapFee } = await import('./src/lib/contracts')
    const feePercent = calculateSwapFee(Number(score))
    console.log('   Swap Fee Tier:', feePercent + '%')
  }
  console.log('')

  console.log('========================================')
  console.log('✅ All tests passed!')
  console.log('========================================')
}

main().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
