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

  const players = await prisma.player.findMany({
    where: { majorId },
    orderBy: [{ tier: 'asc' }, { worldRanking: 'asc' }],
  });

  return NextResponse.json({ players });
}
