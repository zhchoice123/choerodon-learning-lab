// 【样例】09-5 优先级：DataSet 自己写的属性，优先于全局配置。
// 全局按 v1 配置；但「标准接口」那张表要对接 /mock/roles（Spring 分页格式），就在它自己的 DataSet 上单独写。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import LessonConfigScope from './LessonConfigScope';

const config = {
  generatePageQuery: ({ page, pageSize }) => ({ pageNo: page - 1, pageSize }),
  dataKey: 'result.records',
  totalKey: 'result.totalCount',
};

function Lists() {
  // 使用全局配置
  const legacyDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 3,
        transport: { read: { url: '/mock/s/09-5/v1/roles', method: 'GET' } },
        fields: [{ name: 'name', type: 'string', label: '旧系统角色' }],
      }),
    [],
  );
  // 知识点：这个 DataSet 自己的 dataKey / totalKey 覆盖了全局配置
  // （分页参数仍由全局 generatePageQuery 生成；/mock/roles 不认识 pageNo，按默认第 1 页返回）
  const standardDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 3,
        transport: { read: { url: '/mock/roles', method: 'GET' } },
        dataKey: 'content',
        totalKey: 'totalElements',
        fields: [{ name: 'name', type: 'string', label: '标准接口角色' }],
      }),
    [],
  );
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Table dataSet={legacyDS} columns={[{ name: 'name' }]} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Table dataSet={standardDS} columns={[{ name: 'name' }]} />
      </div>
    </div>
  );
}

export default function Example() {
  return (
    <LessonConfigScope config={config}>
      <Lists />
    </LessonConfigScope>
  );
}
