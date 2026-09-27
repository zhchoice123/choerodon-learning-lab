// 【练习·挑战】员工表格维护；规则、接口、失败场景和共同验收见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：完成员工字段规则、默认值和行内编辑；新增主键由后端分配。
// TODO 2：接通三类写接口，保证记录回写和真实数据变化，遵守 README 的数组契约。
// TODO 3：提供新增、保存、删除、重置；删除在职或尚未保存的员工时在页面阻止请求。
// TODO 4：区分未修改、校验失败、请求失败与成功；修正会丢失用户修改的失败分支，支持重试。
// TODO 5：实时展示当前记录状态与未提交数量，完整验证四种状态的流转。
// TODO 6：增加“仅保存勾选员工”，未勾选的合法草稿保留；未勾选时不发请求并提示。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 5,
    dataKey: 'content', totalKey: 'totalElements', strictPageSize: false,
    transport: { read: { url: '/mock/unit-05/employees', method: 'GET' } },
    fields: [{ name: 'id', type: 'number', label: '员工 ID' }],
  });
}

export default observer(function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未提交，请完成 TODO');
  const columns = [];
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
  const handleSaveSelected = () => {};
  buttons.push(<Button key="selected" onClick={handleSaveSelected}>仅保存勾选员工</Button>);
  return (
    <div>
      <p>员工写操作尚未接入。原始模板只读取列表；请先完成 TODO 再验收提交。</p>
      <div className="status-bar">当前 ID：? ｜ status：? ｜ dirty：? ｜ add / update / delete：?</div>
      <Table dataSet={employeeDS} columns={columns} buttons={buttons} />
      <p role="status">{result}</p>
    </div>
  );
});
