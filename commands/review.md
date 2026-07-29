---
description: Dispatch a thorough code review to the Reviewer subagent
---

You are the dispatcher, not the reviewer. Gather context, delegate the review to the **Reviewer** subagent, relay its findings, and triage them with the user. Do NOT produce the review yourself.

## Step 1 — Determine what to review

From `$ARGUMENTS`:
- **`base=<branch>`** — review the current branch against that base.
- **empty** — review against `develop` if it exists locally, else `main` (detect via `git rev-parse --verify`).

Collect before delegating: the base branch, `git diff <base>..HEAD --stat`, `git log <base>..HEAD --oneline`, and the project's `CLAUDE.md` conventions.

## Step 2 — Delegate to the Reviewer subagent

Use the Agent tool with `subagent_type: "nebster:reviewer"`. Write a self-contained prompt that:
1. States the change set (a sentence or two + the stat output).
2. Lists the project conventions to enforce (copy relevant `CLAUDE.md` sections — auth facade, `Log` discipline, flash-message patterns, FK defaults, etc.).
3. Points at the highest-risk files from the diff stat.
4. Tells the Reviewer to produce its numbered findings in its standard format.

Do not tip the Reviewer with your own opinions — it should reach findings independently.

## Step 3 — Relay findings and auto-dispatch Low fixes

Surface the full report, grouped by severity as the Reviewer did. Do not re-review or contradict it; optionally add one line on which blocking items to fix first. Make clear which findings are being **auto-fixed** (the Reviewer's `Auto-fix: yes` / Low section) versus which go to **triage** with the user.

**Immediately dispatch every `Auto-fix: yes` finding to a background Fixer** — do this now, in this step, before triage starts, so they edit while the user reads. Each goes through the same unified per-file queue as triage fixers (see Step 4 concurrency). Do not ask the user about these; they were pre-classified by the Reviewer as single, clear, mechanical fixes with no business-logic change. They appear only in the final recap, marked `auto-fixed`.

**A background auto-fixer that reports back it couldn't cleanly apply** (ambiguous, line/file mismatch, or the fix would change behavior beyond the finding's intent) **falls back into manual triage** — fold it into the Step 4 queue as a normal finding rather than letting it silently vanish.

## Step 4 — Triage one finding at a time, fix in the background

If the Reviewer reported no issues, relay its one-line all-clear and stop — there's nothing to triage.

Otherwise triage every **triaged** finding (everything in the Reviewer's Critical/High/Medium section — `Auto-fix: no`) via `AskUserQuestion`, **one finding per call** (never batch), in severity order. `Auto-fix: yes` (Low) findings are **not** triaged — they were already dispatched in Step 3. Any auto-fixer that fell back (Step 3) is triaged here too. The fix for the finding just decided runs in the background while the user reads the next one.

**Keep the hot path empty.** The lag the user feels is the gap between answering finding N and seeing finding N+1 — so do *nothing slow* in that gap. No brief files, no context-gathering reads, no prose. The only work between the answer and the next question is one background-fixer spawn with an inline prompt. Everything else (reading the file, understanding surroundings) is the fixer's job, done in the background while the user reads N+1.

**The pipeline.** When the user picks **Fix** (or **Fix (option N)**) for finding N, issue **two tool calls in the same turn**:
1. An `Agent` call with `run_in_background: true` whose prompt is the inline fixer brief (see below) — returns immediately; do **not** wait for it.
2. The `AskUserQuestion` for finding N+1.

So fixer N edits while the user decides N+1. Never block on a fixer before asking the next question. **Ignore** defers the finding and asks the next immediately. **Explain** and **Chat** have no fix to dispatch, so the pipeline pauses: handle the conversation, then re-ask the *same* finding.

**Concurrency safety.** Background fixers share one working directory, so two editing the same file will clobber each other. Keep **one unified per-file queue spanning both the Step 3 auto-fixers and the Step 4 triage fixers** — they run against the same working dir, so a triage fixer must never edit a file an auto-fixer is still touching, and vice versa. Map each finding to its file(s), and never run two fixers on the same file at once. If a file is already being fixed, enqueue the new fixer instead of dispatching it — then ask the next question immediately (never make the user wait). On each fixer-completion notification, dispatch the next queued fixer for that file. Only disjoint-file fixers run concurrently. Since auto-fixers are dispatched first, you already know roughly which files are in flight; if the user picks **Fix** on a triage finding for a file an auto-fixer still holds, enqueue it (small, rare wait) rather than clobbering.

**Dispatching a fixer.** Spawn the `Agent` tool, `subagent_type: "nebster:fixer"`, `run_in_background: true`. The Fixer agent already carries all the standing instructions (read the file itself, stay in scope, report in one line), so the prompt is just the finding data you already have from the Reviewer's report — keep it minimal so there's almost nothing to generate before the next question:
- The finding: number, file, line, the issue, the recommended fix (and which option, if several) — quote the Reviewer's lines, don't re-derive them.
- Any decision from an Explain/Chat exchange on this finding — one line, only if it happened.

That's it. No scope boilerplate, no instructions on how to work — those live in the Fixer agent.

**Options per finding.** `AskUserQuestion` allows **at most 4 options** (a fifth, "Other", is always added automatically — do not spend a slot on it). Put the recommended action first and label it `(Recommended)` — for critical/warning findings that's **Fix**.

**Explain and Ignore are mandatory — they must appear in every finding's question and may never be dropped to make room.** This is the whole point of triage: the user must always be able to understand a finding before deciding, and always be able to decline it. If you are over the 4-slot limit, drop or fold *other* options (see below) — never Explain, never Ignore.

The four options, in order:
- **Fix** — apply the recommended fix (dispatched to a background fixer). *(Recommended for critical/warning.)*
- **Explain** — one-shot deep dive into root cause, data flow, blast radius; then re-ask the *same* finding with the same options. **Always present.**
- **Chat** — open-ended discussion; reply, let the user respond, continue until they signal a decision ("fix it" / "ignore" / "option 2"), then act.
- **Ignore** — leave as-is; capture in the final summary so it isn't lost. **Always present.**

**When the Reviewer gave multiple fix paths**, the slots are Fix (option 1), Fix (option 2), Explain, Ignore — name each fix path by its trade-off (e.g. "Fix server-side copy" vs. "Surface failure with toast"). Chat then drops out of the explicit list (it stays reachable via "Other", and any option can lead into discussion). Explain and Ignore still keep their slots. If the Reviewer offered 3+ fix paths, keep only the top two as explicit Fix options and fold the rest into "Other" (mention them by name in the question text so they're not hidden, and they remain reachable via Chat) — Explain and Ignore never lose their slots regardless of how many fix paths exist.

Go straight to the first finding — do not ask whether to triage. Each option is a concrete action, never a plan-approval meta-question.

**Closing out.** After the last finding is decided and dispatched, wait for all in-flight fixers to report, then:
1. **Verify with scoped tests.** Run only the tests covering the changed code (the touched classes' test files / the relevant suite), never the whole suite. Do **not** run Larastan / ESLint / Pint / Prettier — the user runs those manually before the PR. If a test fails because of a fix, surface it and re-dispatch that fixer with the failure, or hand it back to the user.
2. **Handle failed or partial fixes.** For any finding a fixer couldn't fully apply — especially blocking (critical/warning) ones — surface it prominently, don't bury it in the table. Offer to re-dispatch it with more context or a higher-effort Opus Fixer, or hand it back to the user.
3. **Summarize.** End with a single status table marking each finding **fixed / auto-fixed / ignored / deferred / failed**, with each fixer's one-line summary and the scoped-test result. `auto-fixed` = a Low finding applied in Step 3 without triage; keep it a distinct status from user-chosen `fixed` so you can see at a glance what landed without your sign-off and spot-check it.

## Do not

- Do not produce the review yourself — always delegate to the Reviewer.
- Do not skip reading `CLAUDE.md` before delegating.
- Do not substitute another subagent for the **Reviewer** in Step 2 or the **Fixer** in Step 4. If either is unavailable, stop and tell the user the `nebster` plugin's agents aren't loading — have them check the plugin's install/enabled status via `/plugin` and try `/reload-plugins`.
- Do not omit **Explain** or **Ignore** from any finding's `AskUserQuestion`, and do not batch findings to save option slots. If you can't fit everything in 4 options, drop Chat (it stays reachable via "Other") — never Explain or Ignore.

## Arguments

`$ARGUMENTS`
