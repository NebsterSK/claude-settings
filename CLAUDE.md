# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a **Claude Code plugin marketplace**. It ships one plugin (`nebster`) — a set of specialized subagents, skills (slash commands), and output styles — that users install once with `/plugin` and — with auto-update enabled — receive updates from GitHub on startup. It is **not** an application; there is no build, test, or lint step.

## Working in this repo

- Edits are config/prose, not code — there is nothing to build, run, or test. Keep changes tight.
- **Never add a `version` field to `.claude-plugin/plugin.json`.** Omitting it makes every commit ship as a new version (git SHA), which is what keeps installs auto-updating. A pinned version would freeze users at that release.

## Repository Structure

This repo is both the marketplace and the plugin (plugin lives at the repo root):

- `.claude-plugin/marketplace.json` — marketplace manifest; lists the `nebster` plugin with `source: "./"`.
- `.claude-plugin/plugin.json` — plugin manifest (name, description, author, repo). No `version` field, on purpose.
- `output-styles/<name>.md` — persona output styles selectable with `/output-style` (**Comrade** — Soviet servant, **Peon** — Warcraft 3 orc, **Mate** — Guy Ritchie London geezer). All set `keep-coding-instructions: true` and restrict the persona to terminal replies only; never let persona text leak into code, commits, PRs, docs, or any file.
- `agents/` — specialized subagents:
  - **Reviewer** — senior code reviewer / quality gatekeeper; audits security, bugs, tech debt, performance, testing, and accessibility before production. Also checks the diff against a PR's stated purpose when the command supplies one (goal not met, scope creep, undocumented behavior change).
  - **Fixer** — applies a single scoped fix from a review finding; edits only the fix's footprint, adds/updates the covering test for behavior fixes, no unrelated changes, reports in one line. Spawned in parallel by the review command.
  - **SEO** — on-page and technical SEO.
- `skills/<name>/SKILL.md` — skills, invoked as slash commands namespaced under the plugin (`/nebster:review`). The legacy `commands/` directory is deprecated — do not recreate it.
  - **`/nebster:review`** — dispatches the change set to the Reviewer subagent and relays its findings. Runs in one of two modes (see **Review modes** below): **fix mode** on your own work, **report-only mode** on someone else's PR.
  - **`/nebster:qa`** — code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite. Runs in a forked `general-purpose` subagent (`context: fork`, `background: false`) so the lint noise stays out of the main context, and is `disable-model-invocation` — only the user triggers it.

## Review modes

`/nebster:review` always tries `gh` first to read the PR behind the current branch — title, description, linked issue, and existing review comments — and passes that stated purpose to the Reviewer as a claim to verify against the diff. If `gh` is missing/unauthenticated or the branch has no PR, it says so in one line and falls back to a plain `git diff` review.

The branch under review is assumed to be **checked out already** — the command never runs `gh pr checkout`, and never fetches code over the API.

- **Fix mode** — your own branch, or a PR you authored. The Reviewer flags `Auto-fix: yes` at **any severity** when a finding has exactly one obvious fix that restores evident intent and involves no product-rule, contract/API, schema, or data decision. Medium/Low auto-fixes dispatch to background Fixers immediately; Critical/High auto-fixes wait behind one confirm (apply all / hold some back) and run on an Opus Fixer. Everything `Auto-fix: no` is triaged one finding at a time, **uncapped**. Fixers may span the fix's footprint and add a covering test for Medium+ fixes. All fixers share one unified per-file queue. Closes with scoped tests and a status table with a severity column.
- **Report-only mode** — the PR author isn't you (`author.login` vs `gh api user`), or `--report-only` was passed. **Nothing is edited**: no Fixers, no auto-fixes, no commits, no pushes. Lows are reported as findings rather than applied. The command then offers to post findings to the PR — the user selects *which* ones (`multiSelect`, batched 4 at a time), and the exact payload is confirmed before the call. Posts via `gh api …/pulls/<n>/reviews` with `event=COMMENT` only; never `--approve` or `--request-changes`.

Arguments are positional named args (`arguments: [base, pr]` → `$base`, `$pr`): `/nebster:review [base] [pr] [--report-only]`. A bare PR number/URL in the first slot is treated as the PR; legacy `base=`/`pr=` prefixes are stripped; `--report-only` is read from `$ARGUMENTS`. Branch, default base, working tree, `gh` auth and the branch's PR are injected at invocation via `` !`cmd` `` (each `|| true` so a missing `gh` can't abort the skill). `allowed-tools` pre-approves only read-only `git`/`gh` calls — never `gh api …/reviews`, merge, or anything that writes.

**Do not** let report-only mode drift into editing — the no-edit rule is load-bearing, since the branch belongs to someone else.

## Key Details

- **Command namespacing**: plugin skills are always prefixed with the plugin name (`/nebster:review`), so they can no longer shadow the built-in `/review`.
- **`/nebster:review` must stay inline** (no `context: fork`): its triage relies on `AskUserQuestion`, which a forked/background subagent cannot use.
- **Renaming**: the plugin or marketplace name can be changed later; add a `renames` map to `marketplace.json` (`{"old-name": "new-name"}`) so existing installs migrate automatically.
- **Framework-agnostic frontend**: the Reviewer targets a Laravel backend but stays agnostic across frontend stacks (Vue, Livewire, React) — don't reintroduce stack-specific assumptions into its checklist.
