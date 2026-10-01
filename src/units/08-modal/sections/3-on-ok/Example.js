// 【样例】08-3 onOk：等待校验和保存，用返回值控制弹窗是否关闭。
// 接口：/mock/s/08-3/roles（create / update 各保存一条记录）
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
      read: { url: '/mock/s/08-3/roles', method: 'GET' },
      create: { url: '/mock/s/08-3/roles/create', method: 'POST' },
      update: { url: '/mock/s/08-3/roles/update', method: 'POST' },
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

  const edit = () => {
    const record = roleDS.current;
    if (!record) return;
    Modal.open({
      title: `编辑：${record.get('name')}`,
      children: (
        <Form record={record} columns={1}>
          <TextField name="code" />
          <TextField name="name" />
        </Form>
      ),
      okText: '确认保存',
      // 知识点 1：onOk 可以是 async 函数，弹窗会等它完成
      // 知识点 2：返回 false 不关闭；返回 true 关闭。什么都不返回（undefined）也会关闭！
      onOk: async () => {
        if (!(await record.validate())) return false; // 校验不过：留在弹窗里修改
        if (!record.dirty) return true; // 没改：直接关闭
        try {
          // 知识点 3：submitRecord 只保存这一条捕获的记录，不会顺带提交其他草稿
          return Boolean(await roleDS.submitRecord(record));
        } catch (error) {
          return false; // 保存失败：留在弹窗里（08-5 会显示原因）
        }
      },
    });
  };

  return (
    <div>
      <p>清空名称点「确认保存」：弹窗不关；改一个合法名称再确认：保存后关闭。</p>
      <Button onClick={edit}>编辑当前角色</Button>
      <Table dataSet={roleDS} columns={[{ name: 'id' }, { name: 'code' }, { name: 'name' }]} />
    </div>
  );
}
