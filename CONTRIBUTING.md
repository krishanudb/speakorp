# Contributing & Branching Workflow

This repository uses a **`dev`-centric** branching model.

## Branches

- **`main`** — release/production branch. Protected. **Only `dev` may be merged into `main`** (enforced by the `PR Guard` CI check and branch protection).
- **`dev`** — the primary integration branch and the **default branch**. All feature work targets `dev`.
- **feature branches** — short-lived, cut from `dev`, named with a prefix:
  - `feat/<slug>` — new features
  - `fix/<slug>` — bug fixes
  - `chore/<slug>` — tooling, deps, docs

## Feature workflow

1. **Cut a branch from `dev`** (in a dedicated git worktree — see below):
   ```bash
   git fetch origin
   git worktree add ../worktrees/<slug> -b feat/<slug> origin/dev
   ```
2. **Code** in the worktree directory.
3. **Open a PR into `dev`**:
   ```bash
   git push -u origin feat/<slug>
   gh pr create --base dev --head feat/<slug> --fill
   ```
4. **Review the PR carefully**, then merge (squash) into `dev`.
5. Delete the feature branch and remove the worktree:
   ```bash
   git worktree remove ../worktrees/<slug>
   git push origin --delete feat/<slug>
   ```

## Releasing (dev -> main)

Only `dev` is allowed to be merged into `main`:

```bash
gh pr create --base main --head dev --title "Release: dev -> main" --fill
```

The `PR Guard` workflow fails any PR into `main` whose source branch is not `dev`.

## Git worktrees (parallel development)

Worktrees let you check out multiple branches simultaneously in separate
directories that share one `.git`. The **primary** worktree is this repo
checkout (on `dev`); additional worktrees live under `../worktrees/`.

```bash
# list worktrees
git worktree list

# add a worktree for a new feature (branch cut from dev)
git worktree add ../worktrees/<slug> -b feat/<slug> origin/dev

# remove a worktree when the feature is merged
git worktree remove ../worktrees/<slug>
```

## Deploying the app

The Databricks App lives in [`speakorp/`](./speakorp). See its
[`Makefile`](./speakorp/Makefile) — `make deploy` validates, deploys, and starts it.
