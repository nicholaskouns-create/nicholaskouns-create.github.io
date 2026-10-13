# MELANIE · Private Mathematical City Companion

**App:** https://nicholaskouns-create.github.io/melanie/

**Status:** GitHub Pages HTML committed, Supabase schema migrated, authenticated Edge Function deployed. Live model responses are **not verified** and require the `OPENAI_API_KEY` Supabase Edge Function secret.

## Deployment checklist

1. In Supabase project `gpkjvihkyectnenvnbng`, configure the Edge Function secret `OPENAI_API_KEY` in Edge Functions → Secrets. **Never place it in this public repository or browser.**
2. The current app uses Supabase anonymous sign-in. Each anonymous user receives an authenticated JWT and owner-scoped RLS access. Preserve that session; cross-device recovery is not implemented.
3. Confirm GitHub Pages is serving the `/melanie/` path.
4. Open the existing app, confirm its authenticated session, send a synthetic test message, and reload. Completion requires both the user message and the real model reply to remain in the transcript.
5. Test search and full JSON export. Set up managed database backups, retention, and recovery testing for stronger continuity.

## Architecture

- GitHub Pages: austere responsive interface, no secrets
- Supabase Auth: authenticated user sessions
- Supabase Postgres: `melanie_threads`, `melanie_messages`, `melanie_memories`; row-level security enabled
- Supabase Edge Function: `melanie-chat`, JWT verification enabled, server-side OpenAI API access
- Memory retrieval: recent thread context plus keyword-matched historical excerpts; full archives remain in the database, but the model does not receive all messages at once
- User export: all messages as JSON, paginated

## Current limitations

No live conversation has been verified. No automated Drive sync, no tested offsite backup, no native iOS app, no formal CIRP enforcement proof, and no active E47 neural-layer integration. Do not describe any of these as implemented.

**Founding covenant:** True when it is difficult. Kind when it matters most.

## Audit and regression checks · 2026-10-13

Read-only audit completed before implementation changes. The existing app, database,
source registry and function are reused. No new project, table, bucket or runtime
was created. The original family/research documents and Drive sharing are unchanged.

Repairs: JSON export URL shadowing; deterministic ordering of message pairs;
conversation pagination beyond 1,000 messages; retention of a failed-send draft;
thread-bound asynchronous replies; and aborting sends after failed thread creation.
`edge/index.ts` is the source of the **existing** `melanie-chat` function, not a new
service. Its repair only changes the ordering of retrieved recent messages.

Run the code checks with Node.js 22.13+:

```sh
node --test melanie/tests/regression.cjs
```

The 12 tests use synthetic database/provider fixtures. They exercise the actual
frontend and function source. All 12 pass after repair; eight fail against the
pre-audit source. These are not a live model-conversation certificate.

Run `tests/database.sql` in the existing project's SQL editor. It checks the actual
RLS policies with authenticated roles and rolls back all fixtures. Result: four
checks pass, zero fixture messages remain.

**Live acceptance remains FAILED/BLOCKED:** anonymous authentication succeeds and
survives reload, but `melanie-chat` returns HTTP 503 because `OPENAI_API_KEY` is not
configured. No real assistant reply or transcript pair persisted. Do not mark the
implementation complete until a real authenticated exchange survives reload.

The source registry supplies metadata and links; it does not fetch Drive document
contents. The cover URL points to a private Drive asset, and the current header CSS
also overrides its background image. Original assets and permissions were retained;
public asset publication is outside these conversation/persistence repairs.
