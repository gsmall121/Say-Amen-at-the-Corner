// ESPN Golf API integration
// Source: https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard

const ESPN_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';

export interface ESPNPlayer {
  id: string;
  name: string;
  score: number | null; // relative to par
  position: number | null;
  status: 'active' | 'cut' | 'wd' | 'dq';
  roundScores: (number | null)[];
  currentRound: number;
  thru: number | null;
}

export interface ESPNScoreboard {
  eventName: string;
  eventStatus: 'scheduled' | 'in_progress' | 'complete';
  players: ESPNPlayer[];
  lastUpdated: string;
}

function parsePosition(posStr: string | undefined): number | null {
  if (!posStr) return null;
  const cleaned = posStr.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function parseScore(scoreStr: string | undefined | null): number | null {
  if (scoreStr === undefined || scoreStr === null) return null;
  if (scoreStr === 'E' || scoreStr === 'Even') return 0;
  const num = parseInt(scoreStr, 10);
  return isNaN(num) ? null : num;
}

function normalizePlayerName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function fetchESPNScoreboard(): Promise<ESPNScoreboard | null> {
  try {
    const response = await fetch(ESPN_API_URL, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error('ESPN API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data.events || data.events.length === 0) {
      return null;
    }

    const event = data.events[0];
    const competition = event.competitions?.[0];

    if (!competition) return null;

    const status = competition.status?.type?.state;
    let eventStatus: 'scheduled' | 'in_progress' | 'complete' = 'scheduled';
    if (status === 'in') eventStatus = 'in_progress';
    else if (status === 'post') eventStatus = 'complete';

    const players: ESPNPlayer[] = [];

    const competitors = competition.competitors || [];
    for (const comp of competitors) {
      const athlete = comp.athlete;
      const playerName = athlete?.displayName || athlete?.fullName || '';

      const scoreStr = comp.score;
      const score = parseScore(scoreStr);

      const posStr = comp.status?.position?.displayName || comp.status?.period?.toString();
      const position = parsePosition(posStr);

      const compStatus = comp.status?.type?.id;
      let playerStatus: 'active' | 'cut' | 'wd' | 'dq' = 'active';
      if (compStatus === '6' || comp.status?.type?.name === 'STATUS_CUT') playerStatus = 'cut';
      else if (compStatus === '7' || comp.status?.type?.name === 'STATUS_WD') playerStatus = 'wd';
      else if (compStatus === '9' || comp.status?.type?.name === 'STATUS_DQ') playerStatus = 'dq';

      const linescores = comp.linescores || [];
      const roundScores: (number | null)[] = linescores.map((ls: any) =>
        parseScore(ls.displayValue)
      );

      const thruStr = comp.status?.thru;
      const thru = thruStr ? parseInt(thruStr, 10) : null;

      players.push({
        id: athlete?.id || '',
        name: playerName,
        score,
        position,
        status: playerStatus,
        roundScores,
        currentRound: linescores.length || 1,
        thru: isNaN(thru as number) ? null : thru,
      });
    }

    return {
      eventName: event.name || '',
      eventStatus,
      players,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching ESPN scoreboard:', error);
    return null;
  }
}

export function matchPlayerByName(
  espnName: string,
  ourPlayerNames: string[]
): string | null {
  const normalizedEspn = normalizePlayerName(espnName);

  // Exact match first
  for (const name of ourPlayerNames) {
    if (normalizePlayerName(name) === normalizedEspn) {
      return name;
    }
  }

  // Last name match
  const espnLastName = normalizedEspn.split(' ').slice(-1)[0];
  for (const name of ourPlayerNames) {
    const ourLastName = normalizePlayerName(name).split(' ').slice(-1)[0];
    if (espnLastName === ourLastName) {
      return name;
    }
  }

  // Partial match
  for (const name of ourPlayerNames) {
    const normalizedOur = normalizePlayerName(name);
    if (normalizedEspn.includes(normalizedOur) || normalizedOur.includes(normalizedEspn)) {
      return name;
    }
  }

  return null;
}
