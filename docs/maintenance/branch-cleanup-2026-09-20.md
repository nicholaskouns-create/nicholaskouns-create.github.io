# Proposed branch cleanup · September 20, 2026

[Repository home](../../README.md)

This is a reviewable cleanup proposal. No remote branch names were removed during this curation. Every candidate tip below was verified with `git merge-base --is-ancestor` against the recorded `main` commit; the commits are reachable through `main`.

- Repository: `nicholaskouns-create.github.io`
- Main at inspection: `aaa105ce1b77bac1a420bd8f7f4ecc5b308fd603`
- Branches at inspection: 5
- Completed branch names proposed for removal: 1
- Branches remaining if approved: 4

The proposal retains the default branch, deployment branch, open pull-request branch, and tips outside the ancestry of `main`. Removal requires explicit approval and a fresh check that each remote tip still matches the SHA recorded below. Automatic approval review blocked the combined branch-deletion operation because broad curation did not explicitly authorize it.

## Proposed branch-name removals

| Branch | Recoverable commit |
|---|---|
| `copilot/fix-github-actions-job` | [`6a55394a46847c4a0e8346d3361b4484779517db`](https://github.com/nicholaskouns-create/nicholaskouns-create.github.io/commit/6a55394a46847c4a0e8346d3361b4484779517db) |

## Restore a name after removal

From a complete checkout, a branch can be restored with its recorded commit. For example:

```bash
git push origin 6a55394a46847c4a0e8346d3361b4484779517db:refs/heads/copilot/fix-github-actions-job
```

This restores the branch name without rewriting `main`.
