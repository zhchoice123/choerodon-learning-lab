// 【练习·标准】员工草稿：只校验，不提交；请先阅读 README 的共同验收。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：让六个字段必填，自定义姓名、编码的空值提示。参照知识点 2。
// TODO 2：员工编码是 EMP 加三位数字；邮箱先检查基本格式并提供中文提示。参照知识点 4。
// TODO 3：年龄限制在 18～60，定制上下界消息。参照知识点 6。
// TODO 4：邮箱还必须等于「员工编码的小写形式@example.com」；空值交给必填校验。
//         用同步 validator 实现，不改写输入值。参照知识点 3；跨字段读取是变化点。
// TODO 5：编码接入员工查重接口；格式不合格不请求；重复和请求失败都不能通过。参照知识点 5。
// TODO 6：补齐性别选项 M / F，显示男 / 女，实际保存编码。参照知识点 1、7。
// TODO 7：用字段级配置接入 U03.EMPLOYMENT_TYPE，适配 content；不改全局配置。参照知识点 8。
// TODO 8：handleValidate 能运行却提前宣告通过。解释原因并修正，处理等待、失败和异常。参照知识点 9。

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [],
  });
  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'sex', type: 'string', label: '性别', options: sexOptions },
      { name: 'employmentType', type: 'string', label: '用工类型' },
    ],
  });
}

const EmployeeValues = observer(({ dataSet }) => (
  <div className="status-bar">
    实际性别编码：{dataSet.current.get('sex') || '未选择'} ｜
    实际用工类型编码：{dataSet.current.get('employmentType') || '未选择'}
  </div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => {
    // 故意保留的隐患：不要把这个判断直接当成验收通过。
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };

  return (
    <div>
      <p>员工校验与值集待完成；本单元不保存数据。</p>
      <Form dataSet={employeeDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="age" />
        <TextField name="email" />
        <Select name="sex" />
        <Select name="employmentType" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate}>校验员工草稿</Button>
      </div>
      <p role="status">{result}</p>
      <EmployeeValues dataSet={employeeDS} />
    </div>
  );
}
