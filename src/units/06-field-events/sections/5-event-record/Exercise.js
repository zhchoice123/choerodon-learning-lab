// 【练习】06-5 事件记录与当前记录：点「把第二位调到研发」，被清空小组的却是第一位员工。找出原因并修好。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    selection: 'single',
    data: [
      { name: '宋江', department: 'OPS', team: 'OPS-NET' },
      { name: '张飞', department: 'OPS', team: 'OPS-NET' },
    ],
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'department', type: 'string', label: '部门' },
      { name: 'team', type: 'string', label: '小组' },
    ],
    events: {
      // TODO 1：这里有隐患：改的是当前行，不是触发事件的那一条。改成正确的记录
      update: ({ dataSet, name }) => {
        if (name === 'department') dataSet.current.set('team', undefined);
      },
      // TODO 2：勾选一行时，让它同时成为当前行
    },
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => employeeDS.get(1).set('department', 'RD')}>把第二位调到研发</Button>
      </div>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }, { name: 'department' }, { name: 'team' }]} />
    </div>
  );
}
