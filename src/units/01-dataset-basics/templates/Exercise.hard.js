// 【练习·挑战】员工列表。接口 GET /mock/guide/user；完整契约与共同验收见 README。
import React from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createUserDataSet() {
  // TODO 1：首次进入只查询一次；每页 5 人；正确解析员工分页响应与唯一标识。
  // TODO 2：完整定义员工字段，日期只显示年月日，布尔值显示为勾选框。
  return new DataSet({ fields: [] });
}

export default function Exercise() {
  // TODO 3：找出这种创建方式的隐患；普通重新渲染时保留数据、当前行与勾选。
  const userDS = createUserDataSet();
  // TODO 4：展示要求中的 7 个中文列，不显示 id。
  const columns = [];
  // TODO 5：实时展示总人数、当前姓名与本页在职人数，正确处理空列表。
  const status = '共 ? 人 ｜ 当前行：? ｜ 本页在职 ? 人';
  const handleRefresh = () => {
    // TODO 6：刷新当前页，保留页码。
  };
  const handleShowSelected = () => {
    // TODO 7：未选时提示；已选时展示姓名以及女性人数。
  };
  // TODO 8：额外展示本页平均年龄，保留 1 位小数；无记录时显示「—」。

  return (
    <div>
      <div className="toolbar">
        <Button onClick={handleRefresh}>刷新</Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <div className="status-bar">{status}</div>
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
