// 【样例】07-3 子表快照：在角色 A 下改了权限，切到角色 B 再切回来，A 的草稿还在。
// 只需要切换头的 current，框架会自动加载新头的行、恢复旧头的快照。接口：/mock/s/07-3/roles
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleMaster() {
  const permissionDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    dataKey: 'content',
    totalKey: 'totalElements',
    cascadeParams: (parent) => ({ roleId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-3/roles/permissions', method: 'GET' } },
    fields: [
      { name: 'code', type: 'string', label: '权限编码' },
      { name: 'description', type: 'string', label: '权限说明' },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/s/07-3/roles', method: 'GET' } },
    fields: [{ name: 'name', type: 'string', label: '角色名称' }],
    children: { permissions: permissionDS },
  });
}

const DraftStatus = observer(({ dataSet }) => (
  <div className="status-bar">
    当前角色：{dataSet.current?.get('name') || '无'} ｜ 当前子表有修改：{String(dataSet.children.permissions.dirty)} ｜ 主从整体有修改：{String(dataSet.dirty)}
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleMaster, []);
  // 知识点 1：切换只改 current；不要再手动 query 子表，那会用后端数据覆盖草稿
  // 知识点 2：每个头的子表修改都保存在快照里，最后可以一起提交（07-4）
  const switchTo = (index) => {
    roleDS.current = roleDS.get(index);
  };
  return (
    <div>
      <p>改第一个角色的某条权限说明 → 切到第二个 → 再切回来：改动还在。</p>
      <div className="toolbar">
        <Button onClick={() => switchTo(0)}>第一个角色</Button>
        <Button onClick={() => switchTo(1)}>第二个角色</Button>
      </div>
      <DraftStatus dataSet={roleDS} />
      <Table dataSet={roleDS.children.permissions} columns={[{ name: 'code' }, { name: 'description', editor: true }]} pagination={false} />
    </div>
  );
}
