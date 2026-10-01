// 【样例】05-5 提交失败：保留草稿、显示后端原因，修正后重试。
// 接口：/mock/s/05-5/roles。名称填 FAIL 会被后端固定拒绝（400）
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createRoleDataSet() {
  const dataSet = new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/05-5/roles', method: 'GET' },
      create: { url: '/mock/s/05-5/roles/create', method: 'POST' },
      update: { url: '/mock/s/05-5/roles/update', method: 'POST' },
    },
    // 知识点 1：抛出的异常被框架包装过，拿不到后端返回的中文原因；
    // 在 feedback.submitFailed 里先把原因记到 DataSet 的状态里
    feedback: {
      submitFailed: (error) => {
        dataSet.setState('submitError', error.response?.data?.message || error.message);
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', required: true, min: 0, max: 200, defaultValue: 0 },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
  });
  return dataSet;
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未提交');

  const save = async () => {
    try {
      const response = await roleDS.submit();
      if (response === false) setResult('校验未通过');
      else if (response) setResult('保存成功');
    } catch (error) {
      // 知识点 2：失败时什么都不用做：新增 / 修改的草稿还在，status 和 dirty 都保留
      // 知识点 3：不要在这里 reset 或重新查询，那会把用户刚输入的内容丢掉
      setResult(`保存失败：${roleDS.getState('submitError')}。草稿仍在，修改后可以重试`);
    }
  };

  const columns = [
    { name: 'code', width: 180, editor: true },
    { name: 'name', width: 160, editor: true },
  ];
  return (
    <div>
      <p>把某个角色的名称改成 FAIL 后保存：提示后端的原因，改动仍在；改回正常名称再保存即可成功。</p>
      <Button onClick={save}>保存</Button>
      <Table dataSet={roleDS} columns={columns} />
      <p role="status">{result}</p>
    </div>
  );
}
