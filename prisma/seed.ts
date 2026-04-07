import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin2026!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sayamen.com' },
    update: {},
    create: {
      email: 'admin@sayamen.com',
      name: 'Commissioner',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('User2026!', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'player@sayamen.com' },
    update: {},
    create: {
      email: 'player@sayamen.com',
      name: 'Test Player',
      password: userPassword,
      role: 'USER',
      isActive: true,
    },
  });
  console.log('Created test user:', testUser.email);

  // Create 2026 Majors
  const masters = await prisma.major.upsert({
    where: { id: 'masters-2026' },
    update: {},
    create: {
      id: 'masters-2026',
      name: 'The Masters',
      year: 2026,
      venue: 'Augusta National Golf Club',
      location: 'Augusta, Georgia',
      startDate: new Date('2026-04-09T08:00:00Z'),
      endDate: new Date('2026-04-12T20:00:00Z'),
      status: 'PICKS_OPEN',
    },
  });

  const pga = await prisma.major.upsert({
    where: { id: 'pga-2026' },
    update: {},
    create: {
      id: 'pga-2026',
      name: 'PGA Championship',
      year: 2026,
      venue: 'Quail Hollow Club',
      location: 'Charlotte, North Carolina',
      startDate: new Date('2026-05-21T08:00:00Z'),
      endDate: new Date('2026-05-24T20:00:00Z'),
      status: 'UPCOMING',
    },
  });

  const usOpen = await prisma.major.upsert({
    where: { id: 'us-open-2026' },
    update: {},
    create: {
      id: 'us-open-2026',
      name: 'U.S. Open',
      year: 2026,
      venue: 'Shinnecock Hills Golf Club',
      location: 'Southampton, New York',
      startDate: new Date('2026-06-18T08:00:00Z'),
      endDate: new Date('2026-06-21T20:00:00Z'),
      status: 'UPCOMING',
    },
  });

  const theOpen = await prisma.major.upsert({
    where: { id: 'the-open-2026' },
    update: {},
    create: {
      id: 'the-open-2026',
      name: 'The Open Championship',
      year: 2026,
      venue: 'Royal Portrush Golf Club',
      location: 'Portrush, Northern Ireland',
      startDate: new Date('2026-07-16T08:00:00Z'),
      endDate: new Date('2026-07-19T20:00:00Z'),
      status: 'UPCOMING',
    },
  });

  console.log('Created majors:', masters.name, pga.name, usOpen.name, theOpen.name);

  // Create players for The Masters 2026
  // Tier 1 - Top 8
  const tier1Players = [
    { name: 'Scottie Scheffler', odds: '+350', worldRanking: 1 },
    { name: 'Rory McIlroy', odds: '+600', worldRanking: 2 },
    { name: 'Xander Schauffele', odds: '+800', worldRanking: 3 },
    { name: 'Jon Rahm', odds: '+900', worldRanking: 4 },
    { name: 'Collin Morikawa', odds: '+1200', worldRanking: 5 },
    { name: 'Viktor Hovland', odds: '+1400', worldRanking: 6 },
    { name: 'Brooks Koepka', odds: '+1600', worldRanking: 7 },
    { name: 'Bryson DeChambeau', odds: '+1800', worldRanking: 8 },
  ];

  // Tier 2 - Next 22
  const tier2Players = [
    { name: 'Ludvig Aberg', odds: '+2000', worldRanking: 9 },
    { name: 'Tommy Fleetwood', odds: '+2200', worldRanking: 10 },
    { name: 'Patrick Cantlay', odds: '+2500', worldRanking: 11 },
    { name: 'Tony Finau', odds: '+2800', worldRanking: 12 },
    { name: 'Justin Thomas', odds: '+3000', worldRanking: 13 },
    { name: 'Jordan Spieth', odds: '+3200', worldRanking: 14 },
    { name: 'Cameron Smith', odds: '+3500', worldRanking: 15 },
    { name: 'Hideki Matsuyama', odds: '+3800', worldRanking: 16 },
    { name: 'Shane Lowry', odds: '+4000', worldRanking: 17 },
    { name: 'Russell Henley', odds: '+4500', worldRanking: 18 },
    { name: 'Brian Harman', odds: '+5000', worldRanking: 19 },
    { name: 'Keegan Bradley', odds: '+5500', worldRanking: 20 },
    { name: 'Jason Day', odds: '+6000', worldRanking: 21 },
    { name: 'Sungjae Im', odds: '+6500', worldRanking: 22 },
    { name: 'Tom Kim', odds: '+7000', worldRanking: 23 },
    { name: 'Corey Conners', odds: '+7500', worldRanking: 24 },
    { name: 'Adam Scott', odds: '+8000', worldRanking: 25 },
    { name: 'Min Woo Lee', odds: '+8500', worldRanking: 26 },
    { name: 'Matt Fitzpatrick', odds: '+9000', worldRanking: 27 },
    { name: 'Sepp Straka', odds: '+9500', worldRanking: 28 },
    { name: 'Harris English', odds: '+10000', worldRanking: 29 },
    { name: 'Will Zalatoris', odds: '+10000', worldRanking: 30 },
  ];

  // Tier 3 - Next 20
  const tier3Players = [
    { name: 'Sahith Theegala', odds: '+12000', worldRanking: 31 },
    { name: 'Max Homa', odds: '+12000', worldRanking: 32 },
    { name: 'Wyndham Clark', odds: '+12000', worldRanking: 33 },
    { name: 'Justin Rose', odds: '+15000', worldRanking: 34 },
    { name: 'Rickie Fowler', odds: '+15000', worldRanking: 35 },
    { name: 'Dustin Johnson', odds: '+15000', worldRanking: 36 },
    { name: 'Adam Hadwin', odds: '+18000', worldRanking: 37 },
    { name: 'Kurt Kitayama', odds: '+18000', worldRanking: 38 },
    { name: 'Taylor Moore', odds: '+20000', worldRanking: 39 },
    { name: 'Si Woo Kim', odds: '+20000', worldRanking: 40 },
    { name: 'Akshay Bhatia', odds: '+20000', worldRanking: 41 },
    { name: 'Davis Riley', odds: '+25000', worldRanking: 42 },
    { name: 'Chris Kirk', odds: '+25000', worldRanking: 43 },
    { name: 'Eric Cole', odds: '+25000', worldRanking: 44 },
    { name: 'Lucas Glover', odds: '+25000', worldRanking: 45 },
    { name: 'Mackenzie Hughes', odds: '+30000', worldRanking: 46 },
    { name: 'Austin Eckroat', odds: '+30000', worldRanking: 47 },
    { name: 'Nick Taylor', odds: '+30000', worldRanking: 48 },
    { name: 'Denny McCarthy', odds: '+35000', worldRanking: 49 },
    { name: 'Beau Hossler', odds: '+35000', worldRanking: 50 },
  ];

  // Tier 4 - Remaining
  const tier4Players = [
    { name: 'Nick Dunlap', odds: '+40000', worldRanking: 51 },
    { name: 'Peter Malnati', odds: '+40000', worldRanking: 52 },
    { name: 'Jake Knapp', odds: '+40000', worldRanking: 53 },
    { name: 'Aaron Rai', odds: '+50000', worldRanking: 54 },
    { name: 'Billy Horschel', odds: '+50000', worldRanking: 55 },
    { name: 'Thomas Detry', odds: '+50000', worldRanking: 56 },
    { name: 'Sam Burns', odds: '+50000', worldRanking: 57 },
    { name: 'Byeong Hun An', odds: '+60000', worldRanking: 58 },
    { name: 'Christiaan Bezuidenhout', odds: '+60000', worldRanking: 59 },
    { name: 'Thriston Lawrence', odds: '+60000', worldRanking: 60 },
    { name: 'Rasmus Hojgaard', odds: '+70000', worldRanking: 61 },
    { name: 'Nicolai Hojgaard', odds: '+70000', worldRanking: 62 },
    { name: 'Ryan Fox', odds: '+70000', worldRanking: 63 },
    { name: 'Adrian Meronk', odds: '+80000', worldRanking: 64 },
    { name: 'Alex Noren', odds: '+80000', worldRanking: 65 },
    { name: 'Rafa Cabrera Bello', odds: '+100000', worldRanking: 66 },
    { name: 'Haotong Li', odds: '+100000', worldRanking: 67 },
    { name: 'Matteo Manassero', odds: '+100000', worldRanking: 68 },
    { name: 'Tyrrell Hatton', odds: '+100000', worldRanking: 69 },
    { name: 'Luke Donald', odds: '+150000', worldRanking: 70 },
    { name: 'Danny Willett', odds: '+150000', worldRanking: 71 },
    { name: 'Louis Oosthuizen', odds: '+150000', worldRanking: 72 },
    { name: 'Lee Westwood', odds: '+200000', worldRanking: 73 },
    { name: 'Ian Poulter', odds: '+200000', worldRanking: 74 },
    { name: 'Sergio Garcia', odds: '+200000', worldRanking: 75 },
    { name: 'Fred Couples', odds: '+500000', worldRanking: 76 },
    { name: 'Jose Maria Olazabal', odds: '+500000', worldRanking: 77 },
    { name: 'Padraig Harrington', odds: '+500000', worldRanking: 78 },
    { name: 'Mike Weir', odds: '+500000', worldRanking: 79 },
    { name: 'Vijay Singh', odds: '+500000', worldRanking: 80 },
    { name: 'Tom Watson', odds: '+999999', worldRanking: 81 },
  ];

  // Delete existing players for masters 2026 to avoid duplicates
  await prisma.player.deleteMany({ where: { majorId: 'masters-2026' } });

  const allTierPlayers = [
    ...tier1Players.map(p => ({ ...p, tier: 1 })),
    ...tier2Players.map(p => ({ ...p, tier: 2 })),
    ...tier3Players.map(p => ({ ...p, tier: 3 })),
    ...tier4Players.map(p => ({ ...p, tier: 4 })),
  ];

  for (const player of allTierPlayers) {
    await prisma.player.create({
      data: {
        name: player.name,
        majorId: 'masters-2026',
        tier: player.tier,
        odds: player.odds,
        worldRanking: player.worldRanking,
      },
    });
  }

  console.log(`Created ${allTierPlayers.length} players for The Masters 2026`);
  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
