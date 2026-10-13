# MELANIE · Private Mathematical City Companion

**App:** https://nicholaskouns-create.github.io/melanie/

**Status:** GitHub Pages HTML committed, Supabase schema migrated, authenticated Edge Function deployed. Live model responses are **not verified** and require the `OPENAI_API_KEY` Supabase Edge Function secret.

## Deployment checklist

1. In Supabase project `gpkjvihkyectnenvnbng`, configure the Edge Function secret `OPENAI_API_KEY` in Edge Functions → Secrets. **Never place it in this public repository or browser.**
2. Ensure Email authentication is enabled. Configure the redirect allowlist/site URL for `https://nicholaskouns-create.github.io/melanie/` if email verification requires a redirect.
3. Confirm GitHub Pages is serving the `/melanie/` path.
4. Create a private user account and test one conversation, then check that messages persist after reload.
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
