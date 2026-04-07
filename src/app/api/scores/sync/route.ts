import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchESPNScoreboard } from '@/lib/golf-api';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { majorId } = body;

  if (!majorId) {
    return NextResponse.json({ error: 'majorId is required' }, { status: 400 });
  }

  // Get in-progress major
  const major = await prisma.major.findUnique({
    where: { id: majorId },
    include: {
      players: true,
    },
  });

  if (!major) {
    return NextResponse.json({ error: 'Major not found' }, { status: 404 });
  }

  if (major.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Major is not in progress' }, { status: 400 });
  }

  // Fetch ESPN scoreboard
  const scoreboard = await fetchESPNScoreboard();

  if (!scoreboard) {
    return NextResponse.json({ error: 'Failed to fetch ESPN scoreboard' }, { status: 502 });
  }

  const playerNames = major.players.map(p => p.name);
  let updatedCount = 0;

  for (const espnPlayer of scoreboard.players) {
    // Try to find matching player
    const normalizedEspnName = espnPlayer.name.toLowerCase().trim();

    const matchedPlayer = major.players.find(p => {
      const normalizedOurName = p.name.toLowerCase().trim();
      if (normalizedEspnName === normalizedOurName) return true;

      // Last name match
      const espnLastName = normalizedEspnName.split(' ').slice(-1)[0];
      const ourLastName = normalizedOurName.split(' ').slice(-1)[0];
      if (espnLastName === ourLastName && espnLastName.length > 3) return true;

      return false;
    });

    if (!matchedPlayer) continue;

    // Map ESPN status
    let playerStatus = 'ACTIVE';
    if (espnPlayer.status === 'cut') playerStatus = 'CUT';
    else if (espnPlayer.status === 'wd') playerStatus = 'WD';
    else if (espnPlayer.status === 'dq') playerStatus = 'DQ';

    // Update player
    await prisma.player.update({
      where: { id: matchedPlayer.id },
      data: {
        totalScore: espnPlayer.score,
        position: espnPlayer.position,
        status: playerStatus,
      },
    });

    // Update round scores
    for (let i = 0; i < espnPlayer.roundScores.length; i++) {
      const roundNum = i + 1;
      const roundScore = espnPlayer.roundScores[i];

      if (roundScore !== null) {
        await prisma.roundScore.upsert({
          where: {
            playerId_round: { playerId: matchedPlayer.id, round: roundNum },
          },
          update: { score: roundScore },
          create: {
            playerId: matchedPlayer.id,
            round: roundNum,
            score: roundScore,
          },
        });
      }
    }

    updatedCount++;
  }

  return NextResponse.json({
    success: true,
    updatedCount,
    totalPlayers: scoreboard.players.length,
    eventStatus: scoreboard.eventStatus,
    lastUpdated: scoreboard.lastUpdated,
  });
}
