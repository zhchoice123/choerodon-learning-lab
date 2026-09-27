// 【样例】角色草稿：只校验，不提交。表单是现成容器，本单元重点阅读 fields。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const CODE_PATTERN = /^[a-z][a-z0-9-]{2,19}$/;

export function createRoleDataSet() {
  // 知识点 1：options 本身也是 DataSet；它只保存选项，不代表待编辑的角色。
  // 工厂整体由 useMemo 调用，因此这里的两个 DataSet 都只在本次挂载时创建。
  const levelOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [
      { value: 'site', meaning: '平台' },
      { value: 'organization', meaning: '租户' },
      { value: 'project', meaning: '项目' },
    ],
  });

  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      {
        name: 'name', type: 'string', label: '角色名称',
        // 知识点 2：规则写在 fields；消息的键是 valueMissing，不是 required。
        required: true,
        defaultValidationMessages: { valueMissing: '请输入角色名称' },
        // 知识点 3：同步 validator 返回 true 代表通过，返回中文字符串代表失败。
        // 空值交给 required；避免给一个问题提供两套冲突提示。
        validator: (value) => !value || value.trim().length >= 2 || '角色名称至少需要两个字符',
      },
      {
        name: 'code', type: 'string', label: '角色编码',
        // 知识点 4：pattern 约束整个编码，不要给正则加 g，否则 test 会保留游标。
        required: true,
        pattern: CODE_PATTERN,
        defaultValidationMessages: {
          valueMissing: '请输入角色编码',
          patternMismatch: '编码须为 3～20 位，以小写字母开头，仅含小写字母、数字和短横线',
        },
        // 知识点 5：1.6.7 会等待 validator 的 Promise；网络失败也必须给出失败消息。
        validator: async (value) => {
          if (!value || !CODE_PATTERN.test(value)) return true;
          try {
            const response = await fetch(`/mock/unit-03/roles/check-code?code=${encodeURIComponent(value)}`);
            if (!response.ok) return '编码校验服务暂不可用，请稍后重试';
            const result = await response.json();
            if (typeof result.available !== 'boolean') return '编码校验响应不正确，请稍后重试';
            return result.available || '角色编码已存在';
          } catch (error) {
            return '编码校验请求失败，请检查本地服务';
          }
        },
      },
      {
        name: 'memberLimit', type: 'number', label: '成员上限', defaultValue: 10,
        // 知识点 6：number 的 min / max 是数值边界，不是字符串长度。
        required: true, min: 1, max: 100,
        defaultValidationMessages: {
          valueMissing: '请输入成员上限',
          rangeUnderflow: '成员上限不能小于 1',
          rangeOverflow: '成员上限不能大于 100',
        },
      },
      {
        name: 'level', type: 'string', label: '层级', required: true,
        // 知识点 7：Select 显示 meaning，记录保存 value；可观察下方的实际编码。
        options: levelOptions, textField: 'meaning', valueField: 'value',
      },
      {
        name: 'visibility', type: 'string', label: '可见范围', required: true,
        // 知识点 8：字段级 lookup 配置，不调用全局 configure。
        lookupCode: 'U03.ROLE_VISIBILITY',
        lookupUrl: (code) => `/mock/unit-03/lookups/${encodeURIComponent(code)}`,
        textField: 'meaning', valueField: 'value',
        // 用函数返回普通配置，避免 MobX 4 把 transformResponse 数组转成 ObservableArray。
        lookupAxiosConfig: () => ({
          method: 'GET',
          // LookupCodeStore 使用配置上下文的 dataKey，并不直接使用列表的 dataKey 属性。
          // 在字段的 Axios 响应转换中取出 content，交给 1.6.7 支持的数组解析分支。
          transformResponse: [(body) => {
            const payload = typeof body === 'string' ? JSON.parse(body) : body;
            // 1.6.7 的缓存适配器可能复用已转换的响应，重复转换时也保留数组。
            return Array.isArray(payload) ? payload : payload.content;
          }],
        }),
      },
    ],
  });
}

const RoleValues = observer(({ dataSet }) => (
  <div className="status-bar">
    实际层级编码：{dataSet.current.get('level') || '未选择'} ｜
    实际可见范围编码：{dataSet.current.get('visibility') || '未选择'}
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const [checking, setChecking] = useState(false);

  // 知识点 9：validate() 返回 Promise<boolean>，必须等待；校验通过并没有保存角色。
  const handleValidate = async () => {
    setChecking(true);
    setResult('正在校验，请等待');
    try {
      const valid = await roleDS.validate();
      setResult(valid ? '校验通过（尚未保存）' : '校验未通过，请检查字段提示');
    } catch (error) {
      setResult('校验未完成，请检查本地服务后重试');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <p>试试重复编码 site-admin、可用编码 learning-role。这里不会创建角色。</p>
      <Form dataSet={roleDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="memberLimit" />
        <Select name="level" />
        <Select name="visibility" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate} loading={checking}>校验角色草稿</Button>
      </div>
      <p role="status">{result}</p>
      <RoleValues dataSet={roleDS} />
    </div>
  );
}
