// 【练习·挑战】对接「旧系统 v2」的员工列表：只给需求，完成 5 个 TODO，其中 TODO 5 是样例没有覆盖的新需求。
// 验收标准和挑战档额外需求见 README。
//
// 旧系统 v2 的约定：
//   请求 GET /mock/unit-09/v2/employees?current=1&limit=5[&orderBy=age:desc]   （current 从 1 开始）
//   响应 { code: 0, data: { items: [...], total: 45 } }
//   值集 GET /mock/unit-09/v2/lookups/EMP.SEX → { code: 0, data: { items: [{ value, meaning }] } }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import LessonConfigScope from './LessonConfigScope';

// TODO 1：用全局配置完成 v2 的分页参数、响应解析和值集，「性别」显示「男 / 女」
const legacyV2Config = {};

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    // TODO 2：检查 DataSet 上的每一项配置是否仍然需要
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-09/v2/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

// TODO 3：状态栏：共 X 人 ｜ 第 n/m 页 ｜ 当前语言，随数据和语言自动刷新
// TODO 4：提供中文 / 英文切换按钮
// TODO 5（挑战）：「年龄」列可以点击排序，排序在服务端完成：
//                 请求带上 orderBy=age:asc 或 orderBy=age:desc，取消排序时不带 orderBy
const EmployeeList = observer(function EmployeeList() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const columns = [
    { name: 'code', width: 130 },
    { name: 'name', width: 110 },
    { name: 'sex', width: 80 },
    { name: 'age', width: 80 },
    { name: 'active', width: 80 },
  ];
  return <Table dataSet={employeeDS} columns={columns} />;
});

export default function Exercise() {
  return (
    <LessonConfigScope config={legacyV2Config}>
      <EmployeeList />
    </LessonConfigScope>
  );
}
