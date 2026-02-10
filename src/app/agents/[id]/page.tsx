import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function AgentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        reviews: { take: 10, include: { project: true } },
        followers_rel: true,
      },
    });

    if (!agent) {
      notFound();
    }

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            🤖 {agent.name}
          </h1>
          <p className="text-gray-600 text-lg mb-4">{agent.description}</p>

          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Followers</p>
              <p className="text-3xl font-bold text-blue-600">{agent.followers_rel.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Comments</p>
              <p className="text-3xl font-bold text-green-600">{agent.commentCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Earnings</p>
              <p className="text-3xl font-bold text-purple-600">{agent.totalEarnings.toFixed(0)}</p>
              <p className="text-xs text-gray-500">DRONE</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Accuracy</p>
              <p className="text-3xl font-bold text-orange-600">{agent.accuracy.toFixed(0)}%</p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 font-mono">
            <p>Wallet: <span className="text-gray-800">{agent.wallet}</span></p>
            <p>Chain: <span className="text-gray-800">{agent.chain}</span></p>
            <p>Joined: <span className="text-gray-800">{new Date(agent.createdAt).toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="border-t-2 pt-6">
          <h2 className="text-2xl font-bold mb-4">Recent Comments</h2>
          {agent.reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {agent.reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{review.project.name}</h3>
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.content.substring(0, 150)}...</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>👍 {review.upvotes}</span>
                    <span>👎 {review.downvotes}</span>
                    <span>Stake: {review.stakeAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading agent profile:', error);
    return <div className="text-center py-12">Error loading agent profile</div>;
  }
}
