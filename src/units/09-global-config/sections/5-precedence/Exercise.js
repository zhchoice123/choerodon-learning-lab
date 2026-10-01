// 【练习】09-5 优先级：全局配置已经写对了，员工列表却只有一行空白记录。找出原因并修好。
// 旧系统 v2：GET /mock/s/09-5/v2/employees → { code: 0, data: { items: [...], total: 45 } }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  generatePageQuery: ({ page, pageSize }) => ({ current: page, limit: pageSize }),
  dataKey: 'data.items',
  totalKey: 'data.total',
};

function EmployeeList() {
  const employeeDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-5/v2/employees', method: 'GET' } },
        // TODO 1：这里有隐患：这两行是从前面的课程复制来的。想一想它们和全局配置谁优先，然后修正
        dataKey: 'content',
        totalKey: 'totalElements',
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
