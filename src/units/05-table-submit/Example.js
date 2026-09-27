// 【样例】角色维护：每步观察 Network、记录状态和后端数据；与员工练习使用独立集合。
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

export function createRoleDataSet(autoQuery = true) {
  // 知识点 1：规则仍在 fields；新增记录的 id 留空，等待后端生成。
  const dataSet = new DataSet({
    primaryKey: 'id', autoQuery, pageSize: 5,
    dataKey: 'content', totalKey: 'totalElements',
    // 依据 node_modules/choerodon-ui/dataset/data-set/DataSet.js 的 commitData：
    // 默认会先截取 pageSize 条；这里局部关闭截断，让新增的第六行也参与回写。
    strictPageSize: false,
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', required: true, min: 0, max: 200, defaultValue: 0 },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
    // 知识点 2：默认 dataToJSON='dirty'，三个写接口都收到记录对象数组，包括 destroy。
    // 依据 node_modules/choerodon-ui/dataset/data-set/utils.js 的 prepareSubmitData / prepareForSubmit，
    // Record.js 的 toJSONData 会添加 __id / __status；不要擅自改成 { rows: data } 或 ID 数组。
    transport: {
      read: { url: '/mock/unit-05/roles', method: 'GET' },
      create: { url: '/mock/unit-05/roles/create', method: 'POST' },
      update: { url: '/mock/unit-05/roles/update', method: 'POST' },
      destroy: { url: '/mock/unit-05/roles/destroy', method: 'POST' },
    },
    // 知识点 3：响应 content 包含原 __id 和后端 id，框架将它回写到原 Record 并清除 dirty。
    // 依据 DataSet.js 的 handleSubmitSuccess / commitData、Record.js 的 commit。
    feedback: {
      submitFailed: (error) => {
        // DataSetRequestError.js 只复制 message/name/stack，不保留 response；
        // 因此在 DataSet.js 的 handleSubmitFail 包装异常前，保留原 HTTP 错误的中文消息。
        // 这是本 DataSet 的反馈配置，错误在下方状态栏展示，不修改全局反馈或 console。
        dataSet.setState('submitError', error.response?.data?.message || error.message || '请求失败');
      },
    },
  });
  return dataSet;
}

const RoleStatus = observer(({ dataSet }) => (
  <div className="status-bar">
    当前 ID：{dataSet.current?.get('id') ?? '待分配 / 无记录'} ｜
    当前 status：{dataSet.current?.status || '无'} ｜ dirty：{String(dataSet.dirty)} ｜
    add：{dataSet.created.length} / update：{dataSet.updated.length} / delete：{dataSet.destroyed.length}
  </div>
));

export default observer(function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未提交');
  const [busy, setBusy] = useState(false);

  // 知识点 4：editor 才是列的编辑开关，type / label 都来自 fields。
  const columns = [
    { name: 'id', width: 100 },
    { name: 'code', width: 180, editor: true },
    { name: 'name', width: 180, editor: true },
    { name: 'memberCount', width: 100, editor: true },
    { name: 'enabled', width: 80, editor: true },
  ];

  // 知识点 5：submit 自带 await validate；false 是校验失败，undefined 可能是没有变更。
  // 依据 node_modules/choerodon-ui/dataset/data-set/DataSet.js 的 submit / write。
  // 不能把 Promise 或“没有抛异常”直接当成提交成功，更不能在 finally 里 reset/query。
  const handleSave = async () => {
    if (busy) return;
    if (!roleDS.dirty) { setResult('没有待保存的修改'); return; }
    setBusy(true);
    setResult('正在保存');
    try {
      const response = await roleDS.submit();
      if (response === false) setResult('校验未通过，请检查必填与格式');
      else if (response) setResult('保存成功，已回写 ID 和状态');
      else setResult('没有产生提交请求，请检查待提交数据与配置');
    } catch (error) {
      // 知识点 6：create/update 失败不 commit、不 reset，草稿和 add/update/dirty 保留。
      // DataSet.js 的 write.catch / handleSubmitFail：destroyed 记录例外，会 reset 并恢复选中。
      setResult(`保存失败：${roleDS.getState('submitError') || error.message}。新增 / 修改草稿仍在，请核对后重试`);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy || roleDS.selected.length === 0) return;
    setBusy(true);
    try {
      const response = await roleDS.delete(roleDS.selected.slice());
      setResult(response === false ? '已取消删除' : '删除完成；未保存的新行只从本地移除');
    } catch (error) {
      setResult(`删除失败：${roleDS.getState('submitError') || error.message}。框架已撤销删除标记并恢复记录`);
    } finally {
      setBusy(false);
    }
  };

  // 知识点 7：TableQueryBar 的内置 delete 是确认后立即请求；remove 只标记后等待保存。
  // 依据 node_modules/choerodon-ui/pro/lib/table/query-bar/index.js 的 handleButton* / getButtons：
  // ['save', props] 可覆盖内置 onClick，这里为 save/delete 增加错误处理，保持原有动作语义。
  const disabled = busy || roleDS.status !== 'ready';
  const buttons = [
    ['add', { disabled }],
    ['save', { onClick: handleSave, disabled }],
    ['delete', { onClick: handleDelete, disabled: disabled || roleDS.selected.length === 0 }],
    ['reset', { disabled, afterClick: () => setResult('已撤销本地修改；已保存到后端的数据不会被重置') }],
  ];

  return (
    <div>
      <p>依次新增、保存、修改、保存、勾选删除。名称填 FAIL 会被后端固定拒绝；平台管理员不能删除。</p>
      <div className="toolbar">
        {/* 知识点 8：remove 后旧记录 status=delete，保存才发 destroy；reset 可撤销未提交删除。
            DataSet.js 的 remove / deleteRecord / reset：未保存的 add 则直接移出，不发 destroy。 */}
        <Button disabled={disabled || roleDS.selected.length === 0} onClick={() => {
          roleDS.remove(roleDS.selected.slice());
          setResult('已暂存删除；可以保存或重置，尚未请求后端');
        }}>暂存删除（观察 delete）</Button>
      </div>
      <RoleStatus dataSet={roleDS} />
      <Table dataSet={roleDS} columns={columns} buttons={buttons} />
      <p role="status">{result}</p>
    </div>
  );
});
