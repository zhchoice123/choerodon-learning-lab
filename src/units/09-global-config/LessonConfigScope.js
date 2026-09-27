// 单元 09 的「全局配置作用域」（框架代码，不是练习）。
//
// configure 在 1.6.7 里是整个应用共享的单例（dataset/configure/index.js 的 globalConfig 是模块级 MobX map），
// 没有「作用域」也没有「取消设置」。真实项目里只在入口 src/index.js 调用一次。
// 本项目把所有单元放在同一个页面里，如果单元 09 直接调用 configure，离开后 01～08 也会被改掉。
// 所以这里在进入时应用、离开时精确恢复：
//   - 快照用 getConfig(key)：拿到的是「当前生效值」（自定义值或默认值）
//   - 恢复用 configure(快照, false)：第二个参数为 false 时不做对象合并，按原值整体覆盖
//   - 语言包同理：快照 localeContext.locale，离开时 setLocale 回去
import { useLayoutEffect, useState } from 'react';
import { configure, getConfig } from 'choerodon-ui';
import localeContext from 'choerodon-ui/pro/lib/locale-context';

// 多个作用域可能先后重叠（例如快速切换），按栈管理：
// 第一个作用域进入时记录基线，每次变化都「先恢复基线，再按顺序应用仍然生效的配置」
const active = [];
let baseline = null; // { config: Map<key, value>, locale, numberFormatLanguage }

function reapply() {
  configure(Object.fromEntries(baseline.config), false);
  active.forEach((entry) => configure(entry.config, false));
}

export function enterConfigScope(config) {
  if (!baseline) {
    baseline = { config: new Map(), locale: localeContext.locale, numberFormatLanguage: localeContext.numberFormatLanguage };
  }
  Object.keys(config).forEach((key) => {
    if (!baseline.config.has(key)) baseline.config.set(key, getConfig(key));
  });
  const entry = { config };
  active.push(entry);
  reapply();

  let left = false;
  return function leaveConfigScope() {
    if (left) return;
    left = true;
    active.splice(active.indexOf(entry), 1);
    reapply();
    if (!active.length) {
      localeContext.setLocale(baseline.locale);
      if (baseline.numberFormatLanguage) localeContext.setNumberFormatLanguage(baseline.numberFormatLanguage);
      baseline = null;
    }
  };
}

// 先应用配置、再渲染子组件：子组件里 useMemo 创建的 DataSet 一创建就能读到全局配置
export default function LessonConfigScope({ config, children }) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const leave = enterConfigScope(config);
    setReady(true);
    return leave;
    // 配置只在进入时读取一次；修改配置后保存，预览会重新挂载本组件
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready ? children : null;
}
