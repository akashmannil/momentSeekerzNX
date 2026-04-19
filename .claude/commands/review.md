# /project:review — Code Review

Review the current branch's changes against `master` for quality, correctness, and adherence to project conventions.

## Steps

1. Run `git diff master...HEAD` to see all changes on this branch.
2. Check each changed file against these criteria:
   - **Nx boundaries**: No cross-scope imports (web<->api). Verify with `nx lint`.
   - **NgRx discipline**: Components dispatch actions, never call services directly for data. No BehaviorSubjects for global state.
   - **NestJS conventions**: Controllers versioned (`v1`), DTOs in `@sm/shared`, schemas use `timestamps: true`.
   - **Styling**: Tailwind utilities preferred. No bright colors, no rounded corners on major elements. Dark theme only.
   - **Security**: No secrets committed, file uploads processed by Sharp, rate limiting on sensitive endpoints.
   - **Types**: No `any` unless explicitly justified. Shared interfaces/enums used consistently.
3. Flag any issues found, grouped by severity (blocking / warning / nit).
4. If clean, confirm the branch is ready for merge.

Output a structured review with file-by-file findings.
