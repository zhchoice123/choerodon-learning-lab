// 【练习·标准】两位员工资料。只读、校验与回滚要求见 README；不保存到后端。
import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：让编辑表单绑定当前员工；已有字段规则沿用单元 03。参照知识点 1、2。
// TODO 2：补齐五类输入控件，ID / 编码只读；邮箱占满两列。参照知识点 3、4、5。
// TODO 3：实现第一 / 第二位员工切换，保留各自草稿；空数据时不能访问不存在的记录。参照知识点 2。
// TODO 4：预览始终绑定本次加载的第一位员工，切换当前员工不改变预览对象。参照知识点 5。
// TODO 5：切换只读时禁止表单输入、校验和重置，切回编辑保留草稿。参照知识点 5。
// TODO 6：等待表单校验，显示通过 / 不通过和异常；通过不等于保存。参照知识点 6。
// TODO 7：下面重置能运行，却会影响别的员工草稿。解释并修正；走表单重置事件，且不重新查询。参照知识点 7。
// TODO 8：观察两条记录、日期和布尔值的回滚；按 README 验收请求次数。参照知识点 4、6、7。

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false, dataKey: 'content', totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [{ value: 'M', meaning: '男' }, { value: 'F', meaning: '女' }],
  });
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 2,
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-04/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名', required: true,
        defaultValidationMessages: { valueMissing: '请输入姓名' } },
      { name: 'email', type: 'string', label: '邮箱', required: true },
      { name: 'sex', type: 'string', label: '性别', options: sexOptions,
        textField: 'meaning', valueField: 'value', required: true },
      { name: 'age', type: 'number', label: '年龄', required: true, min: 18, max: 60 },
      { name: 'startDate', type: 'date', label: '入职日期', required: true, format: 'YYYY-MM-DD' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
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

  return (
    <div>
      <p>员工资料表单待完成；数据源已接入，输入区绑定、预览和交互仍是 TODO。</p>
      <div className="toolbar">
        <Button onClick={handleFirst}>第一位员工</Button>
        <Button onClick={handleSecond}>第二位员工</Button>
        <Button onClick={() => setReadOnly(!readOnly)}>{readOnly ? '切换为编辑' : '切换为只读'}</Button>

      </div>
      <Form ref={formRef} {...editProps}>
        <TextField name="name" />
        <TextField name="email" />
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
