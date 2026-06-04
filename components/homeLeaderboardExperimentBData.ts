import type { LeaderboardPeer } from './MyLearning';
import type { HomeLeaderboardBoard } from './homeLeaderboardSprint1Data';

/**
 * Experiment B only — Figma Leaderboards_Home Sprint 1, node 222:1854.
 * Weekly hours framing; board data by cohort id (UI uses default cohort in prototype).
 */
export type HomeLeaderboardBFilterId = 'careerswitchers' | 'coursera' | 'aipowered';

export const HOME_LEADERBOARD_B_FILTER_OPTIONS: { id: HomeLeaderboardBFilterId; label: string }[] = [
  { id: 'careerswitchers', label: '#careerswitchers · 428 ranked' },
  { id: 'coursera', label: '#coursera · 1,255 ranked' },
  { id: 'aipowered', label: '#AIpowered · 842 ranked' },
];

const BOARD_CAREERSWITCHERS: HomeLeaderboardBoard = {
  userRank: 18,
  cohortSize: 428,
  top3: [
    { rank: 1, letter: 'M', name: 'Moon Bear', hours: '15h', isLive: true },
    { rank: 2, letter: 'R', name: 'Round Robin', hours: '14.5h' },
    { rank: 3, letter: 'S', name: 'Spiral Seal', hours: '14h' },
  ],
  around: [
    { rank: 17, letter: 'V', name: 'Vortex Viper', hours: '7h' },
    { rank: 18, letter: 'P', name: 'Priya', hours: '6.5h' },
    { rank: 19, letter: 'Z', name: 'Zigzag Zebra', hours: '6h', isLive: true },
  ],
};

const BOARD_COURSERA: HomeLeaderboardBoard = {
  userRank: 15,
  cohortSize: 1255,
  top3: [
    { rank: 1, letter: 'M', name: 'Marble Marten', hours: '16h', isLive: true },
    { rank: 2, letter: 'J', name: 'Jagged Jay', hours: '15.5h' },
    { rank: 3, letter: 'P', name: 'Prism Penguin', hours: '15h' },
  ],
  around: [
    { rank: 14, letter: 'T', name: 'Triangle Tuna', hours: '9.5h' },
    { rank: 15, letter: 'P', name: 'Priya', hours: '9h' },
    { rank: 16, letter: 'A', name: 'Arc Angelfish', hours: '8.5h', isLive: true },
  ],
};

const BOARD_AIPOWERED: HomeLeaderboardBoard = {
  userRank: 6,
  cohortSize: 842,
  top3: [
    { rank: 1, letter: 'A', name: 'Angular Ape', hours: '19h', isLive: true },
    { rank: 2, letter: 'A', name: 'Acute Aardwolf', hours: '17.5h' },
    { rank: 3, letter: 'G', name: 'Grid Gecko', hours: '17h' },
  ],
  around: [
    { rank: 5, letter: 'Y', name: 'Yurt Yak', hours: '16h' },
    { rank: 6, letter: 'P', name: 'Priya', hours: '15h' },
    { rank: 7, letter: 'A', name: 'Arrow Armadillo', hours: '15h' },
  ],
};

export const HOME_LEADERBOARD_B_BOARDS: Record<HomeLeaderboardBFilterId, HomeLeaderboardBoard> = {
  careerswitchers: BOARD_CAREERSWITCHERS,
  coursera: BOARD_COURSERA,
  aipowered: BOARD_AIPOWERED,
};
