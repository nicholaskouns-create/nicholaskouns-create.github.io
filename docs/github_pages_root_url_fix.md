# GitHub Pages root-URL fix

## Summary

The website deploy issue came from using the wrong live URL model for GitHub
Pages. This repository is named `nicholaskouns-create.github.io`, which makes it
a **user-site repository**. User-site repositories publish at the domain root
(`https://nicholaskouns-create.github.io/`), not at a project subpath such as
`/E47-Kartekeya/`.

The fix was to align deployment verification with that rule. The Pages workflow
now validates the root URL after publishing `website/` to the root of the
`gh-pages` branch.

## What was failing

The deployment pipeline could finish the branch publish step and still fail the
final live-site verification step if that step checked the wrong URL. In this
case, the important distinction was:

- **Project site pattern:** `https://OWNER.github.io/REPOSITORY/`
- **User site pattern:** `https://OWNER.github.io/`

This repository matches the second pattern because the repository name is the
same as the Pages hostname.

## Why the mistake is easy to make

The content being published is the E47-Kartekeya website, so it is natural to
think the live URL should include `/E47-Kartekeya/`. That would be correct for a
normal project repository such as `OWNER/E47-Kartekeya`. It is not correct for a
repository whose name is already `OWNER.github.io`.

There is a second reason the confusion persisted: the local website checks still
use a subpath-shaped base URL (`https://example.test/E47-Kartekeya/`). That test
is intentional. It proves that links and assets remain relative and portable
enough to work even if the site is later hosted under a project subpath. A site
that is subpath-safe also works at the root, so this is a stricter portability
check, not evidence that production must use the subpath.

## What the workflow does now

The deployment flow in `.github/workflows/pages.yml` is:

1. Validate the static website with `node --test scripts/check_website.cjs`.
2. Copy `website/` into a clean orphan branch.
3. Force-push that content to `gh-pages`.
4. Poll the live Pages URL at `https://${OWNER}.github.io/`.
5. Confirm the returned HTML contains `<title>The Mathematical City</title>`.
6. Write a publish receipt that records the verified root URL.

The important learning is that the verification URL must match the kind of Pages
repository being deployed. The branch contents and the live URL shape are linked:
publishing the website at the root of `gh-pages` for a user-site repository
means the site itself is expected at the root domain.

## Operational rule to remember

When deciding the live URL for GitHub Pages, classify the repository first:

- If the repository is `OWNER.github.io`, treat it as a **user site** and verify
  `https://OWNER.github.io/`.
- Otherwise, for a normal repository site, verify
  `https://OWNER.github.io/REPOSITORY/` unless a custom domain changes that
  contract.

## How to verify the fix in future

Use this checklist whenever the website deployment is touched:

1. Confirm the repository name still matches `OWNER.github.io`.
2. Read `.github/workflows/pages.yml` and make sure the live verification target
   is the correct URL shape for that repository type.
3. Run `node --test scripts/check_website.cjs` to confirm the static bundle is
   internally consistent.
4. After deployment, open the live root URL and confirm the expected title and
   assets load.
5. Keep README instructions synchronized with the workflow so operators do not
   debug the wrong address.

## Lessons learned

- GitHub Pages URL rules depend on repository naming, not on the apparent name
  of the content being published.
- A correct deploy branch can still look broken if the health check points to the
  wrong address.
- Conservative relative-link tests are valuable because they keep the site
  portable across both root and subpath hosting shapes.
- Documentation must be updated together with workflow behavior, or the same
  incident will repeat during the next maintenance cycle.
