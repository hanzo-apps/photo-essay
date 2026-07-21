# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: **Frame Story** — long-scroll visual photo essays on the canonical Hanzo
stack: Vite + React 19 + `@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Three views
(index · reader · builder). Keep it minimal and real. `@hanzo/gui` needs the
react-native-web alias + Tamagui defines in `vite.config.ts`, uses Tamagui
LONGHAND props, and its `Button` takes no text props (label colour goes on a
nested `Text` — see `Solid`/`Ghost`/`Plain` in `src/views/ui.tsx`). `schema.sql`
is the Base data contract (`stories` + `blocks`). Prove changes with
`npm run build` (tsc + vite). Never build a container image locally — Hanzo Cloud
owns deploys.
