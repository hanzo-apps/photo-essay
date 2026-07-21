-- Hanzo Base schema for Frame Story (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped. The provisioned list/view/create/update/delete rule is
--
--     @request.auth.org_id = org
--
-- so a member of your org reads/writes it and other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/lib/model.ts and src/views/*).

-- A photo essay: a cover, a byline, and whether it is published.
CREATE TABLE IF NOT EXISTS stories (
  title        TEXT    NOT NULL DEFAULT '',
  byline       TEXT    NOT NULL DEFAULT '',
  cover_url    TEXT    NOT NULL DEFAULT '',
  published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TEXT    NOT NULL DEFAULT ''
);

-- An ordered beat within a story: a full-bleed image or a text passage.
-- `kind` is 'image' | 'text'; `"order"` sequences the cinematic scroll.
CREATE TABLE IF NOT EXISTS blocks (
  story_id  TEXT    NOT NULL,
  kind      TEXT    NOT NULL DEFAULT 'text',
  image_url TEXT    NOT NULL DEFAULT '',
  caption   TEXT    NOT NULL DEFAULT '',
  body      TEXT    NOT NULL DEFAULT '',
  "order"   INTEGER NOT NULL DEFAULT 0
);
