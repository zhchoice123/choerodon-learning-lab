// 【样例】06-4 联动赋值：在 update 事件里用 record.set 清空失效的子值、带出关联值。
import React, { useMemo } from 'react';
import { DataSet, Form, Select, Output } from 'choerodon-ui/pro';

function createRoleDataSet() {
  const scopeOptions = new DataSet({ paging: false, data: [{ value: 'site', meaning: '平台' }, { value: 'project', meaning: '项目' }] });
  const permissionOptions = new DataSet({
    paging: false,
    data: [
      { value: 'site.view', meaning: '平台查看', scopeCode: 'site' },
      { value: 'project.view', meaning: '项目查看', scopeCode: 'project' },
      { value: 'project.edit', meaning: '项目编辑', scopeCode: 'project' },
    ],
  });
  return new DataSet({
    autoCreate: true,
    fields: [
      { name: 'scope', type: 'string', label: '权限范围', options: scopeOptions, textField: 'meaning', valueField: 'value' },
      { name: 'permission', type: 'string', label: '权限', options: permissionOptions, textField: 'meaning', valueField: 'value', cascadeMap: { scopeCode: 'scope' } },
      { name: 'summary', type: 'string', label: '权限说明' },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'scope') {
          // 知识点 1：父字段变化，旧的子值已经不属于新范围，显式清空（不要指望下拉自己清）
          record.set({ permission: undefined, summary: '' });
        } else if (name === 'permission') {
          // 知识点 2：选了权限，带出说明
          const option = permissionOptions.find((item) => item.get('value') === value);
          record.set('summary', option ? option.get('meaning') : '');
        }
        // 知识点 3：联动单向：summary 变化不会反过来设置 permission，避免事件循环
      },
    },
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <p>先选「项目 / 项目编辑」，再把范围改成「平台」：权限和说明都被清空。</p>
      <Form dataSet={roleDS} columns={1}>
        <Select name="scope" />
        <Select name="permission" />
        <Output name="summary" />
      </Form>
    </div>
  );
}
