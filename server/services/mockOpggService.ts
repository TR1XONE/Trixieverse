/**
 * Mock op.gg Service - For testing without API key
 * Returns realistic demo data
 */

export interface WildRiftPlayer {
  name: string;
  tag: string;
  level: number;
  rank: string;
  rp: number;
  winRate: number;
  matchCount: number;
  champions: ChampionStats[];
  recentMatches: Match[];
  lastUpdated: Date;
}

export interface ChampionStats {
  name: string;
  tier: string;
  mastery: number;
  winRate: number;
  pickRate: number;
  matchCount: number;
}

export interface Match {
  id: string;
  champion: string;
  result: 'win' | 'loss';
  kda: string;
  duration: number;
  timestamp: Date;
}

const demoPlayers: Record<string, WildRiftPlayer> = {
  'TR1XON#EUW': {
    name: 'TR1XON',
    tag: 'EUW',
    level: 32,
    rank: 'Emerald',
    rp: 75,
    winRate: 58,
    matchCount: 124,
    champions: [
      {
        name: 'Ahri',
        tier: 'S+',
        mastery: 7,
        winRate: 62,
        pickRate: 45,
        matchCount: 56,
      },
      {
        name: 'Lux',
        tier: 'S',
        mastery: 6,
        winRate: 58,
        pickRate: 30,
        matchCount: 37,
      },
      {
        name: 'Akali',
        tier: 'A',
        mastery: 5,
        winRate: 52,
        pickRate: 15,
        matchCount: 18,
      },
      {
        name: 'Seraphine',
        tier: 'A',
        mastery: 4,
        winRate: 55,
        pickRate: 8,
        matchCount: 10,
      },
      {
        name: 'Twisted Fate',
        tier: 'B',
        mastery: 3,
        winRate: 48,
        pickRate: 2,
        matchCount: 3,
      },
    ],
    recentMatches: [
      {
        id: 'match_001',
        champion: 'Ahri',
        result: 'win',
        kda: '12/2/8',
        duration: 1850,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'match_002',
        champion: 'Lux',
        result: 'win',
        kda: '8/3/15',
        duration: 2100,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: 'match_003',
        champion: 'Ahri',
        result: 'loss',
        kda: '5/6/4',
        duration: 1650,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: 'match_004',
        champion: 'Akali',
        result: 'win',
        kda: '10/4/6',
        duration: 1900,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        id: 'match_005',
        champion: 'Seraphine',
        result: 'win',
        kda: '3/1/18',
        duration: 2050,
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
    ],
    lastUpdated: new Date(),
  },
  'Faker#KR': {
    name: 'Faker',
    tag: 'KR',
    level: 35,
    rank: 'Grandmaster',
    rp: 200,
    winRate: 68,
    matchCount: 156,
    champions: [
      {
        name: 'Ahri',
        tier: 'S+',
        mastery: 7,
        winRate: 72,
        pickRate: 50,
        matchCount: 78,
      },
      {
        name: 'Lux',
        tier: 'S+',
        mastery: 7,
        winRate: 70,
        pickRate: 35,
        matchCount: 55,
      },
      {
        name: 'Akali',
        tier: 'S',
        mastery: 6,
        winRate: 65,
        pickRate: 12,
        matchCount: 19,
      },
      {
        name: 'Twisted Fate',
        tier: 'S',
        mastery: 6,
        winRate: 62,
        pickRate: 2,
        matchCount: 3,
      },
      {
        name: 'Seraphine',
        tier: 'A',
        mastery: 5,
        winRate: 58,
        pickRate: 1,
        matchCount: 1,
      },
    ],
    recentMatches: [
      {
        id: 'match_001',
        champion: 'Ahri',
        result: 'win',
        kda: '15/1/10',
        duration: 1800,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'match_002',
        champion: 'Lux',
        result: 'win',
        kda: '10/2/18',
        duration: 2000,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'match_003',
        champion: 'Ahri',
        result: 'win',
        kda: '13/3/9',
        duration: 1950,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: 'match_004',
        champion: 'Akali',
        result: 'win',
        kda: '12/2/8',
        duration: 1850,
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
      },
      {
        id: 'match_005',
        champion: 'Lux',
        result: 'win',
        kda: '8/1/20',
        duration: 2100,
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
      },
    ],
    lastUpdated: new Date(),
  },
};

export class MockOpggService {
  /**
   * Search for a player by name and tag
   */
  async searchPlayer(gameName: string, tag: string): Promise<WildRiftPlayer | null> {
    const key = `${gameName}#${tag}`;
    
    if (demoPlayers[key]) {
      return JSON.parse(JSON.stringify(demoPlayers[key]));
    }

    // Return a random demo player if not found
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    const randomPlayer = JSON.parse(JSON.stringify(demoPlayers[randomKey]));
    randomPlayer.name = gameName;
    randomPlayer.tag = tag;
    
    return randomPlayer;
  }

  /**
   * Get player stats by summoner ID
   */
  async getPlayerStats(summonerId: string): Promise<WildRiftPlayer | null> {
    // For demo, just return a random player
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    return JSON.parse(JSON.stringify(demoPlayers[randomKey]));
  }

  /**
   * Get player's recent matches
   */
  async getRecentMatches(summonerId: string, limit: number = 10): Promise<Match[]> {
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    const player = demoPlayers[randomKey];
    return player.recentMatches.slice(0, limit);
  }

  /**
   * Get champion statistics for a player
   */
  async getChampionStats(summonerId: string): Promise<ChampionStats[]> {
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    const player = demoPlayers[randomKey];
    return player.champions;
  }

  /**
   * Get tier list for a specific role
   */
  async getTierList(role: string): Promise<any[]> {
    // Return demo tier list
    return [
      { name: 'Ahri', tier: 'S+', pickRate: 45, winRate: 62 },
      { name: 'Lux', tier: 'S+', pickRate: 40, winRate: 60 },
      { name: 'Akali', tier: 'S', pickRate: 30, winRate: 58 },
      { name: 'Seraphine', tier: 'S', pickRate: 25, winRate: 57 },
      { name: 'Twisted Fate', tier: 'A', pickRate: 15, winRate: 52 },
    ];
  }
}

export default new MockOpggService();
