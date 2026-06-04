---
description: Dispatch a thorough code review to the Reviewer subagent (overrides the built-in /review)
---

You are the dispatcher, not the reviewer. Gather context, delegate the review to the **Reviewer** subagent, relay its findings, and triage them with the user. Do NOT produce the review yourself.

## Step 1 — Determine what to review

From `$ARGUMENTS`:
- **`base=<branch>`** — review the current branch against that base.
- **empty** — review against `develop` if it exists locally, else `main` (detect via `git rev-parse --verify`).

Collect before delegating: the base branch, `git diff <base>..HEAD --stat`, `git log <base>..HEAD --oneline`, and the project's `CLAUDE.md` conventions.

## Step 2 — Delegate to the Reviewer subagent

Use the Agent tool with `subagent_type: "Reviewer"`. Write a self-contained prompt that:
1. States the change set (a sentence or two + the stat output).
2. Lists the project conventions to enforce (copy relevant `CLAUDE.md` sections — auth facade, `Log` discipline, flash-message patterns, FK defaults, etc.).
3. Points at the highest-risk files from the diff stat.
4. Tells the Reviewer to produce its numbered findings in its standard format.

Do not tip the Reviewer with your own opinions — it should reach findings independently.

## Step 3 — Relay findings

Surface the full report, grouped by severity as the Reviewer did. Do not re-review or contradict it; optionally add one line on which blocking items to fix first.

## Step 4 — Triage one finding at a time, fix in the background

If the Reviewer reported no issues, relay its one-line all-clear and stop — there's nothing to triage.

Otherwise triage every substantive finding (anything the Reviewer marked **critical** or **warning**, plus any non-trivial **suggestion**) via `AskUserQuestion`, **one finding per call** (never batch), in severity order. The fix for the finding just decided runs in the background while the user reads the next one.

**Keep the hot path empty.** The lag the user feels is the gap between answering finding N and seeing finding N+1 — so do *nothing slow* in that gap. No brief files, no context-gathering reads, no prose. The only work between the answer and the next question is one background-fixer spawn with an inline prompt. Everything else (reading the file, understanding surroundings) is the fixer's job, done in the background while the user reads N+1.

**The pipeline.** When the user picks **Fix** (or **Fix (option N)**) for finding N, issue **two tool calls in the same turn**:
1. An `Agent` call with `run_in_background: true` whose prompt is the inline fixer brief (see below) — returns immediately; do **not** wait for it.
2. The `AskUserQuestion` for finding N+1.

So fixer N edits while the user decides N+1. Never block on a fixer before asking the next question. **Ignore** defers the finding and asks the next immediately. **Explain** and **Chat** have no fix to dispatch, so the pipeline pauses: handle the conversation, then re-ask the *same* finding.

**Concurrency safety.** Background fixers share one working directory, so two editing the same file will clobber each other. Keep a **per-file queue**: map each finding to its file(s), and never run two fixers on the same file at once. If a file is already being fixed, enqueue the new fixer instead of dispatching it — then ask the next question immediately (never make the user wait). On each fixer-completion notification, dispatch the next queued fixer for that file. Only disjoint-file fixers run concurrently.

**Dispatching a fixer.** Spawn the `Agent` tool, `subagent_type: "Fixer"`, `run_in_background: true`. The Fixer agent already carries all the standing instructions (read the file itself, stay in scope, report in one line), so the prompt is just the finding data you already have from the Reviewer's report — keep it minimal so there's almost nothing to generate before the next question:
- The finding: number, file, line, the issue, the recommended fix (and which option, if several) — quote the Reviewer's lines, don't re-derive them.
- Any decision from an Explain/Chat exchange on this finding — one line, only if it happened.

That's it. No scope boilerplate, no instructions on how to work — those live in the Fixer agent.

**Options per finding.** In each `AskUserQuestion`, put the recommended action first and label it `(Recommended)` — for critical/warning findings that's **Fix**.
- **Fix** — apply the recommended fix (dispatched to a background fixer).
- **Fix (option N)** — when the Reviewer gave multiple paths, list each labelled by trade-off (e.g. "Fix server-side copy" vs. "Surface failure with toast").
- **Chat** — open-ended discussion; reply, let the user respond, continue until they signal a decision ("fix it" / "ignore" / "option 2"), then act.
- **Explain** — one-shot deep dive into root cause, data flow, blast radius; then re-ask the same finding with Fix / Chat / Ignore.
- **Ignore** — leave as-is; capture in the final summary so it isn't lost.

Go straight to the first finding — do not ask whether to triage. Each option is a concrete action, never a plan-approval meta-question.

**Closing out.** After the last finding is decided and dispatched, wait for all in-flight fixers to report, then:
1. **Verify with scoped tests.** Run only the tests covering the changed code (the touched classes' test files / the relevant suite), never the whole suite. Do **not** run Larastan / ESLint / Pint / Prettier — the user runs those manually before the PR. If a test fails because of a fix, surface it and re-dispatch that fixer with the failure, or hand it back to the user.
2. **Handle failed or partial fixes.** For any finding a fixer couldn't fully apply — especially blocking (critical/warning) ones — surface it prominently, don't bury it in the table. Offer to re-dispatch it with more context or a higher-effort Opus Fixer, or hand it back to the user.
3. **Summarize.** End with a single status table marking each finding **fixed / ignored / deferred / failed**, with each fixer's one-line summary and the scoped-test result.

## Do not

- Do not produce the review yourself — always delegate to the Reviewer.
- Do not skip reading `CLAUDE.md` before delegating.
- Do not substitute another subagent for the **Reviewer** in Step 2 or the **Fixer** in Step 4. If either is unavailable, stop and tell the user their `~/.claude/agents/reviewer.md` or `~/.claude/agents/fixer.md` is not loading.

## Arguments

`$ARGUMENTS`
