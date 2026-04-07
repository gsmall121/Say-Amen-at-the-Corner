import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, name, password } = body;

  if (!token || !name || !password) {
    return NextResponse.json({ error: 'Token, name, and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 });
  }

  if (user.isActive) {
    return NextResponse.json({ error: 'This invite link has already been used' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      password: hashedPassword,
      isActive: true,
      inviteToken: null, // Consume the token
    },
  });

  return NextResponse.json({ success: true });
}
