import Link from 'next/link';
import { auth } from '@/lib/auth';
import Footer from '@/components/Footer';

const ICONIC_MOMENTS = [
  {
    year: '2005',
    title: "Tiger's Chip at the 16th",
    tournament: 'The Masters',
    description:
      "On Sunday at Augusta, Tiger Woods chipped from behind the 16th green with his ball landing perfectly on the slope, trickling toward the hole with Nike logo visible, pausing at the lip for a breathless moment, before dropping in. The roar echoed across Amen Corner. Called the greatest chip shot in Masters history.",
  },
  {
    year: '1986',
    title: "The Golden Bear's Last Roar",
    tournament: 'The Masters',
    description:
      "At 46, Jack Nicklaus was written off. The Atlanta Journal-Constitution called him 'done.' On Sunday, Nicklaus made seven birdies and an eagle on the back nine, shooting 30. His 65 produced one final green jacket — the oldest Masters champion ever. His son Jackie caddied, weeping on the 18th green.",
  },
  {
    year: '1999',
    title: 'Van de Velde and Carnoustie',
    tournament: 'The Open Championship',
    description:
      "Jean Van de Velde stood on the 72nd tee at Carnoustie with a three-shot lead. He needed only a double bogey. What followed was golf's most spectacular collapse — into the burn, off the grandstand, into the rough. He removed his shoes to play from the water, thought better of it, took a seven, and lost in a playoff.",
  },
  {
    year: '2012',
    title: "Bubba's Miracle Hook",
    tournament: 'The Masters',
    description:
      "In the sudden-death playoff, Bubba Watson pulled his drive into the pine straw, blocked by trees. From 155 yards, he hit a 52-degree wedge with a 40-yard right-to-left hook, threading through the trees and stopping 10 feet from the flag. Two putts later, Bubba won his first green jacket, collapsing in tears in caddie Ted Scott's arms.",
  },
  {
    year: '1950',
    title: "Hogan's Comeback",
    tournament: 'U.S. Open',
    description:
      "Sixteen months after a near-fatal head-on collision with a Greyhound bus, Ben Hogan limped around Merion Golf Club on wrapped, aching legs. He played 36 holes on Saturday, barely able to walk. Yet his 36-hole total of 139 tied the leaders. He won the playoff, cementing one of sport's greatest comebacks. His 1-iron approach on 18 became legend.",
  },
  {
    year: '1977',
    title: 'Duel in the Sun',
    tournament: 'The Open Championship',
    description:
      "At Turnberry, Tom Watson and Jack Nicklaus separated from the field entirely. Over 72 holes they traded birdies in what Sports Illustrated called 'the greatest head-to-head battle in golf history.' Watson's final 65 to Nicklaus's 66 remains the standard for championship match play. Nicklaus told Watson: 'I gave you my best. You were better.'",
  },
  {
    year: '1913',
    title: "The Amateur Who Stunned the World",
    tournament: 'U.S. Open',
    description:
      "Francis Ouimet was a 20-year-old amateur who had grown up across the street from The Country Club in Brookline. The English professionals Harry Vardon and Ted Ray were overwhelming favorites. Ouimet tied them at 72 holes and won the 18-hole playoff, igniting America's love affair with golf and proving the game belonged to everyone.",
  },
  {
    year: '2010',
    title: "Phil's Gap Wedge on 13",
    tournament: 'The Masters',
    description:
      "Two back with five to play, Phil Mickelson stood beneath the towering pines on Augusta's 13th hole — the 2nd shot into the creek-guarded par-5 — and pulled a gap wedge from 207 yards, over water, to 20 feet. Two putts for eagle. The gallery erupted. Mickelson went on to win his third Masters in one of Augusta's most electrifying finishes.",
  },
];

const MAJORS_2026 = [
  {
    name: 'The Masters',
    dates: 'April 9–12, 2026',
    venue: 'Augusta National Golf Club',
    location: 'Augusta, Georgia',
    color: '#2e8b57',
    accent: '#c9a84c',
  },
  {
    name: 'PGA Championship',
    dates: 'May 21–24, 2026',
    venue: 'Quail Hollow Club',
    location: 'Charlotte, North Carolina',
    color: '#1a2e5a',
    accent: '#7a9fd4',
  },
  {
    name: 'U.S. Open',
    dates: 'June 18–21, 2026',
    venue: 'Shinnecock Hills Golf Club',
    location: 'Southampton, New York',
    color: '#5a1a1a',
    accent: '#e05050',
  },
  {
    name: 'The Open Championship',
    dates: 'July 16–19, 2026',
    venue: 'Royal Portrush Golf Club',
    location: 'Portrush, Northern Ireland',
    color: '#1a1a5a',
    accent: '#9090e0',
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="hero-bg min-h-screen flex flex-col items-center justify-center relative px-4">
        {/* Background SVG golf landscape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Fairway hills */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 300" preserveAspectRatio="none">
            <path d="M0,200 Q200,100 400,180 Q600,260 800,150 Q1000,40 1200,160 Q1350,240 1440,180 L1440,300 L0,300 Z" fill="rgba(26,46,26,0.6)"/>
            <path d="M0,230 Q180,160 360,220 Q540,280 720,200 Q900,120 1080,200 Q1260,280 1440,220 L1440,300 L0,300 Z" fill="rgba(36,56,36,0.8)"/>
            <path d="M0,260 Q360,220 720,250 Q1080,280 1440,250 L1440,300 L0,300 Z" fill="rgba(20,40,20,0.9)"/>
          </svg>

          {/* Stars/dots decoration */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 60 + '%',
                left: Math.random() * 100 + '%',
                background: 'rgba(201,168,76,0.3)',
                animation: `shimmer ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: Math.random() * 3 + 's',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Decorative top element */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4))' }} />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L12.5 7.5H20L14 12L16.5 19.5L10 15L3.5 19.5L6 12L0 7.5H7.5Z" fill="#c9a84c" opacity="0.6"/>
            </svg>
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
          </div>

          {/* Main title */}
          <h1 className="font-serif font-bold leading-none mb-4 fade-in" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}>
            <span className="block gold-shimmer">SAY AMEN</span>
            <span className="block" style={{ color: 'rgba(201,168,76,0.5)', fontSize: '0.45em', letterSpacing: '0.4em', marginTop: '0.1em' }}>AT THE CORNER</span>
          </h1>

          {/* Subtitle */}
          <p className="font-serif text-xl md:text-2xl mb-2 slide-up" style={{ color: 'rgba(245,239,224,0.8)', animationDelay: '0.3s' }}>
            The Greatest Pool in Golf
          </p>
          <p className="font-serif text-sm md:text-base mb-10 slide-up" style={{ color: 'rgba(245,239,224,0.4)', letterSpacing: '0.15em', animationDelay: '0.5s' }}>
            2026 MAJOR CHAMPIONSHIPS FANTASY POOL
          </p>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-20" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c)' }} />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#c9a84c" strokeWidth="1" opacity="0.6"/>
              <circle cx="6" cy="6" r="2" fill="#c9a84c" opacity="0.6"/>
            </svg>
            <div className="h-px w-20" style={{ background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{ animationDelay: '0.6s' }}>
            {session ? (
              <Link href="/dashboard" className="btn-gold text-lg py-4 px-10">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-gold text-lg py-4 px-10">
                  Sign In to Pool
                </Link>
                <a href="#how-it-works" className="btn-outline-gold text-lg py-4 px-10">
                  How It Works
                </a>
              </>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto" style={{ color: 'rgba(201,168,76,0.4)' }}>
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* 2026 MAJORS */}
      <section className="py-20 px-4" style={{ background: 'rgba(10,26,10,0.6)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              The 2026 Major Championships
            </h2>
            <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>
              Four tournaments. One season. Eternal glory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MAJORS_2026.map((major, i) => (
              <div
                key={i}
                className="rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300"
                style={{
                  background: `linear-gradient(135deg, ${major.color}40 0%, rgba(10,26,10,0.8) 100%)`,
                  border: `1px solid ${major.accent}30`,
                }}
              >
                <div className="text-3xl font-serif font-bold mb-2" style={{ color: major.accent }}>
                  {i + 1}
                </div>
                <h3 className="font-serif text-lg font-bold mb-2" style={{ color: '#f5efe0' }}>
                  {major.name}
                </h3>
                <p className="font-serif text-sm mb-1" style={{ color: major.accent, opacity: 0.8 }}>
                  {major.dates}
                </p>
                <p className="font-serif text-xs mb-1" style={{ color: 'rgba(245,239,224,0.6)' }}>
                  {major.venue}
                </p>
                <p className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.4)' }}>
                  {major.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              How the Pool Works
            </h2>
            <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>
              Strategy meets luck across golf's greatest stages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Pick system */}
            <div className="card-green p-8">
              <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#c9a84c' }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: 'rgba(201,168,76,0.2)', color: '#c9a84c' }}>1</span>
                The Tier System
              </h3>
              <div className="space-y-4">
                {[
                  { tier: 'Tier 1', desc: 'Top 8 by odds', pick: 'Pick 3', color: '#c9a84c' },
                  { tier: 'Tier 2', desc: 'Players 9–30', pick: 'Pick 4', color: '#a0c878' },
                  { tier: 'Tier 3', desc: 'Players 31–50', pick: 'Pick 3', color: '#6a9a6a' },
                  { tier: 'Tier 4', desc: 'Remaining field', pick: 'Pick 2', color: '#4a7a4a' },
                ].map(t => (
                  <div key={t.tier} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.color}20` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full" style={{ background: t.color }} />
                      <div>
                        <div className="font-serif text-sm font-bold" style={{ color: t.color }}>{t.tier}</div>
                        <div className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.5)' }}>{t.desc}</div>
                      </div>
                    </div>
                    <span className="font-serif text-sm font-bold" style={{ color: 'rgba(245,239,224,0.7)' }}>{t.pick}</span>
                  </div>
                ))}
              </div>
              <p className="font-serif text-sm mt-4" style={{ color: 'rgba(245,239,224,0.5)' }}>
                Total: 12 players per major. Best 10 of 12 scores count.
              </p>
            </div>

            {/* Scoring */}
            <div className="card-green p-8">
              <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-3" style={{ color: '#c9a84c' }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: 'rgba(201,168,76,0.2)', color: '#c9a84c' }}>2</span>
                Scoring & Earnings
              </h3>
              <div className="space-y-3 mb-4">
                <p className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>
                  Your pool score is the sum of your best 10 players' scores relative to par. Lower is better.
                </p>
                <p className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>
                  Missed cut players receive a <span style={{ color: '#e63c3c' }}>+20 penalty</span>.
                </p>
              </div>
              <h4 className="font-serif text-sm font-bold mb-3" style={{ color: '#c9a84c' }}>Top Earnings per Major</h4>
              <div className="space-y-2">
                {[
                  { pos: '1st', earn: '$500,000' },
                  { pos: '2nd', earn: '$300,000' },
                  { pos: '3rd', earn: '$200,000' },
                  { pos: '4th', earn: '$150,000' },
                  { pos: '5th', earn: '$100,000' },
                ].map(e => (
                  <div key={e.pos} className="flex justify-between items-center">
                    <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>{e.pos}</span>
                    <span className="font-serif text-sm font-bold" style={{ color: '#c9a84c' }}>{e.earn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Get Invited', desc: 'The commissioner adds you to the pool and sends an invite link to activate your account.' },
              { step: '02', title: 'Make Picks', desc: 'Before each major begins, select your 12 players across the four tiers. Picks lock at tee time.' },
              { step: '03', title: 'Watch & Win', desc: 'Live scores update throughout the weekend. Top earners across all four majors take the season title.' },
            ].map(step => (
              <div key={step.step} className="text-center p-6 card-dark rounded-xl">
                <div className="font-serif text-5xl font-bold mb-3" style={{ color: 'rgba(201,168,76,0.2)' }}>
                  {step.step}
                </div>
                <h4 className="font-serif text-lg font-bold mb-2" style={{ color: '#c9a84c' }}>{step.title}</h4>
                <p className="font-serif text-sm leading-relaxed" style={{ color: 'rgba(245,239,224,0.6)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICONIC MOMENTS */}
      <section className="py-20 px-4" style={{ background: 'rgba(10,26,10,0.5)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              Defining Moments in Major History
            </h2>
            <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>
              The shots, collapses, and triumphs that made golf what it is
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ICONIC_MOMENTS.map((moment, i) => (
              <div
                key={i}
                className="p-6 rounded-xl group hover:border-gold-600/40 transition-all duration-300"
                style={{
                  background: 'rgba(26,46,26,0.5)',
                  border: '1px solid rgba(201,168,76,0.15)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="font-serif text-2xl font-bold" style={{ color: 'rgba(201,168,76,0.3)' }}>
                      {moment.year}
                    </div>
                    <div className="text-xs font-serif mt-1" style={{ color: 'rgba(201,168,76,0.4)' }}>
                      {moment.tournament.split(' ')[0]}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-gold-400 transition-colors" style={{ color: '#c9a84c' }}>
                      {moment.title}
                    </h3>
                    <p className="font-serif text-sm leading-relaxed" style={{ color: 'rgba(245,239,224,0.65)' }}>
                      {moment.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="font-serif text-6xl mb-6" style={{ color: 'rgba(201,168,76,0.15)' }}>⛳</div>
          <h2 className="font-serif text-4xl font-bold mb-4" style={{ color: '#c9a84c' }}>
            Ready to Play?
          </h2>
          <p className="font-serif text-lg mb-8" style={{ color: 'rgba(245,239,224,0.6)' }}>
            Contact the commissioner to get your invite link and join the 2026 pool.
          </p>
          {session ? (
            <Link href="/dashboard" className="btn-gold text-xl py-5 px-12">
              Enter Your Picks →
            </Link>
          ) : (
            <Link href="/login" className="btn-gold text-xl py-5 px-12">
              Sign In to the Pool →
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
