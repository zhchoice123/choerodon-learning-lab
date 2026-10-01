// 【样例】02-3 条件转换：前端字段名和后端参数名不同、带空白、或者为空时，在 read 函数里统一处理。
// 前端查询字段叫 roleName，后端参数叫 name。接口：GET /mock/roles
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [{ name: 'roleName', type: 'string', label: '角色名称' }],
    transport: {
      read: ({ data = {}, params }) => {
        // 知识点 1：去掉首尾空白，「 管理员 」和「管理员」查询结果一致
        const name = (data.roleName || '').trim();
        // 知识点 2：改名 roleName → name；知识点 3：空值不发送，避免把空字符串当成条件
        const conditions = name ? { name } : {};
        return {
          url: '/mock/roles',
          method: 'GET',
          params: { ...params, ...conditions },
          // GET 请求时 1.6.7 会把 data 再合并进 params；已手动转换，清空 data，避免 roleName 被原样带上
          data: {},
        };
      },
    },
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <p>输入「 管理员 」（前后带空格）查询，Network 里是 name=管理员，没有 roleName。</p>
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }]} queryBar="normal" />
    </div>
  );
}
