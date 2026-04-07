import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()

    // Create all tables if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "accessCode" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL DEFAULT '',
        "role" TEXT NOT NULL DEFAULT 'USER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Major" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "venue" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'UPCOMING',
        "cutScore" INTEGER
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Player" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "majorId" TEXT NOT NULL REFERENCES "Major"("id"),
        "tier" INTEGER NOT NULL,
        "odds" TEXT,
        "worldRanking" INTEGER,
        "totalScore" INTEGER,
        "position" INTEGER,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE'
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Pick" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id"),
        "majorId" TEXT NOT NULL REFERENCES "Major"("id"),
        "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isLocked" BOOLEAN NOT NULL DEFAULT false,
        UNIQUE("userId", "majorId")
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PickPlayer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "pickId" TEXT NOT NULL REFERENCES "Pick"("id"),
        "playerId" TEXT NOT NULL REFERENCES "Player"("id")
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RoundScore" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "playerId" TEXT NOT NULL REFERENCES "Player"("id"),
        "round" INTEGER NOT NULL,
        "score" INTEGER,
        "scoreToPar" INTEGER,
        UNIQUE("playerId", "round")
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Earning" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id"),
        "majorId" TEXT NOT NULL REFERENCES "Major"("id"),
        "amount" DOUBLE PRECISION NOT NULL,
        "rank" INTEGER NOT NULL,
        UNIQUE("userId", "majorId")
      )
    `)

    // Check if already seeded
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (existingAdmin) {
      return NextResponse.json({ message: 'Database already set up', status: 'ok' })
    }

    // Seed admin user
    const { createId } = await import('@paralleldrive/cuid2')

    await prisma.user.create({
      data: {
        id: createId(),
        email: 'admin@pool.internal',
        name: 'Commissioner',
        accessCode: 'COMMISSIONER',
        role: 'ADMIN',
        isActive: true,
      },
    })

    // Seed 2026 majors
    const masters = await prisma.major.create({
      data: {
        id: createId(),
        name: 'The Masters',
        year: 2026,
        venue: 'Augusta National Golf Club',
        location: 'Augusta, Georgia',
        startDate: new Date('2026-04-09'),
        endDate: new Date('2026-04-12'),
        status: 'PICKS_OPEN',
      },
    })

    await prisma.major.createMany({
      data: [
        {
          id: createId(),
          name: 'PGA Championship',
          year: 2026,
          venue: 'Quail Hollow Club',
          location: 'Charlotte, North Carolina',
          startDate: new Date('2026-05-21'),
          endDate: new Date('2026-05-24'),
          status: 'UPCOMING',
        },
        {
          id: createId(),
          name: 'U.S. Open',
          year: 2026,
          venue: 'Oakmont Country Club',
          location: 'Oakmont, Pennsylvania',
          startDate: new Date('2026-06-18'),
          endDate: new Date('2026-06-21'),
          status: 'UPCOMING',
        },
        {
          id: createId(),
          name: 'The Open Championship',
          year: 2026,
          venue: 'Royal Portrush Golf Club',
          location: 'Portrush, Northern Ireland',
          startDate: new Date('2026-07-16'),
          endDate: new Date('2026-07-19'),
          status: 'UPCOMING',
        },
      ],
    })

    // Seed Masters players
    const players = [
      // Tier 1
      { name: 'Scottie Scheffler', tier: 1, odds: '+350', worldRanking: 1 },
      { name: 'Rory McIlroy', tier: 1, odds: '+600', worldRanking: 2 },
      { name: 'Xander Schauffele', tier: 1, odds: '+900', worldRanking: 3 },
      { name: 'Jon Rahm', tier: 1, odds: '+1000', worldRanking: 4 },
      { name: 'Collin Morikawa', tier: 1, odds: '+1200', worldRanking: 5 },
      { name: 'Viktor Hovland', tier: 1, odds: '+1400', worldRanking: 6 },
      { name: 'Brooks Koepka', tier: 1, odds: '+1600', worldRanking: 7 },
      { name: 'Bryson DeChambeau', tier: 1, odds: '+1800', worldRanking: 8 },
      // Tier 2
      { name: 'Ludvig Aberg', tier: 2, odds: '+2000', worldRanking: 9 },
      { name: 'Tommy Fleetwood', tier: 2, odds: '+2200', worldRanking: 10 },
      { name: 'Patrick Cantlay', tier: 2, odds: '+2500', worldRanking: 11 },
      { name: 'Tony Finau', tier: 2, odds: '+2800', worldRanking: 12 },
      { name: 'Justin Thomas', tier: 2, odds: '+3000', worldRanking: 13 },
      { name: 'Jordan Spieth', tier: 2, odds: '+3000', worldRanking: 14 },
      { name: 'Cameron Smith', tier: 2, odds: '+3200', worldRanking: 15 },
      { name: 'Hideki Matsuyama', tier: 2, odds: '+3500', worldRanking: 16 },
      { name: 'Shane Lowry', tier: 2, odds: '+3500', worldRanking: 17 },
      { name: 'Russell Henley', tier: 2, odds: '+4000', worldRanking: 18 },
      { name: 'Brian Harman', tier: 2, odds: '+4000', worldRanking: 19 },
      { name: 'Keegan Bradley', tier: 2, odds: '+4500', worldRanking: 20 },
      { name: 'Jason Day', tier: 2, odds: '+4500', worldRanking: 21 },
      { name: 'Sungjae Im', tier: 2, odds: '+5000', worldRanking: 22 },
      { name: 'Tom Kim', tier: 2, odds: '+5000', worldRanking: 23 },
      { name: 'Corey Conners', tier: 2, odds: '+5500', worldRanking: 24 },
      { name: 'Adam Scott', tier: 2, odds: '+5500', worldRanking: 25 },
      { name: 'Min Woo Lee', tier: 2, odds: '+6000', worldRanking: 26 },
      { name: 'Matt Fitzpatrick', tier: 2, odds: '+6000', worldRanking: 27 },
      { name: 'Sepp Straka', tier: 2, odds: '+6500', worldRanking: 28 },
      { name: 'Harris English', tier: 2, odds: '+7000', worldRanking: 29 },
      { name: 'Will Zalatoris', tier: 2, odds: '+7000', worldRanking: 30 },
      // Tier 3
      { name: 'Sahith Theegala', tier: 3, odds: '+8000', worldRanking: 31 },
      { name: 'Max Homa', tier: 3, odds: '+8000', worldRanking: 32 },
      { name: 'Wyndham Clark', tier: 3, odds: '+8500', worldRanking: 33 },
      { name: 'Justin Rose', tier: 3, odds: '+9000', worldRanking: 34 },
      { name: 'Rickie Fowler', tier: 3, odds: '+9000', worldRanking: 35 },
      { name: 'Dustin Johnson', tier: 3, odds: '+10000', worldRanking: 36 },
      { name: 'Adam Hadwin', tier: 3, odds: '+10000', worldRanking: 37 },
      { name: 'Kurt Kitayama', tier: 3, odds: '+10000', worldRanking: 38 },
      { name: 'Taylor Moore', tier: 3, odds: '+12000', worldRanking: 39 },
      { name: 'Si Woo Kim', tier: 3, odds: '+12000', worldRanking: 40 },
      { name: 'Akshay Bhatia', tier: 3, odds: '+12000', worldRanking: 41 },
      { name: 'Davis Riley', tier: 3, odds: '+15000', worldRanking: 42 },
      { name: 'Chris Kirk', tier: 3, odds: '+15000', worldRanking: 43 },
      { name: 'Eric Cole', tier: 3, odds: '+15000', worldRanking: 44 },
      { name: 'Lucas Glover', tier: 3, odds: '+15000', worldRanking: 45 },
      { name: 'Mackenzie Hughes', tier: 3, odds: '+18000', worldRanking: 46 },
      { name: 'Austin Eckroat', tier: 3, odds: '+18000', worldRanking: 47 },
      { name: 'Nick Taylor', tier: 3, odds: '+18000', worldRanking: 48 },
      { name: 'Denny McCarthy', tier: 3, odds: '+20000', worldRanking: 49 },
      { name: 'Beau Hossler', tier: 3, odds: '+20000', worldRanking: 50 },
      // Tier 4
      { name: 'Nick Dunlap', tier: 4, odds: '+25000', worldRanking: 51 },
      { name: 'Peter Malnati', tier: 4, odds: '+25000', worldRanking: 52 },
      { name: 'Jake Knapp', tier: 4, odds: '+30000', worldRanking: 53 },
      { name: 'Aaron Rai', tier: 4, odds: '+30000', worldRanking: 54 },
      { name: 'Billy Horschel', tier: 4, odds: '+30000', worldRanking: 55 },
      { name: 'Thomas Detry', tier: 4, odds: '+35000', worldRanking: 56 },
      { name: 'Sam Burns', tier: 4, odds: '+35000', worldRanking: 57 },
      { name: 'Byeong Hun An', tier: 4, odds: '+40000', worldRanking: 58 },
      { name: 'Tyrrell Hatton', tier: 4, odds: '+40000', worldRanking: 59 },
      { name: 'Rasmus Hojgaard', tier: 4, odds: '+45000', worldRanking: 60 },
      { name: 'Nicolai Hojgaard', tier: 4, odds: '+45000', worldRanking: 61 },
      { name: 'Ryan Fox', tier: 4, odds: '+50000', worldRanking: 62 },
      { name: 'Alex Noren', tier: 4, odds: '+50000', worldRanking: 63 },
      { name: 'Haotong Li', tier: 4, odds: '+60000', worldRanking: 64 },
      { name: 'Matteo Manassero', tier: 4, odds: '+60000', worldRanking: 65 },
      { name: 'Louis Oosthuizen', tier: 4, odds: '+80000', worldRanking: 66 },
      { name: 'Sergio Garcia', tier: 4, odds: '+100000', worldRanking: 67 },
      { name: 'Danny Willett', tier: 4, odds: '+100000', worldRanking: 68 },
      { name: 'Fred Couples', tier: 4, odds: '+100000', worldRanking: 69 },
      { name: 'Jose Maria Olazabal', tier: 4, odds: '+100000', worldRanking: 70 },
      { name: 'Mike Weir', tier: 4, odds: '+100000', worldRanking: 71 },
      { name: 'Vijay Singh', tier: 4, odds: '+100000', worldRanking: 72 },
    ]

    await prisma.player.createMany({
      data: players.map(p => ({ id: createId(), majorId: masters.id, ...p })),
    })

    return NextResponse.json({
      message: 'Database set up successfully!',
      status: 'ok',
      created: { admin: 'Login with code: COMMISSIONER', majors: 4, players: players.length },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed', details: String(error) }, { status: 500 })
  }
}
