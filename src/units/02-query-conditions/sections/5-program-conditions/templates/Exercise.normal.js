// 【练习】02-5 用代码控制查询：完成「只看女性」和「恢复默认」两个按钮。
// 接口：GET /mock/guide/user，支持 name、sex 查询参数
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/guide/user', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
    ],
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);

  const onlyFemale = () => {
    // TODO 1：把性别条件设为 'F'（姓名条件保持不变），然后从第 1 页重新查询
  };

  const restore = () => {
    // TODO 2：把所有条件恢复成初始值，然后从第 1 页重新查询
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={onlyFemale}>只看女性</Button>
        <Button onClick={restore}>恢复默认</Button>
      </div>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }, { name: 'sex' }]} queryBar="normal" />
    </div>
  );
}
