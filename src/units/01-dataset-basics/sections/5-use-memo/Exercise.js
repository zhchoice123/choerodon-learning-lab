// 【练习】01-5 useMemo：勾选几名员工后点「重新渲染」，勾选就没了。找出原因并修好。
import React, { useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [
      { id: 1, name: '宋江' },
      { id: 2, name: '张飞' },
      { id: 3, name: '赵云' },
    ],
    primaryKey: 'id',
    fields: [{ name: 'name', type: 'string', label: '姓名' }],
  });
}

export default function Exercise() {
  const [renders, setRenders] = useState(1);
  // TODO 1：这一行每次渲染都会执行。改成只创建一次（别忘了在第 3 行引入需要的 Hook）
  const employeeDS = createEmployeeDataSet();
  return (
    <div>
      <Button onClick={() => setRenders(renders + 1)}>重新渲染（第 {renders} 次）</Button>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }]} />
    </div>
  );
}
