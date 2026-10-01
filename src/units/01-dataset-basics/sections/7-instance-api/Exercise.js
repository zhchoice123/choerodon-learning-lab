// 【练习】01-7 常用实例成员：完成两个按钮。
// 接口：GET /mock/guide/user（共 45 人）
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/guide/user', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);

  const refresh = () => {
    // TODO 1：重新查询当前页（翻到第 3 页再点，应该仍在第 3 页）
  };

  const showSelected = () => {
    // TODO 2：没有勾选时提示「请先勾选员工」；否则提示选中员工的姓名，以及其中女性（sex 为 'F'）的人数
    message.info('TODO 2 还没完成');
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={refresh}>刷新当前页</Button>
        <Button onClick={showSelected}>查看选中</Button>
      </div>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }, { name: 'sex' }]} />
    </div>
  );
}
