// 【样例】05-2 表格按钮：add / save / delete / reset 是内置按钮，写名字就有。
// 接口：GET /mock/s/05-2/roles，以及 create / update / destroy（下一节详细讲）
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/05-2/roles', method: 'GET' },
      create: { url: '/mock/s/05-2/roles/create', method: 'POST' },
      update: { url: '/mock/s/05-2/roles/update', method: 'POST' },
      destroy: { url: '/mock/s/05-2/roles/destroy', method: 'POST' },
    },
    fields: [
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', required: true, min: 0, max: 200, defaultValue: 0 },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const columns = [
    { name: 'code', width: 180, editor: true },
    { name: 'name', width: 160, editor: true },
    { name: 'memberCount', width: 100, editor: true },
    { name: 'enabled', width: 80, editor: true },
  ];
  // 知识点 1：add 新增一行；save 提交所有修改；delete 确认后立即删除；reset 撤销本地未保存的修改
  // 知识点 2：按钮的禁用、加载状态由框架自动处理
  return <Table dataSet={roleDS} columns={columns} buttons={['add', 'save', 'delete', 'reset']} />;
}
