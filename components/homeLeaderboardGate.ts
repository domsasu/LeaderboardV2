import { type CourseData, Status } from '../types';

/** First five module-1 lessons — home leaderboard (B/C/D unlock) when all are completed. */
export const HOME_LEADERBOARD_UNLOCK_LESSON_IDS = [
  'm1-l1',
  'm1-l2',
  'm1-l3',
  'm1-l4',
  'm1-l5',
] as const;

/**
 * Toolbar experiment ids that render `HomeLeaderboardExperimentB` (not the A pill leaderboard).
 * Experiment **D** uses `HomeLeaderboardExperimentD` when locked; use `usesWiderHomeLeaderboardCohortTabs`
 * for cohort tab validation when **d** is active.
 */
export function isHomeLeaderboardExperimentBCard(experimentId: string): boolean {
  return experimentId === 'b' || experimentId === 'c';
}

/**
 * Experiments that use the wider cohort tab list for `selectedHomeLeaderboardCohort` validation (B/C/D prototypes).
 */
export function usesWiderHomeLeaderboardCohortTabs(experimentId: string): boolean {
  return experimentId === 'b' || experimentId === 'c' || experimentId === 'd';
}

/**
 * Experiments that always show the leaderboard card and blur the grid until unlock (same behavior as C).
 */
export function isHomeLeaderboardBlurGateExperiment(experimentId: string): boolean {
  return experimentId === 'c';
}

/**
 * True when every unlock lesson exists in the course and is `Status.COMPLETED`.
 * Used for experiments B, C, and D on the home leaderboard.
 */
export function areHomeLeaderboardUnlockLessonsComplete(courseData: CourseData): boolean {
  const byId = new Map(
    courseData.modules.flatMap((m) => m.lessons).map((l) => [l.id, l])
  );
  return HOME_LEADERBOARD_UNLOCK_LESSON_IDS.every((id) => {
    const lesson = byId.get(id);
    return lesson != null && lesson.status === Status.COMPLETED;
  });
}
