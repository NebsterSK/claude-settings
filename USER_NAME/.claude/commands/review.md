---
description: Dispatch a thorough code review to the Reviewer subagent (overrides the built-in /review)
---

You are the dispatcher, not the reviewer. Your job is to gather the context, delegate the actual review to the **Reviewer** subagent, and relay its findings to the user. Do NOT produce the review yourself.

## Step 1 — Determine what to review

Look at `$ARGUMENTS` (anything the user typed after `/review`):

- **If `base=<branch>` (e.g. `base=develop`)**: review the current branch against that base.
- **If empty**: review the current branch against `develop` if it exists locally, otherwise against `main`. (Detect via `git rev-parse --verify develop` / `git rev-parse --verify main`.)

Collect these facts before delegating:
- The base branch (for local reviews).
- `git diff <base>..HEAD --stat` output — for the scope summary.
- `git log <base>..HEAD --oneline` output — for the commit trail.
- The project's `CLAUDE.md` conventions (read it if it exists).

## Step 2 — Delegate to the Reviewer subagent

Use the Agent tool with `subagent_type: "Reviewer"`. Write a self-contained prompt that:

1. States what the change set is (one or two sentences + the stat output).
2. Lists the project conventions the Reviewer should enforce (copy the relevant sections from `CLAUDE.md` — auth facade usage, `Log::info` / `Log::error` discipline, flash-message patterns, foreign-key defaults, etc.).
3. Points at the files with the most risk based on the diff stat.
4. Instructs the Reviewer to produce its numbered findings in its standard format.

Do not inline tip the Reviewer with your own opinions — it should reach findings independently.

## Step 3 — Relay findings

Once the Reviewer returns, surface its full report to the user. Group by severity as the Reviewer did. Do not re-review or contradict the Reviewer; you may add a one-line suggestion at the end about which blocking items to fix first if that is helpful.

## Step 4 - Triage findings interactively

After relaying the Reviewer's report, do not stop. Triage every substantive
finding (Critical / High / Medium and any non-trivial Low) with the user via
the AskUserQuestion tool.

### Pattern

Group findings into batches of up to 4 (the tool's per-call limit). Keep
related items together, e.g. all Nits in one batch, all Mediums in
another. Order batches by severity, most serious first.

For each batch, call **AskUserQuestion** once with one question per finding.
Present the options below.

When the batch returns, act on every answer in order before opening the
next batch.

After all findings are resolved, end with a single status table
(? fixed / ? ignored / ? deferred) summarising what was done and what
remains.

### Options to present per finding

- Fix - apply the recommended fix immediately.
- Fix (option N) - when the Reviewer surfaced multiple fix paths, list
each as its own option labelled by the trade-off (e.g. "Fix server-side
copy" vs. "Fix surface failure with toast").
- Chat about it - open-ended discussion. Reply with analysis or follow-up
questions, let the user respond, and continue until they signal a decision
("fix it" / "ignore" / "do option 2"). Only then act. Use this when the
user wants to think out loud or pressure-test the recommendation.
- Explain - one-shot deep dive into root cause, data flow, blast radius.
Then re-ask the same finding with Fix / Chat / Ignore as the remaining
options. Use this when the user just needs more context to decide.
- Ignore - leave as-is. Capture the deferred item in the final summary so
it isn't lost.

Do not ask whether to triage at all, go straight to the first batch. Do not
phrase any option as a meta-question about plan approval; each option is a
concrete action you will take.

## Do not

- Do not produce the review yourself — always delegate.
- Do not skip reading `CLAUDE.md` before delegating.
- Do not silently substitute a different subagent (e.g. `general-purpose`) if `Reviewer` is unavailable. If the Reviewer agent is missing, stop and tell the user their `~/.claude/agents/reviewer.md` is not loading.

## Arguments

`$ARGUMENTS`
