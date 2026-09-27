// 【练习·挑战】两位员工资料。只读、校验与回滚要求见 README；不保存到后端。
import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Form, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：完成八个员工字段的元信息、校验和输入 / 只读控件，布局遵守共同验收。
// TODO 2：编辑区跟随当前员工；能切换两位员工，保留各自的未保存修改。
// TODO 3：预览固定展示本次加载的第一位员工；直接反映它的修改。
// TODO 4：提供编辑 / 只读两种模式，切换保留草稿，只读时禁止修改与重置。
// TODO 5：显示真实的等待和校验结果，失败可重试，不发生保存请求。
// TODO 6：修正会丢失另一位员工修改的重置；只恢复当前员工，且清除旧提示。
// TODO 7：增加空结果演示与重新加载；空记录时禁用切换、校验和重置，恢复后重新建立正确绑定。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 2,
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-04/employees', method: 'GET' } },
    fields: [{ name: 'id', type: 'number', label: '员工 ID' }],
  });
}

export default observer(function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const formRef = useRef(null);
  const [readOnly, setReadOnly] = useState(false);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const editProps = {};
  const previewProps = {};
  const handleFirst = () => {};
  const handleSecond = () => {};
  const handleValidate = () => setResult('表单校验待完成');
  const handleReset = () => {
    // 故意保留的隐患：有多条草稿时，重置范围是否正确？
    employeeDS.reset();
    setResult('骨架执行了整组重置，请修正范围');
  };
  const handleEmpty = () => {};
  const handleReload = () => {};
  return (
    <div>
      <p>员工资料表单待完成；数据源已接入，输入区绑定、预览和交互仍是 TODO。</p>
      <div className="toolbar">
        <Button onClick={handleFirst}>第一位员工</Button>
        <Button onClick={handleSecond}>第二位员工</Button>
        <Button onClick={() => setReadOnly(!readOnly)}>{readOnly ? '切换为编辑' : '切换为只读'}</Button>
        <Button onClick={handleEmpty}>演示空结果</Button>
        <Button onClick={handleReload}>重新加载员工</Button>
      </div>
      <Form ref={formRef} {...editProps}>
        <p>待补齐员工字段和布局</p>
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate}>校验员工表单</Button>
        <Button onClick={handleReset}>恢复当前员工资料</Button>
      </div>
      <h3>固定第一位员工的只读预览</h3>
      <Form {...previewProps}><p>待绑定第一位员工并补齐只读字段</p></Form>
      <p role="status">{result}</p>
      <div className="status-bar">
        已读取 {employeeDS.length} 位员工 ｜ 当前：{employeeDS.current ? employeeDS.current.get('name') : '无'} ｜
        模式按钮：{readOnly ? '只读（绑定待完成）' : '编辑'}
      </div>
    </div>
  );
});
