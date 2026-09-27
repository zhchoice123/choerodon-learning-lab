# Repository Guidelines

## Project Structure & Module Organization

- `src/units/`: numbered lessons (`08-modal/`) containing metadata, `Example.js`, `Exercise.js`, README, and easy/normal/hard templates; `index.js` registers lessons.
- `src/learn/`: workspace routing, API client, home, and editor components.
- `src/playground/`: learner-owned experiments; preserve existing work.
- `mock/`: CommonJS mock routes and seeds. `devtools/`: development-only learning APIs and Monaco assets. `src/setupProxy.js` registers both.
- `scripts/`: reset tooling and installation patches. `public/`: static assets. `docs/`: verification records and workspace task contracts.

## Build, Test, and Development Commands

Use Node 20.18-compatible code and Yarn Classic 1.22.22.

- `yarn install --frozen-lockfile`: install locked dependencies.
- `yarn start`: serve locally at `http://localhost:3000`; restart after mock or development middleware changes.
- `CI=true yarn test --watchAll=false`: run frontend tests; append `--runInBand` for serial execution.
- `node --test scripts/unit.test.js devtools/`: run tooling and development-server tests.
- `CI=true yarn build`: produce the production bundle in `build/`.
- `yarn unit:list`: inspect lesson/template status.
- `yarn unit:reset 2 hard`: back up and overwrite that exercise; only run when requested.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, semicolons, function components, and PascalCase component filenames. Keep lesson comments and UI copy Chinese. Use CommonJS for Node tooling. CRA supplies ESLint through `react-app` and `react-app/jest`; no separate formatter is configured.

Keep Choerodon UI 1.6.7, React 16.14, MobX 4.15.7, mobx-react 6.1.5, and react-scripts 5.0.1 unchanged. Preserve `ReactDOM.render` without StrictMode. Create component DataSets with `useMemo`; import Pro components from `choerodon-ui/pro`. Use `dataKey: 'content'`, `totalKey: 'totalElements'`, and pagination `page` (one-based)/`pagesize`. Table columns use `editor`; field types and labels belong in DataSet fields.

## Testing Guidelines

Use Jest/React Testing Library for `src/**/*.test.js` and `node:test` for tooling. No numeric coverage threshold is configured. Cover observable success, failure, and rollback behavior. Test filesystem writes in temporary projects, never real exercises. Keep unfinished templates renderable and new exercises byte-identical to normal templates. Record actual commands, results, and unverified browser behavior in `docs/`.

## Commit & Pull Request Guidelines

Follow recent imperative subjects, such as `Add unit 08 modal and drawer lessons`. Keep commits focused. PR descriptions should explain behavior, scope, verification, relevant issues, and screenshots for UI changes.

## Contributor Boundaries

Start with `git status` and `git log -1`; preserve unrelated changes. Workspace tasks must follow `docs/workspace/README.md`, `CONTRACT.md`, and their task-specific file ownership. Verify protected-file SHA-256 hashes where required. Preserve learner TODOs; provide hints rather than completed exercise answers.
