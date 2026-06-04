import type { LeaderboardPeer } from './MyLearning';
import { usesWiderHomeLeaderboardCohortTabs } from './homeLeaderboardGate';

/**
 * Home leaderboard — Sprint 1 (Figma: Leaderboards_Home, node 218:3486).
 *
 * **Prototype experiments:** cohort *tabs* differ by toolbar variant so edits for one
 * experiment do not remove tabs in the other unless you change both lists below.
 * - **Experiment A** (`experimentId === 'a'`): trimmed tab strip (e.g. no #Thoughtful skeptics).
 * - **Experiment B** (`experimentId === 'b'`): home leaderboard UI is `HomeLeaderboardExperimentB`
 *   (Figma 222:1854 — sprint-1 header + two-column board, not the pill strip). The pill list `HOME_LEADERBOARD_COHORT_TABS_B`
 *   is only used for session/cohort id validation when switching A ↔ B/C/D; the B/C/D card uses `homeLeaderboardExperimentBData` cohort options instead.
 * - **Experiment C** (`experimentId === 'c'`): same B layout with blurred leaderboard grid until unlock (see docs).
 * - **Experiment D** (`experimentId === 'd'`): home leaderboard slot is `HomeLeaderboardExperimentD` until unlock, then the same board as B/C (`HomeLeaderboardExperimentB`).
 *
 * Board data for every cohort id lives in `HOME_LEADERBOARD_BOARDS`; only tabs shown
 * per experiment are filtered by `getHomeLeaderboardCohortTabs`.
 */
export type HomeLeaderboardCohortId =
  | 'ai_newbies'
  | 'lifelong_learners'
  | 'team_coursera'
  | 'thoughtful_skeptics';

export type HomeLeaderboardCohortTab = {
  id: HomeLeaderboardCohortId;
  label: string;
  count: number;
};

/** Cohort pills shown only in experiment A (edit this list for A-only changes). */
const HOME_LEADERBOARD_COHORT_TABS_A: HomeLeaderboardCohortTab[] = [
  { id: 'ai_newbies', label: '#AI newbies', count: 15 },
  { id: 'lifelong_learners', label: '#Lifelong learners', count: 13 },
  { id: 'team_coursera', label: '#Team Coursera', count: 20 },
];

/** Cohort pills shown only in experiment B — full Sprint 1 set including skeptics. */
const HOME_LEADERBOARD_COHORT_TABS_B: HomeLeaderboardCohortTab[] = [
  ...HOME_LEADERBOARD_COHORT_TABS_A,
  { id: 'thoughtful_skeptics', label: '#Thoughtful skeptics', count: 3 },
];

/**
 * Cohort filter buttons for the home leaderboard for the active prototype experiment.
 * Anything not returned here is hidden for that variant (but board data may still exist).
 */
export function getHomeLeaderboardCohortTabs(experimentId: string): HomeLeaderboardCohortTab[] {
  return usesWiderHomeLeaderboardCohortTabs(experimentId)
    ? HOME_LEADERBOARD_COHORT_TABS_B
    : HOME_LEADERBOARD_COHORT_TABS_A;
}

export type HomeLeaderboardBoard = {
  top3: LeaderboardPeer[];
  around: LeaderboardPeer[];
  userRank: number;
  cohortSize: number;
};

export const HOME_LEADERBOARD_BOARDS: Record<HomeLeaderboardCohortId, HomeLeaderboardBoard> = {
  ai_newbies: {
    userRank: 15,
    cohortSize: 16,
    top3: [
      { rank: 1, letter: 'R', name: 'Rectangular Penguin', hours: '16m', isLive: true },
      { rank: 2, letter: 'M', name: 'Milky Eagle', hours: '7m' },
      { rank: 3, letter: 'W', name: 'Wide Tiger', hours: '0m' },
    ],
    around: [
      { rank: 14, letter: 'I', name: 'Important Fox', hours: '0m' },
      { rank: 15, letter: 'L', name: 'Lively Sea Lion', hours: '0m' },
      { rank: 16, letter: 'D', name: 'Dark Squirrel', hours: '0m' },
    ],
  },
  lifelong_learners: {
    userRank: 8,
    cohortSize: 13,
    top3: [
      { rank: 1, letter: 'N', name: 'Nimble Otter', hours: '42m', isLive: true },
      { rank: 2, letter: 'C', name: 'Calm Heron', hours: '38m' },
      { rank: 3, letter: 'B', name: 'Bright Finch', hours: '31m' },
    ],
    around: [
      { rank: 6, letter: 'K', name: 'Keen Badger', hours: '12m' },
      { rank: 7, letter: 'S', name: 'Swift Lark', hours: '9m' },
      { rank: 8, letter: 'P', name: 'Priya', hours: '8m' },
    ],
  },
  team_coursera: {
    userRank: 12,
    cohortSize: 20,
    top3: [
      { rank: 1, letter: 'G', name: 'Global Owl', hours: '2h', isLive: true },
      { rank: 2, letter: 'S', name: 'Steady Bison', hours: '1.5h' },
      { rank: 3, letter: 'R', name: 'Rapid Hare', hours: '1h' },
    ],
    around: [
      { rank: 10, letter: 'T', name: 'Team Walrus', hours: '45m' },
      { rank: 11, letter: 'C', name: 'Curious Lemur', hours: '40m' },
      { rank: 12, letter: 'P', name: 'Priya', hours: '36m' },
    ],
  },
  thoughtful_skeptics: {
    userRank: 2,
    cohortSize: 3,
    top3: [
      { rank: 1, letter: 'Q', name: 'Quiet Raven', hours: '22m', isLive: true },
      { rank: 2, letter: 'P', name: 'Priya', hours: '18m' },
      { rank: 3, letter: 'S', name: 'Sharp Lynx', hours: '12m' },
    ],
    around: [
      { rank: 1, letter: 'Q', name: 'Quiet Raven', hours: '22m' },
      { rank: 2, letter: 'P', name: 'Priya', hours: '18m' },
      { rank: 3, letter: 'S', name: 'Sharp Lynx', hours: '12m' },
    ],
  },
};
