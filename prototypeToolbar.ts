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
  /** Opens {@link import('./components/ModuleCompletionModal')} with demo completion data. */
  onSimulateModuleComplete: () => void;
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
          {
            title: 'Evaluator',
            items: [
              {
                text: 'Simulate module complete → opens completion modal (demo data)',
                action: 'openModuleCompleteDemo',
              },
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
                text: '7-day badge, 2-week hours subtitle, Edit cohorts + cohort dropdown',
                hl: '#proto-home-leaderboard',
              },
              { text: 'Cohort filter dropdown', hl: '#proto-home-lb-b-cohort' },
            ],
          },
          {
            title: 'Shared with A',
            items: [
              { text: 'Up next + coach module', hl: '#proto-home-up-next' },
              { text: 'Streak widget', hl: '#proto-home-streak' },
              {
                text: 'Simulate module complete (same trigger as bolt menu)',
                action: 'openModuleCompleteDemo',
              },
            ],
          },
        ],
      },
      c: {
        notice:
          'Same home leaderboard layout as B (`HomeLeaderboardExperimentB`). Until m1-l1–m1-l5 are completed, the Top 3 / Around you grid is blurred with a “Learn for 30 minutes…” overlay; header and cohort controls stay visible.',
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
                text: '7-day badge, 2-week hours subtitle, Edit cohorts + cohort dropdown (always visible)',
                hl: '#proto-home-leaderboard',
              },
              { text: 'Cohort filter dropdown', hl: '#proto-home-lb-c-cohort' },
              {
                text: 'Blurred Top 3 / Around you + overlay until unlock',
                hl: '#proto-home-leaderboard',
              },
            ],
          },
          {
            title: 'Shared with A',
            items: [
              { text: 'Up next + coach module', hl: '#proto-home-up-next' },
              { text: 'Streak widget', hl: '#proto-home-streak' },
              {
                text: 'Simulate module complete (same trigger as bolt menu)',
                action: 'openModuleCompleteDemo',
              },
            ],
          },
        ],
      },
    },

    actions: {
      openModuleCompleteDemo: () => {
        handlers.onSimulateModuleComplete();
        return true;
      },
    },

    triggers: [
      {
        label: 'Simulate module complete',
        icon: 'workspace_premium',
        onClick: () => {
          handlers.onSimulateModuleComplete();
        },
      },
    ],
  } satisfies PrototypeToolbarInitConfig);
}
