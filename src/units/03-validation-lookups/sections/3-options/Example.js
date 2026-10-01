// 【样例】03-3 options 下拉：Select 显示 meaning，记录里保存 value。
import React, { useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  // 知识点 1：选项本身也是一个 DataSet，只保存选项，和正在编辑的角色无关
  const levelOptions = new DataSet({
    paging: false,
    data: [
      { value: 'site', meaning: '平台层' },
      { value: 'organization', meaning: '租户层' },
      { value: 'project', meaning: '项目层' },
    ],
  });
  return new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'level', type: 'string', label: '层级', required: true,
        // 知识点 2：options 指定选项，textField 是显示的字段，valueField 是保存的字段
        options: levelOptions, textField: 'meaning', valueField: 'value',
      },
    ],
  });
}

const SavedValue = observer(({ dataSet }) => (
  <div className="status-bar">记录里保存的是：{dataSet.current.get('level') || '未选择'}</div>
));

export default function Example() {
  // 知识点 3：工厂整体交给 useMemo，两个 DataSet 都只创建一次
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <Form dataSet={roleDS} columns={1}>
        <Select name="level" />
      </Form>
      <SavedValue dataSet={roleDS} />
    </div>
  );
}
