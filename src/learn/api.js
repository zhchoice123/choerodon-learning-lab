// 本地学习接口的前端客户端（契约：docs/workspace/CONTRACT.md 第 4、5 节）
// 接口只在 yarn start 时由 dev server 提供；其他环境统一抛出 code 为 UNAVAILABLE 的错误。
const BASE_URL = '/__learn/api';
const UNAVAILABLE_MESSAGE = '本地学习接口不可用，请用 yarn start 启动项目后使用在线编辑';

export class LearnApiError extends Error {
  constructor({ status = 0, code = 'UNAVAILABLE', message = UNAVAILABLE_MESSAGE, line, column } = {}) {
    super(message);
    this.name = 'LearnApiError';
    this.status = status;
    this.code = code;
    this.line = line;
    this.column = column;
  }
}

async function request(method, path, body) {
  if (typeof fetch !== 'function') throw new LearnApiError();
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new LearnApiError();
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  // 非 JSON（例如静态服务器返回的 index.html）或 503（接口未实现）都视为接口不可用
  if (data === null || response.status === 503) throw new LearnApiError({ status: response.status });
  if (!response.ok) {
    throw new LearnApiError({
      status: response.status,
      code: data.error || 'UNKNOWN',
      message: data.message || `请求失败（${response.status}）`,
      line: data.line,
      column: data.column,
    });
  }
  return data;
}

const unitPath = (number) => `/units/${encodeURIComponent(number)}`;

export const learnApi = {
  async listUnits() {
    const data = await request('GET', '/units');
    return data.units;
  },
  getExercise: (number) => request('GET', `${unitPath(number)}/exercise`),
  saveExercise: (number, code) => request('PUT', `${unitPath(number)}/exercise`, { code }),
  resetExercise: (number, difficulty) => request('POST', `${unitPath(number)}/reset`, { difficulty }),
  getExample: (number) => request('GET', `${unitPath(number)}/example`),
  getReadme: (number) => request('GET', `${unitPath(number)}/readme`),
};

// 'unit-05' → '05'
export function unitNumberFromKey(key) {
  const match = /^unit-(\d{2})$/.exec(key || '');
  if (!match) throw new Error(`无效的单元 key：${key}`);
  return match[1];
}
