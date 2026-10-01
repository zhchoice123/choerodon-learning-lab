// 【样例】03-5 等待校验：validate() 返回 Promise，必须 await；校验通过 ≠ 已保存。
// 查重接口：GET /mock/s/03-5/roles/check-code（约 250ms 后应答）
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';

const CODE_PATTERN = /^[a-z][a-z0-9-]{2,19}$/;

function createRoleDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'code', type: 'string', label: '角色编码', required: true, pattern: CODE_PATTERN,
        validator: async (value) => {
          if (!value || !CODE_PATTERN.test(value)) return true;
          try {
            const response = await fetch(`/mock/s/03-5/roles/check-code?code=${encodeURIComponent(value)}`);
            if (!response.ok) return '编码校验服务暂不可用';
            return (await response.json()).available || '角色编码已存在';
          } catch (error) {
            return '编码校验请求失败';
          }
        },
      },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const [checking, setChecking] = useState(false);

  // 知识点 1：validate() 返回 Promise<boolean>，await 之后拿到的才是最终结果
  // 知识点 2：校验期间禁用按钮，避免重复点击；结束后无论成功失败都要恢复
  // 知识点 3：本节只校验，「校验通过」不等于「已保存」，提示里要说清楚
  const check = async () => {
    setChecking(true);
    setResult('正在校验……');
    try {
      const valid = await roleDS.validate();
      setResult(valid ? '校验通过（尚未保存）' : '校验未通过，请看字段提示');
    } catch (error) {
      setResult('校验没有完成，请稍后重试');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <p>编码填 site-admin（已存在）后点校验：要等查重返回，才显示「未通过」。</p>
      <Form dataSet={roleDS} columns={1}>
        <TextField name="code" />
      </Form>
      <Button onClick={check} loading={checking}>校验</Button>
      <p role="status">{result}</p>
    </div>
  );
}
