import { UserCareerStats } from '../engine/Types';

const STATS_KEY = 'ludo_career_stats_v1';

export class StatsManager {
  private stats: UserCareerStats;

  constructor() {
    this.stats = this.loadStats();
  }

  public getStats(): Readonly<UserCareerStats> {
    return this.stats;
  }

  public recordMatchCompletion(won: boolean, captures: number, homeTokens: number, sixes: number): void {
    this.stats.matchesPlayed += 1;
    if (won) {
      this.stats.matchesWon += 1;
      this.stats.winStreak += 1;
      if (this.stats.winStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.winStreak;
      }
    } else {
      this.stats.winStreak = 0;
    }

    this.stats.tokensCaptured += captures;
    this.stats.tokensHome += homeTokens;
    this.stats.sixesRolled += sixes;
    this.stats.lastPlayedTimestamp = Date.now();

    this.saveStats();
  }

  public getWinRatePercentage(): number {
    if (this.stats.matchesPlayed === 0) return 0;
    return Math.round((this.stats.matchesWon / this.stats.matchesPlayed) * 100);
  }

  private loadStats(): UserCareerStats {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STATS_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // Fallback
    }

    return {
      matchesPlayed: 12,
      matchesWon: 8,
      tokensCaptured: 34,
      tokensHome: 38,
      sixesRolled: 52,
      winStreak: 3,
      bestStreak: 5,
      lastPlayedTimestamp: Date.now(),
    };
  }

  private saveStats(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
      }
    } catch {
      // Ignore in private browsing
    }
  }
}
