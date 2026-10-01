// 【练习】08-3 onOk：清空姓名后点「确认保存」，弹窗直接关了，也没保存。修好它。
// 接口：/mock/s/08-3/employees（create / update 各保存一条记录）
import React, { useMemo } from 'react';
import { DataSet, Table, Form, TextField, Button, Modal } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  const dataSet = new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    autoQueryAfterSubmit: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/08-3/employees', method: 'GET' },
      create: { url: '/mock/s/08-3/employees/create', method: 'POST' },
      update: { url: '/mock/s/08-3/employees/update', method: 'POST' },
    },
    feedback: {
      submitFailed: (error) => dataSet.setState('submitError', error.response?.data?.message || error.message),
    },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码', required: true, pattern: /^EMP\d{3}$/ },
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', required: true, min: 18, max: 60, defaultValue: 18 },
      { name: 'email', type: 'string', label: '邮箱', defaultValue: '' },
      { name: 'active', type: 'boolean', label: '在职', defaultValue: false },
    ],
  });
  return dataSet;
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);

  const edit = () => {
    const record = employeeDS.current;
    if (!record) return;
    Modal.open({
      title: `编辑：${record.get('name')}`,
      children: (
        <Form record={record} columns={1}>
          <TextField name="name" />
        </Form>
      ),
      okText: '确认保存',
      // TODO 1：这里有隐患：没等校验、也没返回值，弹窗总会关闭。改成：校验不过不关闭
      // TODO 2：校验通过且有修改时，只保存这一条记录；保存成功才关闭，失败不关闭
      onOk: () => {
        record.validate();
      },
    });
  };

  return (
    <div>
      <Button onClick={edit}>编辑当前员工</Button>
      <Table dataSet={employeeDS} columns={[{ name: 'id' }, { name: 'code' }, { name: 'name' }]} />
    </div>
  );
}
