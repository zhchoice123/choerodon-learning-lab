// 【样例】04-2 常用控件：控件要和字段类型配合，写入的值类型才正确。
import React, { useMemo } from 'react';
import { DataSet, Form, TextField, Select, NumberField, DatePicker, Switch } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  const levelOptions = new DataSet({
    paging: false,
    data: [
      { value: 'site', meaning: '平台层' },
      { value: 'project', meaning: '项目层' },
    ],
  });
  return new DataSet({
    data: [{ name: '平台管理员', level: 'site', memberCount: 3, createdAt: '2023-01-15', enabled: true }],
    fields: [
      { name: 'name', type: 'string', label: '角色名称' }, // TextField：文字
      { name: 'level', type: 'string', label: '层级', options: levelOptions, textField: 'meaning', valueField: 'value' }, // Select：选项
      { name: 'memberCount', type: 'number', label: '成员数', min: 0 }, // NumberField：数字
      { name: 'createdAt', type: 'date', label: '创建日期' }, // DatePicker：日期
      { name: 'enabled', type: 'boolean', label: '启用' }, // Switch：开关，写入 true / false
    ],
  });
}

// 状态栏显示记录里真实保存的值和类型
const RawValues = observer(({ dataSet }) => {
  const record = dataSet.current;
  const describe = (name) => `${name}=${JSON.stringify(record.get(name))}（${typeof record.get(name)}）`;
  return <div className="status-bar">{['memberCount', 'enabled'].map(describe).join(' ｜ ')}</div>;
});

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <Form dataSet={roleDS} columns={1}>
        <TextField name="name" />
        <Select name="level" />
        <NumberField name="memberCount" />
        <DatePicker name="createdAt" />
        <Switch name="enabled" />
      </Form>
      <RawValues dataSet={roleDS} />
    </div>
  );
}
