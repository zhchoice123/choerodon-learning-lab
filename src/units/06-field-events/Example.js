// 【样例】角色权限联动：两条草稿、静态选项、单次读取；不向后端保存。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Output, Select, Switch, NumberField, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

export function createRoleDataSet(autoQuery = true) {
  // 知识点 1：options DataSet 也在 useMemo 的工厂内创建；级联只过滤本地选项，不重新请求。
  const scopeOptions = new DataSet({
    paging: false, dataKey: 'content', totalKey: 'totalElements',
    fields: [{ name: 'value', type: 'string', label: '编码' }, { name: 'meaning', type: 'string', label: '范围' }],
    data: [
      { value: 'site', meaning: '平台' },
      { value: 'organization', meaning: '租户' },
      { value: 'project', meaning: '项目' },
    ],
  });
  const permissionOptions = new DataSet({
    paging: false, dataKey: 'content', totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '权限' },
      { name: 'scopeCode', type: 'string', label: '所属范围' },
    ],
    data: [
      { value: 'site.view', meaning: '平台查看', scopeCode: 'site' },
      { value: 'site.manage', meaning: '平台管理', scopeCode: 'site' },
      { value: 'organization.view', meaning: '租户查看', scopeCode: 'organization' },
      { value: 'project.view', meaning: '项目查看', scopeCode: 'project' },
      { value: 'project.edit', meaning: '项目编辑', scopeCode: 'project' },
    ],
  });
  const log = (dataSet, text) => {
    // 状态日志不是业务字段，不会触发 update，也不改变 dirty；最多保留 8 条。
    dataSet.setState('eventLog', [...(dataSet.getState('eventLog') || []), text].slice(-8));
  };
  return new DataSet({
    primaryKey: 'id', autoQuery, pageSize: 2, selection: 'single',
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-06/roles', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'enabled', type: 'boolean', label: '启用' },
      { name: 'scope', type: 'string', label: '权限范围', required: true,
        options: scopeOptions, textField: 'meaning', valueField: 'value' },
      {
        name: 'permissionCode', type: 'string', label: '权限',
        options: permissionOptions, textField: 'meaning', valueField: 'value',
        // 知识点 2：左边是选项字段，右边是本条角色字段，不能反写。
        // 依据 node_modules/choerodon-ui/pro/lib/select/Select.js 的 cascadeOptions。
        cascadeMap: { scopeCode: 'scope' },
        // 知识点 3：使用属性函数映射，不用已废弃的整对象 dynamicProps 回调。
        // 依据 node_modules/choerodon-ui/dataset/data-set/Field.js 的 get / executeDynamicProps。
        // 回调只读 record；禁用是界面约束，不会阻止程序调用 record.set。
        dynamicProps: {
          required: ({ record }) => !!record && record.get('enabled') === true,
          disabled: ({ record }) => !record || !record.get('enabled') || !record.get('scope'),
        },
        // 知识点 4：computedProps 是带 MobX computed 缓存的字段属性，不是计算字段值。
        // Field.js:get 先取 computedProps 再取 dynamicProps；同一属性不要在两处重复定义。
        computedProps: {
          label: ({ record }) => `${{ site: '平台', organization: '租户', project: '项目' }[record?.get('scope')] || '待选'}权限`,
        },
      },
      { name: 'permissionSummary', type: 'string', label: '权限说明' },
      { name: 'memberCount', type: 'number', label: '成员数', min: 0, max: 200,
        computedProps: { readOnly: ({ record }) => !record || !record.get('enabled') } },
    ],
    // 知识点 5：在构造时注册一次，不在 render / effect 每次重复 addEventListener。
    // node_modules/choerodon-ui/dataset/data-set/DataSet.js 的 initEvents / loadData：
    // load 参数仅 { dataSet }，日志不能假设有 record 参数。
    events: {
      load: ({ dataSet }) => {
        dataSet.setState('loadCount', (dataSet.getState('loadCount') || 0) + 1);
        log(dataSet, `load：读取 ${dataSet.length} 条角色，当前 ${dataSet.current?.get('id') || '无'}`);
      },
      // 知识点 6：node_modules/choerodon-ui/dataset/data-set/Record.js 的 set
      // 提供 record/name/value/oldValue，只有值变化才发 update。
      // 必须更新事件的 record，不能假定它就是 current；record.set 会再次触发 update。
      update: ({ dataSet, record, name, value, oldValue }) => {
        dataSet.setState('updateCount', (dataSet.getState('updateCount') || 0) + 1);
        log(dataSet, `update：${record.get('id')}.${name}，${oldValue ?? '空'} → ${value ?? '空'}`);
        if (name === 'scope') {
          // 知识点 7：显式清除旧子值，独立于 Select 是否挂载或是否有可选项。
          // Select.js:processSelectedData 的自动清理有 filteredOptions.length 等条件，不能包办数据一致性。
          record.set({ permissionCode: undefined, permissionSummary: '' });
        } else if (name === 'permissionCode') {
          const option = permissionOptions.find((item) => item.get('value') === value
            && item.get('scopeCode') === record.get('scope'));
          record.set('permissionSummary', option ? option.get('meaning') : '');
        }
        // permissionSummary 不再反向设置 permissionCode：联动单向，避免事件循环。
      },
      // 知识点 8：node_modules/choerodon-ui/dataset/data-set/DataSet.js 的 select
      // 发 { dataSet, record, previous }，选中不等于定位。
      // 本例显式把选中记录设为 current，Form 才跟随；重复选择已选记录不再发 select。
      select: ({ dataSet, record, previous }) => {
        dataSet.current = record;
        dataSet.setState('selectCount', (dataSet.getState('selectCount') || 0) + 1);
        log(dataSet, `select：${previous?.get('id') || '无'} → ${record.get('id')}`);
      },
    },
  });
}

export default observer(function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('只联动和校验，不保存');
  const [checking, setChecking] = useState(false);
  const record = roleDS.current;
  const handleValidate = async () => {
    if (!record) return;
    setChecking(true);
    try {
      const valid = await roleDS.validate();
      setResult(valid ? '校验通过（两条角色草稿，尚未保存）' : '校验未通过，请检查两条角色草稿');
    } catch (error) {
      setResult('校验未完成，请检查本地服务后重试');
    } finally {
      setChecking(false);
    }
  };
  return (
    <div>
      <p>切换权限范围后旧权限清空；选择新权限会写入说明。关闭启用会禁用权限、只读成员数，但保留草稿。</p>
      <div className="toolbar">
        <Button disabled={!roleDS.get(0)} onClick={() => roleDS.select(0)}>选择第一位角色</Button>
        <Button disabled={!roleDS.get(1)} onClick={() => roleDS.select(1)}>选择第二位角色</Button>
        <Button disabled={!roleDS.get(1)} onClick={() => roleDS.get(1).set('scope', 'project')}>将第二位角色切到项目</Button>
      </div>
      <Form dataSet={roleDS} columns={2}>
        <Output name="id" /><Output name="name" />
        <Switch name="enabled" /><NumberField name="memberCount" />
        <Select name="scope" /><Select name="permissionCode" />
        <Output name="permissionSummary" colSpan={2} />
      </Form>
      <div className="toolbar"><Button disabled={!record} loading={checking} onClick={handleValidate}>校验角色联动</Button></div>
      <p role="status">{result}</p>
      <div className="status-bar">
        当前 ID：{record?.get('id') || '无'} ｜ 范围：{record?.get('scope') || '空'} ｜
        权限编码：{record?.get('permissionCode') || '空'} ｜ dirty：{String(roleDS.dirty)} ｜
        load：{roleDS.getState('loadCount') || 0} / update：{roleDS.getState('updateCount') || 0} / select：{roleDS.getState('selectCount') || 0}
      </div>
      <ol aria-label="角色事件日志">{(roleDS.getState('eventLog') || []).map((text, index) => <li key={index}>{text}</li>)}</ol>
    </div>
  );
});
