// 【样例】08-1 Modal.open：用代码打开弹窗或抽屉，里面放表单显示当前角色。
// 本节只查看，不编辑。接口：GET /mock/s/08-1/roles
import React, { useMemo } from 'react';
import { DataSet, Table, Form, Output, Button, Modal } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/08-1/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);

  // 知识点 1：Modal.open 是函数，不是组件；调用后立刻打开，返回一个句柄（可以 update / close）
  // 知识点 2：drawer: true 变成从右侧滑出的抽屉，其他写法完全一样
  const view = (drawer) => {
    const record = roleDS.current;
    if (!record) return;
    Modal.open({
      title: `查看角色${drawer ? '（抽屉）' : '（弹窗）'}`,
      drawer,
      children: (
        <Form record={record} columns={1}>
          <Output name="code" />
          <Output name="name" />
          <Output name="enabled" />
        </Form>
      ),
      okCancel: false, // 只要一个「确定」按钮
    });
  };

  return (
    <div>
      <p>先点击表格行选中一个角色，再打开。</p>
      <div className="toolbar">
        <Button onClick={() => view(false)}>弹窗查看</Button>
        <Button onClick={() => view(true)}>抽屉查看</Button>
      </div>
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'enabled' }]} />
    </div>
  );
}
