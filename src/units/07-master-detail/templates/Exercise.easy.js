// 【练习·入门】员工 + 技能行；先完成关联，再验收合并提交，不提供员工答案。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Output, TextField, Switch, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getConfig } from 'choerodon-ui';

// 1.6.7 兼容底座（不属于练习答案）：Record.js:commit 会用父 context 新建临时子 DS。
// DataSetSnapshot.js 不保存 props；DataSet.js:commitData 默认分页切片会让非当前头的
// 待删行残留在快照中。局部 context 关闭该切片，其余配置委托 getConfig，不修改全局。
const masterContext = { getConfig: (key) => key === 'strictPageSize' ? false : getConfig(key) };

// TODO 1：用 children: { skills: skillDS } 绑定头行；表格继续使用同一个 skillDS。
// TODO 2：子表配置 transport.read 和 cascadeParams，把父 id 映射成 employeeId；URL 见 README。
// TODO 3：头的 transport.submit 配到合并接口；不要另配子表写接口，保留默认嵌套记录数组。
// TODO 4：补技能编码 required / pattern、等级 required / min / max 与默认值 1、认证默认 false。
// TODO 5：技能列使用 editor；ID / employeeId 只读，type / label 留在 fields。
// TODO 6：切换只改 employeeDS.current；等待子表加载完成后才允许编辑、新增、删除、保存。
// TODO 7：新增技能时关联当前员工；仅在职能新增；remove 暂存删除，不能直接 delete 发独立请求。
// TODO 8：handleSave 只调用 skillDS.submit 有什么问题？从头提交并区分 false / undefined / HTTP 失败。
// TODO 9：展示头行 dirty、当前员工和新增行 ID；失败不 reset/query，修正后能重试。
// TODO 10：验证切换快照、两位员工一起保存、重复技能拒绝、跨员工行归属和整数等级。

function createEmployeeMaster() {
  const skillDS = new DataSet({
    primaryKey: 'id', autoQuery: false, pageSize: 50, strictPageSize: false,
    dataKey: 'content', totalKey: 'totalElements', autoQueryAfterSubmit: false,
    fields: [
      { name: 'id', type: 'number', label: '技能 ID' },
      { name: 'employeeId', type: 'number', label: '所属员工 ID' },
      { name: 'skillCode', type: 'string', label: '技能编码' },
      { name: 'level', type: 'number', label: '技能等级' },
      { name: 'certified', type: 'boolean', label: '已认证' },
    ],
  });
  const employeeDS = new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 2, strictPageSize: false,
    dataKey: 'content', totalKey: 'totalElements', autoQueryAfterSubmit: false,
    transport: { read: { url: '/mock/unit-07/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  }, masterContext);
  return { employeeDS, skillDS };
}

export default observer(function Exercise() {
  const { employeeDS, skillDS } = useMemo(createEmployeeMaster, []);
  const [result, setResult] = useState('员工已接入读取，主从关联与保存待完成');
  const columns = [{ name: 'id', width: 100 }, { name: 'employeeId', width: 120 },
    { name: 'skillCode', width: 180 }, { name: 'level', width: 100 }, { name: 'certified', width: 100 }];
  const handleSave = async () => {
    // 骨架保护：关联与写接口缺失时只提示，不能落到旧服务或外部代理。
    if (!employeeDS.children.skills || !employeeDS.transport.submit) {
      setResult('请先完成 skills 关联与头提交接口');
      return;
    }
    try {
      // 能跑但有隐患：此处只调用子表，员工头的修改能一起保存吗？
      await skillDS.submit();
      setResult('骨架尚未核对主从提交结果，请修正');
    } catch (error) {
      setResult('保存失败，错误反馈待完善');
    }
  };
  return (
    <div>
      <p>原始模板只读取员工头。空技能表不是后端没有技能，而是主从关联尚未完成。</p>
      <div className="toolbar">
        <Button onClick={() => {}}>第一位员工</Button>
        <Button onClick={() => {}}>第二位员工</Button>
        <Button onClick={() => {}}>新增技能行</Button>
        <Button onClick={() => {}}>暂存删除技能</Button>
        <Button onClick={handleSave}>保存全部员工主从</Button>
      </div>
      <Form dataSet={employeeDS} columns={3}><Output name="id" /><TextField name="name" /><Switch name="active" /></Form>
      <div className="status-bar">
        已读取 {employeeDS.length} 位员工 ｜ 当前：{employeeDS.current?.get('name') || '无'} ｜
        主从 dirty：? ｜ 技能关联：待完成
      </div>
      <Table dataSet={skillDS} columns={columns} pagination={false} />
      <p role="status">{result}</p>
    </div>
  );
});
