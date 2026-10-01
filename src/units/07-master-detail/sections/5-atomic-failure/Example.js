// 【样例】07-5 原子提交失败：整份主从请求要么全部保存，要么全部不保存；失败时保留所有草稿。
// 接口：POST /mock/s/07-5/roles/submit。权限说明填 FAIL 会让整份请求失败
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
    transport: { read: { url: '/mock/s/07-5/roles/permissions', method: 'GET' } },
    fields: [
      { name: 'code', type: 'string', label: '权限编码', required: true },
      { name: 'description', type: 'string', label: '权限说明', required: true },
    ],
  });
  const roleDS = new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    autoQueryAfterSubmit: false,
    fields: [{ name: 'name', type: 'string', label: '角色名称', required: true }],
    children: { permissions: permissionDS },
    transport: {
      read: { url: '/mock/s/07-5/roles', method: 'GET' },
      submit: { url: '/mock/s/07-5/roles/submit', method: 'POST' },
    },
    // 知识点 1：同 05-5，在 feedback 里记下后端原因
    feedback: {
      submitFailed: (error) => roleDS.setState('submitError', error.response?.data?.message || error.message),
    },
  }, masterContext);
  return roleDS;
}

export default function Example() {
  const roleDS = useMemo(createRoleMaster, []);
  const [result, setResult] = useState('尚未保存');

  const save = async () => {
    if (!roleDS.dirty) { setResult('没有待保存的修改'); return; }
    try {
      const response = await roleDS.submit();
      setResult(response === false ? '校验未通过' : response ? '主从保存成功' : '没有发出请求');
    } catch (error) {
      // 知识点 2：后端一条都没保存；前端的头和所有行草稿都还在
      // 知识点 3：不要 reset，也不要重新查询；让用户改掉出错的那一处再保存
      setResult(`保存失败：${roleDS.getState('submitError')}。所有草稿都在，修改后重试`);
    }
  };

  return (
    <div>
      <p>把第一个角色改个名，再把某条权限说明改成 FAIL → 保存：整份失败，角色名和权限的改动都还在。</p>
      <Button onClick={save}>保存全部主从</Button>
      <Table dataSet={roleDS} columns={[{ name: 'name', editor: true }]} />
      <Table dataSet={roleDS.children.permissions} columns={[{ name: 'code' }, { name: 'description', editor: true }]} pagination={false} />
      <p role="status">{result}</p>
    </div>
  );
}
