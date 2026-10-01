// 【样例】02-4 查询栏：queryFieldsLimit 控制直接显示几个条件，其余收进「更多」。
// 接口：GET /mock/roles
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'code', type: 'string', label: '角色编码' },
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
  // 知识点 1：queryBar="normal" 显示查询栏
  // 知识点 2：queryFieldsLimit={1}：只直接显示第 1 个条件，另外两个点「更多」才出现
  // 知识点 3：查询栏显示多少条件，和表格有几列无关
  return (
    <Table
      dataSet={roleDS}
      columns={[{ name: 'code' }, { name: 'name' }, { name: 'level' }]}
      queryBar="normal"
      queryFieldsLimit={1}
    />
  );
}
