// 【样例】03-2 自定义 validator：同步规则和异步查重。
// 查重接口：GET /mock/s/03-2/roles/check-code?code=xxx → { available: true | false }
//   编码 service-down 模拟服务不可用（503），用来观察异常处理
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';

const CODE_PATTERN = /^[a-z][a-z0-9-]{2,19}$/;

function createRoleDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'name', type: 'string', label: '角色名称', required: true,
        // 知识点 1：validator 返回 true 表示通过，返回字符串表示失败（字符串就是提示）
        // 空值交给 required 处理，这里直接放行，避免两套提示冲突
        validator: (value) => !value || value.trim().length >= 2 || '角色名称至少需要两个字符',
      },
      {
        name: 'code', type: 'string', label: '角色编码', required: true, pattern: CODE_PATTERN,
        // 知识点 2：validator 可以是 async 函数，校验会等待它完成
        validator: async (value) => {
          if (!value || !CODE_PATTERN.test(value)) return true; // 格式问题交给 pattern
          try {
            const response = await fetch(`/mock/s/03-2/roles/check-code?code=${encodeURIComponent(value)}`);
            // 知识点 3：网络失败、服务异常也必须返回失败提示，不能当作通过
            if (!response.ok) return '编码校验服务暂不可用，请稍后重试';
            const result = await response.json();
            return result.available || '角色编码已存在';
          } catch (error) {
            return '编码校验请求失败，请检查本地服务';
          }
        },
      },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const check = async () => {
    setResult('正在校验……');
    setResult((await roleDS.validate()) ? '校验通过' : '校验未通过，请看字段提示');
  };
  return (
    <div>
      <p>编码试试：site-admin（已存在）、learning-role（可用）、service-down（服务异常）。</p>
      <Form dataSet={roleDS} columns={1}>
        <TextField name="name" />
        <TextField name="code" />
      </Form>
      <Button onClick={check}>校验</Button>
      <p role="status">{result}</p>
    </div>
  );
}
