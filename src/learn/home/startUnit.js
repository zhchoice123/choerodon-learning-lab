// 首页点击难度后的流程（需求：docs/workspace/task-B-home.md 第 2 节）。
// 所有外部依赖都通过参数传入，方便逐条测试。
import { unitNumberFromKey } from '../api';

export const OUTCOMES = {
  LOCKED: 'locked', // 未开放，什么都不做
  ENTERED: 'entered', // 未开始且难度一致，直接进入
  SWITCHED: 'switched', // 未开始但难度不同，切换模板后进入
  CONTINUED: 'continued', // 进行中，选择继续
  RESTARTED: 'restarted', // 进行中，选择重新开始（已备份）
  CANCELLED: 'cancelled', // 进行中，取消
  OFFLINE: 'offline', // 接口不可用，不修改任何东西，直接进入
  FAILED: 'failed', // 接口返回了错误，停留在首页
};

export const OFFLINE_MESSAGE = '本地接口不可用，已直接进入单元';

/**
 * @param {object} options
 * @param {object} options.unit       注册表中的单元（key、title、Example…）
 * @param {string} options.difficulty easy / normal / hard
 * @param {object|null} options.status 接口返回的单元状态；接口不可用或读取失败时为 null
 * @param {object} options.api        { resetExercise(number, difficulty) }
 * @param {Function} options.confirmRestart ({ unit, difficulty }) → Promise<'continue' | 'restart' | 'cancel'>
 * @param {object} options.notify     { success, warning, error }
 * @param {Function} options.enter    (unitKey) → void，进入单元
 */
export async function startUnit({ unit, difficulty, status, api, confirmRestart, notify, enter }) {
  if (!unit.Example || status?.state === 'locked') return OUTCOMES.LOCKED;

  if (!status) {
    notify.warning(OFFLINE_MESSAGE);
    enter(unit.key);
    return OUTCOMES.OFFLINE;
  }

  const number = unitNumberFromKey(unit.key);
  // 重置失败时：接口不可用 → 按离线处理直接进入；其他错误 → 提示并停留
  const reset = async () => {
    try {
      return await api.resetExercise(number, difficulty);
    } catch (error) {
      if (error.code === 'UNAVAILABLE') {
        notify.warning(OFFLINE_MESSAGE);
        enter(unit.key);
        return OUTCOMES.OFFLINE;
      }
      notify.error(`切换难度失败：${error.message}`);
      return OUTCOMES.FAILED;
    }
  };

  if (status.state === 'not-started') {
    if (status.matched === difficulty) {
      enter(unit.key);
      return OUTCOMES.ENTERED;
    }
    // 未开始说明还没有作业，切换模板无需询问
    const result = await reset();
    if (typeof result === 'string') return result;
    enter(unit.key);
    return OUTCOMES.SWITCHED;
  }

  const choice = await confirmRestart({ unit, difficulty });
  if (choice === 'continue') {
    enter(unit.key);
    return OUTCOMES.CONTINUED;
  }
  if (choice !== 'restart') return OUTCOMES.CANCELLED;

  const result = await reset();
  if (typeof result === 'string') return result;
  notify.success(result.backupPath ? `已重新开始，原代码已备份到 ${result.backupPath}` : '已重新开始');
  enter(unit.key);
  return OUTCOMES.RESTARTED;
}
