import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// One-time database setup endpoint — creates all tables and seeds initial data
// Visit /api/admin/setup-db after first deploy to initialize the database
export async function GET() {
  try {
    await prisma.$connect()

    // Check if already seeded
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (existingAdmin) {
      return NextResponse.json({ message: 'Database already set up', status: 'ok' })
    }

    // Create admin user — logs in with access code COMMISSIONER
    await prisma.user.create({
      data: {
        email: 'admin@pool.internal',
        name: 'Commissioner',
        accessCode: 'COMMISSIONER',
        role: 'ADMIN',
        isActive: true,
      },
    })

    // Create 2026 majors
    const masters = await prisma.major.create({
      data: {
        name: 'The Masters',
        year: 2026,
        venue: 'Augusta National Golf Club',
        location: 'Augusta, Georgia',
        startDate: new Date('2026-04-09'),
        endDate: new Date('2026-04-12'),
        status: 'PICKS_OPEN',
      },
    })

    await prisma.major.create({
      data: {
        name: 'PGA Championship',
        year: 2026,
        venue: 'Quail Hollow Club',
        location: 'Charlotte, North Carolina',
        startDate: new Date('2026-05-21'),
        endDate: new Date('2026-05-24'),
        status: 'UPCOMING',
      },
    })

    await prisma.major.create({
      data: {
        name: 'U.S. Open',
        year: 2026,
        venue: 'Oakmont Country Club',
        location: 'Oakmont, Pennsylvania',
        startDate: new Date('2026-06-18'),
        endDate: new Date('2026-06-21'),
        status: 'UPCOMING',
      },
    })

    await prisma.major.create({
      data: {
        name: 'The Open Championship',
        year: 2026,
        venue: 'Royal Portrush Golf Club',
        location: 'Portrush, Northern Ireland',
        startDate: new Date('2026-07-16'),
        endDate: new Date('2026-07-19'),
        status: 'UPCOMING',
      },
    })

    // Seed Masters players by tier
    const tier1Players = [
      { name: 'Scottie Scheffler', odds: '+350', worldRanking: 1 },
      { name: 'Rory McIlroy', odds: '+600', worldRanking: 2 },
      { name: 'Xander Schauffele', odds: '+900', worldRanking: 3 },
      { name: 'Jon Rahm', odds: '+1000', worldRanking: 4 },
      { name: 'Collin Morikawa', odds: '+1200', worldRanking: 5 },
      { name: 'Viktor Hovland', odds: '+1400', worldRanking: 6 },
      { name: 'Brooks Koepka', odds: '+1600', worldRanking: 7 },
      { name: 'Bryson DeChambeau', odds: '+1800', worldRanking: 8 },
    ]

    const tier2Players = [
      { name: 'Ludvig Aberg', odds: '+2000', worldRanking: 9 },
      { name: 'Tommy Fleetwood', odds: '+2200', worldRanking: 10 },
      { name: 'Patrick Cantlay', odds: '+2500', worldRanking: 11 },
      { name: 'Tony Finau', odds: '+2800', worldRanking: 12 },
      { name: 'Justin Thomas', odds: '+3000', worldRanking: 13 },
      { name: 'Jordan Spieth', odds: '+3000', worldRanking: 14 },
      { name: 'Cameron Smith', odds: '+3200', worldRanking: 15 },
      { name: 'Hideki Matsuyama', odds: '+3500', worldRanking: 16 },
      { name: 'Shane Lowry', odds: '+3500', worldRanking: 17 },
      { name: 'Russell Henley', odds: '+4000', worldRanking: 18 },
      { name: 'Brian Harman', odds: '+4000', worldRanking: 19 },
      { name: 'Keegan Bradley', odds: '+4500', worldRanking: 20 },
      { name: 'Jason Day', odds: '+4500', worldRanking: 21 },
      { name: 'Sungjae Im', odds: '+5000', worldRanking: 22 },
      { name: 'Tom Kim', odds: '+5000', worldRanking: 23 },
      { name: 'Corey Conners', odds: '+5500', worldRanking: 24 },
      { name: 'Adam Scott', odds: '+5500', worldRanking: 25 },
      { name: 'Min Woo Lee', odds: '+6000', worldRanking: 26 },
      { name: 'Matt Fitzpatrick', odds: '+6000', worldRanking: 27 },
      { name: 'Sepp Straka', odds: '+6500', worldRanking: 28 },
      { name: 'Harris English', odds: '+7000', worldRanking: 29 },
      { name: 'Will Zalatoris', odds: '+7000', worldRanking: 30 },
    ]

    const tier3Players = [
      { name: 'Sahith Theegala', odds: '+8000', worldRanking: 31 },
      { name: 'Max Homa', odds: '+8000', worldRanking: 32 },
      { name: 'Wyndham Clark', odds: '+8500', worldRanking: 33 },
      { name: 'Justin Rose', odds: '+9000', worldRanking: 34 },
      { name: 'Rickie Fowler', odds: '+9000', worldRanking: 35 },
      { name: 'Dustin Johnson', odds: '+10000', worldRanking: 36 },
      { name: 'Adam Hadwin', odds: '+10000', worldRanking: 37 },
      { name: 'Kurt Kitayama', odds: '+10000', worldRanking: 38 },
      { name: 'Taylor Moore', odds: '+12000', worldRanking: 39 },
      { name: 'Si Woo Kim', odds: '+12000', worldRanking: 40 },
      { name: 'Akshay Bhatia', odds: '+12000', worldRanking: 41 },
      { name: 'Davis Riley', odds: '+15000', worldRanking: 42 },
      { name: 'Chris Kirk', odds: '+15000', worldRanking: 43 },
      { name: 'Eric Cole', odds: '+15000', worldRanking: 44 },
      { name: 'Lucas Glover', odds: '+15000', worldRanking: 45 },
      { name: 'Mackenzie Hughes', odds: '+18000', worldRanking: 46 },
      { name: 'Austin Eckroat', odds: '+18000', worldRanking: 47 },
      { name: 'Nick Taylor', odds: '+18000', worldRanking: 48 },
      { name: 'Denny McCarthy', odds: '+20000', worldRanking: 49 },
      { name: 'Beau Hossler', odds: '+20000', worldRanking: 50 },
    ]

    const tier4Players = [
      { name: 'Nick Dunlap', odds: '+25000', worldRanking: 51 },
      { name: 'Peter Malnati', odds: '+25000', worldRanking: 52 },
      { name: 'Jake Knapp', odds: '+30000', worldRanking: 53 },
      { name: 'Aaron Rai', odds: '+30000', worldRanking: 54 },
      { name: 'Billy Horschel', odds: '+30000', worldRanking: 55 },
      { name: 'Thomas Detry', odds: '+35000', worldRanking: 56 },
      { name: 'Sam Burns', odds: '+35000', worldRanking: 57 },
      { name: 'Byeong Hun An', odds: '+40000', worldRanking: 58 },
      { name: 'Tyrrell Hatton', odds: '+40000', worldRanking: 59 },
      { name: 'Rasmus Hojgaard', odds: '+45000', worldRanking: 60 },
      { name: 'Nicolai Hojgaard', odds: '+45000', worldRanking: 61 },
      { name: 'Ryan Fox', odds: '+50000', worldRanking: 62 },
      { name: 'Alex Noren', odds: '+50000', worldRanking: 63 },
      { name: 'Haotong Li', odds: '+60000', worldRanking: 64 },
      { name: 'Matteo Manassero', odds: '+60000', worldRanking: 65 },
      { name: 'Louis Oosthuizen', odds: '+80000', worldRanking: 66 },
      { name: 'Sergio Garcia', odds: '+100000', worldRanking: 67 },
      { name: 'Danny Willett', odds: '+100000', worldRanking: 68 },
      { name: 'Fred Couples', odds: '+100000', worldRanking: 69 },
      { name: 'Jose Maria Olazabal', odds: '+100000', worldRanking: 70 },
      { name: 'Mike Weir', odds: '+100000', worldRanking: 71 },
      { name: 'Vijay Singh', odds: '+100000', worldRanking: 72 },
    ]

    const allPlayers = [
      ...tier1Players.map(p => ({ ...p, tier: 1, majorId: masters.id })),
      ...tier2Players.map(p => ({ ...p, tier: 2, majorId: masters.id })),
      ...tier3Players.map(p => ({ ...p, tier: 3, majorId: masters.id })),
      ...tier4Players.map(p => ({ ...p, tier: 4, majorId: masters.id })),
    ]

    await prisma.player.createMany({ data: allPlayers })

    return NextResponse.json({
      message: 'Database set up successfully!',
      status: 'ok',
      created: {
        admin: 'Login with access code: COMMISSIONER',
        majors: 4,
        players: allPlayers.length,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed', details: String(error) },
      { status: 500 }
    )
  }
}
