// 【练习】09-2 generatePageQuery：每页应该 5 条，现在显示 10 条，翻页也不变。修好它。
// 旧系统 v2：GET /mock/s/09-2/v2/employees?current=1&limit=5（current 从 1 开始）
//   缺少分页参数时，后端默认返回第 1 页、每页 10 条
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  // TODO 1：把 DataSet 的分页信息翻译成 v2 的 current 和 limit
  dataKey: 'data.items',
  totalKey: 'data.total',
};

function EmployeeList() {
  const employeeDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-2/v2/employees', method: 'GET' } },
        fields: [{ name: 'name', type: 'string', label: '姓名' }],
      }),
    [],
  );
  return <Table dataSet={employeeDS} columns={[{ name: 'name' }]} />;
}

export default function Exercise() {
  return (
    <LessonConfigScope config={config}>
      <EmployeeList />
    </LessonConfigScope>
  );
}
