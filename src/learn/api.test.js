import { LearnApiError, learnApi, unitNumberFromKey } from './api';

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

afterEach(() => {
  delete global.fetch;
});

test('listUnits returns the units array', async () => {
  global.fetch = jest.fn(() => Promise.resolve(jsonResponse(200, { units: [{ number: '01' }] })));
  await expect(learnApi.listUnits()).resolves.toEqual([{ number: '01' }]);
  expect(global.fetch).toHaveBeenCalledWith('/__learn/api/units', expect.objectContaining({ method: 'GET' }));
});

test('saveExercise sends the code as JSON', async () => {
  global.fetch = jest.fn(() => Promise.resolve(jsonResponse(200, { saved: true })));
  await learnApi.saveExercise('05', 'const a = 1;');
  const [url, init] = global.fetch.mock.calls[0];
  expect(url).toBe('/__learn/api/units/05/exercise');
  expect(init.method).toBe('PUT');
  expect(init.headers['Content-Type']).toBe('application/json');
  expect(JSON.parse(init.body)).toEqual({ code: 'const a = 1;' });
});

test('resetExercise posts the difficulty', async () => {
  global.fetch = jest.fn(() => Promise.resolve(jsonResponse(200, { matched: 'hard' })));
  await learnApi.resetExercise('02', 'hard');
  const [url, init] = global.fetch.mock.calls[0];
  expect(url).toBe('/__learn/api/units/02/reset');
  expect(JSON.parse(init.body)).toEqual({ difficulty: 'hard' });
});

test('a syntax error keeps its code, line and column', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(422, { error: 'SYNTAX_ERROR', message: 'Unexpected token', line: 12, column: 5 })),
  );
  const error = await learnApi.saveExercise('05', 'const = ;').catch((e) => e);
  expect(error).toBeInstanceOf(LearnApiError);
  expect(error).toMatchObject({ status: 422, code: 'SYNTAX_ERROR', message: 'Unexpected token', line: 12, column: 5 });
});

test.each([
  ['no fetch at all', () => undefined],
  ['a network failure', () => jest.fn(() => Promise.reject(new TypeError('Failed to fetch')))],
  ['a non-JSON body (static server)', () => jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('bad')) }))],
  ['the 503 stub', () => jest.fn(() => Promise.resolve(jsonResponse(503, { error: 'NOT_IMPLEMENTED', message: 'stub' })))],
])('%s is reported as UNAVAILABLE', async (label, makeFetch) => {
  global.fetch = makeFetch();
  const error = await learnApi.listUnits().catch((e) => e);
  expect(error).toBeInstanceOf(LearnApiError);
  expect(error.code).toBe('UNAVAILABLE');
});

test('unitNumberFromKey', () => {
  expect(unitNumberFromKey('unit-05')).toBe('05');
  expect(() => unitNumberFromKey('unit-5')).toThrow();
});
