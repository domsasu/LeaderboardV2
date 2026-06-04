import React, { useState } from 'react';
import { MiniLeaderboardRow } from './MyLearning';
import { isHomeLeaderboardBlurGateExperiment } from './homeLeaderboardGate';
import {
  HOME_LEADERBOARD_B_BOARDS,
  HOME_LEADERBOARD_B_FILTER_OPTIONS,
  type HomeLeaderboardBFilterId,
} from './homeLeaderboardExperimentBData';

/**
 * Home leaderboard — Experiments B and C (Figma 222:1854 layout).
 * Experiment A uses `HomeLeaderboard` instead; experiment **D** uses `HomeLeaderboardExperimentD`.
 *
 * - **B:** entire card hidden until `m1-l1`–`m1-l5` are completed (`leaderboardUnlocked`). When visible,
 *   shows full sprint-1 header (days left, subtitle, cohort select, Edit cohorts).
 * - **C:** same card always visible; **locked** state shows a simplified title + blurred grid + unlock copy.
 *   **Unlocked** matches B (full header + board).
 */
export function HomeLeaderboardExperimentB({
  experimentId,
  leaderboardUnlocked,
  /** When set, overrides `data-prototype-experiment` (e.g. D unlocked renders C logic but keeps `d` in QA). */
  prototypeExperiment,
}: {
  experimentId: string;
  leaderboardUnlocked: boolean;
  prototypeExperiment?: string;
}) {
  const [filterId, setFilterId] = useState<HomeLeaderboardBFilterId>('careerswitchers');
  const board = HOME_LEADERBOARD_B_BOARDS[filterId];

  if (experimentId === 'b' && !leaderboardUnlocked) {
    return null;
  }

  const isBlurGateVariant = isHomeLeaderboardBlurGateExperiment(experimentId);
  const showBlurGrid = isBlurGateVariant && !leaderboardUnlocked;
  const showFullHeaderChrome =
    experimentId === 'b' || (isBlurGateVariant && leaderboardUnlocked);

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
      data-prototype-experiment={prototypeExperiment ?? experimentId}
    >
      {showFullHeaderChrome ? (
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="cds-subtitle-lg text-[var(--cds-color-grey-975)]">Leaderboard</h2>
              <span
                className="inline-flex items-center rounded-[var(--cds-border-radius-400)] bg-[var(--cds-color-yellow-100)] px-2.5 py-0.5 cds-body-tertiary text-[var(--cds-color-yellow-700)]"
                aria-label="Time remaining in this leaderboard period"
              >
                6 days left
              </span>
            </div>
            <p className="cds-body-secondary mt-2 max-w-2xl text-[var(--cds-color-grey-600)]">
              Your weekly learning hours compiled into a board. Track your time along others!
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:ml-auto sm:justify-end lg:w-auto">
            <button
              type="button"
              className="cds-action-secondary border-0 bg-transparent p-0 text-[var(--cds-color-blue-700)] hover:underline"
            >
              Edit cohorts
            </button>
            <label className="sr-only" htmlFor="home-leaderboard-b-cohort-select">
              Cohort
            </label>
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[240px] sm:max-w-[min(100%,360px)]">
              <select
                id="home-leaderboard-b-cohort-select"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value as HomeLeaderboardBFilterId)}
                className="w-full cursor-pointer appearance-none rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-400)] bg-[var(--cds-color-white)] py-2.5 pl-3 pr-10 cds-body-primary text-[var(--cds-color-grey-975)] cds-focus-ring hover:border-[var(--cds-color-blue-800)] hover:bg-[var(--cds-color-blue-25)]"
              >
                {HOME_LEADERBOARD_B_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center"
                aria-hidden
              >
                <span
                  className="material-symbols-rounded flex leading-none text-[var(--cds-color-grey-600)]"
                  style={{ fontSize: 20 }}
                >
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="cds-subtitle-lg mb-4 text-[var(--cds-color-grey-975)]">Leaderboard</h2>
      )}

      {showBlurGrid ? (
        <div className="relative min-h-[188px] rounded-[var(--cds-border-radius-100)]">
          <div aria-hidden className="pointer-events-none select-none blur-sm sm:blur-[4px]">
            {leaderboardGrid}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center px-4 py-6"
            role="status"
            aria-live="polite"
          >
            <p className="cds-title-xs max-w-lg px-6 py-5 text-center text-[var(--cds-color-grey-975)] drop-shadow-sm">
              Learn for 30 minutes to unlock
            </p>
          </div>
        </div>
      ) : (
        leaderboardGrid
      )}
    </div>
  );
}
