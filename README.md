# Frame Story — Visual Photo Essays

**Scroll it like a story.** A long-scroll visual narrative builder on the Hanzo
stack: editors sequence full-bleed image blocks interleaved with text passages;
readers experience the result as a cinematic vertical scroll. A real, buildable
app you fork on [hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. No Tailwind, no second kit. The cinematic
  cover frames are self-contained SVG — nothing depends on the network to render.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Essays and their beats are real Base
  collections (`stories`, `blocks`).

## Three views

- **Index** — poster tiles of every published essay in your org.
- **Reader** — the cinematic scroll: a title card, then the ordered beats
  (full-bleed image / centred text passage), then an end card. Near-zero chrome.
- **Builder** — pick or create an essay, edit cover/byline, add and reorder
  image/text beats, publish. "Load the sample essay" seeds a complete piece.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_IAM_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. Per-app clients are provisioned at deploy. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |
| `VITE_HANZO_API_URL` / `VITE_HANZO_API_KEY` | Optional — only if the app calls the Hanzo LLM gateway. Unused here; never commit a real key. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base.

The one deploy requirement: the IAM client (`VITE_IAM_CLIENT_ID`) must list this
origin's `/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every forked
app works, or register a dedicated `photo-essay` client per template.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org with the rule
`@request.auth.org_id = org` — a teammate in your org sees the row; other orgs
cannot. At runtime the views read/write `stories` and `blocks` through
`@hanzo/base/react` (`useQuery`/`useMutation`) carrying the IAM token. Keep
`schema.sql` in lockstep with `src/lib/model.ts`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate (Landing / Studio)
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  lib/base.ts       BaseClient carrying the IAM bearer token
  lib/model.ts      Story/Block types, bundled SVG frames, sample essay
  auth/callback.tsx PKCE return leg
  views/
    landing.tsx     signed-out cinematic title card
    studio.tsx      signed-in shell (index · reader · builder routes)
    stories.tsx     Index — poster tiles of published essays
    story.tsx       Reader — the cinematic scroll
    builder.tsx     Builder — compose, order beats, publish
    ui.tsx          shared primitives (Caps, FullBleed, Solid/Ghost/Plain, Field)
  assets/           self-contained SVG cover frames
schema.sql          databaseSchema -> Base collections on publish (stories, blocks)
hanzo.yml           Hanzo Cloud build/deploy manifest
```
