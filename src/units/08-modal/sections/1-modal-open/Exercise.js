// 【练习】08-1 Modal.open：点「抽屉查看」，从右侧滑出抽屉显示当前员工的资料。
// 接口：GET /mock/s/08-1/employees
import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 1 时会用到
import { DataSet, Table, Form, Output, Button, Modal } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/08-1/employees', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'email', type: 'string', label: '邮箱' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);

  const view = () => {
    // TODO 1：用抽屉显示当前员工的编码、姓名、邮箱（只读），标题「员工资料」，只有一个「确定」按钮；没有当前员工时什么都不做
  };

  return (
    <div>
      <Button onClick={view}>抽屉查看</Button>
      <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }]} />
    </div>
  );
}
