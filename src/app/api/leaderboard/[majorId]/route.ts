import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateMajorEarnings } from '@/lib/earnings';

export async function GET(
  request: NextRequest,
  { params }: { params: { majorId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { majorId } = params;

  const major = await prisma.major.findUnique({ where: { id: majorId } });
  if (!major) {
    return NextResponse.json({ error: 'Major not found' }, { status: 404 });
  }

  // Only show picks once tournament has started
  const showPicks = major.status === 'IN_PROGRESS' || major.status === 'COMPLETED';

  // Get all picks with players for this major
  const picks = await prisma.pick.findMany({
    where: { majorId },
    include: {
      user: { select: { id: true, name: true } },
      players: {
        include: {
          player: {
            include: {
              scores: true,
            },
          },
        },
      },
    },
  });

  if (!showPicks) {
    // Only show that picks exist, but not what they are (except for the current user)
    const privatePicks = picks.map(pick => ({
      userId: pick.user.id,
      userName: pick.user.name,
      hasSubmitted: true,
      isCurrentUser: pick.user.id === session.user.id,
      players: pick.user.id === session.user.id ? pick.players.map(pp => ({
        id: pp.player.id,
        name: pp.player.name,
        tier: pp.player.tier,
        odds: pp.player.odds,
        worldRanking: pp.player.worldRanking,
        totalScore: pp.player.totalScore,
        position: pp.player.position,
        status: pp.player.status,
        roundScores: pp.player.scores
          .sort((a, b) => a.round - b.round)
          .map(s => s.scoreToPar),
      })) : null,
    }));

    return NextResponse.json({ major, picks: privatePicks, showPicks: false });
  }

  // Tournament is live or completed - show full leaderboard
  const participants = picks.map(pick => ({
    userId: pick.user.id,
    userName: pick.user.name,
    players: pick.players.map(pp => ({
      id: pp.player.id,
      name: pp.player.name,
      tier: pp.player.tier,
      odds: pp.player.odds,
      worldRanking: pp.player.worldRanking,
      totalScore: pp.player.totalScore,
      position: pp.player.position,
      status: pp.player.status,
      // Include round-by-round scores (scoreToPar) for cut-line cap calculation
      roundScores: pp.player.scores
        .sort((a, b) => a.round - b.round)
        .map(s => s.scoreToPar),
    })),
  }));

  const results = calculateMajorEarnings(participants, major.cutScore ?? null);

  return NextResponse.json({ major, results, showPicks: true });
}
