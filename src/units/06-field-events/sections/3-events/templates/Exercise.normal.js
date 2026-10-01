// 【练习】06-3 DataSet 事件：统计员工列表的事件次数。
// 接口：GET /mock/s/06-3/employees
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createEmployeeDataSet() {
  // eslint-disable-next-line no-unused-vars -- 完成 TODO 1 时会用到
  const count = (dataSet, key) => dataSet.setState(key, (dataSet.getState(key) || 0) + 1);
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 3,
    transport: { read: { url: '/mock/s/06-3/employees', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
    ],
    // TODO 1：注册 load、update、select 三个事件，每次触发用 count 给 loadCount / updateCount / selectCount 加 1
    // TODO 2：update 时，再把「姓名：字段 旧值 → 新值」记到状态 lastUpdate 里
  });
}

const Counter = observer(({ dataSet }) => (
  <div className="status-bar">
    load：{dataSet.getState('loadCount') || 0} ｜ update：{dataSet.getState('updateCount') || 0} ｜
    select：{dataSet.getState('selectCount') || 0} ｜ 最近一次修改：{dataSet.getState('lastUpdate') || '无'}
  </div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <div>
      <Counter dataSet={employeeDS} />
      <Table dataSet={employeeDS} columns={[{ name: 'name' }, { name: 'age', editor: true }]} />
    </div>
  );
}
