# RentHub Backend — Agent rules

## Stack and layout
- Node.js, Express 5, ES modules (always use the `.js` extension in imports), Sequelize 6 with MySQL, Joi, multer, sharp, socket.io.
- Feature code lives in `src/modules/<feature>/` (`*.routes.js`, `*.controller.js`, `*.schema.js`, `*.middleware.js`). Shared code lives in `src/shared/`, configuration in `config/`.
- Follow the patterns used in neighbouring files. Do not introduce new folders, patterns or libraries unless the task says so.

## Scope rules
- Do only what the task asks. No refactoring, renaming, reformatting or "improvements" outside the lines you must change.
- Do not add or upgrade dependencies unless the task lists them.
- Never commit. Never print, log or write real secrets. Never edit `.env` files that hold real values.
- Keep existing API responses backward compatible unless the task explicitly says otherwise.
- Database changes: read how `src/database/migrations/migration.js` works first and follow the same approach. Never drop or rewrite existing data.

## Stop rules
- If the task is ambiguous, a file named in the task does not exist, or a check fails twice, stop and report the problem. Do not improvise a workaround.

## Verification
- After each task, run the checks listed in the task. If none are listed, run `node --check` on every changed `.js` file.
- Report the commands you ran and their real output. Never claim a check passed without running it.

## Commit protocol
At the end of every task, do NOT commit. Write `.commit-msg.txt` at the repo root, built from `git diff` (and `git status` for new files), using this template:

```
<type>(<scope>): <imperative subject, 72 characters max>

## Summary
One or two sentences: what changed and why.

## Changes
- <path> — what changed and why

## Behavior impact
What changes for API clients. Write "None" if nothing.

## Config / migration
New env variables, migrations, manual steps. Write "None" if nothing.

## How to verify
Exact commands or requests, with the expected result.

## Notes
Risks, follow-ups, deviations from the task.
```

Allowed types: feat, fix, refactor, perf, docs, test, chore. Write the message in English.