// 【练习】04-1 Form 绑定 dataSet：点击员工表格的行，右边表单编辑这名员工。
// 接口：GET /mock/s/04-1/employees
import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 1 时会用到 Form 和控件
import { DataSet, Table, Form, TextField, NumberField } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/04-1/employees', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }]} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* TODO 1：用 Form 编辑当前员工的编码、姓名、年龄（一列布局） */}
      </div>
    </div>
  );
}
