// 【样例】02-2 transport.read 写成函数：拿到查询条件 data 和分页参数 params，自己决定怎么发请求。
// 接口：GET /mock/roles（支持 name、level 等查询参数）
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [{ name: 'name', type: 'string', label: '角色名称' }],
    transport: {
      // 知识点 1：read 可以是函数。data 是查询条件（来自 queryDataSet），params 是分页参数 page / pagesize
      // 知识点 2：返回的对象就是 axios 请求配置
      read: ({ data, params }) => ({
        url: '/mock/roles',
        method: 'GET',
        // 知识点 3：在这里追加一个固定条件：只查已启用的角色
        params: { ...params, ...data, enabled: true },
      }),
    },
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <p>Network 里每次请求都带 enabled=true，所以「启用」列全是勾选；查询栏的名称条件照常生效。</p>
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'enabled' }]} queryBar="normal" />
    </div>
  );
}
