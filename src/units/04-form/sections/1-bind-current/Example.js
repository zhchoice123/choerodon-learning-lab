// 【样例】04-1 Form 绑定 dataSet：表单默认编辑 dataSet.current。
// 左边表格点哪一行，右边表单就编辑哪一行；改动立刻反映到表格（同一条记录）。
// 接口：GET /mock/s/04-1/roles
import React, { useMemo } from 'react';
import { DataSet, Table, Form, TextField, NumberField } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/04-1/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }]} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 知识点 1：Form 绑定 dataSet，编辑的是 dataSet.current（当前行）
            知识点 2：子控件只写 name，标签、校验都来自 fields */}
        <Form dataSet={roleDS} columns={1}>
          <TextField name="code" />
          <TextField name="name" />
          <NumberField name="memberCount" />
        </Form>
      </div>
    </div>
  );
}
