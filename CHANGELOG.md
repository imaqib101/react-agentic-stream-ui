# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- `LICENSE`, `CONTRIBUTING.md`, `.editorconfig`, `.nvmrc`.
- `exports` map, `engines`, `sideEffects` and `prepublishOnly` in `package.json`.

## [1.0.0]

### Added
- `useAgenticStream` hook: reduces streamed chunks (tokens, thoughts, tool calls, step finishes, errors) into state.
- `ToolCallCard`, `ToolCallTimeline`, `HumanInTheLoopApproval`, `AgentReasoningAccordion` and `TokenStreamRenderer` components.
- `stepCount` tracking via `step_finish` chunks.
