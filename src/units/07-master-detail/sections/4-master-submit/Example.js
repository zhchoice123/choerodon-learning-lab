// 【样例】07-4 主从一起提交：只在头上配 transport.submit，一次请求带上所有头和它们修改过的行。
// 接口：POST /mock/s/07-4/roles/submit，请求体：[{ ...头, permissions: [...修改过的行] }]
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { getConfig } from 'choerodon-ui';

// 1.6.7 兼容底座（不是本节知识点，照抄即可）：提交后框架会用临时子 DataSet 回写快照，
// 默认按 pageSize 截取会让「非当前头」上待删除的行残留。这里只对本 DataSet 关闭截取，不修改全局配置。
const masterContext = { getConfig: (key) => (key === 'strictPageSize' ? false : getConfig(key)) };

function createRoleMaster() {
  const permissionDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    cascadeParams: (parent) => ({ roleId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-4/roles/permissions', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '权限 ID' },
      { name: 'code', type: 'string', label: '权限编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'description', type: 'string', label: '权限说明', required: true },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    autoQueryAfterSubmit: false,
    fields: [{ name: 'name', type: 'string', label: '角色名称', required: true }],
    children: { permissions: permissionDS },
    // 知识点 1：只给头配 submit；子表不配写接口，也不要分别提交头和子表
    // 知识点 2：请求体是头数组，每个头带 permissions 子数组（键名来自 children）
    // 知识点 3：成功后，新增行拿到后端 id，所有记录变成已同步
    transport: {
      read: { url: '/mock/s/07-4/roles', method: 'GET' },
      submit: { url: '/mock/s/07-4/roles/submit', method: 'POST' },
    },
  }, masterContext);
}

export default function Example() {
  const roleDS = useMemo(createRoleMaster, []);
  const permissionDS = roleDS.children.permissions;
  const [result, setResult] = useState('尚未保存');

  const save = async () => {
    if (!roleDS.dirty) { setResult('没有待保存的修改'); return; }
    try {
      // 知识点 4：头 submit 会级联校验子表，并把子表修改一起序列化
      const response = await roleDS.submit();
      setResult(response === false ? '校验未通过' : response ? '主从保存成功，新行已拿到 ID' : '没有发出请求');
    } catch (error) {
      setResult(`保存失败：${error.message}`);
    }
  };

  return (
    <div>
      <p>新增一条权限（编码如 report-view）→ 保存：Network 里只有一次 submit 请求，权限 ID 列出现新 id。</p>
      <div className="toolbar">
        <Button onClick={() => permissionDS.create({ roleId: roleDS.current.get('id') })}>新增权限行</Button>
        <Button onClick={save}>保存全部主从</Button>
      </div>
      <Table dataSet={roleDS} columns={[{ name: 'name', editor: true }]} />
      <Table dataSet={permissionDS} columns={[{ name: 'id' }, { name: 'code', editor: true }, { name: 'description', editor: true }]} pagination={false} />
      <p role="status">{result}</p>
    </div>
  );
}
