# /project:fix-issue — Fix a Reported Issue

Diagnose and fix a bug or issue reported by the user.

## Arguments

$ARGUMENTS — Description of the issue, optionally with a file path or error message.

## Steps

1. Reproduce the problem: read the relevant files, trace the data flow, identify the root cause.
2. For **frontend issues**: check the component, its NgRx selectors/effects, and any related services or templates.
3. For **backend issues**: check the controller, service, schema, and any DTOs in `@sm/shared`.
4. For **build/compile errors**: read the full error, check imports, Nx dependency graph, and tsconfig paths.
5. Apply the minimal fix that resolves the issue without side effects.
6. Run `nx lint <project>` on the affected project to verify no lint regressions.
7. Summarize: what was wrong, why, and what was changed.

Do not refactor surrounding code. Fix only what is broken.
