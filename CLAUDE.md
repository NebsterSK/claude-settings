# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo stores reusable Claude Code configuration files (settings, agents, bin wrappers) meant to be copied into target projects. It is **not** an application — there is no build, test, or lint step.

## Repository Structure

Configuration lives under `USER_NAME/`:

- `.claude/settings.json` — Marketplace config and update channel settings
- `.claude/agents/` — Four specialized subagents: Developer (full-stack VILT), Designer (UI/UX), Reviewer (code quality), SEO (on-page SEO)
- `bin/` — Cross-platform wrapper scripts (shell + `.cmd`) for Laravel Herd's PHP 8.5, Composer, Node, and npm

## How to Use

1. Copy the appropriate profile's `USER_NAME/` contents into your project's user-level Claude config directory
2. Place `bin/` wrappers on the system PATH (or the location Claude sources on startup)
3. Replace `USER_NAME` in the path with the actual system username

## Key Details

- **Laravel Herd**: The `bin/` wrappers delegate to Herd-managed binaries (`php85`, `composer.phar`, Node v25.2.0). Update paths inside the wrappers if Herd versions change.
- **Agent cooperation model**: The four agents follow a defined workflow — Designer designs first, Developer implements end-to-end (Laravel + Vue + Inertia + Tailwind), SEO advises on markup, Reviewer approves before shipping.
