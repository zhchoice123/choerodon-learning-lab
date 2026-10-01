// 【练习】05-5 提交失败：把姓名改成 FAIL 保存，提示里没有原因，而且改动全丢了。修好它。
// 接口：/mock/s/05-5/employees。姓名填 FAIL 会被后端固定拒绝（400）
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
      read: { url: '/mock/s/05-5/employees', method: 'GET' },
      create: { url: '/mock/s/05-5/employees/create', method: 'POST' },
      update: { url: '/mock/s/05-5/employees/update', method: 'POST' },
    },
    // TODO 1：在提交失败时，把后端返回的原因（响应里的 message）记到 DataSet 的状态里
    fields: [
      { name: 'code', type: 'string', label: '员工编码', required: true, pattern: /^EMP\d{3}$/ },
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', required: true, min: 18, max: 60 },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未提交');

  const save = async () => {
    try {
      const response = await employeeDS.submit();
      if (response === false) setResult('校验未通过');
      else if (response) setResult('保存成功');
    } catch (error) {
      // TODO 2：这里有隐患：失败后把用户的改动全部撤销了。去掉它，并在提示里显示 TODO 1 记下的原因
      employeeDS.reset();
      setResult('保存失败');
    }
  };

  const columns = [
    { name: 'code', width: 140, editor: true },
    { name: 'name', width: 140, editor: true },
    { name: 'age', width: 100, editor: true },
  ];
  return (
    <div>
      <Button onClick={save}>保存</Button>
      <Table dataSet={employeeDS} columns={columns} />
      <p role="status">{result}</p>
    </div>
  );
}
