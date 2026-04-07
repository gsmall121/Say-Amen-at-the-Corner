import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { majorId: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { majorId } = params;
  const body = await request.json();
  const { status, cutScore } = body;

  const validStatuses = ['UPCOMING', 'PICKS_OPEN', 'IN_PROGRESS', 'COMPLETED'];
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Validate cutScore if provided
  if (cutScore !== undefined && cutScore !== null && typeof cutScore !== 'number') {
    return NextResponse.json({ error: 'cutScore must be a number or null' }, { status: 400 });
  }

  // Build update data
  const updateData: { status?: string; cutScore?: number | null } = {};
  if (status !== undefined) updateData.status = status;
  if (cutScore !== undefined) updateData.cutScore = cutScore === '' ? null : cutScore;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const major = await prisma.major.update({
    where: { id: majorId },
    data: updateData,
  });

  // If tournament starts, lock all existing picks
  if (status === 'IN_PROGRESS') {
    await prisma.pick.updateMany({
      where: { majorId },
      data: { isLocked: true },
    });
  }

  return NextResponse.json({ major });
}
