import { LearnApiError } from '../api';
import { OFFLINE_MESSAGE, OUTCOMES, startUnit } from './startUnit';

const unit = { key: 'unit-02', title: '02 查询条件', points: [], Example: () => null };
const lockedUnit = { key: 'unit-09', title: '09 全局配置与国际化', points: [] };

function setup({ status, choice = 'cancel', reset = () => Promise.resolve({ backupPath: '.backup/02/Exercise.x.js' }), difficulty = 'hard', target = unit } = {}) {
  const deps = {
    unit: target,
    difficulty,
    status,
    api: { resetExercise: jest.fn(reset) },
    confirmRestart: jest.fn(() => Promise.resolve(choice)),
    notify: { success: jest.fn(), warning: jest.fn(), error: jest.fn() },
    enter: jest.fn(),
  };
  return { deps, run: () => startUnit(deps) };
}

const notStarted = (matched) => ({ state: 'not-started', matched });
const inProgress = { state: 'in-progress', matched: null };

test('not-started with the same difficulty enters directly', async () => {
  const { deps, run } = setup({ status: notStarted('hard') });
  await expect(run()).resolves.toBe(OUTCOMES.ENTERED);
  expect(deps.api.resetExercise).not.toHaveBeenCalled();
  expect(deps.confirmRestart).not.toHaveBeenCalled();
  expect(deps.enter).toHaveBeenCalledWith('unit-02');
});

test('not-started with another difficulty switches the template without asking', async () => {
  const { deps, run } = setup({ status: notStarted('normal') });
  await expect(run()).resolves.toBe(OUTCOMES.SWITCHED);
  expect(deps.confirmRestart).not.toHaveBeenCalled();
  expect(deps.api.resetExercise).toHaveBeenCalledWith('02', 'hard');
  expect(deps.enter).toHaveBeenCalledWith('unit-02');
});

test('in-progress + continue enters without touching the code', async () => {
  const { deps, run } = setup({ status: inProgress, choice: 'continue' });
  await expect(run()).resolves.toBe(OUTCOMES.CONTINUED);
  expect(deps.confirmRestart).toHaveBeenCalledWith({ unit, difficulty: 'hard' });
  expect(deps.api.resetExercise).not.toHaveBeenCalled();
  expect(deps.enter).toHaveBeenCalledWith('unit-02');
});

test('in-progress + restart resets, reports the backup path, then enters', async () => {
  const { deps, run } = setup({ status: inProgress, choice: 'restart' });
  await expect(run()).resolves.toBe(OUTCOMES.RESTARTED);
  expect(deps.api.resetExercise).toHaveBeenCalledWith('02', 'hard');
  expect(deps.notify.success).toHaveBeenCalledWith(expect.stringContaining('.backup/02/Exercise.x.js'));
  expect(deps.enter).toHaveBeenCalledWith('unit-02');
});

test('in-progress + cancel does nothing', async () => {
  const { deps, run } = setup({ status: inProgress, choice: 'cancel' });
  await expect(run()).resolves.toBe(OUTCOMES.CANCELLED);
  expect(deps.api.resetExercise).not.toHaveBeenCalled();
  expect(deps.enter).not.toHaveBeenCalled();
});

test('no status (API unavailable) enters without modifying anything', async () => {
  const { deps, run } = setup({ status: null });
  await expect(run()).resolves.toBe(OUTCOMES.OFFLINE);
  expect(deps.notify.warning).toHaveBeenCalledWith(OFFLINE_MESSAGE);
  expect(deps.api.resetExercise).not.toHaveBeenCalled();
  expect(deps.confirmRestart).not.toHaveBeenCalled();
  expect(deps.enter).toHaveBeenCalledWith('unit-02');
});

test.each([
  ['a unit without Example', { target: lockedUnit, status: notStarted('normal') }],
  ['a unit reported as locked', { status: { state: 'locked', matched: null } }],
])('%s is ignored', async (label, options) => {
  const { deps, run } = setup(options);
  await expect(run()).resolves.toBe(OUTCOMES.LOCKED);
  expect(deps.enter).not.toHaveBeenCalled();
  expect(deps.api.resetExercise).not.toHaveBeenCalled();
});

test('the API disappearing during a reset falls back to entering directly', async () => {
  const { deps, run } = setup({ status: notStarted('normal'), reset: () => Promise.reject(new LearnApiError()) });
  await expect(run()).resolves.toBe(OUTCOMES.OFFLINE);
  expect(deps.notify.warning).toHaveBeenCalledWith(OFFLINE_MESSAGE);
  expect(deps.enter).toHaveBeenCalledWith('unit-02');
});

test.each([
  ['switching a template', { status: notStarted('normal') }],
  ['restarting', { status: inProgress, choice: 'restart' }],
])('a server error while %s stays on the home page', async (label, options) => {
  const failure = new LearnApiError({ status: 409, code: 'UNIT_LOCKED', message: '单元未开放' });
  const { deps, run } = setup({ ...options, reset: () => Promise.reject(failure) });
  await expect(run()).resolves.toBe(OUTCOMES.FAILED);
  expect(deps.notify.error).toHaveBeenCalledWith(expect.stringContaining('单元未开放'));
  expect(deps.enter).not.toHaveBeenCalled();
});
