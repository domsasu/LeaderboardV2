/** Global from `public/prototype-toolbar.js` (loaded in `index.html`). */
declare global {
  interface Window {
    PrototypeToolbar?: {
      init: (config: PrototypeToolbarInitConfig) => void;
      getExperiment: () => string;
      setExperiment: (id: string) => void;
      /** Re-fetch `public/design-comments.json` after file edits (same-origin GET). */
      reloadDesignComments?: () => void;
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
  /** Marks m1-l1–m1-l5 complete so the home leaderboard (experiments B/C/D) shows the populated state. */
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
      { id: 'd', label: 'Experiment D' },
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
      d: {
        notice:
          'Home leaderboard slot uses `HomeLeaderboardExperimentD`: Figma 278:4639 promotion (headline + weekly copy + Resume learning) with an Around you mini-board preview on the right until m1-l1–m1-l5 unlock; then the same sprint-1 board as B/C.',
        sections: [
          {
            title: 'Visual treatment (D — leaderboard promo)',
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
                text: 'Leaderboard: promo band + Around you preview (see `HomeLeaderboardExperimentD`)',
                hl: '#proto-home-leaderboard',
              },
            ],
          },
          {
            title: 'Leaderboard layout (D — promo until unlock)',
            items: [
              {
                text: 'Two-column promo: copy + gradient headline + Resume learning; right column Around you preview (same rows as B/C #careerswitchers)',
                hl: '#proto-home-leaderboard',
              },
              {
                text: 'After unlock: same Top 3 / Around you board as B/C',
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
