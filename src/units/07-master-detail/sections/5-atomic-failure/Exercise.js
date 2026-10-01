// 【练习】07-5 原子提交失败：把技能编码改成 FAIL 保存，提示没有原因，而且所有改动都被刷新掉了。修好它。
// 接口：POST /mock/s/07-5/employees/submit。技能编码填 FAIL 会让整份请求失败
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { getConfig } from 'choerodon-ui';

// 1.6.7 兼容底座（不是本节知识点，照抄即可）：提交后框架会用临时子 DataSet 回写快照，
// 默认按 pageSize 截取会让「非当前头」上待删除的行残留。这里只对本 DataSet 关闭截取，不修改全局配置。
const masterContext = { getConfig: (key) => (key === 'strictPageSize' ? false : getConfig(key)) };

function createEmployeeMaster() {
  const skillDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    cascadeParams: (parent) => ({ employeeId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-5/employees/skills', method: 'GET' } },
    fields: [
      { name: 'skillCode', type: 'string', label: '技能编码', required: true },
      { name: 'level', type: 'number', label: '等级', required: true, min: 1, max: 5 },
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
    fields: [{ name: 'name', type: 'string', label: '姓名', required: true }],
    children: { skills: skillDS },
    transport: {
      read: { url: '/mock/s/07-5/employees', method: 'GET' },
      submit: { url: '/mock/s/07-5/employees/submit', method: 'POST' },
    },
    // TODO 1：提交失败时，把后端返回的原因记到头 DataSet 的状态里
  }, masterContext);
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeMaster, []);
  const [result, setResult] = useState('尚未保存');

  const save = async () => {
    if (!employeeDS.dirty) { setResult('没有待保存的修改'); return; }
    try {
      const response = await employeeDS.submit();
      setResult(response === false ? '校验未通过' : response ? '主从保存成功' : '没有发出请求');
    } catch (error) {
      // TODO 2：这里有隐患：失败后重新查询，把用户的草稿全部覆盖了。去掉它，并在提示里显示后端原因
      employeeDS.query();
      setResult('保存失败');
    }
  };

  return (
    <div>
      <Button onClick={save}>保存全部主从</Button>
      <Table dataSet={employeeDS} columns={[{ name: 'name', editor: true }]} />
      <Table dataSet={employeeDS.children.skills} columns={[{ name: 'skillCode', editor: true }, { name: 'level', editor: true }]} pagination={false} />
      <p role="status">{result}</p>
    </div>
  );
}
