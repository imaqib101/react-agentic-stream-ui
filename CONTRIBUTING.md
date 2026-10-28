# Contributing

Thanks for your interest in improving `@imaqib101/react-agentic-stream-ui`.

## Setup

Use Node 18 or newer (`.nvmrc` pins the version used in CI).

```bash
npm ci
```

## Before opening a pull request

Run all checks locally:

```bash
npm run typecheck
npm test
npm run build
```

- Add or update tests in `test/` for any behavior change.
- Keep commits small and use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `ci:`).
- Add a line under `## [Unreleased]` in `CHANGELOG.md` for user-visible changes.

## Reporting bugs

Open an issue with a minimal reproduction: the chunk sequence you fed to `useAgenticStream`, the expected state and the actual state.
