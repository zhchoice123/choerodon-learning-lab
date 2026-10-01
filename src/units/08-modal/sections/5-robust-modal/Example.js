// 【样例】08-5 稳健的弹窗：保存失败留窗显示原因、保存期间防止重复点击、组件卸载时关闭自己的弹窗。
// 接口：/mock/s/08-5/roles。名称填 FAIL 会被后端固定拒绝
import React, { useEffect, useMemo, useRef } from 'react';
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
      read: { url: '/mock/s/08-5/roles', method: 'GET' },
      create: { url: '/mock/s/08-5/roles/create', method: 'POST' },
      update: { url: '/mock/s/08-5/roles/update', method: 'POST' },
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
  const modalRef = useRef(null);

  // 知识点 3：组件卸载（比如切到别的页面）时，只关闭自己打开的弹窗，不要用 Modal.destroyAll
  useEffect(() => () => modalRef.current && modalRef.current.close(), []);

  const edit = () => {
    const record = roleDS.current;
    if (!record || modalRef.current) return;
    let pending = false;
    modalRef.current = Modal.open({
      title: `编辑：${record.get('name')}`,
      children: (
        <Form record={record} columns={1}>
          <TextField name="name" />
        </Form>
      ),
      okText: '确认保存',
      onOk: async () => {
        // 知识点 2：保存期间再次点击直接忽略，避免重复提交
        if (pending) return false;
        pending = true;
        try {
          if (!(await record.validate())) return false;
          if (!record.dirty) return true;
          return Boolean(await roleDS.submitRecord(record));
        } catch (error) {
          // 知识点 1：失败留在弹窗里，提示后端原因，用户改了可以直接重试
          Modal.error({ title: '保存失败', children: roleDS.getState('submitError') || error.message });
          return false;
        } finally {
          pending = false;
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
      <p>把名称改成 FAIL 点确认：弹窗不关并提示原因；改回正常名称再确认即可保存。</p>
      <Button onClick={edit}>编辑当前角色</Button>
      <Table dataSet={roleDS} columns={[{ name: 'id' }, { name: 'name' }]} />
    </div>
  );
}
