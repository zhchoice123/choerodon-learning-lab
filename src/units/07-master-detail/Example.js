// 【样例】已有角色 + 权限行；头可改名，行可新增 / 修改 / 暂存删除，一起提交。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Output, TextField, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getConfig } from 'choerodon-ui';

// 1.6.7 兼容底座（不属于练习答案）：Record.js:commit 会用父 context 新建临时子 DS。
// DataSetSnapshot.js 不保存 props；DataSet.js:commitData 默认分页切片会让非当前头的
// 待删行残留在快照中。局部 context 关闭该切片，其余配置委托 getConfig，不修改全局。
const masterContext = { getConfig: (key) => key === 'strictPageSize' ? false : getConfig(key) };

export function createRoleMaster(autoQuery = true) {
  let requestedParent;
  // 知识点 1：先创建子 DataSet，再放入头的 children；整体只由 useMemo 工厂创建一次。
  const permissionDS = new DataSet({
    primaryKey: 'id', autoQuery: false, pageSize: 50, strictPageSize: false,
    dataKey: 'content', totalKey: 'totalElements', autoQueryAfterSubmit: false,
    // 知识点 2：默认父参数名是父 primaryKey（这里为 id），接口要 roleId 时显式映射。
    // 依据 node_modules/choerodon-ui/dataset/data-set/DataSet.js 的 getParentParams / defaultProps.cascadeParams。
    cascadeParams: (parent) => ({ roleId: parent.get('id') }),
    transport: { read: { url: '/mock/unit-07/roles/permissions', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '权限 ID' },
      { name: 'roleId', type: 'number', label: '所属角色 ID' },
      { name: 'code', type: 'string', label: '权限编码', required: true, pattern: /^[a-z][a-z0-9-]{2,29}$/ },
      { name: 'description', type: 'string', label: '权限说明', required: true },
      { name: 'enabled', type: 'boolean', label: '启用', defaultValue: true },
    ],
    events: {
      query: ({ dataSet }) => { requestedParent = dataSet.parent.current; },
      load: () => {
        // 知识点 3：首次切换有 300ms 防抖，不能只看 status=ready 就立即新增 / 保存。
        // DataSet.js:syncChildren 先 loadData([])，syncChildrenRemote 再 read，最后 syncChild 载入结果。
        // 仅真正发过查询后标记就绪；标记放父 Record.state，切换快照不会丢失，不改业务 dirty。
        if (requestedParent) {
          requestedParent.setState('permissionsLoaded', true);
          requestedParent = undefined;
        }
      },
    },
  });
  const roleDS = new DataSet({
    primaryKey: 'id', autoQuery, pageSize: 2, strictPageSize: false,
    dataKey: 'content', totalKey: 'totalElements', autoQueryAfterSubmit: false,
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称', required: true },
    ],
    // 知识点 4：permissions 同时是 children 键和提交 JSON 子数组名，不是 childrenField 树结构。
    // node_modules/choerodon-ui/dataset/data-set/DataSet.js:initChildren / bind / handleCascade。
    children: { permissions: permissionDS },
    // 知识点 5：只配头的 transport.submit，一次 POST 包含所有已加载的脏头及其脏行。
    // DataSet.js:write 与 utils.js:prepareForSubmit；Record.js:normalizeCascadeData 默认递归 dirty 数据。
    // 不给子表配独立写接口，也不同时分别调用头 submit 和子 submit。
    transport: {
      read: { url: '/mock/unit-07/roles', method: 'GET' },
      submit: { url: '/mock/unit-07/roles/submit', method: 'POST' },
    },
    feedback: {
      submitFailed: (error) => {
        // 同 05：在 DataSetRequestError 包装前保存后端 message，不屏蔽 console 或改全局反馈。
        roleDS.setState('submitError', error.response?.data?.message || error.message || '请求失败');
      },
    },
  }, masterContext);
  return roleDS;
}

export default observer(function Example() {
  const roleDS = useMemo(createRoleMaster, []);
  const permissionDS = roleDS.children.permissions;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('尚未保存主从修改');
  const record = roleDS.current;
  const ready = !!record?.getState('permissionsLoaded') && roleDS.status === 'ready' && permissionDS.status === 'ready';
  const locked = busy || !ready;
  const switchRole = (index) => {
    // 知识点 6：只切 current，框架负责读新头或恢复已读快照。不要额外 permissionDS.query()。
    // node_modules/choerodon-ui/dataset/data-set/DataSet.js:syncChildren / syncChild / restore。
    roleDS.current = roleDS.get(index);
  };
  const handleSave = async () => {
    if (locked) return;
    if (!roleDS.dirty) { setResult('没有待保存的主从修改'); return; }
    setBusy(true);
    try {
      // 知识点 7：头 submit 默认级联 validate 与序列化；只改子行，头仍会进入请求。
      // DataSet.js:submit / validate；Record.js:dirty / toJSONData 会将 sync 头序列化为 update。
      const response = await roleDS.submit();
      setResult(response === false ? '主从校验未通过，请检查两位角色及其权限行'
        : response ? '主从保存成功，行 ID 已回写，草稿已同步' : '没有产生提交请求，请检查配置');
    } catch (error) {
      // 知识点 8：本 mock 用一个请求原子更新，失败不发布任何头 / 行；保留草稿，不 reset/query。
      // Record.js:commit 递归调用 child.commitData；成功响应 content 包头，每个 permissions 是数组。
      setResult(`主从保存失败：${roleDS.getState('submitError') || error.message}；请修正后重试，草稿未清空`);
    } finally {
      setBusy(false);
    }
  };
  const columns = [
    { name: 'id', width: 100 }, { name: 'roleId', width: 110 },
    { name: 'code', width: 170, editor: !locked },
    { name: 'description', width: 260, editor: !locked },
    { name: 'enabled', width: 80, editor: !locked },
  ];
  return (
    <div>
      <p>维护已有的两位角色。新增 / 修改 / 删除权限均先留在草稿；点击“保存全部主从”才一起落库。</p>
      <div className="toolbar">
        <Button disabled={locked} onClick={() => switchRole(0)}>第一位角色</Button>
        <Button disabled={locked} onClick={() => switchRole(1)}>第二位角色</Button>
        <Button disabled={locked} onClick={() => permissionDS.create({ roleId: record.get('id') })}>新增权限行</Button>
        <Button disabled={locked || !permissionDS.selected.length} onClick={() => permissionDS.remove(permissionDS.selected.slice())}>暂存删除权限</Button>
        <Button disabled={locked} onClick={handleSave}>保存全部主从</Button>
      </div>
      <Form dataSet={roleDS} columns={3} readOnly={locked}>
        <Output name="id" /><Output name="code" /><TextField name="name" />
      </Form>
      <div className="status-bar">
        当前角色：{record?.get('id') || '无'} ｜ 子表：{ready ? '已就绪' : '等待自动加载'} ｜
        当前权限 {permissionDS.length} 条 ｜ 主从 dirty：{String(roleDS.dirty)} ｜
        当前子表 dirty：{String(permissionDS.dirty)} ｜ 新增行：{permissionDS.created.length}
      </div>
      <Table dataSet={permissionDS} columns={columns} pagination={false} />
      <p role="status">{result}</p>
      <p>权限说明填 FAIL 可触发整份请求失败；每个头至少保留一行。只改子行时，头 status 可能仍为 sync，主从 dirty 仍为 true。</p>
    </div>
  );
});
