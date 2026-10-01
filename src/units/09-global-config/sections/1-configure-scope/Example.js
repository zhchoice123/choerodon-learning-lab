// 【样例】09-1 configure 全局配置：写一次，对之后创建的所有 DataSet 生效。
// 这里把 dataKey / totalKey 写成全局配置，DataSet 上就不用再写了。接口：GET /mock/roles
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { getConfig } from 'choerodon-ui';
import LessonConfigScope from './LessonConfigScope';

// 知识点 1：真实项目在入口 src/index.js 里调用一次 configure(config)
// 知识点 2：configure 是整个应用共享的单例；本项目所有课程在同一个页面里，
//   所以用 LessonConfigScope：进入本课时应用，离开时用 getConfig 的快照精确恢复
const config = { dataKey: 'content', totalKey: 'totalElements' };

function RoleList() {
  const roleDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/roles', method: 'GET' } },
        // 没有写 dataKey / totalKey：使用全局配置
        fields: [{ name: 'name', type: 'string', label: '角色名称' }],
      }),
    [],
  );
  return (
    <div>
      {/* 知识点 3：getConfig 读取当前生效的值（自定义值或默认值） */}
      <p className="status-bar">当前生效：dataKey = {getConfig('dataKey')}，totalKey = {getConfig('totalKey')}</p>
      <Table dataSet={roleDS} columns={[{ name: 'name' }]} />
    </div>
  );
}

export default function Example() {
  return (
    <LessonConfigScope config={config}>
      <RoleList />
    </LessonConfigScope>
  );
}
