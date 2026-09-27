// 【练习·标准】员工 + 技能行；先完成关联，再验收合并提交，不提供员工答案。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, Output, TextField, Switch, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getConfig } from 'choerodon-ui';

// 1.6.7 兼容底座（不属于练习答案）：Record.js:commit 会用父 context 新建临时子 DS。
// DataSetSnapshot.js 不保存 props；DataSet.js:commitData 默认分页切片会让非当前头的
// 待删行残留在快照中。局部 context 关闭该切片，其余配置委托 getConfig，不修改全局。
const masterContext = { getConfig: (key) => key === 'strictPageSize' ? false : getConfig(key) };

// TODO 1：绑定员工与 skills 子表，字段名与嵌套接口契约一致（知识点 1、4）。
// TODO 2：完成子表读取与父主键映射，识别延迟加载窗口并限制操作（知识点 2、3）。
// TODO 3：配置头的合并提交，补齐技能规则、默认值和行内编辑（知识点 5；复习 03、05）。
// TODO 4：切换两位员工只改变当前头，保留各自草稿，不手动重新查询子表（知识点 6）。
// TODO 5：新增技能关联当前员工且限在职；暂存删除等待合并保存（知识点 4、5 的延伸）。
// TODO 6：修正仅提交子表的隐患，等待真实主从结果，失败保留草稿并可重试（知识点 7、8）。
// TODO 7：状态栏与共同验收完成，核对嵌套回写、归属、重复编码与级联校验（知识点 3、7、8）。

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
