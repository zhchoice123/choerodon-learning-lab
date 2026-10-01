// 【练习】07-2 子表查询参数：点第二名员工，下面显示的还是第一名员工的技能。修好它。
// 接口要求 employeeId：GET /mock/s/07-2/employees/skills?employeeId=1
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeMaster() {
  const skillDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    dataKey: 'content',
    totalKey: 'totalElements',
    // TODO 1：这里有隐患：参数写死成了 1。改成用父记录（当前员工）的 id
    cascadeParams: () => ({ employeeId: 1 }),
    transport: { read: { url: '/mock/s/07-2/employees/skills', method: 'GET' } },
    fields: [
      { name: 'employeeId', type: 'number', label: '所属员工 ID' },
      { name: 'skillCode', type: 'string', label: '技能编码' },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/s/07-2/employees', method: 'GET' } },
    fields: [{ name: 'name', type: 'string', label: '姓名' }],
    children: { skills: skillDS },
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeMaster, []);
  return (
    <div>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }]} />
      <Table dataSet={employeeDS.children.skills} columns={[{ name: 'employeeId' }, { name: 'skillCode' }]} pagination={false} />
    </div>
  );
}
