import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const majorId = searchParams.get('majorId');

  if (!majorId) {
    return NextResponse.json({ error: 'majorId is required' }, { status: 400 });
  }

  const pick = await prisma.pick.findUnique({
    where: {
      userId_majorId: {
        userId: session.user.id!,
        majorId,
      },
    },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });

  return NextResponse.json({ pick });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { majorId, playerIds } = body;

  if (!majorId || !Array.isArray(playerIds)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Check tournament status
  const major = await prisma.major.findUnique({ where: { id: majorId } });
  if (!major) {
    return NextResponse.json({ error: 'Major not found' }, { status: 404 });
  }

  if (major.status === 'IN_PROGRESS' || major.status === 'COMPLETED') {
    return NextResponse.json({ error: 'Picks are locked for this tournament' }, { status: 400 });
  }

  if (major.status === 'UPCOMING') {
    return NextResponse.json({ error: 'Picks are not open yet for this tournament' }, { status: 400 });
  }

  // Validate player count (must be 12)
  if (playerIds.length !== 12) {
    return NextResponse.json({ error: 'Must select exactly 12 players' }, { status: 400 });
  }

  // Validate tier requirements
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds }, majorId },
  });

  if (players.length !== 12) {
    return NextResponse.json({ error: 'Invalid player selection' }, { status: 400 });
  }

  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const player of players) {
    tierCounts[player.tier as 1 | 2 | 3 | 4]++;
  }

  if (tierCounts[1] !== 3) {
    return NextResponse.json({ error: 'Must select exactly 3 players from Tier 1' }, { status: 400 });
  }
  if (tierCounts[2] !== 4) {
    return NextResponse.json({ error: 'Must select exactly 4 players from Tier 2' }, { status: 400 });
  }
  if (tierCounts[3] !== 3) {
    return NextResponse.json({ error: 'Must select exactly 3 players from Tier 3' }, { status: 400 });
  }
  if (tierCounts[4] !== 2) {
    return NextResponse.json({ error: 'Must select exactly 2 players from Tier 4' }, { status: 400 });
  }

  // Delete existing pick and create new one (upsert workaround)
  const existingPick = await prisma.pick.findUnique({
    where: {
      userId_majorId: {
        userId: session.user.id!,
        majorId,
      },
    },
  });

  if (existingPick) {
    await prisma.pickPlayer.deleteMany({ where: { pickId: existingPick.id } });
    await prisma.pick.delete({ where: { id: existingPick.id } });
  }

  const pick = await prisma.pick.create({
    data: {
      userId: session.user.id!,
      majorId,
      submittedAt: new Date(),
      players: {
        create: playerIds.map((playerId: string) => ({
          playerId,
        })),
      },
    },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });

  return NextResponse.json({ pick });
}
