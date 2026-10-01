// 【练习】03-3 options 下拉：性别下拉显示「男 / 女」，记录里保存 M / F。
import React, { useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createEmployeeDataSet() {
  // TODO 1：创建性别选项 DataSet：M → 男，F → 女
  return new DataSet({
    autoCreate: true,
    fields: [
      // TODO 2：性别字段绑定选项，下拉显示中文，记录保存 M / F
      { name: 'sex', type: 'string', label: '性别', required: true },
    ],
  });
}

const SavedValue = observer(({ dataSet }) => (
  <div className="status-bar">记录里保存的是：{dataSet.current.get('sex') || '未选择'}</div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <div>
      <Form dataSet={employeeDS} columns={1}>
        <Select name="sex" />
      </Form>
      <SavedValue dataSet={employeeDS} />
    </div>
  );
}
