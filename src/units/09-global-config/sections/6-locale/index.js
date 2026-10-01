import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-09-6',
  title: '09-6 语言包：localeContext',
  doc: 'src/units/09-global-config/sections/6-locale/README.md',
  point: 'localeContext.setLocale 切换组件库内置文案；它也是全局单例，只影响组件库自己的文字',
  hints: [
    '引入：localeContext 来自 choerodon-ui/pro/lib/locale-context，语言包在它下面的 zh_CN、en_US。',
    '当前语言：localeContext.locale.lang，值是 \'zh_CN\' 或 \'en_US\'。',
    '组件要随语言刷新，就要用 observer 包住；练习里的 EmployeeList 已经包好了。',
  ],
  exclusivePreview: true,
  Example,
  Exercise,
};

export default lesson;
