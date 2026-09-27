// 【练习·标准】员工部门与职位联动；只改浏览器草稿，规则和选项数据见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Output, TextField, Switch, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：接入员工部门 / 职位选项与级联，补齐字段和控件（知识点 1、2）。
// TODO 2：完成导师动态必填、职位禁用和随部门变化的标题；属性回调保持纯读取（知识点 3、4）。
// TODO 3：记录加载日志与次数，不改变刚加载的业务记录（知识点 5）。
// TODO 4：修正 update 使用 current 的隐患；只清变化记录的旧职位 / 说明，选择职位后填写说明（知识点 6、7）。
// TODO 5：选择事件控制当前员工并记录前后对象；按钮能切换且保留两条草稿（知识点 8）。
// TODO 6：第三个按钮更改非当前员工部门，状态栏与有限日志可观察；说明怎样避免递归（知识点 6～8）。
// TODO 7：校验与共同验收全部完成，特别是 RD 在职导师规则、筹备部零选项和无额外 HTTP 请求。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 2, selection: 'single',
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-06/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'active', type: 'boolean', label: '在职' },
      { name: 'departmentCode', type: 'string', label: '部门' },
      { name: 'positionCode', type: 'string', label: '职位' },
      { name: 'positionLabel', type: 'string', label: '职位说明' },
      { name: 'mentor', type: 'string', label: '导师' },
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
      </div>
      <Form dataSet={employeeDS} columns={2}>
        <Output name="name" /><Switch name="active" />
        {/* 部门 / 职位的文本框是占位输入，待改成级联下拉。 */}
        <TextField name="departmentCode" /><TextField name="positionCode" />
        <TextField name="mentor" /><Output name="positionLabel" />
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
