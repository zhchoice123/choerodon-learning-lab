// 【练习·入门】员工表格维护；规则、接口、失败场景和共同验收见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：code / name / age 加 required，code 用 pattern 限制 EMP 加三位数字，age 用 min/max 限制 18～60。
// TODO 2：age 的 defaultValue 为 18，active 的 defaultValue 为 false；id 不设置默认值。
// TODO 3：transport 加 create / update / destroy；URL 见 README，method 均为 POST。
// TODO 4：不要包装 data 或仅提取 id；默认记录数组的 __id 用来匹配响应，业务主键仍是 id。
// TODO 5：name / age / active 列补 editor: true；id 列不编辑，type 和 label 保留在 fields。
// TODO 6：buttons 补 add / delete / reset；save 的 onClick 走自定义 handleSave。
// TODO 7：删除前检查 selected 的 active 与 dirty；在职或未保存的员工只提示，不调用 delete。
// TODO 8：await submit() 后区分 false、undefined 和有效响应，等待期间禁止重复操作。
// TODO 9：catch 中 reset() 会怎样？保留草稿，显示后端中文消息，允许修正后重试。
// TODO 10：状态栏读取 current.get('id')、current.status、dirty、created/updated/destroyed.length。
// TODO 11：用 README 的步骤检查重置范围及 Network 的 content / __id / id；说明失败为何仍是 dirty。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 5,
    dataKey: 'content', totalKey: 'totalElements', strictPageSize: false,
    transport: { read: { url: '/mock/unit-05/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

export default observer(function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未提交，请完成 TODO');
  const columns = [
    { name: 'id', width: 100 },
    { name: 'code', width: 160, editor: true },
    { name: 'name', width: 140 },
    { name: 'age', width: 100 },
    { name: 'active', width: 80 },
  ];
  const handleSave = async () => {
    // 骨架保护：写接口尚未接入时不发请求，不会落到旧服务或外部代理。
    if (!employeeDS.transport.create || !employeeDS.transport.update || !employeeDS.transport.destroy) {
      setResult('请先完成三个员工写接口的配置');
      return;
    }
    try {
      await employeeDS.submit();
      setResult('骨架尚未区分保存结果，请完成 TODO');
    } catch (error) {
      // 故意保留的隐患：请求失败时，这一步会丢失哪些内容？
      employeeDS.reset();
      setResult('骨架在失败后重置了数据，请修正');
    }
  };
  const buttons = [['save', { onClick: handleSave, children: '保存员工（待完成）' }]];

  return (
    <div>
      <p>员工写操作尚未接入。原始模板只读取列表；请先完成 TODO 再验收提交。</p>
      <div className="status-bar">当前 ID：? ｜ status：? ｜ dirty：? ｜ add / update / delete：?</div>
      <Table dataSet={employeeDS} columns={columns} buttons={buttons} />
      <p role="status">{result}</p>
    </div>
  );
});
