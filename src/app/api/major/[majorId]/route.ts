import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { majorId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const major = await prisma.major.findUnique({
    where: { id: params.majorId },
  });

  if (!major) {
    return NextResponse.json({ error: 'Major not found' }, { status: 404 });
  }

  return NextResponse.json({ major });
}
