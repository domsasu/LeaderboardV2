<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/161PQcgIc24BwVXMWnOArxoNPf2Jooxgq

**Live demo (Vercel):** [Update with your Vercel deployment URL]

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Prototype toolbar (experiments A / B / C)

This repo includes [Coursera Prototype Toolbar](https://github.com/nella-droid/coursera-prototype-toolbar) (`public/prototype-toolbar.js` + `.css`, wired in `index.html`). Configuration lives in `prototypeToolbar.ts`; `App.tsx` wires the **Leaderboard Unlocked** trigger (marks m1-l1–m1-l5 complete for home leaderboard demos). Switch **Experiment B** or **Experiment C** on the home page for alternate leaderboard layouts and styling (`index.css`, `body.proto-experiment-b` / `body.proto-experiment-c`).

**Variant-specific UI:** use `ExperimentGate` + `experimentId` so a change for one experiment does not show in the other unless you promote it to shared markup. See [docs/experiment-variants.md](docs/experiment-variants.md).
