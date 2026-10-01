// 【练习】02-3 条件转换：员工搜索接口的参数名和查询字段不一样。
// 接口：GET /mock/guide/user/search?q=关键词&minAge=最低年龄
//   q 同时匹配姓名和员工编码；minAge 为空时不要发送
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [
      { name: 'keyword', type: 'string', label: '姓名或编码' },
      { name: 'minAge', type: 'number', label: '最低年龄' },
    ],
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 1：keyword 去掉首尾空白后，改名为 q；为空时不发送
        // TODO 2：minAge 有值时才发送（注意 0 也是有效值）
        const conditions = {};
        return { url: '/mock/guide/user/search', method: 'GET', params: { ...params, ...conditions }, data: {} };
      },
    },
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'age' }]} queryBar="normal" />;
}
