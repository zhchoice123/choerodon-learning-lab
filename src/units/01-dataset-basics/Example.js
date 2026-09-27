// 【样例】角色列表：本单元全部知识点的完整写法。
// 练习页要用同样的知识点完成「员工列表」，先读懂这里的每一处注释再动手。
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// 知识点 1：DataSet 就是「一张表的数据 + 它的元信息 + 和后端通信的方式」
function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id', // 记录的唯一标识，DataSet 用它区分记录
    autoQuery: true, // 创建后立即调用 transport.read 查询第 1 页
    pageSize: 10, // 每页条数，查询时作为 pagesize 参数发给后端

    // 知识点 2：transport 描述「怎么和后端通信」，read 对应查询
    transport: {
      read: { url: '/mock/roles', method: 'GET' },
    },

    // 知识点 3：告诉 DataSet 后端响应里的数据放在哪个字段
    dataKey: 'content', // 列表数组所在字段（默认 rows）
    totalKey: 'totalElements', // 总条数所在字段（默认 total），分页器靠它算页数

    // 知识点 4：fields 定义每个字段的类型和标签。
    // Table 的列标题、数字右对齐、布尔值显示成勾选框、日期格式化，都由这里的 type 决定。
    fields: [
      { name: 'id', type: 'number', label: '角色ID' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'level', type: 'string', label: '层级' },
      { name: 'memberCount', type: 'number', label: '成员数' },
      { name: 'enabled', type: 'boolean', label: '启用' },
      { name: 'createdAt', type: 'dateTime', label: '创建时间' },
    ],
  });
}

// 知识点 6：DataSet 是 MobX 可观察对象。
// 用 observer 包裹的组件，会在它读取过的 DataSet 属性变化时自动重新渲染，
// 不需要自己写 useState 同步数据。
const RoleStatusBar = observer(({ dataSet }) => {
  const { current, selected, totalCount, currentPage, totalPage } = dataSet;
  // 本页已启用的角色数：DataSet 提供了和数组一样的 filter / map 等方法
  const enabledCount = dataSet.filter((record) => record.get('enabled')).length;
  return (
    <div className="status-bar">
      共 {totalCount} 个角色 ｜ 第 {currentPage}/{totalPage} 页 ｜ 当前行：
      {current ? current.get('name') : '无'} ｜ 本页启用 {enabledCount} 个 ｜ 已选 {selected.length} 个
    </div>
  );
});

export default function Example() {
  // 知识点 5：用 useMemo 保证组件重新渲染时不会重复创建 DataSet。
  // 否则每次渲染都会 new 一个新的 DataSet：重复发请求，勾选和当前行也会丢失。
  const roleDS = useMemo(createRoleDataSet, []);

  // 列只需要写 name 和布局相关属性，标题和显示格式来自 DataSet 的 field
  const columns = [
    { name: 'code', width: 150 },
    { name: 'name', width: 140 },
    { name: 'level', width: 120 },
    { name: 'memberCount', width: 90 },
    { name: 'enabled', width: 80 },
    { name: 'createdAt' },
  ];

  // 知识点 7：常用实例方法和属性
  const handleRefresh = () => {
    // query(page) 查询指定页；不传参数会回到第 1 页
    roleDS.query(roleDS.currentPage);
  };

  const handleShowSelected = () => {
    // selected：所有勾选的记录（Record 数组）；record.get(字段名) 取值
    if (roleDS.selected.length === 0) {
      message.warning('请先勾选角色');
      return;
    }
    const codes = roleDS.selected.map((record) => record.get('code'));
    message.info(`已选角色编码：${codes.join('、')}`);
  };

  return (
    <div>
      <div className="toolbar">
        <Button icon="refresh" onClick={handleRefresh}>
          刷新
        </Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <RoleStatusBar dataSet={roleDS} />
      <Table dataSet={roleDS} columns={columns} />
    </div>
  );
}
