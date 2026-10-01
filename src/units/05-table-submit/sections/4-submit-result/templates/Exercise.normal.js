// 【练习】05-4 提交结果：现在不管成功还是校验失败，都提示「保存成功」。按 submit() 的返回值分别提示。
// 接口：/mock/s/05-4/employees。编码 EMP 加 3 位数字，年龄 18～60
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/05-4/employees', method: 'GET' },
      create: { url: '/mock/s/05-4/employees/create', method: 'POST' },
      update: { url: '/mock/s/05-4/employees/update', method: 'POST' },
    },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码', required: true, pattern: /^EMP\d{3}$/ },
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', required: true, min: 18, max: 60, defaultValue: 18 },
      { name: 'active', type: 'boolean', label: '在职', defaultValue: false },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未提交');

  const save = async () => {
    // TODO 1：没有修改时提示「没有待保存的修改」，不发请求
    // TODO 2：按 submit() 的返回值分别提示：校验未通过 / 保存成功 / 没有发出请求；请求失败时提示「保存失败：原因」
    await employeeDS.submit();
    setResult('保存成功');
  };

  const columns = [
    { name: 'id', width: 90 },
    { name: 'code', width: 140, editor: true },
    { name: 'name', width: 140, editor: true },
    { name: 'age', width: 100, editor: true },
  ];
  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => employeeDS.create({}, 0)}>新增</Button>
        <Button onClick={save}>保存</Button>
      </div>
      <Table dataSet={employeeDS} columns={columns} />
      <p role="status">{result}</p>
    </div>
  );
}
