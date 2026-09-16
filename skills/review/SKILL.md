---
name: review
description: Dispatch a thorough code review to the Reviewer subagent, then triage the findings (fix mode on your own work, report-only on someone else's PR)
argument-hint: "[base-branch] [pr-number|url] [--report-only]"
arguments: [base, pr]
allowed-tools:
  - Bash(git status*)
  - Bash(git branch*)
  - Bash(git rev-parse *)
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(gh auth status*)
  - Bash(gh pr view *)
  - Bash(gh issue view *)
  - Bash(gh api user*)
---

You are the dispatcher, not the reviewer. Gather context, delegate the review to the **Reviewer** subagent, relay its findings, and triage them with the user. Do NOT produce the review yourself.

## Context (captured when the skill was invoked)

- Current branch: !`git branch --show-current`
- Default base: !`git rev-parse --verify --quiet develop >/dev/null 2>&1 && echo develop || echo main`
- Working tree: !`git status --short 2>&1 | head -30 || true`
- `gh` auth: !`gh auth status 2>&1 | head -3 || true`
- PR on this branch: !`gh pr view --json number,title,author,url,baseRefName 2>&1 || true`
- Your GitHub login: !`gh api user --jq .login 2>&1 || true`

## Step 1 — Determine what to review

Arguments are positional: `$base` is the first, `$pr` the second (either may be empty).

- **Base branch** — `$base`. Empty → use the default base above. If it is a PR number, a GitHub PR URL, or starts with `--`, it is *not* a branch: treat a number/URL as the PR and fall back to the default base. A legacy `base=<branch>` prefix means the same thing — strip it.
- **PR** — `$pr` (a number or URL; a legacy `pr=` prefix is stripped). Empty → the PR resolved on this branch above, if any.
- **`--report-only`** anywhere in `$ARGUMENTS` — force read-only mode (no fixes) regardless of authorship.

Collect before delegating: `git diff <base>...HEAD --stat`, `git log <base>..HEAD --oneline`, and the project's `CLAUDE.md` conventions.

## Step 1b — Pull PR context via `gh` (always try)

The branch is expected to be checked out already — this step is about **intent**, not about fetching code.

If the `gh` auth line above shows `gh` is missing or unauthenticated, skip this whole step, say so in one line, and continue with the plain diff.

Otherwise, using the PR resolved above (or the explicit `$pr`), gather:
- `gh pr view <n> --json number,title,body,author,baseRefName,headRefName,url,isCrossRepository,additions,deletions`
- `gh pr view <n> --comments` — existing review discussion. Known-and-accepted issues raised there should not be re-reported as new findings.
- Any linked issue from the body (`Fixes #123`, `Closes #123`) via `gh issue view <id>`.

If no PR exists for the branch, that's fine — continue with the plain diff.

**Pick the mode** (this decides Steps 3–4):
- **Report-only mode** — the PR author is not you (compare `author.login` against your GitHub login above), or `--report-only` was passed. Findings are reported and optionally posted to GitHub; **nothing is edited, ever** — no auto-fixers, no triage fixers, no commits, no pushes.
- **Fix mode** — your own branch, or your own PR. The existing auto-fix + triage pipeline applies unchanged.

State which mode you're in, in one line, before delegating.

## Step 2 — Delegate to the Reviewer subagent

Use the Agent tool with `subagent_type: "nebster:reviewer"`. Write a self-contained prompt that:
1. States the change set (a sentence or two + the stat output).
2. **PR context**, when Step 1b found a PR: title, stated purpose (body / linked issue), author, base ← head, and any known-issue notes from the PR comments. Frame it as *what the PR claims to do* — the Reviewer verifies the diff against that claim, it does not trust it.
3. Lists the project conventions to enforce (copy relevant `CLAUDE.md` sections — auth facade, `Log` discipline, flash-message patterns, FK defaults, etc.).
4. Points at the highest-risk files from the diff stat.
5. Tells the Reviewer to produce its numbered findings in its standard format.

Do not tip the Reviewer with your own opinions — it should reach findings independently.

## Step 3R — Report-only mode (someone else's PR)

*Applies instead of Steps 3 and 4 when Step 1b selected report-only mode.*

**Edit nothing.** No Fixer agents, no auto-fixes, no `git` writes, no `gh pr merge`/`close`/`review --approve|--request-changes`. It is not your branch.

1. **Relay the full report** exactly as the Reviewer grouped it, including the Low section — here those are findings to mention, not things being applied. Number every finding continuously (Lows keep going after the last triaged number) so the user can reference them.
2. **Offer discussion, not triage.** The user may ask to Explain any finding before deciding. Do not walk findings one at a time via `AskUserQuestion` — that's the fix-mode pipeline and it doesn't apply.
3. **Offer to post to the PR.** Ask once with `AskUserQuestion`: *post findings as a PR review?* — options: **Choose which findings (Recommended)** / **Post all blocking (Critical + High)** / **Single summary comment** / **Don't post**.
4. **Let the user pick the findings.** If they chose to select, present the numbered findings via `AskUserQuestion` with `multiSelect: true`, in batches of 4 options (the cap), in severity order — one option per finding, labelled `#N file:line — issue`. Keep going until every finding has been offered, or the user says stop. Never post a finding they didn't select.
5. **Post.** Inline comments via `gh api repos/<owner>/<repo>/pulls/<n>/reviews` with `event=COMMENT` and a `comments` array (`path`, `line`, `side: "RIGHT"`, `body`). Write each body as the Reviewer's issue + fix, prefixed with its severity. If a line can't be mapped to the diff, drop that entry into the review's top-level `body` as a bulleted `file:line — …` item instead of failing the whole call. **Show the exact payload and get explicit confirmation before the call** — this publishes to someone else's PR. Never use `--approve` or `--request-changes`; always `COMMENT`.
6. **Summarize.** One table: each finding marked **posted / not posted**, plus the PR review URL. No test run — you changed nothing.

## Step 3 — Relay findings and auto-dispatch fixes

*Fix mode only (your own branch or your own PR). In report-only mode, skip to Step 3R.*

Surface the full report, grouped by severity as the Reviewer did. Do not re-review or contradict it; optionally add one line on which blocking items to fix first. Make clear which findings are being **auto-fixed** (the Reviewer's `Auto-fix: yes` section — any severity) versus which go to **triage** with the user (`Auto-fix: no`).

**Medium and Low `Auto-fix: yes` findings: dispatch immediately** to background Fixers — now, in this step, before triage starts, so they edit while the user reads. Do not ask the user about these; the Reviewer pre-classified them as single-path fixes that restore evident intent without a product, contract, or data decision. They appear only in the final recap, marked `auto-fixed`.

**Critical and High `Auto-fix: yes` findings: one confirm, then dispatch.** These edit real behavior without per-finding sign-off, so gate them with a single `AskUserQuestion` (only if there is at least one): *"Apply these N Critical/High auto-fixes?"* with options **Apply all (Recommended)** / **Pick which to hold back** / **Hold all back to triage**. If the user picks, present them via `multiSelect: true` in batches of 4 (`#N [Severity] file:line — issue`); every held-back finding joins the Step 4 triage queue as a normal `Auto-fix: no` finding. Dispatch the rest immediately after the answer. Spawn Critical/High fixers with the `Agent` tool's `model: "opus"` override — the Fixer's default Sonnet/low-effort profile is tuned for hygiene, not for behavior fixes with tests.

Every auto-fixer goes through the same unified per-file queue as triage fixers (see Step 4 concurrency), locking **all** files the Reviewer listed in the finding's footprint plus the test file it will touch.

**A background auto-fixer that reports back it couldn't cleanly apply** (ambiguous, line/file mismatch, or the fix would change behavior beyond the finding's intent) **falls back into manual triage** — fold it into the Step 4 queue as a normal finding rather than letting it silently vanish.

## Step 4 — Triage one finding at a time, fix in the background

*Fix mode only.*

If the Reviewer reported no issues, relay its one-line all-clear and stop — there's nothing to triage.

Otherwise triage every **`Auto-fix: no`** finding — **all of them, uncapped, at any severity** — via `AskUserQuestion`, **one finding per call** (never batch), in severity order. `Auto-fix: yes` findings are **not** triaged — they were dispatched in Step 3. Held-back Critical/High auto-fixes and any auto-fixer that fell back (Step 3) are triaged here too. The fix for the finding just decided runs in the background while the user reads the next one.

**Keep the hot path empty.** The lag the user feels is the gap between answering finding N and seeing finding N+1 — so do *nothing slow* in that gap. No brief files, no context-gathering reads, no prose. The only work between the answer and the next question is one background-fixer spawn with an inline prompt. Everything else (reading the file, understanding surroundings) is the fixer's job, done in the background while the user reads N+1.

**The pipeline.** When the user picks **Fix** (or **Fix (option N)**) for finding N, issue **two tool calls in the same turn**:
1. An `Agent` call with `run_in_background: true` whose prompt is the inline fixer brief (see below) — returns immediately; do **not** wait for it.
2. The `AskUserQuestion` for finding N+1.

So fixer N edits while the user decides N+1. Never block on a fixer before asking the next question. **Ignore** defers the finding and asks the next immediately. **Explain** and **Chat** have no fix to dispatch, so the pipeline pauses: write the explanation or reply as your **final message and end the turn** — do not call `AskUserQuestion` in that same turn, or the text is lost behind the next question (focus mode shows only the last message). When the user answers, act on their decision if they gave one ("fix", "ignore", "option 2"); otherwise re-ask the *same* finding.

**Concurrency safety.** Background fixers share one working directory, so two editing the same file will clobber each other. Keep **one unified per-file queue spanning both the Step 3 auto-fixers and the Step 4 triage fixers** — they run against the same working dir, so a triage fixer must never edit a file an auto-fixer is still touching, and vice versa. Map each finding to **all** its footprint files (the Reviewer lists them; add the likely test file), and never run two fixers on the same file at once. If a file is already being fixed, enqueue the new fixer instead of dispatching it — then ask the next question immediately (never make the user wait). On each fixer-completion notification, dispatch the next queued fixer for that file. Only disjoint-file fixers run concurrently. Since auto-fixers are dispatched first, you already know roughly which files are in flight; if the user picks **Fix** on a triage finding for a file an auto-fixer still holds, enqueue it (small, rare wait) rather than clobbering.

**Dispatching a fixer.** Spawn the `Agent` tool, `subagent_type: "nebster:fixer"`, `run_in_background: true`. The Fixer agent already carries all the standing instructions (read the file itself, stay in scope, report in one line), so the prompt is just the finding data you already have from the Reviewer's report — keep it minimal so there's almost nothing to generate before the next question:
- The finding: number, severity, file(s), line, the issue, the recommended fix (and which option, if several) — quote the Reviewer's lines, don't re-derive them. Severity matters: the Fixer adds a covering test for Medium and above.
- Any decision from an Explain/Chat exchange on this finding — one line, only if it happened.

That's it. No scope boilerplate, no instructions on how to work — those live in the Fixer agent.

**Options per finding.** `AskUserQuestion` allows **at most 4 options** (a fifth, "Other", is always added automatically — do not spend a slot on it). Put the recommended action first and label it `(Recommended)` — for critical/warning findings that's **Fix**.

**Every option gets a one-line, human-readable `description`** — what happens if picked, its trade-off, in plain words (e.g. *"Return `$model->reference()` for tickets; leave sessionKey() untouched so existing sessions keep their id"*). **Never set the `preview` field** on triage options: a preview switches the UI to a side-by-side code box and hides the descriptions. Code belongs in Explain, not in the option list.

**Explain and Ignore are mandatory — they must appear in every finding's question and may never be dropped to make room.** This is the whole point of triage: the user must always be able to understand a finding before deciding, and always be able to decline it. If you are over the 4-slot limit, drop or fold *other* options (see below) — never Explain, never Ignore.

The four options, in order:
- **Fix** — apply the recommended fix (dispatched to a background fixer). *(Recommended for critical/warning.)*
- **Explain** — one-shot deep dive into root cause, data flow, blast radius, delivered as the final message of the turn (**end the turn; no `AskUserQuestion` after it**). Close with one line: *reply fix / ignore, or say "ask again" to see the options.* On the next user message, act on the decision or re-ask the *same* finding with the same options. **Always present.**
- **Chat** — open-ended discussion; reply, let the user respond, continue until they signal a decision ("fix it" / "ignore" / "option 2"), then act.
- **Ignore** — leave as-is; capture in the final summary so it isn't lost. **Always present.**

**When the Reviewer gave multiple fix paths**, the slots are Fix (option 1), Fix (option 2), Explain, Ignore — name each fix path by its trade-off (e.g. "Fix server-side copy" vs. "Surface failure with toast"). Chat then drops out of the explicit list (it stays reachable via "Other", and any option can lead into discussion). Explain and Ignore still keep their slots. If the Reviewer offered 3+ fix paths, keep only the top two as explicit Fix options and fold the rest into "Other" (mention them by name in the question text so they're not hidden, and they remain reachable via Chat) — Explain and Ignore never lose their slots regardless of how many fix paths exist.

Go straight to the first finding — do not ask whether to triage. Each option is a concrete action, never a plan-approval meta-question.

**Closing out.** After the last finding is decided and dispatched, wait for all in-flight fixers to report, then:
1. **Verify with scoped tests.** Run only the tests covering the changed code — every test file the fixers added or updated, plus the touched classes' existing test files — never the whole suite. Do **not** run Larastan / ESLint / Pint / Prettier — the user runs those manually before the PR. If a test fails because of a fix, surface it and re-dispatch that fixer with the failure, or hand it back to the user.
2. **Handle failed or partial fixes.** For any finding a fixer couldn't fully apply — especially blocking (critical/warning) ones — surface it prominently, don't bury it in the table. Offer to re-dispatch it with more context or a higher-effort Opus Fixer, or hand it back to the user.
3. **Summarize.** End with a single status table — columns `#`, `Severity`, `Status`, `Summary` — marking each finding **fixed / auto-fixed / ignored / deferred / failed**, with each fixer's one-line summary (including the test it added) and the scoped-test result. Order it Critical → Low. `auto-fixed` = applied in Step 3 without per-finding triage; keep it distinct from user-chosen `fixed` and keep the severity column so Critical/High auto-fixes are the first thing to spot-check.

## Do not

- Do not produce the review yourself — always delegate to the Reviewer.
- Do not skip reading `CLAUDE.md` before delegating.
- Do not substitute another subagent for the **Reviewer** in Step 2 or the **Fixer** in Step 4. If either is unavailable, stop and tell the user the `nebster` plugin's agents aren't loading — they are defined in `${CLAUDE_PLUGIN_ROOT}/agents/`; have them check the plugin's install/enabled status via `/plugin` and try `/reload-plugins`.
- Do not use `preview` on any triage option — plain-text `description` only.
- Do not follow an **Explain** or **Chat** reply with `AskUserQuestion` in the same turn — end the turn so the explanation stays visible.
- Do not omit **Explain** or **Ignore** from any finding's `AskUserQuestion`, and do not batch findings to save option slots. If you can't fit everything in 4 options, drop Chat (it stays reachable via "Other") — never Explain or Ignore.
- **In report-only mode, do not edit a single file** — no fixers, no "while I'm here" cleanups, no commits, no pushes, and never post to the PR without explicit per-finding selection and a confirmed payload.
