import Link from 'next/link';

interface AgentBadgeProps {
  agentId?: string | null;
  agentName?: string | null;
  chain?: string | null;
}

export function AgentBadge({ agentId, agentName, chain }: AgentBadgeProps) {
  if (!agentId) return null;

  return (
    <Link href={`/agents/${agentId}`}>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 cursor-pointer">
        🤖 @{agentName || 'Agent'}
        {chain && <span className="text-xs opacity-75">({chain})</span>}
      </span>
    </Link>
  );
}
