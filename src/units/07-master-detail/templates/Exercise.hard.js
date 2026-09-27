// 【练习·挑战】员工 + 技能行；先完成关联，再验收合并提交，不提供员工答案。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getConfig } from 'choerodon-ui';

// 1.6.7 兼容底座（不属于练习答案）：Record.js:commit 会用父 context 新建临时子 DS。
// DataSetSnapshot.js 不保存 props；DataSet.js:commitData 默认分页切片会让非当前头的
// 待删行残留在快照中。局部 context 关闭该切片，其余配置委托 getConfig，不修改全局。
const masterContext = { getConfig: (key) => key === 'strictPageSize' ? false : getConfig(key) };

// TODO 1：完成员工与技能的主从数据关系、字段规则和界面。
// TODO 2：选择员工时自动加载或恢复对应技能，等待期间不能误操作，草稿不能串到其他员工。
// TODO 3：维护技能行；只允许在职员工新增，删除先暂存，每位至少保留一条技能。
// TODO 4：修正仅保存子表的隐患；一次保存所有已加载的主从修改，正确处理失败、校验与回写。
// TODO 5：状态可观察，完成重复技能、错误归属、切换保留草稿及失败重试的验收。
// TODO 6：增加仅保存当前员工主从；另一位员工的合法草稿仍未提交，后端保持旧值。

function createEmployeeMaster() {
  const skillDS = new DataSet({
    primaryKey: 'id', autoQuery: false, pageSize: 50, strictPageSize: false,
    dataKey: 'content', totalKey: 'totalElements', autoQueryAfterSubmit: false,
    fields: [
      { name: 'id', type: 'number', label: '技能 ID' },
    ],
  });
  const employeeDS = new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 2, strictPageSize: false,
    dataKey: 'content', totalKey: 'totalElements', autoQueryAfterSubmit: false,
    transport: { read: { url: '/mock/unit-07/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
    ],
  }, masterContext);
  return { employeeDS, skillDS };
}

export default observer(function Exercise() {
  const { employeeDS, skillDS } = useMemo(createEmployeeMaster, []);
  const [result, setResult] = useState('员工已接入读取，主从关联与保存待完成');
  const columns = [];
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
        <Button onClick={() => {}}>仅保存当前员工主从</Button>
      </div>
      <Form dataSet={employeeDS} columns={3}><p>员工表单待完成</p></Form>
      <div className="status-bar">
        已读取 {employeeDS.length} 位员工 ｜ 当前：{employeeDS.current?.get('name') || '无'} ｜
        主从 dirty：? ｜ 技能关联：待完成
      </div>
      <Table dataSet={skillDS} columns={columns} pagination={false} />
      <p role="status">{result}</p>
    </div>
  );
});
