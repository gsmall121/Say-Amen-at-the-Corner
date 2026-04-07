import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { playerId, round, score, scoreToPar } = body;

  if (!playerId || round === undefined) {
    return NextResponse.json({ error: 'playerId and round are required' }, { status: 400 });
  }

  // Upsert round score
  const roundScore = await prisma.roundScore.upsert({
    where: {
      playerId_round: { playerId, round },
    },
    update: {
      score: score !== undefined ? parseInt(score, 10) : null,
      scoreToPar: scoreToPar !== undefined ? parseInt(scoreToPar, 10) : null,
    },
    create: {
      playerId,
      round: parseInt(round, 10),
      score: score !== undefined ? parseInt(score, 10) : null,
      scoreToPar: scoreToPar !== undefined ? parseInt(scoreToPar, 10) : null,
    },
  });

  // Recalculate total score for player
  const allRounds = await prisma.roundScore.findMany({
    where: { playerId },
  });

  const totalScoreToPar = allRounds.reduce((sum, r) => {
    return sum + (r.scoreToPar ?? 0);
  }, 0);

  await prisma.player.update({
    where: { id: playerId },
    data: { totalScore: totalScoreToPar },
  });

  return NextResponse.json({ roundScore });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { playerId, totalScore, position, status } = body;

  if (!playerId) {
    return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
  }

  const player = await prisma.player.update({
    where: { id: playerId },
    data: {
      ...(totalScore !== undefined && { totalScore: parseInt(totalScore, 10) }),
      ...(position !== undefined && { position: parseInt(position, 10) }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json({ player });
}
