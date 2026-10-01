// 【样例】09-3 全局响应解析：dataKey / totalKey 支持「a.b」路径，适配嵌套的响应格式。
// 旧系统 v1：{ success: true, result: { records: [...], totalCount: 12 } }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  generatePageQuery: ({ page, pageSize }) => ({ pageNo: page - 1, pageSize }),
  // 知识点：路径用点连接，逐层取值
  dataKey: 'result.records',
  totalKey: 'result.totalCount',
};

function RoleList() {
  const roleDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-3/v1/roles', method: 'GET' } },
        fields: [
          { name: 'code', type: 'string', label: '角色编码' },
          { name: 'name', type: 'string', label: '角色名称' },
        ],
      }),
    [],
  );
  return <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }]} />;
}

export default function Example() {
  return (
    <LessonConfigScope config={config}>
      <RoleList />
    </LessonConfigScope>
  );
}
