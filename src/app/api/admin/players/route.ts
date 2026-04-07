import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const majorId = searchParams.get('majorId');

  if (!majorId) {
    return NextResponse.json({ error: 'majorId is required' }, { status: 400 });
  }

  const players = await prisma.player.findMany({
    where: { majorId },
    include: { scores: true },
    orderBy: [{ tier: 'asc' }, { worldRanking: 'asc' }],
  });

  return NextResponse.json({ players });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { majorId, name, tier, odds, worldRanking } = body;

  if (!majorId || !name || !tier) {
    return NextResponse.json({ error: 'majorId, name, and tier are required' }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      majorId,
      name,
      tier: parseInt(tier, 10),
      odds: odds || null,
      worldRanking: worldRanking ? parseInt(worldRanking, 10) : null,
    },
  });

  return NextResponse.json({ player });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, name, tier, odds, worldRanking, status, totalScore, position } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const player = await prisma.player.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(tier !== undefined && { tier: parseInt(tier, 10) }),
      ...(odds !== undefined && { odds }),
      ...(worldRanking !== undefined && { worldRanking: parseInt(worldRanking, 10) }),
      ...(status !== undefined && { status }),
      ...(totalScore !== undefined && { totalScore: parseInt(totalScore, 10) }),
      ...(position !== undefined && { position: parseInt(position, 10) }),
    },
  });

  return NextResponse.json({ player });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');

  if (!playerId) {
    return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
  }

  await prisma.player.delete({ where: { id: playerId } });

  return NextResponse.json({ success: true });
}
