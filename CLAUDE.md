# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo stores reusable Claude Code configuration files (settings, agents, bashrc) meant to be copied into target projects. It is **not** an application — there is no build, test, or lint step.

## Repository Structure

Two configuration profiles, each under `<profile>/USER_NAME/.claude/`:

- **`general/`** — Generic profile for any project (plain Tailwind frontend agents)
- **`vilt_stack/`** — Profile for Laravel + Vue 3 + Inertia.js + Tailwind CSS (VILT) projects; designer and frontend agents are VILT-specific, all other files are identical to `general/`

Each profile contains:
- `.claude/settings.json` — Permissions (shell commands, tools) and marketplace config
- `.claude/agents/` — Five specialized subagents: Backend (PHP/Laravel), Designer (UI/UX), Frontend (Tailwind or VILT), Reviewer (code quality), SEO (on-page SEO)
- `.bashrc` — Shell functions exposing Laravel Herd's PHP 8.5, Composer, Node, and npm to Claude's bash environment

## How to Use

1. Copy the appropriate profile's `USER_NAME/` contents into your project's user-level Claude config directory
2. The `.bashrc` file goes in the user's home directory (or the location Claude sources on startup)
3. Replace `USER_NAME` in the path with the actual system username

## Key Details

- **Laravel Herd**: The `.bashrc` wrappers point to Herd-managed binaries (`php85`, `composer.phar`, Node v25.2.0). Update paths if Herd versions change.
- **Permissions default mode**: `acceptEdits` — Claude can edit files without confirmation but needs approval for other tool calls not in the allow list.
- **Agent cooperation model**: The five agents follow a defined workflow — Designer designs first, Frontend implements, Backend provides data, SEO advises on markup, Reviewer approves before shipping.

## Editing Guidelines

- When modifying agents shared between profiles (`backend.md`, `reviewer.md`, `seo.md`), apply the same change to both `general/` and `vilt_stack/`.
- When modifying `designer.md` or `frontend.md`, the two profiles intentionally differ — general uses plain Tailwind, VILT uses Vue 3 + Inertia.js + Tailwind.
- `settings.json` is currently identical across profiles. Keep them in sync unless a profile needs different permissions.
