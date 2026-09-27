// 【样例】角色资料：读取一条已有记录，只编辑和校验，不保存到后端。
import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Form, TextField, Select, NumberField, DatePicker, Switch, Output, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

export function createRoleDataSet() {
  // 知识点 1：沿用单元 03 的字段规则与 options；整个工厂由 useMemo 调用。
  const levelOptions = new DataSet({
    paging: false, dataKey: 'content', totalKey: 'totalElements',
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
    primaryKey: 'id', autoQuery: true, pageSize: 1,
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-04/roles', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称', required: true,
        defaultValidationMessages: { valueMissing: '请输入角色名称' } },
      { name: 'level', type: 'string', label: '层级', required: true,
        options: levelOptions, textField: 'meaning', valueField: 'value' },
      { name: 'memberCount', type: 'number', label: '成员数', required: true, min: 0, max: 200 },
      // 本单元只编辑日期，不保留原始时间；类型和格式放在字段元信息中。
      { name: 'createdAt', type: 'date', label: '创建日期', required: true, format: 'YYYY-MM-DD' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

export default observer(function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const formRef = useRef(null);
  const [readOnly, setReadOnly] = useState(false);
  const [result, setResult] = useState('尚未校验');
  const [checking, setChecking] = useState(false);
  const record = roleDS.current;

  // 知识点 6：1.6.7 的 Form 没有 validate()；checkValidity() 返回 Promise<boolean>。
  // 依据 node_modules/choerodon-ui/pro/lib/form/Form.js 的 checkValidity：
  // 有 dataSet 时委托 dataSet.validate()，不是只检查表单里可见的输入框。
  const handleValidate = async () => {
    if (!formRef.current || !record) return;
    setChecking(true);
    try {
      const valid = await formRef.current.checkValidity();
      setResult(valid ? '校验通过（尚未保存）' : '校验未通过，请检查字段提示');
    } catch (error) {
      setResult('校验未完成，请重试');
    } finally {
      setChecking(false);
    }
  };

  if (!record) return <p role="status">正在读取角色资料；没有记录时不渲染可编辑表单。</p>;

  return (
    <div>
      <p>角色资料只在内存里修改。切换只读模式保留草稿，刷新页面重新读取初始值。</p>
      <div className="toolbar">
        <Button onClick={() => setReadOnly(!readOnly)} disabled={checking}>
          {readOnly ? '切换为编辑' : '切换为只读'}
        </Button>
      </div>
      {/* 知识点 2：Form 的 dataSet 默认绑定 current，子控件通过 name 读写字段。
          依据 node_modules/choerodon-ui/pro/lib/form/Form.js 的 record getter。 */}
      {/* 知识点 3：columns 是字段列数；colSpan=2 让角色名称占满本行。 */}
      <Form ref={formRef} dataSet={roleDS} columns={2} readOnly={readOnly}
        onReset={() => setResult('已恢复初始角色资料（没有请求后端）')}>
        <Output name="id" />
        <Output name="code" />
        <TextField name="name" colSpan={2} />
        {/* 知识点 4：控件与字段类型配合，Switch 写入布尔值，DatePicker 写入日期值。 */}
        <Select name="level" />
        <NumberField name="memberCount" />
        <DatePicker name="createdAt" />
        <Switch name="enabled" />
        {/* 知识点 7：Pro Button 使用 type="reset"，不是 htmlType。
            依据 node_modules/choerodon-ui/pro/lib/button/Button.d.ts；
            Form.js 的 handleReset 会先调用 onReset，未 preventDefault 才 record.reset()。
            Record.reset 依据 dataset/data-set/Record.js 恢复 pristineData，不发请求。 */}
        <div className="toolbar" colSpan={2}>
          <Button onClick={handleValidate} loading={checking} disabled={readOnly}>校验角色表单</Button>
          <Button type="reset" disabled={readOnly || checking}>恢复初始角色资料</Button>
        </div>
      </Form>
      {/* 知识点 5：显式 record 优先于 dataSet/current；两个 Form 共享同一个 Record。
          Output.isEditable() 固定返回 false，依据 pro/lib/output/Output.js。
          readOnly 仅限制 UI 输入，不阻止程序调用 record.set。 */}
      <h3>只读预览（显式绑定 record）</h3>
      <Form record={record} columns={2}>
        <Output name="name" colSpan={2} />
        <Output name="level" />
        <Output name="memberCount" />
        <Output name="createdAt" />
        <Output name="enabled" />
      </Form>
      <p role="status">{result}</p>
      <div className="status-bar">当前模式：{readOnly ? '只读' : '编辑'} ｜ 已修改：{record.dirty ? '是' : '否'}</div>
    </div>
  );
});
