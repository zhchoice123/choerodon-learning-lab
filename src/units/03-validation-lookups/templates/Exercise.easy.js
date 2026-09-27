// 【练习·入门】员工草稿：按编号补齐属性；表单容器已提供。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：六个字段都补 required: true。
// TODO 2：姓名、编码补 defaultValidationMessages.valueMissing，内容见 README。
// TODO 3：code 用 pattern 限制为 EMP 加三位数字；用 patternMismatch 写格式提示。
// TODO 4：age 补 min: 18、max: 60，定制 rangeUnderflow / rangeOverflow。
// TODO 5：email 补基本邮箱 pattern；不要只凭包含 @ 就认为邮箱合法。
// TODO 6：email 的 validator(value, name, record) 用 record.get('code') 检查邮箱和编码的关系。
//         正确时返回 true，错误时返回中文字符串；空值交给 required。
// TODO 7：code 的 async validator 调用 /mock/unit-03/employees/check-code?code=...。
//         先跳过空值和格式错误；检查 response.ok 和 available；catch 返回失败消息。
// TODO 8：sexOptions.data 补 F / 女；sex 字段补 textField / valueField。
// TODO 9：employmentType 补 lookupCode: 'U03.EMPLOYMENT_TYPE' 和字段级 lookupUrl。
// TODO 10：lookupAxiosConfig 用函数返回 GET 配置，并用 transformResponse 提取 content，兼容已转换的数组。
// TODO 11：下面 validate() 返回的是什么？为 handleValidate 增加 async / await 和异常处理。
//          等待期间显示「正在校验」，结束后区分 true / false；不要写成保存成功。

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [{ value: 'M', meaning: '男' }],
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
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };

  return (
    <div>
      <p>先配置 fields，再验证；本单元不保存数据。</p>
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
