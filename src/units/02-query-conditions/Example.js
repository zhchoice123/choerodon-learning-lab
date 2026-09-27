// 【样例】角色查询：先对照 Network 阅读，再完成使用员工数据的练习。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',

    // 知识点 1：fields 管列表，queryFields 管查询栏，两者可以使用不同的字段名。
    // roleName 是前端查询字段；后端接收的是 name。
    queryFields: [
      { name: 'roleName', type: 'string', label: '角色名称' },
      { name: 'level', type: 'string', label: '层级' },
    ],

    // 知识点 2：queryFields 会让列表自动创建 queryDataSet 和一条条件记录。
    // 条件保存在 roleDS.queryDataSet.current，与表格的 roleDS.current 无关。
    // 另一种写法是显式创建 queryDataSet 后传入；练习采用这种方式，二者不要同时配置。

    transport: {
      // 知识点 3：data 是查询条件；params 是 page / pagesize 等分页、排序参数。
      read: ({ data = {}, params }) => {
        const name = (data.roleName || '').trim();
        const level = (data.level || '').trim();
        const conditions = {};
        // 知识点 4：在传输边界改名、去除首尾空白；不要回写或直接修改条件记录。
        if (name !== '') conditions.name = name;
        if (level !== '') conditions.level = level;
        return {
          url: '/mock/roles',
          method: 'GET',
          params: { ...params, ...conditions },
          // 1.6.7 会将 GET 的 data 再合并进 params。
          // 已手动映射到 params 时清空 data，避免 roleName 和未清理值再次被带上。
          data: {},
        };
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '角色ID' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'level', type: 'string', label: '层级' },
      { name: 'memberCount', type: 'number', label: '成员数' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

// 知识点 5：状态栏读取的是「正在编辑的条件」，结果总数则来自上一次成功查询。
const QueryStatus = observer(({ dataSet }) => {
  const query = dataSet.queryDataSet.current;
  return (
    <div className="status-bar">
      待查询名称：{query.get('roleName') || '不限'} ｜ 待查询层级：{query.get('level') || '不限'}
      {' ｜ '}上次查询共 {dataSet.totalCount} 个角色 ｜ 第 {dataSet.currentPage} 页
    </div>
  );
});

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const columns = [
    { name: 'code', width: 160 },
    { name: 'name', width: 140 },
    { name: 'level', width: 140 },
    { name: 'memberCount', width: 90 },
    { name: 'enabled', width: 80 },
  ];

  // 知识点 6：设置条件不会自动请求；显式查询第 1 页，避免沿用旧条件的页码。
  const handleProject = () => {
    roleDS.queryDataSet.current.set({ roleName: undefined, level: 'project' });
    return roleDS.query(1);
  };

  // 知识点 7：reset 恢复条件初始值；查询列表仍需主动调用 query。
  const handleReset = () => {
    roleDS.queryDataSet.current.reset();
    return roleDS.query(1);
  };

  return (
    <div>
      <p>名称支持模糊匹配；层级可填 site、organization、project。修改条件后点击查询。</p>
      <div className="toolbar">
        <Button onClick={handleProject}>只看项目角色</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
      </div>
      <QueryStatus dataSet={roleDS} />
      {/* 知识点 8：查询栏由查询字段自动生成，显示数量独立于表格列数。 */}
      <Table dataSet={roleDS} columns={columns} queryBar="normal" queryFieldsLimit={2} />
    </div>
  );
}
