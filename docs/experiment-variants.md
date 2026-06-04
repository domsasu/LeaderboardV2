# Prototype experiment variants (A / B / C / D)

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

   Use `variants={['a']}` for A-only, `variants={['b']}`, `variants={['b','c']}`, `variants={['d']}`, or `variants={['c','d']}` when you intentionally want the same block in those ids but **not** in others (explicit list).

3. **CSS-only differences**  
   You may scope rules in `index.css` under `body.proto-experiment-b { … }`, `body.proto-experiment-c { … }`, `body.proto-experiment-d { … }`, etc. Those rules do not apply to other variants. Do **not** put variant-specific Tailwind in shared components unless gated in JSX.

4. **Home leaderboard**  
   - **Experiment A:** `HomeLeaderboard` in `Home.tsx` — pill cohort tabs from `getHomeLeaderboardCohortTabs('a')` / board data in `homeLeaderboardSprint1Data.ts`.  
   - **Experiments B and C:** `HomeLeaderboardExperimentB.tsx` + `homeLeaderboardExperimentBData.ts` (Figma 222:1854 — two-column board; sprint-1 header with days-left pill, subtitle, **Edit cohorts**, and cohort `<select>` when **B** or **C unlocked**). **C locked** keeps only the **Leaderboard** title above the blurred grid with “Learn for 30 minutes to unlock”.  
   - **Experiment D:** `HomeLeaderboardExperimentD.tsx` — Figma **278:4639** promotion while locked (headline, weekly copy, **Resume learning**, animated media on the right). After unlock, D renders the same sprint-1 board as B/C via `HomeLeaderboardExperimentB` with `prototypeExperiment="d"`. **Do not** change A’s leaderboard when editing B/C/D; edit `Home.tsx` + the experiment component files.

5. **Home leaderboard unlock (B, C, and D)**  
   Unlock when **`m1-l1` through `m1-l5`** are all `Status.COMPLETED` in `courseData`. Logic lives in [`components/homeLeaderboardGate.ts`](components/homeLeaderboardGate.ts) (`areHomeLeaderboardUnlockLessonsComplete`, `isHomeLeaderboardExperimentBCard`, `isHomeLeaderboardBlurGateExperiment`, `usesWiderHomeLeaderboardCohortTabs`).  
   - **B:** until unlocked, the home leaderboard region renders **nothing** (empty `#proto-home-leaderboard`).  
   - **C:** until unlocked, only the **Leaderboard** heading is shown in the header (no days-left pill, subtitle, or cohort controls); the **Top 3 / Around you** grid is **blurred** with centered title-style copy: “Learn for 30 minutes to unlock” (no full-area dim scrim or message panel fill). After unlock, C matches B (full header + board).  
   - **D:** shows the **promotion** layout until unlock; after unlock, same board as B/C. Toolbar **Leaderboard Unlocked** still marks the five lessons complete for demos.

6. **Other home JSX**  
   Use `ExperimentGate` or `body.proto-experiment-*` CSS as in rules 2–3.

## Cohort tabs (`getHomeLeaderboardCohortTabs`)

`HOME_LEADERBOARD_COHORT_TABS_B` is returned for **`b`, `c`, and `d`** (wider pill set than A). It is used when validating `selectedHomeLeaderboardCohort` on experiment switch. The **B** and **unlocked C/D** leaderboard uses cohort `<select>` options from `homeLeaderboardExperimentBData.ts`, not these pills.

## Intentionally promoting a change to all variants

Remove the `ExperimentGate` wrapper (or widen `variants`), move shared styles out of `body.proto-experiment-*` blocks, merge cohort tab lists for A, **or** port the same markup from `HomeLeaderboardExperimentB` into `HomeLeaderboard` so all experiments use one component.
