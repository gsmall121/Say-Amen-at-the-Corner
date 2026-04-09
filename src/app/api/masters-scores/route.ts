import { NextResponse } from 'next/server';

// ESPN Golf API — returns the current PGA/major tournament scoreboard
const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';

function parseScore(val: string | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  if (val === 'E' || val === 'Even') return 0;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

export interface ESPNPlayerScore {
  name: string;
  score: number | null;   // total score relative to par (null = not started)
  status: 'active' | 'cut' | 'wd' | 'dq';
  position: string | null;
  thru: number | null;    // holes completed in current round (null = not started / finished)
  round: number;          // current round number
}

export interface MastersScoresResponse {
  eventName: string | null;
  eventStatus: 'scheduled' | 'in_progress' | 'complete';
  players: ESPNPlayerScore[];
  lastUpdated: string;
  error?: string;
}

export async function GET() {
  try {
    const res = await fetch(ESPN_URL, {
      next: { revalidate: 0 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return NextResponse.json<MastersScoresResponse>({
        eventName: null,
        eventStatus: 'scheduled',
        players: [],
        lastUpdated: new Date().toISOString(),
        error: `ESPN API returned ${res.status}`,
      });
    }

    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      return NextResponse.json<MastersScoresResponse>({
        eventName: null,
        eventStatus: 'scheduled',
        players: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    const event = data.events[0];
    const competition = event.competitions?.[0];

    if (!competition) {
      return NextResponse.json<MastersScoresResponse>({
        eventName: event.name ?? null,
        eventStatus: 'scheduled',
        players: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    const state = competition.status?.type?.state;
    const eventStatus: 'scheduled' | 'in_progress' | 'complete' =
      state === 'in' ? 'in_progress' : state === 'post' ? 'complete' : 'scheduled';

    const players: ESPNPlayerScore[] = (competition.competitors ?? []).map((comp: any) => {
      const name: string = comp.athlete?.displayName ?? comp.athlete?.fullName ?? '';
      const score = parseScore(comp.score);

      const statusName: string = comp.status?.type?.name ?? '';
      const statusId: string = comp.status?.type?.id ?? '';
      let status: ESPNPlayerScore['status'] = 'active';
      if (statusName === 'STATUS_CUT' || statusId === '6') status = 'cut';
      else if (statusName === 'STATUS_WD' || statusId === '7') status = 'wd';
      else if (statusName === 'STATUS_DQ' || statusId === '9') status = 'dq';

      const position: string | null = comp.status?.position?.displayName ?? null;
      const thruRaw = comp.status?.thru;
      const thru = thruRaw != null ? parseInt(thruRaw, 10) : null;
      const linescores = comp.linescores ?? [];
      const round = linescores.length || 1;

      return {
        name,
        score,
        status,
        position,
        thru: thru != null && !isNaN(thru) ? thru : null,
        round,
      };
    });

    return NextResponse.json<MastersScoresResponse>({
      eventName: event.name ?? null,
      eventStatus,
      players,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('masters-scores fetch error:', err);
    return NextResponse.json<MastersScoresResponse>({
      eventName: null,
      eventStatus: 'scheduled',
      players: [],
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch scores',
    });
  }
}
