// 【练习·挑战】员工部门与职位联动；只改浏览器草稿，规则和选项数据见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：按共同验收完成员工部门 / 职位联动、字段规则与输入界面。
// TODO 2：属性规则随员工状态变化，标题随部门变化，计算属性时不能修改业务数据。
// TODO 3：加载、修改、选择都能观察；日志有上限，初始读取不产生脏数据。
// TODO 4：修正事件误改当前员工的隐患；程序修改非当前员工也只影响该员工，联动不循环。
// TODO 5：切换保留草稿，完成导师校验、零职位部门清理和请求次数验收。
// TODO 6：增加空结果演示和重新加载；空记录时禁用操作，恢复后事件不重复注册，次数不倍增。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 2, selection: 'single',
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-06/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
    ],
    events: {
      load: () => {},
      update: ({ dataSet, name }) => {
        // 能跑但有隐患：事件来自非当前员工时，这里会清掉谁的职位？
        if (name === 'departmentCode') {
          dataSet.current?.set({ positionCode: undefined, positionLabel: '' });
        }
      },
      select: () => {},
    },
  });
}

export default observer(function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => setResult('联动校验待完成');
  return (
    <div>
      <p>部门 / 职位联动、导师规则与事件日志待完成；原始模板只读取员工资料。</p>
      <div className="toolbar">
        <Button onClick={() => {}}>选择第一位员工</Button>
        <Button onClick={() => {}}>选择第二位员工</Button>
        <Button onClick={() => {}}>将第二位员工调到研发</Button>
        <Button onClick={() => {}}>演示空结果</Button>
        <Button onClick={() => {}}>重新加载员工</Button>
      </div>
      <Form dataSet={employeeDS} columns={2}>
        <p>员工字段、下拉与绑定待完成</p>
      </Form>
      <div className="toolbar"><Button onClick={handleValidate}>校验员工联动</Button></div>
      <p role="status">{result}</p>
      <div className="status-bar">
        已读取 {employeeDS.length} 位员工 ｜ 当前：{employeeDS.current?.get('name') || '无'} ｜
        dirty：? ｜ load / update / select：待完成
      </div>
      <ol aria-label="员工事件日志"><li>事件日志待完成</li></ol>
    </div>
  );
});
