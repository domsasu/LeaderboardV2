import { type CourseData, Status } from '../types';

/** First five module-1 lessons — home leaderboard (B/C) unlocks when all are completed. */
export const HOME_LEADERBOARD_UNLOCK_LESSON_IDS = [
  'm1-l1',
  'm1-l2',
  'm1-l3',
  'm1-l4',
  'm1-l5',
] as const;

/**
 * True when every unlock lesson exists in the course and is `Status.COMPLETED`.
 * Used for experiments B and C on the home leaderboard.
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
