// 【练习】08-4 取消：现在取消编辑后表格里留着改了一半的姓名；取消新增后列表里多出一行空白。修好它。
// 接口：/mock/s/08-4/employees。员工编码 EMP 加 3 位数字
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
      read: { url: '/mock/s/08-4/employees', method: 'GET' },
      create: { url: '/mock/s/08-4/employees/create', method: 'POST' },
      update: { url: '/mock/s/08-4/employees/update', method: 'POST' },
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

  const open = (record) => {
    Modal.open({
      title: record.status === 'add' ? '新增员工' : `编辑：${record.get('name')}`,
      children: (
        <Form record={record} columns={1}>
          <TextField name="code" />
          <TextField name="name" />
        </Form>
      ),
      okText: '确认保存',
      onOk: async () => {
        if (!(await record.validate())) return false;
        if (!record.dirty) return true;
        try {
          return Boolean(await employeeDS.submitRecord(record));
        } catch (error) {
          return false;
        }
      },
      // TODO 1：取消时撤销本次修改
      // TODO 2：如果是新增的记录，取消后还要把它从列表里移除
    });
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => open(employeeDS.create({}, 0))}>新增员工</Button>
        <Button onClick={() => employeeDS.current && open(employeeDS.current)}>编辑当前员工</Button>
      </div>
      <Table dataSet={employeeDS} columns={[{ name: 'id' }, { name: 'code' }, { name: 'name' }]} />
    </div>
  );
}
