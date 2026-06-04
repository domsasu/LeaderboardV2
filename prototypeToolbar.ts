/** Global from `public/prototype-toolbar.js` (loaded in `index.html`). */
declare global {
  interface Window {
    PrototypeToolbar?: {
      init: (config: PrototypeToolbarInitConfig) => void;
      getExperiment: () => string;
      setExperiment: (id: string) => void;
    };
  }
}

/** Loose typing for the vanilla toolbar config (see upstream README). */
type PrototypeToolbarInitConfig = Record<string, unknown>;

/**
 * Mounts the Coursera prototype toolbar (idempotent). Call once after app handlers exist.
 * @see https://github.com/nella-droid/coursera-prototype-toolbar
 */
export function initCourseraPrototypeToolbar(handlers: {
  /** Marks m1-l1–m1-l5 complete so the home leaderboard (experiments B/C) shows the populated state. */
  onSimulateLeaderboardUnlocked: () => void;
}): void {
  const PT = window.PrototypeToolbar;
  if (!PT) {
    console.warn(
      '[prototype-toolbar] window.PrototypeToolbar missing — ensure /prototype-toolbar.js is in index.html'
    );
    return;
  }

  PT.init({
    home: { href: '/', label: 'Home' },
    experiments: [
      { id: 'a', label: 'Experiment A' },
      { id: 'b', label: 'Experiment B' },
      { id: 'c', label: 'Experiment C' },
    ],
    reloadOnExperimentChange: false,

    features: {
      a: {
        sections: [
          {
            title: 'Home hero & course preview',
            items: [
              { text: 'Hero band + background (baseline emphasis)', hl: '#proto-home-hero' },
              { text: 'Welcome + course title + progress row', hl: '#proto-home-welcome' },
              {
                text: '“Up next” card, coach summary, resume',
                hl: '#proto-home-up-next',
              },
            ],
          },
          {
            title: 'Motivation & discovery',
            items: [
              { text: 'Today’s goals widget', hl: '#proto-home-daily-goals' },
              { text: 'Streak strip (1 week streak)', hl: '#proto-home-streak' },
              { text: 'Leaderboard (Sprint 1: tabs, rank line, collapse, edit)', hl: '#proto-home-leaderboard' },
            ],
          },
        ],
      },
      b: {
        notice:
          'Home leaderboard uses `HomeLeaderboardExperimentB` (Figma 222:1854), not the A pill strip. The leaderboard card is hidden until learners complete m1-l1 through m1-l5.',
        sections: [
          {
            title: 'Visual treatment (B)',
            items: [
              {
                text: 'Hero + welcome + course preview',
                hl: '#proto-home-hero',
                children: [
                  { text: 'Welcome / progress block', hl: '#proto-home-welcome' },
                ],
              },
              {
                text: 'Today’s goals widget',
                hl: '#proto-home-daily-goals',
              },
              { text: 'Leaderboard: experiment B uses alternate layout (see `HomeLeaderboardExperimentB`)', hl: '#proto-home-leaderboard' },
            ],
          },
          {
            title: 'Leaderboard layout (B only — Figma 222:1854)',
            items: [
              {
                text: 'Leaderboard heading + two-column board (Top 3 / Around you)',
                hl: '#proto-home-leaderboard',
              },
            ],
          },
          {
            title: 'Shared with A',
            items: [
              { text: 'Up next + coach module', hl: '#proto-home-up-next' },
              { text: 'Streak widget', hl: '#proto-home-streak' },
            ],
          },
        ],
      },
      c: {
        notice:
          'Same home leaderboard layout as B (`HomeLeaderboardExperimentB`). Until m1-l1–m1-l5 are completed, the Top 3 / Around you grid is blurred with centered “Learn for 30 minutes…” title text; the Leaderboard heading stays visible.',
        sections: [
          {
            title: 'Visual treatment (C)',
            items: [
              {
                text: 'Hero + welcome + course preview',
                hl: '#proto-home-hero',
                children: [
                  { text: 'Welcome / progress block', hl: '#proto-home-welcome' },
                ],
              },
              {
                text: 'Today’s goals widget',
                hl: '#proto-home-daily-goals',
              },
              {
                text: 'Leaderboard: same B layout; grid blurred until first five module-1 lessons complete',
                hl: '#proto-home-leaderboard',
              },
            ],
          },
          {
            title: 'Leaderboard layout (C — B + blur gate)',
            items: [
              {
                text: 'Leaderboard heading (always visible when card is shown)',
                hl: '#proto-home-leaderboard',
              },
              {
                text: 'Blurred Top 3 / Around you + unlock message until complete',
                hl: '#proto-home-leaderboard',
              },
            ],
          },
          {
            title: 'Shared with A',
            items: [
              { text: 'Up next + coach module', hl: '#proto-home-up-next' },
              { text: 'Streak widget', hl: '#proto-home-streak' },
            ],
          },
        ],
      },
    },

    triggers: [
      {
        label: 'Leaderboard Unlocked',
        icon: 'leaderboard',
        onClick: () => {
          handlers.onSimulateLeaderboardUnlocked();
        },
      },
    ],
  } satisfies PrototypeToolbarInitConfig);
}
