# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo stores reusable Claude Code configuration files (agents, slash commands, bin wrappers) meant to be copied into target projects. It is **not** an application — there is no build, test, or lint step.

## Working in this repo

- **Never run git actions unless explicitly asked.** Do not `commit`, `add`, `push`, `branch`, `checkout`, `reset`, or any other git command on your own — not even to "save progress" or after finishing a change. Make the file edits and stop; the user handles all git operations themselves and will ask when they want one.
- Edits are config/prose, not code — there is nothing to build, run, or test. Keep changes tight and within the file the user pointed at.

## Repository Structure

Configuration lives under `USER_NAME/` (replace `USER_NAME` with the real system username when installing):

- `.claude/agents/` — specialized subagents:
  - **Reviewer** — senior code reviewer / quality gatekeeper; audits security, bugs, tech debt, performance, testing, and accessibility before production.
  - **SEO** — on-page and technical SEO.
- `.claude/commands/` — custom slash commands:
  - **`/review`** — overrides the built-in `/review`. Dispatches the change set to the Reviewer subagent, relays findings, then triages them interactively one finding at a time, applying accepted fixes via background fixer agents.
- `bin/` — cross-platform wrapper scripts (shell + `.cmd`) for Laravel Herd's PHP, Composer, Node, and npm.

## How to Use

1. Copy the profile's `USER_NAME/` contents into your home directory.
2. Place `bin/` wrappers on the system PATH (or the location Claude sources on startup).
3. Replace `USER_NAME` in the path with the actual system username.

## Key Details

- **Laravel Herd**: the `bin/` wrappers delegate to Herd-managed binaries (PHP, `composer.phar`, Node). Update the paths inside the wrappers if Herd versions change.
- **Framework-agnostic frontend**: the Reviewer targets a Laravel backend but stays agnostic across frontend stacks (Vue, Livewire, React) — don't reintroduce stack-specific assumptions into its checklist.
