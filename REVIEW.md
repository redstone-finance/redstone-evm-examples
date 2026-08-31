# Code Review Guidance

This document outlines the guidelines for reviewing code in this repository.

## When to Skip Review

Do not review pull requests if:
- The changes are isolated to `monitoring-manifests`.
- The pull request description includes the text: "AI, PLEASE DO NOT REVIEW THIS PR".

## Review Goals

Your primary objective is to identify concrete, actionable problems, including:
- Bugs
- Security vulnerabilities
- Potential data inconsistencies
- Incorrect behavior

**Do not** comment on:
- Coding style, architectural preferences, naming conventions, or documentation unless they actively obscure a bug. (Assume linters and formatters handle standard style issues).
- Improvements framed as "consider doing X" or "this might be better" unless a concrete issue is provable from the diff.

## Scope and Constraints

- Base your review strictly on the provided diff. Do not make assumptions about external files, systems, or runtime environments.
- Limit your comments only to the lines modified in the pull request.
- Avoid leaving comments if you have low confidence in the issue. It is better to leave no comments than to add noise.
- Do not speculate or guess the author's intent.

## Comment Structure

When you leave a comment, follow this exact format:

1. **Quote**: Provide the exact line(s) from the diff.
2. **Issue**: Explain the problem clearly in a single sentence.
3. **Fix**: Offer a concrete fix or a safer alternative in 1-3 sentences.
4. **Severity**: Categorize the issue as 🔴 `blocker`, 🟠 `major`, or 🟡 `minor`.
5. **Confidence**: Indicate your confidence level as ✅ `high` or ⚠️ `medium`. (Never post a comment with `low` confidence).
