# Frame Story — agent notes

A real Hanzo app: long-scroll **visual photo essays**. Editors sequence
full-bleed image blocks and text passages; readers fall through them as a
cinematic vertical scroll. Built on the canonical Hanzo stack —
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Forked from `hanzo-apps/hanzo-starter`; the provider stack, `vite.config`, auth
and deploy contract are unchanged from it. Keep every surface REAL — it must
build and run, no fabricated UI.

## The app (three views)

- **Index** (`src/views/stories.tsx`) — poster tiles of every published essay in
  your org. Click a poster to read it.
- **Reader** (`src/views/story.tsx`) — the cinematic scroll: a title card, then
  the ordered beats (full-bleed image / centred text passage) with slow rhythm
  and near-zero chrome, then an end card.
- **Builder** (`src/views/builder.tsx`) — pick or create an essay, edit its
  cover/byline, add & reorder image/text beats, publish. "Load the sample essay"
  seeds a complete, publishable piece from the bundled frames.

`src/views/studio.tsx` is the signed-in shell (tiny route state, no router).
`src/views/landing.tsx` is the signed-out title card. `src/views/ui.tsx` holds
the shared primitives (`Caps`, `FullBleed`, the `Solid`/`Ghost`/`Plain` buttons,
`Field`). `src/lib/model.ts` is the data model + the bundled SVG frames.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `VITE_IAM_CLIENT_ID` (fallback `hanzo-app`); per-app clients
  are provisioned at deploy.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). The bundled cinematic frames are self-contained SVG, so nothing
  depends on the network to render.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND**: `alignItems`/`justifyContent`/
  `backgroundColor`/`padding`/`alignSelf`/`borderRadius`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`self`/`rounded`/`text` shorthands. Shorthands pass
  at runtime but FAIL `tsc`.
- **`Button` is a styled stack — no text props.** `color`/`fontWeight`/
  `fontSize` are NOT valid on `Button` (they fail `tsc`). Set the frame on
  `Button` and the label colour on a nested `Text`; that is exactly what the
  `Solid`/`Ghost`/`Plain` compositions in `ui.tsx` do. `Button` uses `onPress`;
  `Input`/`TextArea` use `value`/`onChangeText`.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Base manages
  `id`/`created`/`updated`/`owner`/`org`; the provisioned rule is
  `@request.auth.org_id = org`. Keep it in lockstep with `src/lib/model.ts`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the `stories` and
  `blocks` collections (org-scoped, IAM-native). Runtime read/write is
  browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
