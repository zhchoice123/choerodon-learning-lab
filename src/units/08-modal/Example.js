// 【样例】角色弹窗 / 抽屉共用编辑流程；列表只读，修改绑定打开时捕获的 Record。
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet, Table, Form, TextField, Switch, Output, Button, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

export function createRoleDataSet(autoQuery = true) {
  // 知识点 1：useMemo 创建列表 DS；create/update 只指向本单元，字段规则沿用前面单元。
  const dataSet = new DataSet({
    primaryKey: 'id', autoQuery, pageSize: 5, strictPageSize: false, autoQueryAfterSubmit: false,
    dataKey: 'content', totalKey: 'totalElements',
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
    transport: {
      read: { url: '/mock/unit-08/roles', method: 'GET' },
      create: { url: '/mock/unit-08/roles/create', method: 'POST' },
      update: { url: '/mock/unit-08/roles/update', method: 'POST' },
    },
    feedback: { submitFailed: error => {
      // dataset/data-set/DataSet.js:handleSubmitFail 在包装 DataSetRequestError 前调用本地反馈。
      dataSet.setState('submitError', error.response?.data?.message || error.message);
    } },
  });
  return dataSet;
}

const RoleForm = observer(({ record }) => (
  <div>
    {/* 知识点 2：Form 明确绑定 record；不要在点击确认时重新取 dataSet.current。 */}
    <Form record={record} columns={1} readOnly={!!record.getState('saving')}>
      <Output name="id" /><TextField name="code" /><TextField name="name" /><Switch name="enabled" />
    </Form>
    <p>名称填 FAIL 可观察服务端失败后弹窗保留。直接编辑 Record，底层列表会同步显示草稿。</p>
    <p role="status">{record.getState('dialogResult') || '编辑后确认保存，取消撤销本次草稿'}</p>
  </div>
));

export function openRoleEditor(dataSet, record, { drawer = false, onResult = () => {}, afterClose = () => {} } = {}) {
  const isNew = record.status === 'add';
  let pending = false;
  let disposed = false;
  let accepted = false;
  let rolledBack = false;
  const report = text => {
    if (!disposed) { record.setState('dialogResult', text); onResult(text); }
  };
  const rollback = () => {
    if (accepted || rolledBack) return;
    rolledBack = true;
    // 知识点 3：Record.js:reset 还原 pristineData；add 不会变 sync，也不会自动从列表移除。
    record.reset();
    if (isNew) dataSet.remove(record);
  };
  record.setState('dialogResult', '编辑后确认保存，取消撤销本次草稿');
  // 知识点 4：Modal.open 返回带 update / close 的句柄；drawer=true 复用同一 Form 与回调。
  // node_modules/choerodon-ui/pro/lib/modal/index.js 与 modal-container/ModalContainer.js:open。
  const modal = Modal.open({
    title: `${isNew ? '新增' : '编辑'}角色${drawer ? '（抽屉）' : '（弹窗）'}`,
    drawer, style: { width: 560 }, children: <RoleForm record={record} />,
    okText: '确认保存', cancelText: '取消修改', destroyOnClose: true,
    maskClosable: false, keyboardClosable: false, closable: true, closeOnLocationChange: false,
    onOk: async () => {
      // 知识点 5：Modal.js:handleOk 等待回调，严格 false 才阻止关闭；undefined 也可能关闭。
      if (pending || disposed) return false;
      pending = true;
      record.setState('saving', true);
      modal.update({ okProps: { disabled: true }, cancelProps: { disabled: true }, closable: false });
      try {
        if (!(await record.validate())) { report('校验未通过，请检查必填与格式'); return false; }
        if (disposed) return false;
        if (record.status === 'sync' && !record.dirty) {
          accepted = true;
          report('没有修改，直接关闭；未发写请求');
          return true;
        }
        dataSet.setState('submitError', undefined);
        // 知识点 6：只保存捕获的记录，避免顺带提交其他草稿。submitRecord 自带再次校验。
        // dataset/data-set/DataSet.js:submitRecord / write；请求仍是数组，按 content 回写。
        const response = await dataSet.submitRecord(record);
        if (!response) { report('未保存：校验不通过或未产生提交请求'); return false; }
        accepted = true;
        report(`保存成功，ID：${record.get('id')}，status：${record.status}`);
        return true;
      } catch (error) {
        // 知识点 7：捕获 HTTP 错误并返回 false；失败不 reset/query，允许原地修正重试。
        report(`保存失败：${dataSet.getState('submitError') || error.message}；草稿保留`);
        return false;
      } finally {
        pending = false;
        record.setState('saving', false);
        if (!disposed) modal.update({ okProps: { disabled: false }, cancelProps: { disabled: false }, closable: true });
        else if (!accepted) rollback();
      }
    },
    onCancel: () => {
      if (pending) return false;
      rollback();
      report(isNew ? '已取消新增，草稿行已移除' : '已取消编辑，恢复最近一次已保存的数据');
      return true;
    },
    // 知识点 8：句柄 close 不会自动调用 onCancel；onClose 兜底回滚，成功关闭不能再 reset。
    // modal-container/ModalContainer.js:open.close 调用 onClose；afterClose 在退出动画结束时调用。
    onClose: () => {
      if (pending && !disposed) return false;
      if (!pending) rollback();
      return true;
    },
    afterClose: () => { if (!disposed) afterClose(); },
  });
  return {
    dispose: () => {
      // 知识点 9：路由卸载只关闭自己的句柄，不 Modal.destroyAll；已发出的请求不会被撤销。
      disposed = true;
      if (!pending) rollback();
      modal.close(true);
    },
  };
}

export default observer(function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const session = useRef();
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState('尚未打开编辑器');
  useEffect(() => () => { session.current?.dispose(); }, []);
  const openEditor = (create, drawer) => {
    if (session.current || roleDS.status !== 'ready') return;
    const record = create ? roleDS.create() : roleDS.current;
    if (!record) return;
    setOpened(true);
    session.current = openRoleEditor(roleDS, record, { drawer, onResult: setResult,
      afterClose: () => { session.current = undefined; setOpened(false); } });
  };
  const disabled = opened || roleDS.status !== 'ready';
  return (
    <div>
      <p>先点击列表行定位当前角色，再打开弹窗或抽屉。新增与编辑共用同一个表单和保存流程。</p>
      <div className="toolbar">
        <Button disabled={disabled} onClick={() => openEditor(true, false)}>新增角色（弹窗）</Button>
        <Button disabled={disabled || !roleDS.current} onClick={() => openEditor(false, false)}>编辑当前（弹窗）</Button>
        <Button disabled={disabled} onClick={() => openEditor(true, true)}>新增角色（抽屉）</Button>
        <Button disabled={disabled || !roleDS.current} onClick={() => openEditor(false, true)}>编辑当前（抽屉）</Button>
      </div>
      <div className="status-bar">当前 ID：{roleDS.current?.get('id') ?? '待分配 / 无'} ｜
        status：{roleDS.current?.status || '无'} ｜ dirty：{String(roleDS.dirty)} ｜ 本页 {roleDS.length} 条</div>
      <Table dataSet={roleDS} columns={[{ name: 'id', width: 100 }, { name: 'code', width: 190 },
        { name: 'name', width: 220 }, { name: 'enabled', width: 80 }]} />
      <p role="status">{result}</p>
    </div>
  );
});
