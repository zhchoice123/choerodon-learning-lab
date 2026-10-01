// 【样例】01-7 常用实例成员：query / currentPage / selected / record.get。
// 接口：GET /mock/roles（共 12 个角色）
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
    ],
  });
}

// totalCount / currentPage / totalPage 都是可观察属性
const Pager = observer(({ dataSet }) => (
  <div className="status-bar">
    共 {dataSet.totalCount} 个 ｜ 第 {dataSet.currentPage}/{dataSet.totalPage} 页
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);

  // 知识点 1：query(page) 查询指定页；不传参数会回到第 1 页
  const refresh = () => roleDS.query(roleDS.currentPage);

  // 知识点 2：selected 是勾选的记录数组；record.get(字段名) 取值
  const showSelected = () => {
    if (!roleDS.selected.length) {
      message.warning('请先勾选角色');
      return;
    }
    message.info(`已选：${roleDS.selected.map((record) => record.get('code')).join('、')}`);
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={refresh}>刷新当前页</Button>
        <Button onClick={showSelected}>查看选中</Button>
      </div>
      <Pager dataSet={roleDS} />
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }]} />
    </div>
  );
}
