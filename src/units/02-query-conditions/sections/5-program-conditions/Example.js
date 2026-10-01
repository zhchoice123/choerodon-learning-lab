// 【样例】02-5 用代码控制查询：设置条件、重新查询、恢复默认。
// 接口：GET /mock/roles
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
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

const Status = observer(({ dataSet }) => (
  <div className="status-bar">
    当前条件：层级 = {dataSet.queryDataSet.current.get('level') || '不限'} ｜ 共 {dataSet.totalCount} 个 ｜ 第 {dataSet.currentPage} 页
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);

  // 知识点 1：条件保存在 queryDataSet.current，用 set 修改
  // 知识点 2：修改条件不会自动查询；要主动 query(1)，从第 1 页开始，避免沿用旧页码
  const onlyProject = () => {
    roleDS.queryDataSet.current.set({ name: undefined, level: 'project' });
    return roleDS.query(1);
  };

  // 知识点 3：reset 把条件恢复成初始值，同样要主动查询
  const restore = () => {
    roleDS.queryDataSet.current.reset();
    return roleDS.query(1);
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={onlyProject}>只看项目层</Button>
        <Button onClick={restore}>恢复默认</Button>
      </div>
      <Status dataSet={roleDS} />
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'level' }]} queryBar="normal" />
    </div>
  );
}
