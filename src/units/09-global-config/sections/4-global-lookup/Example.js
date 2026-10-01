// 【样例】09-4 全局值集：字段上只写 lookupCode，地址和请求方式全局配置一次。
// v1 值集：GET /mock/s/09-4/v1/lookups/ROLE.LEVEL → { success, result: { records: [{ value, meaning }] } }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  generatePageQuery: ({ page, pageSize }) => ({ pageNo: page - 1, pageSize }),
  // 知识点 1：值集的响应也用全局 dataKey 解析，所以值集接口的外壳要和列表一致
  dataKey: 'result.records',
  totalKey: 'result.totalCount',
  // 知识点 2：lookupUrl 根据编码生成地址
  lookupUrl: (code) => `/mock/s/09-4/v1/lookups/${code}`,
  // 知识点 3：1.6.7 的值集默认用 POST，这个后端只支持 GET
  lookupAxiosMethod: 'get',
};

function RoleList() {
  const roleDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/s/09-4/v1/roles', method: 'GET' } },
        fields: [
          { name: 'name', type: 'string', label: '角色名称' },
          { name: 'level', type: 'string', label: '层级', lookupCode: 'ROLE.LEVEL' }, // 只写编码
        ],
      }),
    [],
  );
  return <Table dataSet={roleDS} columns={[{ name: 'name' }, { name: 'level' }]} />;
}

export default function Example() {
  return (
    <div>
      <p>「层级」显示平台层 / 租户层 / 项目层；Network 里有一次 GET lookups/ROLE.LEVEL。</p>
      <LessonConfigScope config={config}>
        <RoleList />
      </LessonConfigScope>
    </div>
  );
}
