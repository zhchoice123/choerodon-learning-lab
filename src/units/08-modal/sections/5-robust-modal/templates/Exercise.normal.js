// 【练习】08-5 稳健的弹窗：完成三处防护。
// 接口：/mock/s/08-5/employees。姓名填 FAIL 会被后端固定拒绝
import React, { useMemo, useRef } from 'react';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 后可能会用到
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
      read: { url: '/mock/s/08-5/employees', method: 'GET' },
      create: { url: '/mock/s/08-5/employees/create', method: 'POST' },
      update: { url: '/mock/s/08-5/employees/update', method: 'POST' },
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
  const modalRef = useRef(null);

  // TODO 3：组件卸载时，如果弹窗还开着，就关闭它（只关自己的，不要 Modal.destroyAll）

  const edit = () => {
    const record = employeeDS.current;
    if (!record || modalRef.current) return;
    modalRef.current = Modal.open({
      title: `编辑：${record.get('name')}`,
      children: (
        <Form record={record} columns={1}>
          <TextField name="name" />
        </Form>
      ),
      okText: '确认保存',
      onOk: async () => {
        // TODO 2：保存期间再次点击「确认保存」要直接忽略
        try {
          if (!(await record.validate())) return false;
          if (!record.dirty) return true;
          return Boolean(await employeeDS.submitRecord(record));
        } catch (error) {
          // TODO 1：失败时提示后端返回的原因（已经记在 employeeDS 的 submitError 状态里）
          return false;
        }
      },
      onCancel: () => {
        record.reset();
        return true;
      },
      afterClose: () => {
        modalRef.current = null;
      },
    });
  };

  return (
    <div>
      <Button onClick={edit}>编辑当前员工</Button>
      <Table dataSet={employeeDS} columns={[{ name: 'id' }, { name: 'name' }]} />
    </div>
  );
}
