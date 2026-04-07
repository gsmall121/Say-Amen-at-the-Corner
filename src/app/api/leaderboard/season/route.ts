import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateMajorEarnings, calculateSeasonStandings } from '@/lib/earnings';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all completed or in-progress majors
  const majors = await prisma.major.findMany({
    where: {
      status: { in: ['IN_PROGRESS', 'COMPLETED'] },
      year: 2026,
    },
    orderBy: { startDate: 'asc' },
  });

  const majorResults = [];

  for (const major of majors) {
    const picks = await prisma.pick.findMany({
      where: { majorId: major.id },
      include: {
        user: { select: { id: true, name: true } },
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    const participants = picks.map(pick => ({
      userId: pick.user.id,
      userName: pick.user.name,
      players: pick.players.map(pp => ({
        id: pp.player.id,
        name: pp.player.name,
        totalScore: pp.player.totalScore,
        position: pp.player.position,
        status: pp.player.status,
      })),
    }));

    const results = calculateMajorEarnings(participants);

    majorResults.push({
      majorId: major.id,
      majorName: major.name,
      results,
    });
  }

  const standings = calculateSeasonStandings(majorResults);

  // Get all active users for users who haven't submitted picks
  const allUsers = await prisma.user.findMany({
    where: { isActive: true, role: 'USER' },
    select: { id: true, name: true },
  });

  // Add users with no picks
  const existingUserIds = new Set(standings.map(s => s.userId));
  for (const user of allUsers) {
    if (!existingUserIds.has(user.id)) {
      standings.push({
        userId: user.id,
        userName: user.name,
        totalEarnings: 0,
        majorResults: [],
      });
    }
  }

  return NextResponse.json({ standings, majors });
}
