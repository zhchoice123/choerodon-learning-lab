// 【练习·挑战】员工草稿。规则、接口和共同验收见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';

// TODO 1：六个字段必填；编码、邮箱满足格式约定；年龄 18～60；提示用中文。
// TODO 2：邮箱与员工编码一致，改变编码后再次校验也必须发现不一致。
// TODO 3：服务端判断编码是否可用，格式错误不请求；重复和服务故障不能放行。
// TODO 4：性别来自本地选项，用工类型来自本地值集；显示文本、保存编码，不影响其他单元。
// TODO 5：修正下面能运行却提前判定通过的逻辑；显示等待和最终结果，异常后仍可重试。
// TODO 6：实时展示两个选择字段的实际编码，完成共同验收中的请求观察。
// TODO 7：增加模拟历史数据操作，写入已失效用工类型 LEGACY；校验必须阻止，重新选择合法值后恢复。

function createEmployeeDataSet() {
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
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'employmentType', type: 'string', label: '用工类型' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => {
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };
  const handleLegacy = () => {};

  return (
    <div>
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
        <Button onClick={handleLegacy}>模拟历史用工类型</Button>
      </div>
      <p role="status">{result}</p>
      <div className="status-bar">实际性别编码：? ｜ 实际用工类型编码：?</div>
    </div>
  );
}
