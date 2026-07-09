# Global Settings & Agents for Claude

## Purpose

This repo stores reusable Claude Code configuration files (agents and slash commands) meant to be copied into the user's home directory (`~/.claude`) so they apply globally across all projects.

## Repository Structure

Configuration lives under `USER_NAME/` (replace `USER_NAME` with the real system username when installing):

- `.claude/agents/` — specialized subagents:
  - **Reviewer** — senior code reviewer / quality gatekeeper; audits security, bugs, tech debt, performance, testing, and accessibility before production.
  - **Fixer** — applies a single scoped fix from a review finding; edits only the named file, no unrelated changes, reports in one line. Spawned in parallel by `/review`.
  - **SEO** — on-page and technical SEO.
- `.claude/commands/` — custom slash commands:
  - **`/review`** — overrides the built-in `/review`. Dispatches the change set to the Reviewer subagent, relays findings, then triages them interactively one finding at a time, applying accepted fixes via background fixer agents.
  - **`/qa`** — code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite.
