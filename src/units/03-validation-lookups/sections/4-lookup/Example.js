// 【样例】03-4 值集 lookupCode：选项从后端读取，字段上只写一个编码。
// 值集接口：GET /mock/s/03-4/lookups/U03.ROLE_VISIBILITY → { content: [{ value, meaning }], ... }
import React, { useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'visibility', type: 'string', label: '可见范围', required: true,
        // 知识点 1：lookupCode 是值集编码，lookupUrl 根据编码生成请求地址（字段级配置，不改全局）
        lookupCode: 'U03.ROLE_VISIBILITY',
        lookupUrl: (code) => `/mock/s/03-4/lookups/${encodeURIComponent(code)}`,
        textField: 'meaning',
        valueField: 'value',
        // 知识点 2：本接口返回分页结构，选项在 content 里，用 transformResponse 取出数组
        // 写成函数返回普通对象：MobX 4 会把直接写的数组变成 ObservableArray，axios 无法识别
        lookupAxiosConfig: () => ({
          method: 'GET',
          transformResponse: [(body) => {
            const payload = typeof body === 'string' ? JSON.parse(body) : body;
            return Array.isArray(payload) ? payload : payload.content;
          }],
        }),
      },
    ],
  });
}

const SavedValue = observer(({ dataSet }) => (
  <div className="status-bar">记录里保存的是：{dataSet.current.get('visibility') || '未选择'}</div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <div>
      <p>打开下拉时，Network 里有一次 lookups/U03.ROLE_VISIBILITY 请求。</p>
      <Form dataSet={roleDS} columns={1}>
        <Select name="visibility" />
      </Form>
      <SavedValue dataSet={roleDS} />
    </div>
  );
}
