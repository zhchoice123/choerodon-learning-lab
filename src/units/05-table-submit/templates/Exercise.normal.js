// 【练习·标准】员工表格维护；规则、接口、失败场景和共同验收见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：补齐员工编码 / 姓名 / 年龄的规则与新增默认值；id 留给后端。参照知识点 1。
// TODO 2：接入员工 create / update / destroy，保留默认记录数组协议。参照知识点 2、3。
// TODO 3：允许编辑编码、姓名、年龄、在职，ID 始终只读。参照知识点 4。
// TODO 4：补齐 add / save / delete / reset；删除在职或尚有未保存修改的员工前先提示，不发请求。参照知识点 7。
// TODO 5：完善保存结果与等待状态；当前 catch 能运行却会丢草稿，解释并修正。参照知识点 5、6。
// TODO 6：实时显示当前业务 ID、status、dirty 和三类待提交数量。参照知识点 3、8。
// TODO 7：验证新增回写、修改、删除、重置和 FAIL 后重试；不能把失败当成功。参照知识点 2、3、5～8。

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
    { name: 'code', width: 160 },
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
