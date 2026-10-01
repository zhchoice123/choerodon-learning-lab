// 【样例】05-1 行内编辑：列上写 editor 就能编辑；校验规则仍然写在 fields。
// 本节只在内存里编辑，不保存。接口：GET /mock/s/05-1/roles
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/05-1/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      // 知识点 1：规则写在 fields，单元格编辑时同样生效
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', min: 0, max: 200 },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

// 知识点 3：编辑后记录 status 变成 update，DataSet 的 dirty 变成 true
const EditStatus = observer(({ dataSet }) => (
  <div className="status-bar">
    当前行 status：{dataSet.current ? dataSet.current.status : '无'} ｜ dirty：{String(dataSet.dirty)}
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  // 知识点 2：editor: true 打开编辑，控件按字段类型自动选择（数字 → NumberField，布尔 → CheckBox）
  const columns = [
    { name: 'code', width: 160 },
    { name: 'name', width: 160, editor: true },
    { name: 'memberCount', width: 100, editor: true },
    { name: 'enabled', width: 80, editor: true },
  ];
  return (
    <div>
      <EditStatus dataSet={roleDS} />
      <Table dataSet={roleDS} columns={columns} />
    </div>
  );
}
