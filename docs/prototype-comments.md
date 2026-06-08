# Prototype toolbar — design comments

Design feedback is stored in [`public/design-comments.json`](../public/design-comments.json). The **prototype toolbar** (bottom-left) includes a **Comments** control that opens a panel: browse comments, jump to the referenced DOM node, use **Add comment** to pick a target on the page, and **Update** to copy an agent-ready prompt for committing.

Browsers **cannot** write into your git repo. Durable adds/edits/resolves happen by **editing the JSON file in Cursor** (you or the agent) and committing.

## JSON schema

`design-comments.json` is a **JSON array** of objects:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Stable unique id (UUID recommended). |
| `author` | string | no | Display name for the thread. |
| `title` | string | no | Short headline (e.g. `#28 • Leaderboard`). |
| `body` | string | yes | Comment text. |
| `selector` | string | yes | CSS selector pointing at the DOM node (same idea as feature `hl` in `prototypeToolbar.ts`). Prefer stable `#id` or `[data-*]` hooks. |
| `createdAt` | string | yes | ISO-8601 timestamp. |
| `resolved` | boolean | no | If `true`, hidden from the default list after reload. Default `false`. |
| `experimentId` | string | no | If set, comment can be filtered to the current toolbar experiment (`a`–`d`). |

### Example entry

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "author": "Alex",
  "title": "#12 • Home leaderboard",
  "body": "Preview needs more vertical rhythm above the promo band.",
  "selector": "#proto-home-leaderboard",
  "createdAt": "2026-06-08T12:00:00.000Z",
  "resolved": false,
  "experimentId": "d"
}
```

## Toolbar behavior

- **Collapse** — far-left control (`unfold_less` / `unfold_more`): hides Home, experiment, features, triggers, and comments into one button. State is stored in `sessionStorage` (`proto-toolbar-collapsed`). Collapsing closes open flyouts, the features overlay, and the comments panel.
- **Comments** opens a **right-hand panel** (scrollable list, search, actions).
- **Click a row** — switches to the app screen that contains the target when known (e.g. selectors under `#proto-home-*` open **Home**), then highlights with `proto-feature-hl` and scrolls. If the stored path no longer matches, the toolbar retries the **first `#id`** in the selector when possible.
- **Hover a row** — while the pointer is over a comment, the referenced node(s) get the same **blue hover ring** as Add-comment picking (`proto-design-hover-hl`) when they exist in the current DOM; leaving the row removes it.
- **Add comment** — when on, moving the pointer over the page shows a **blue hover ring** (`proto-design-hover-hl`, Cursor-like) on the element under the cursor. The next click **outside** the toolbar/panel records a target, clears the hover ring, and opens the comment dialog. Click the dim backdrop outside the dialog or press **Escape** to close without saving.
- **Mark complete** — hides the row for this browser session (stored in `sessionStorage` under `proto-comments-dismissed`). Until you set `"resolved": true` in the file and commit, other sessions or a hard reload will show it again.
- **Update** — copies one block to the clipboard: a short instruction for the agent plus a fenced `json` array. The array is the same merge as before: last loaded server file + `resolved: true` for session **Done** ids + any **queued** design-mode comments (sorted by `createdAt`). Paste into Cursor’s agent chat and send so the agent can replace `public/design-comments.json` and commit (push only if you ask).

## Agent workflow (Cursor)

1. User turns on **Add comment**, clicks the UI element, enters optional author + comment, taps the **up arrow** to queue (or uses **Update** in the panel to copy the full merged JSON for the agent).
2. When ready to sync the repo, click **Update** in the comments panel — paste the clipboard into the agent and send (the prompt asks to replace the file and commit).
3. For a single ad-hoc JSON object, you can still paste into chat and ask the agent to merge into `public/design-comments.json`.
4. To resolve durably without the full snapshot: set `"resolved": true` on the object (or remove it) and commit.

Optional: enable the scoped Cursor rule [`.cursor/rules/prototype-design-comments.mdc`](../.cursor/rules/prototype-design-comments.mdc) when editing `public/design-comments.json`, or reference this doc when the user says “prototype comment.”

## Collaboration / merge conflicts

Treat `design-comments.json` like any shared file: **pull before edit**, commit soon. If two people edit the same region, Git may conflict—same mitigations as for other JSON configs.

## Selector stability

Avoid selectors that depend on generated class names from build tools. Prefer:

- `id` attributes already used for prototype QA (e.g. `#proto-home-leaderboard`).
- `data-*` attributes you add for anchoring.
