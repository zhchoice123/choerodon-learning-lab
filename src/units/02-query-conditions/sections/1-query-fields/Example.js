// 【样例】02-1 queryFields：写了查询字段，Table 就会自动生成查询栏。
// 查询字段名和后端参数同名（name、level）时，条件会原样作为查询参数发出。
// 接口：GET /mock/roles?page=1&pagesize=5&name=管理员
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    // 知识点 1：fields 管列表，queryFields 管查询条件
    // 知识点 2：写了 queryFields，DataSet 会自动创建 queryDataSet（里面一条记录保存当前条件）
    queryFields: [
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'level', type: 'string', label: '层级' },
    ],
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'level', type: 'string', label: '层级' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <p>在查询栏输入「管理员」后点「查询」，看 Network 里的 name 参数；层级可填 site / organization / project。</p>
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'level' }]} queryBar="normal" />
    </div>
  );
}
