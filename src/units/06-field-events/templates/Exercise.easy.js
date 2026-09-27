// 【练习·入门】员工部门与职位联动；只改浏览器草稿，规则和选项数据见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Output, TextField, Switch, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：用两个 paging:false 的 options DataSet 准备 README 的部门 / 职位；均写 dataKey / totalKey。
// TODO 2：补齐 fields，部门 / 职位用 options、textField、valueField，输入控件换成 Select。
// TODO 3：职位加 cascadeMap，左侧写选项里的 department，右侧写员工里的 departmentCode。
// TODO 4：导师的 dynamicProps.required 在 active=true 且部门为 RD 时成立；职位在没有部门时 disabled。
// TODO 5：用 computedProps.label 让职位标题随部门变化；回调只读 record，不在里面 set。
// TODO 6：events.load 用 dataSet 读取条数并记日志；不要 set 业务字段制造初始 dirty。
// TODO 7：检查 update 里用 current 清子值的隐患；按 name 分支，清职位 / 说明，职位变化时 record.set 说明。
// TODO 8：events.select 记录 previous / record，并显式设置 current；两个按钮分别调用 select(0/1)。
// TODO 9：第三个按钮只对 get(1) 调用 set，当前第一条不应被清空；同值 set 不应新增 update。
// TODO 10：状态栏展示 current、dirty、三类事件次数；日志最多 8 条，记录从旧值到新值。
// TODO 11：await validate 显示真实结果；验证筹备部没有职位时仍清旧值，联动和切换都不请求后端。

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
