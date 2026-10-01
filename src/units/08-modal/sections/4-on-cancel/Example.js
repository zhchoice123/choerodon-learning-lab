// 【样例】08-4 取消：编辑取消用 record.reset 回滚；新增取消还要把草稿行移除。
// 接口：/mock/s/08-4/roles
import React, { useMemo } from 'react';
import { DataSet, Table, Form, TextField, Button, Modal } from 'choerodon-ui/pro';

function createRoleDataSet() {
  const dataSet = new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    autoQueryAfterSubmit: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/08-4/roles', method: 'GET' },
      create: { url: '/mock/s/08-4/roles/create', method: 'POST' },
      update: { url: '/mock/s/08-4/roles/update', method: 'POST' },
    },
    feedback: {
      submitFailed: (error) => dataSet.setState('submitError', error.response?.data?.message || error.message),
    },
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
  });
  return dataSet;
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);

  const open = (record) => {
    const isNew = record.status === 'add';
    Modal.open({
      title: isNew ? '新增角色' : `编辑：${record.get('name')}`,
      // Form 直接编辑这条记录：输入时，底下的表格会同步显示草稿
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
          return Boolean(await roleDS.submitRecord(record));
        } catch (error) {
          return false;
        }
      },
      // 知识点 1：取消时 record.reset() 恢复到最近一次保存的值
      // 知识点 2：新增记录 reset 后仍然是 add 状态，还在列表里；要再 remove 掉
      onCancel: () => {
        record.reset();
        if (isNew) roleDS.remove(record);
        return true;
      },
    });
  };

  return (
    <div>
      <p>编辑时改了名称再点「取消」：表格恢复原值。新增时点「取消」：草稿行消失。</p>
      <div className="toolbar">
        <Button onClick={() => open(roleDS.create({}, 0))}>新增角色</Button>
        <Button onClick={() => roleDS.current && open(roleDS.current)}>编辑当前角色</Button>
      </div>
      <Table dataSet={roleDS} columns={[{ name: 'id' }, { name: 'code' }, { name: 'name' }]} />
    </div>
  );
}
