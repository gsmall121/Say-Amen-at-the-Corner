import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      accessCode: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { picks: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, accessCode } = await request.json();

  if (!name || !accessCode) {
    return NextResponse.json({ error: 'Name and access code are required' }, { status: 400 });
  }

  const code = (accessCode as string).toUpperCase().trim();

  const existing = await prisma.user.findUnique({ where: { accessCode: code } });
  if (existing) {
    return NextResponse.json({ error: 'That access code is already taken' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      accessCode: code,
      email: `${code.toLowerCase()}@pool.internal`,
      role: 'USER',
      isActive: true,
    },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, accessCode: user.accessCode } });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
