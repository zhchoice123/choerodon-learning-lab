// 【练习】09-1 configure 全局配置：员工列表的 DataSet 没写 dataKey / totalKey，现在只有一行空白记录。
// 不改 DataSet，用全局配置修好它。接口：GET /mock/guide/user → { content: [...], totalElements: 45 }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 2 时会用到
import LessonConfigScope from './LessonConfigScope';

// TODO 1：写出全局配置：列表在 content，总数在 totalElements
// eslint-disable-next-line no-unused-vars -- 完成 TODO 2 时会用到
const config = {};

function EmployeeList() {
  const employeeDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/guide/user', method: 'GET' } },
        fields: [{ name: 'name', type: 'string', label: '姓名' }],
      }),
    [],
  );
  return <Table dataSet={employeeDS} columns={[{ name: 'name' }]} />;
}

export default function Exercise() {
  // TODO 2：用 LessonConfigScope 包住员工列表，让配置只在本课生效（参考样例）
  return <EmployeeList />;
}
