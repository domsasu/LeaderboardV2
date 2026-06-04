import React, { useState } from 'react';
import { MiniLeaderboardRow } from './MyLearning';
import {
  HOME_LEADERBOARD_B_BOARDS,
  HOME_LEADERBOARD_B_FILTER_OPTIONS,
  type HomeLeaderboardBFilterId,
} from './homeLeaderboardExperimentBData';

/**
 * Home leaderboard — Experiments B and C (Figma 222:1854 layout).
 * Experiment A uses `HomeLeaderboard` instead.
 *
 * - **B:** entire card hidden until `m1-l1`–`m1-l5` are completed (`leaderboardUnlocked`).
 * - **C:** same card; header + cohort controls always shown; Top 3 / Around you grid is blurred with
 *   overlay copy until unlocked; when unlocked, matches B.
 */
export function HomeLeaderboardExperimentB({
  experimentId,
  leaderboardUnlocked,
}: {
  experimentId: string;
  leaderboardUnlocked: boolean;
}) {
  const [filterId, setFilterId] = useState<HomeLeaderboardBFilterId>('careerswitchers');
  const board = HOME_LEADERBOARD_B_BOARDS[filterId];

  if (experimentId === 'b' && !leaderboardUnlocked) {
    return null;
  }

  const cohortSelectId = `proto-home-lb-${experimentId}-cohort`;
  const showBlurGrid = experimentId === 'c' && !leaderboardUnlocked;

  const leaderboardGrid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] p-5">
        <p className="cds-body-tertiary mb-1.5 text-[var(--cds-color-grey-600)]">Top 3</p>
        <div className="space-y-1">
          {board.top3.map((p) => (
            <MiniLeaderboardRow
              key={`b-top-${filterId}-${p.rank}`}
              peer={p}
              isUser={p.rank === board.userRank}
              isMedal
            />
          ))}
        </div>
      </div>

      <div className="rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] p-5">
        <p className="cds-body-tertiary mb-1.5 text-[var(--cds-color-grey-600)]">Around you</p>
        <div className="space-y-1">
          {board.around.map((p) => (
            <MiniLeaderboardRow
              key={`b-around-${filterId}-${p.rank}`}
              peer={p}
              isUser={p.rank === board.userRank}
              isMedal={false}
              showYouSuffix
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-[var(--cds-border-radius-200)] bg-[var(--cds-color-white)] p-4 sm:p-5"
      data-prototype-experiment={experimentId}
    >
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="cds-subtitle-lg text-[var(--cds-color-grey-975)]">Leaderboard</h2>
          <span
            className="shrink-0 rounded-full border border-[var(--cds-color-yellow-300)] bg-[var(--cds-color-yellow-50)] px-2.5 py-0.5 cds-body-tertiary text-[var(--cds-color-yellow-900)]"
            title="Time remaining in this board period"
          >
            7 days left
          </span>
        </div>

        <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:pb-3">
          <p className="cds-body-secondary min-w-0 flex-1 text-[var(--cds-color-grey-600)] sm:max-w-3xl">
            2 weeks of learning hours compiled into a board. Track your learning hours alongside others!
          </p>

          <div className="flex w-full shrink-0 flex-col flex-nowrap items-stretch gap-2 sm:w-auto sm:min-w-0 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              className="cds-action-secondary order-2 inline-flex shrink-0 whitespace-nowrap text-left text-[var(--cds-color-blue-700)] hover:underline sm:order-1 sm:text-right"
            >
              Edit cohorts
            </button>
            <label className="sr-only" htmlFor={cohortSelectId}>
              Cohort leaderboard
            </label>
            <select
              id={cohortSelectId}
              value={filterId}
              onChange={(e) => setFilterId(e.target.value as HomeLeaderboardBFilterId)}
              className="order-1 min-w-0 w-full max-w-full cursor-pointer appearance-none rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-400)] bg-[var(--cds-color-white)] px-3 py-2.5 pr-9 cds-body-secondary text-[var(--cds-color-grey-975)] cds-focus-ring sm:order-2 sm:w-[min(100%,280px)] sm:min-w-[200px] sm:max-w-[min(100%,320px)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              {HOME_LEADERBOARD_B_FILTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showBlurGrid ? (
        <div className="relative min-h-[188px] rounded-[var(--cds-border-radius-100)]">
          <div aria-hidden className="pointer-events-none select-none blur-sm sm:blur-[4px]">
            {leaderboardGrid}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--cds-color-utility-overlay)_45%,var(--cds-color-white)_55%)] px-4 py-6"
            role="status"
            aria-live="polite"
          >
            <p className="cds-body-primary max-w-md text-center text-[var(--cds-color-grey-975)]">
              Learn for 30 minutes to unlock leaderboards
            </p>
          </div>
        </div>
      ) : (
        leaderboardGrid
      )}
    </div>
  );
}
