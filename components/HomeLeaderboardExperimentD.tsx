import React from 'react';
import { HomeLeaderboardExperimentB } from './HomeLeaderboardExperimentB';

const PROMO_MEDIA_SRC = `${import.meta.env.BASE_URL}leaderboard-promo-experiment-d.png`;

/**
 * Experiment **D** — home leaderboard promotion (Figma Leaderboards_Home Sprint 1, node 278:4639).
 * Locked: two-column promo (copy + animated media). Unlocked: same sprint-1 board as B/C via {@link HomeLeaderboardExperimentB}.
 */
export function HomeLeaderboardExperimentD({
  leaderboardUnlocked,
  onResumeLearning,
}: {
  leaderboardUnlocked: boolean;
  onResumeLearning: () => void;
}) {
  if (leaderboardUnlocked) {
    return (
      <HomeLeaderboardExperimentB
        experimentId="c"
        leaderboardUnlocked
        prototypeExperiment="d"
      />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[var(--cds-border-radius-200)] bg-[var(--cds-color-white)] shadow-[var(--cds-elevation-level1)]"
      data-prototype-experiment="d"
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-6 py-8 sm:px-8 lg:max-w-[min(100%,480px)] lg:py-10">
          <div className="flex flex-col gap-1">
            <p className="cds-title-xs text-[var(--cds-color-grey-975)]">
              Get to your career goals by
            </p>
            <p className="cds-title-xs bg-gradient-to-r from-[var(--cds-color-yellow-600)] to-[var(--cds-color-yellow-200)] bg-clip-text text-transparent">
              making learning a daily routine
            </p>
          </div>
          <p className="cds-body-tertiary max-w-md text-[var(--cds-color-grey-600)]">
            Your weekly learning hours compiled into a board. Track your time along others!
          </p>
          <div>
            <button
              type="button"
              onClick={onResumeLearning}
              className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-400)] bg-[var(--cds-color-white)] px-4 py-2.5 cds-action-secondary text-[var(--cds-color-grey-975)] shadow-none transition-colors hover:border-[var(--cds-color-blue-800)] hover:bg-[var(--cds-color-blue-25)] cds-focus-ring"
            >
              Resume learning
            </button>
          </div>
        </div>

        <div className="relative min-h-[220px] w-full shrink-0 overflow-hidden bg-[var(--cds-color-grey-25)] lg:min-h-[300px] lg:flex-1">
          <img
            src={PROMO_MEDIA_SRC}
            alt=""
            className="home-lb-d-promo-img absolute inset-0 h-full w-full object-cover object-center"
            width={1354}
            height={728}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
