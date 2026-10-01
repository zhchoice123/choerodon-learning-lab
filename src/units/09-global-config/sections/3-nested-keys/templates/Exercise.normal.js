// 【练习】09-3 全局响应解析：表格只有一行空白记录，分页器 1 条。按 v2 的响应格式修好它。
// 旧系统 v2：GET /mock/s/09-3/v2/employees → { code: 0, data: { items: [...], total: 45 } }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  generatePageQuery: ({ page, pageSize }) => ({ current: page, limit: pageSize }),
  // TODO 1：列表数组在哪个路径？
  // TODO 2：总条数在哪个路径？
};

function EmployeeList() {
  const employeeDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-3/v2/employees', method: 'GET' } },
        fields: [
          { name: 'code', type: 'string', label: '员工编码' },
          { name: 'name', type: 'string', label: '姓名' },
        ],
      }),
    [],
  );
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }]} />;
}

export default function Exercise() {
  return (
    <LessonConfigScope config={config}>
      <EmployeeList />
    </LessonConfigScope>
  );
}
