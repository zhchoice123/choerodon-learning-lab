// 【练习】09-6 语言包：完成「中 / 英」切换按钮，并在状态栏显示当前语言。
import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 时会用到
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import LessonConfigScope from './LessonConfigScope';

// TODO 1：引入 localeContext 和中文、英文两个语言包（路径见样例）

const EmployeeList = observer(function EmployeeList() {
  const employeeDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/guide/user', method: 'GET' } },
        dataKey: 'content',
        totalKey: 'totalElements',
        fields: [{ name: 'name', type: 'string', label: '姓名' }],
      }),
    [],
  );
  return (
    <div>
      {/* TODO 2：一个按钮：当前是英文时切换为中文，否则切换为英文；按钮文字随语言变化 */}
      {/* TODO 3：状态栏显示「当前语言：中文 / English」 */}
      <div className="status-bar">当前语言：?</div>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }]} />
    </div>
  );
});

export default function Exercise() {
  return (
    <LessonConfigScope config={{}}>
      <EmployeeList />
    </LessonConfigScope>
  );
}
