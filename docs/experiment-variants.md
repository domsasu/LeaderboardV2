# Prototype experiment variants (A / B / C)

The [Coursera prototype toolbar](https://github.com/nella-droid/coursera-prototype-toolbar) sets `body.proto-experiment-<id>` and `sessionStorage['proto-experiment']`. React stays in sync via `usePrototypeExperiment()` in `App.tsx`.

## Rules

1. **Shared design (all variants)**  
   Put markup and classes in the normal tree with **no** `ExperimentGate`. Everyone sees it.

2. **Design for one variant only**  
   Wrap that UI in:

   ```tsx
   <ExperimentGate experimentId={experimentId} variants={['b']}>
     …
   </ExperimentGate>
   ```

   Use `variants={['a']}` for A-only, `variants={['b']}` or `variants={['b','c']}` when you intentionally want the same block in both B and C but **not** in A or other ids (explicit list).

3. **CSS-only differences**  
   You may scope rules in `index.css` under `body.proto-experiment-b { … }` or `body.proto-experiment-c { … }` (etc.). Those rules do not apply to other variants. Do **not** put variant-specific Tailwind in shared components unless gated in JSX.

4. **Home leaderboard**  
   - **Experiment A:** `HomeLeaderboard` in `Home.tsx` — pill cohort tabs from `getHomeLeaderboardCohortTabs('a')` / board data in `homeLeaderboardSprint1Data.ts`.  
   - **Experiments B and C:** `HomeLeaderboardExperimentB.tsx` + `homeLeaderboardExperimentBData.ts` (Figma 222:1854 — two-column board; sprint-1 header with days-left pill, subtitle, **Edit cohorts**, and cohort `<select>` when **B** or **C unlocked**). **C locked** keeps only the **Leaderboard** title above the blurred grid (pre-populated demo). **Do not** change A’s leaderboard when editing B/C; edit the `*ExperimentB*` files (or the `experimentId === 'b' || experimentId === 'c'` branch in `Home.tsx`).

5. **Home leaderboard unlock (B and C)**  
   Unlock when **`m1-l1` through `m1-l5`** are all `Status.COMPLETED` in `courseData`. Logic lives in [`components/homeLeaderboardGate.ts`](components/homeLeaderboardGate.ts) (`areHomeLeaderboardUnlockLessonsComplete`).  
   - **B:** until unlocked, the home leaderboard region renders **nothing** (empty `#proto-home-leaderboard`).  
   - **C:** until unlocked, only the **Leaderboard** heading is shown in the header (no days-left pill, subtitle, or cohort controls); the **Top 3 / Around you** grid is **blurred** with centered title-style copy: “Learn for 30 minutes to unlock” (no full-area dim scrim or message panel fill). After unlock, C matches B (full header + board).

6. **Other home JSX**  
   Use `ExperimentGate` or `body.proto-experiment-*` CSS as in rules 2–3.

## Cohort tabs (`getHomeLeaderboardCohortTabs`)

`HOME_LEADERBOARD_COHORT_TABS_B` is returned for **`b` and `c`** (wider pill set than A). It is used when validating `selectedHomeLeaderboardCohort` on experiment switch; the B/C home leaderboard card uses its own cohort `<select>` options from `homeLeaderboardExperimentBData.ts`, not these pills.

## Intentionally promoting a change to all variants

Remove the `ExperimentGate` wrapper (or widen `variants`), move shared styles out of `body.proto-experiment-*` blocks, merge cohort tab lists for A, **or** port the same markup from `HomeLeaderboardExperimentB` into `HomeLeaderboard` so all experiments use one component.
