// 【样例】06-5 事件记录与当前记录：update 事件里要改「触发事件的那条记录」，不一定是 current。
// 「把第二位改成项目」按钮在 current 是第一位时，用程序修改第二位，观察联动作用在哪一条上。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    selection: 'single',
    data: [
      { name: '平台管理员', scope: 'site', permission: 'site.view' },
      { name: '项目成员', scope: 'site', permission: 'site.view' },
    ],
    fields: [
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'scope', type: 'string', label: '范围' },
      { name: 'permission', type: 'string', label: '权限' },
    ],
    events: {
      // 知识点 1：用参数里的 record，它就是值发生变化的那一条
      update: ({ record, name }) => {
        if (name === 'scope') record.set('permission', undefined);
      },
      // 知识点 2：勾选（select）不会改变当前行（current）；需要时显式设置
      select: ({ dataSet, record }) => {
        dataSet.current = record;
      },
    },
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <div className="toolbar">
        <Button onClick={() => roleDS.get(1).set('scope', 'project')}>把第二位改成项目</Button>
      </div>
      <p>第一行是当前行时点按钮：只有第二行的权限被清空，第一行不受影响。</p>
      <Table dataSet={roleDS} columns={[{ name: 'name' }, { name: 'scope' }, { name: 'permission' }]} />
    </div>
  );
}
