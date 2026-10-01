// 【样例】04-3 只读：Form 的 readOnly 切换整张表单；Output 永远只读，适合做预览。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Output, Button } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    data: [{ name: '平台管理员', memberCount: 3 }],
    fields: [
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'memberCount', type: 'number', label: '成员数' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [readOnly, setReadOnly] = useState(false);
  return (
    <div>
      <Button onClick={() => setReadOnly(!readOnly)}>{readOnly ? '切换为编辑' : '切换为只读'}</Button>
      {/* 知识点 1：readOnly 只锁住界面输入；切换回来，草稿还在 */}
      <Form dataSet={roleDS} columns={1} readOnly={readOnly}>
        <TextField name="name" />
        <NumberField name="memberCount" />
      </Form>
      <h4>预览</h4>
      {/* 知识点 2：Output 只显示，不能编辑
          知识点 3：record 属性显式绑定一条记录，优先于 dataSet / current */}
      <Form record={roleDS.current} columns={1}>
        <Output name="name" />
        <Output name="memberCount" />
      </Form>
    </div>
  );
}
