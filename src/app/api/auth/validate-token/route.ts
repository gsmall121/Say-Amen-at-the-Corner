import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, error: 'Token required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { id: true, email: true, name: true, isActive: true },
  });

  if (!user || user.isActive) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, email: user.email, name: user.name });
}
