// 【样例】01-6 observer：DataSet 是 MobX 可观察对象。
// 点击表格行、勾选，对比两个状态栏：只有 observer 包裹的会自动刷新。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    data: [
      { id: 101, name: '平台管理员' },
      { id: 102, name: '租户管理员' },
      { id: 111, name: '访客' },
    ],
    primaryKey: 'id',
    fields: [{ name: 'name', type: 'string', label: '角色名称' }],
  });
}

function describe(dataSet) {
  return `当前行：${dataSet.current ? dataSet.current.get('name') : '无'} ｜ 已选 ${dataSet.selected.length} 个`;
}

// 普通组件：读取了 DataSet，但 DataSet 变化时不会重新渲染
const PlainStatus = ({ dataSet }) => <div className="status-bar">普通组件：{describe(dataSet)}</div>;

// 知识点：observer 包裹后，组件读取过的可观察属性（current、selected……）一变化就自动重新渲染
const ObservedStatus = observer(({ dataSet }) => <div className="status-bar">observer：{describe(dataSet)}</div>);

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <PlainStatus dataSet={roleDS} />
      <ObservedStatus dataSet={roleDS} />
      <Table dataSet={roleDS} columns={[{ name: 'name' }]} />
    </div>
  );
}
