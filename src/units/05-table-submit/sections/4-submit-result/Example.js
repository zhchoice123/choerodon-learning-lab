// 【样例】05-4 提交结果：submit() 的返回值有三种含义，要分别处理。
// 接口：/mock/s/05-4/roles
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/05-4/roles', method: 'GET' },
      create: { url: '/mock/s/05-4/roles/create', method: 'POST' },
      update: { url: '/mock/s/05-4/roles/update', method: 'POST' },
    },
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', required: true, min: 0, max: 200, defaultValue: 0 },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
  });
}

// 知识点 3：提交成功后，新记录拿到后端 id，status 变成 sync，dirty 变回 false
const SubmitStatus = observer(({ dataSet }) => (
  <div className="status-bar">
    当前行 ID：{dataSet.current?.get('id') ?? '待分配'} ｜ status：{dataSet.current?.status || '无'} ｜ dirty：{String(dataSet.dirty)}
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未提交');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy) return;
    // 知识点 1：没有修改时不必提交
    if (!roleDS.dirty) { setResult('没有待保存的修改'); return; }
    setBusy(true);
    try {
      // 知识点 2：submit 会先校验。false = 校验没通过；undefined = 没有发出请求；其他 = 后端响应
      const response = await roleDS.submit();
      if (response === false) setResult('校验未通过，请检查必填和格式');
      else if (response) setResult('保存成功，已回写 ID 和状态');
      else setResult('没有发出提交请求');
    } catch (error) {
      setResult(`保存失败：${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { name: 'id', width: 90 },
    { name: 'code', width: 180, editor: true },
    { name: 'name', width: 160, editor: true },
  ];
  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => roleDS.create({}, 0)}>新增</Button>
        <Button onClick={save} loading={busy}>保存</Button>
      </div>
      <SubmitStatus dataSet={roleDS} />
      <Table dataSet={roleDS} columns={columns} />
      <p role="status">{result}</p>
    </div>
  );
}
