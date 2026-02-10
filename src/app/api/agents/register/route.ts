import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAgentSignature } from '@/lib/verify-agent-signature';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, message, signature, name, description, chain } = body;

    // Validate input
    if (!wallet || !message || !signature || !name || !chain) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, message, signature, name, chain' },
        { status: 400 }
      );
    }

    if (!['solana', 'base', 'ethereum'].includes(chain)) {
      return NextResponse.json(
        { error: 'Invalid chain. Must be solana, base, or ethereum' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = await verifyAgentSignature(wallet, message, signature, chain);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature or wallet does not match' },
        { status: 401 }
      );
    }

    // Check if agent already exists
    let agent = await prisma.agent.findUnique({
      where: { wallet },
    });

    if (!agent) {
      const apiKey = `ak_${uuidv4().replace(/-/g, '')}`;
      agent = await prisma.agent.create({
        data: {
          id: uuidv4(),
          name,
          description: description || '',
          wallet,
          chain,
          apiKey,
          signature,
          message,
        },
      });
    }

    // Generate JWT token (24h valid)
    const token = jwt.sign(
      { agentId: agent.id, wallet, chain },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      agentId: agent.id,
      token,
      apiKey: agent.apiKey,
      wallet: agent.wallet,
      name: agent.name,
      message: 'Agent registered successfully',
    });
  } catch (error) {
    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: String(error) },
      { status: 500 }
    );
  }
}
