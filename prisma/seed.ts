import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pool.internal' },
    update: {},
    create: {
      email: 'admin@pool.internal',
      name: 'Commissioner',
      accessCode: 'COMMISSIONER',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Created admin:', admin.name, '— login code:', admin.accessCode);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
