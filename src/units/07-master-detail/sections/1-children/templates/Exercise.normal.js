// 【练习】07-1 主从 DataSet：员工（头）和技能（行），点击员工时自动加载他的技能。
// 接口：GET /mock/s/07-1/employees（2 名员工）、GET /mock/s/07-1/employees/skills?employeeId=1
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeMaster() {
  // eslint-disable-next-line no-unused-vars -- 完成 TODO 1 时会用到
  const skillDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    dataKey: 'content',
    totalKey: 'totalElements',
    cascadeParams: (parent) => ({ employeeId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-1/employees/skills', method: 'GET' } },
    fields: [
      { name: 'skillCode', type: 'string', label: '技能编码' },
      { name: 'level', type: 'number', label: '等级' },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/s/07-1/employees', method: 'GET' } },
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
    ],
    // TODO 1：把技能 DataSet 挂到员工上，键名用 skills
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeMaster, []);
  return (
    <div>
      <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }]} />
      {/* TODO 2：在下方显示当前员工的技能表格（不分页） */}
    </div>
  );
}
