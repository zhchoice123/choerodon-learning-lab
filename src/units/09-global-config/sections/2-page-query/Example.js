// 【样例】09-2 generatePageQuery：后端的分页参数不叫 page / pagesize 时，全局翻译一次。
// 旧系统 v1：GET /mock/s/09-2/v1/roles?pageNo=0&pageSize=5（pageNo 从 0 开始）
//   响应 { success, result: { records, totalCount } }（响应解析在 09-3 讲，这里先照抄）
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  // 知识点 1：参数里的 page 从 1 开始，pageSize 是每页条数
  // 知识点 2：返回值整体替换默认的 page / pagesize
  generatePageQuery: ({ page, pageSize }) => ({ pageNo: page - 1, pageSize }),
  dataKey: 'result.records',
  totalKey: 'result.totalCount',
};

function RoleList() {
  const roleDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-2/v1/roles', method: 'GET' } },
        fields: [{ name: 'name', type: 'string', label: '角色名称' }],
      }),
    [],
  );
  return <Table dataSet={roleDS} columns={[{ name: 'name' }]} />;
}

export default function Example() {
  return (
    <div>
      <p>Network 里是 pageNo=0&amp;pageSize=5，翻到第 2 页变成 pageNo=1，没有 page / pagesize。</p>
      <LessonConfigScope config={config}>
        <RoleList />
      </LessonConfigScope>
    </div>
  );
}
