// 【练习】03-4 值集 lookupCode：「用工类型」的选项从值集读取。
// 值集接口：GET /mock/s/03-4/lookups/U03.EMPLOYMENT_TYPE → { content: [{ value, meaning }], ... }
//   FULL_TIME 全职、PART_TIME 兼职、INTERN 实习
import React, { useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createEmployeeDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'employmentType', type: 'string', label: '用工类型', required: true,
        // TODO 1：配置值集编码和值集地址
        // TODO 2：用 GET 请求，并从响应的 content 里取出选项数组
      },
    ],
  });
}

const SavedValue = observer(({ dataSet }) => (
  <div className="status-bar">记录里保存的是：{dataSet.current.get('employmentType') || '未选择'}</div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <div>
      <Form dataSet={employeeDS} columns={1}>
        <Select name="employmentType" />
      </Form>
      <SavedValue dataSet={employeeDS} />
    </div>
  );
}
