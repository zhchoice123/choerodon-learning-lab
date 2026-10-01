// 【练习】01-6 observer：点击行、勾选时，状态栏一直不变。让它自动刷新。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 1 时会用到
import { observer } from 'mobx-react';

function createEmployeeDataSet() {
  return new DataSet({
    data: [
      { id: 1, name: '宋江', active: true },
      { id: 2, name: '张飞', active: true },
      { id: 4, name: '廉颇', active: false },
    ],
    primaryKey: 'id',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

// TODO 1：让这个组件在 DataSet 变化时自动刷新
const EmployeeStatus = ({ dataSet }) => (
  // TODO 2：显示「当前行：姓名 ｜ 已选 N 人」，没有当前行时显示「无」
  <div className="status-bar">当前行：? ｜ 已选 ? 人</div>
);

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <div>
      <EmployeeStatus dataSet={employeeDS} />
      <Table dataSet={employeeDS} columns={[{ name: 'name' }, { name: 'active' }]} />
    </div>
  );
}
