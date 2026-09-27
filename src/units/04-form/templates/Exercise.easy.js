// 【练习·入门】两位员工资料。只读、校验与回滚要求见 README；不保存到后端。
import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Form, TextField, Select, NumberField, DatePicker, Switch, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：给编辑 Form 的配置补 dataSet，值来自 employeeDS，默认编辑 current。
// TODO 2：编辑 Form 使用 columns={2}；email 控件使用 colSpan={2}。
// TODO 3：从 choerodon-ui/pro 导入 Output，展示 id / code；它们不能被输入修改。
// TODO 4：核对已放置的 Select、NumberField、DatePicker、Switch 的 name 和字段类型；补全只读预览。
// TODO 5：第一 / 第二位按钮通过 employeeDS.get(index) 和 current 切换记录；先判断记录存在。
// TODO 6：预览 Form 使用 record 显式绑定 employeeDS.get(0)，内部使用 Output。
// TODO 7：给编辑 Form 配 readOnly；按钮用 disabled 限制只读模式下的校验和重置。
// TODO 8：handleValidate 等待 formRef.current.checkValidity()，用布尔结果区分成功 / 失败。
// TODO 9：校验增加等待状态和 try / catch / finally；结果只表示校验，不表示保存。
// TODO 10：employeeDS.reset() 会重置几条记录？改用表单内 type="reset" 按钮和 Form.onReset。
//          依据 node_modules/choerodon-ui/pro/lib/form/Form.js 的 handleReset；不要阻止默认回滚。
// TODO 11：先改第一位姓名，再改第二位日期和在职；只重置第二位，观察第一位是否保留。

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
        <Select name="sex" />
        <NumberField name="age" />
        <DatePicker name="startDate" />
        <Switch name="active" />
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
