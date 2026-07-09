# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a **Claude Code plugin marketplace**. It ships one plugin (`nebster`) — a set of specialized subagents and slash commands — that users install once with `/plugin` and — with auto-update enabled — receive updates from GitHub on startup. It is **not** an application; there is no build, test, or lint step.

## Working in this repo

- **Never run git actions unless explicitly asked.** Do not `commit`, `add`, `push`, `branch`, `checkout`, `reset`, or any other git command on your own. Make the file edits and stop; the user handles all git operations themselves.
- Edits are config/prose, not code — there is nothing to build, run, or test. Keep changes tight.
- **Never add a `version` field to `.claude-plugin/plugin.json`.** Omitting it makes every commit ship as a new version (git SHA), which is what keeps installs auto-updating. A pinned version would freeze users at that release.

## Repository Structure

This repo is both the marketplace and the plugin (plugin lives at the repo root):

- `.claude-plugin/marketplace.json` — marketplace manifest; lists the `nebster` plugin with `source: "./"`.
- `.claude-plugin/plugin.json` — plugin manifest (name, description, author, repo). No `version` field, on purpose.
- `agents/` — specialized subagents:
  - **Reviewer** — senior code reviewer / quality gatekeeper; audits security, bugs, tech debt, performance, testing, and accessibility before production.
  - **Fixer** — applies a single scoped fix from a review finding; edits only the named file, no unrelated changes, reports in one line. Spawned in parallel by the review command.
  - **SEO** — on-page and technical SEO.
- `commands/` — custom slash commands (namespaced under the plugin, e.g. `/nebster:review`):
  - **`/nebster:review`** — dispatches the change set to the Reviewer subagent, relays findings, then triages them interactively one finding at a time, applying accepted fixes via background Fixer agents.
  - **`/nebster:qa`** — code-style and static-analysis gate. Runs Larastan, Pint, ESLint, and Prettier and fixes every issue they surface. Does **not** run the test suite.

## Key Details

- **Command namespacing**: plugin commands are always prefixed with the plugin name (`/nebster:review`), so they can no longer shadow the built-in `/review`.
- **Renaming**: the plugin or marketplace name can be changed later; add a `renames` map to `marketplace.json` (`{"old-name": "new-name"}`) so existing installs migrate automatically.
- **Framework-agnostic frontend**: the Reviewer targets a Laravel backend but stays agnostic across frontend stacks (Vue, Livewire, React) — don't reintroduce stack-specific assumptions into its checklist.
