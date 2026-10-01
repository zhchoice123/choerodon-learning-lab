// 【练习】09-4 全局值集：「性别」显示的是 M / F，改成显示「男 / 女」。
// v2 值集：GET /mock/s/09-4/v2/lookups/EMP.SEX → { code: 0, data: { items: [{ value, meaning }] } }
//   用 POST 请求会返回 405
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  generatePageQuery: ({ page, pageSize }) => ({ current: page, limit: pageSize }),
  dataKey: 'data.items',
  totalKey: 'data.total',
  // TODO 1：全局值集地址
  // TODO 2：全局值集请求方式
};

function EmployeeList() {
  const employeeDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-4/v2/employees', method: 'GET' } },
        fields: [
          { name: 'name', type: 'string', label: '姓名' },
          // TODO 3：给性别加上值集编码 EMP.SEX
          { name: 'sex', type: 'string', label: '性别' },
        ],
      }),
    [],
  );
  return <Table dataSet={employeeDS} columns={[{ name: 'name' }, { name: 'sex' }]} />;
}

export default function Exercise() {
  return (
    <LessonConfigScope config={config}>
      <EmployeeList />
    </LessonConfigScope>
  );
}
