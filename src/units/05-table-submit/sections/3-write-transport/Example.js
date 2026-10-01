// 【样例】05-3 写接口协议：create / update / destroy 收到的都是「记录数组」。
// 下方显示最近一次写请求的请求体，对照 Network 阅读。接口：/mock/s/05-3/roles
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  // 把写请求的请求体记录到 DataSet 的状态里，方便在页面上观察
  const write = (operation) => ({ data, dataSet }) => {
    dataSet.setState('lastWrite', `${operation}：${JSON.stringify(data)}`);
    return { url: `/mock/s/05-3/roles/${operation}`, method: 'POST', data };
  };
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/05-3/roles', method: 'GET' },
      // 知识点 1：新增 → create，修改 → update，删除 → destroy，三个接口分开
      // 知识点 2：请求体是记录数组，每条带 __id（前端临时标识）和 __status（add / update / delete）
      // 知识点 3：destroy 收到的也是记录对象数组，不是 id 数组
      create: write('create'),
      update: write('update'),
      destroy: write('destroy'),
    },
    fields: [
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', required: true, min: 0, max: 200, defaultValue: 0 },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
  });
}

const LastWrite = observer(({ dataSet }) => (
  <pre className="status-bar" style={{ whiteSpace: 'pre-wrap' }}>{dataSet.getState('lastWrite') || '还没有写请求'}</pre>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const columns = [
    { name: 'code', width: 180, editor: true },
    { name: 'name', width: 160, editor: true },
    { name: 'memberCount', width: 100, editor: true },
  ];
  return (
    <div>
      <p>新增一行保存、修改一行保存、删除一行，观察三种请求体。平台管理员（site-admin）不能删除。</p>
      <LastWrite dataSet={roleDS} />
      <Table dataSet={roleDS} columns={columns} buttons={['add', 'save', 'delete']} />
    </div>
  );
}
