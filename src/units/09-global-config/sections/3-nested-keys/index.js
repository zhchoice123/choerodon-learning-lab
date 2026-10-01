import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-09-3',
  title: '09-3 全局 dataKey / totalKey：a.b 路径',
  doc: 'src/units/09-global-config/sections/3-nested-keys/README.md',
  point: 'dataKey / totalKey 支持用点连接的路径，逐层取出嵌套响应里的列表和总数',
  hints: [
    '在 Network 里点开响应，从最外层开始，一层一层找到列表数组。',
    '路径用点连接：外层键.内层键。v2 的列表是 data 下面的 items。',
    '总数同理：data 下面的 total。两项都写对，分页器才会显示 45 条。',
  ],
  exclusivePreview: true,
  Example,
  Exercise,
};

export default lesson;
