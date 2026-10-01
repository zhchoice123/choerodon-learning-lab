// 【样例】06-3 DataSet 事件：load（读取完成）、update（字段值变化）、select（勾选）。
// 接口：GET /mock/s/06-3/roles。下方日志显示每次事件的参数
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  const log = (dataSet, text) => dataSet.setState('log', [...(dataSet.getState('log') || []), text].slice(-6));
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 3,
    transport: { read: { url: '/mock/s/06-3/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'memberCount', type: 'number', label: '成员数' },
    ],
    // 知识点 1：事件在创建 DataSet 时注册一次
    events: {
      // 知识点 2：load 只有 { dataSet }，没有 record
      load: ({ dataSet }) => log(dataSet, `load：读取了 ${dataSet.length} 条`),
      // 知识点 3：update 有 record、name、value、oldValue；只有值真的变化才触发
      update: ({ dataSet, record, name, value, oldValue }) => log(dataSet, `update：${record.get('name')} 的 ${name}，${oldValue} → ${value}`),
      // 知识点 4：select 有 record（新勾选的）和 previous
      select: ({ dataSet, record }) => log(dataSet, `select：${record.get('name')}`),
    },
  });
}

const EventLog = observer(({ dataSet }) => (
  <ol className="status-bar">{(dataSet.getState('log') || []).map((text) => <li key={text}>{text}</li>)}</ol>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <p>翻页触发 load；改成员数触发 update；勾选触发 select。</p>
      <Table dataSet={roleDS} columns={[{ name: 'name' }, { name: 'memberCount', editor: true }]} />
      <EventLog dataSet={roleDS} />
    </div>
  );
}
