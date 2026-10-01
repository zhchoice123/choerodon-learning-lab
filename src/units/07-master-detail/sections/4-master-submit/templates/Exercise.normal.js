// 【练习】07-4 主从一起提交：员工和技能一起保存。现在点「保存」没有任何请求。
// 接口：POST /mock/s/07-4/employees/submit，请求体：[{ ...员工, skills: [...修改过的技能] }]
//   技能编码 2～20 位大写字母、数字、下划线（如 SKILL_X），等级 1～5
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
    transport: { read: { url: '/mock/s/07-4/employees/skills', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '技能 ID' },
      { name: 'skillCode', type: 'string', label: '技能编码', required: true, pattern: /^[A-Z][A-Z0-9_]{1,19}$/ },
      { name: 'level', type: 'number', label: '等级', required: true, min: 1, max: 5, defaultValue: 1 },
      { name: 'certified', type: 'boolean', label: '已认证', defaultValue: false },
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
      read: { url: '/mock/s/07-4/employees', method: 'GET' },
      // TODO 1：只在头上配置一个提交接口，让员工和技能一次提交
    },
  }, masterContext);
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeMaster, []);
  const skillDS = employeeDS.children.skills;
  // eslint-disable-next-line no-unused-vars -- 完成 TODO 2 时会用到 setResult
  const [result, setResult] = useState('尚未保存');

  const save = async () => {
    // TODO 2：没有修改时提示「没有待保存的修改」；否则提交头，并按结果提示（校验未通过 / 保存成功 / 保存失败：原因）
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => skillDS.create({ employeeId: employeeDS.current.get('id') })}>新增技能行</Button>
        <Button onClick={save}>保存全部主从</Button>
      </div>
      <Table dataSet={employeeDS} columns={[{ name: 'name', editor: true }]} />
      <Table dataSet={skillDS} columns={[{ name: 'id' }, { name: 'skillCode', editor: true }, { name: 'level', editor: true }]} pagination={false} />
      <p role="status">{result}</p>
    </div>
  );
}
