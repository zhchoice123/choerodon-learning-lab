// 【练习】07-3 子表快照：改了第一名员工的技能等级，切到第二名再切回来，改动没了。找出原因并修好。
// 接口：/mock/s/07-3/employees、/mock/s/07-3/employees/skills?employeeId=1
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createEmployeeMaster() {
  const skillDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    dataKey: 'content',
    totalKey: 'totalElements',
    cascadeParams: (parent) => ({ employeeId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-3/employees/skills', method: 'GET' } },
    fields: [
      { name: 'skillCode', type: 'string', label: '技能编码' },
      { name: 'level', type: 'number', label: '等级', min: 1, max: 5 },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/s/07-3/employees', method: 'GET' } },
    fields: [{ name: 'name', type: 'string', label: '姓名' }],
    children: { skills: skillDS },
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeMaster, []);
  const skillDS = employeeDS.children.skills;

  // TODO 1：这里有隐患：切换后又手动查询了子表。去掉多余的部分，让草稿保留
  const switchTo = (index) => {
    employeeDS.current = employeeDS.get(index);
    skillDS.query();
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => switchTo(0)}>第一名员工</Button>
        <Button onClick={() => switchTo(1)}>第二名员工</Button>
      </div>
      <Table dataSet={skillDS} columns={[{ name: 'skillCode' }, { name: 'level', editor: true }]} pagination={false} />
    </div>
  );
}
