import Example from './Example';
import Exercise from './Exercise';
import './unit09.css';

const unit09 = {
  key: 'unit-09',
  title: '09 全局配置与国际化',
  doc: 'src/units/09-global-config/README.md',
  points: [
    'configure 全局配置：作用范围、快照与恢复',
    'generatePageQuery 把分页信息翻译成后端参数',
    '全局 dataKey / totalKey，支持 a.b 路径',
    '全局 lookupUrl / lookupAxiosMethod 统一接入值集',
    'DataSet 自身属性优先于全局配置',
    'localeContext 切换语言包',
  ],
  // 样例和练习各自修改全局配置，同时挂载会互相影响：工作台只挂载当前标签的预览
  exclusivePreview: true,
  Example,
  Exercise,
};

export default unit09;
