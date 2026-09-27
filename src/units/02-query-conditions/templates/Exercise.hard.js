// 【练习·挑战】员工查询。完整接口、共同验收和挑战需求见 README。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createUserDataSet() {
  // TODO 1：提供独立的查询条件容器：关键词、是否在职、最低年龄；初始均不限。
  // TODO 2：首次只查一次，每页 5 人；展示编码、姓名、性别、年龄、在职的中文列。
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [],
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 3：修正能运行却会漏掉条件的写法；满足参数命名、空白、假值和分页契约。
        const conditions = Object.fromEntries(Object.entries(data).filter(([, value]) => value));
        return { url: '/mock/guide/user/search', method: 'GET', params: { ...params, ...conditions }, data: {} };
      },
    },
  });
}

export default function Exercise() {
  const userDS = useMemo(createUserDataSet, []);
  // TODO 4：直接展示全部 3 个查询控件，实时预览待查询条件和上次查询总数。
  const columns = [];
  const handleInactive = () => {
    // TODO 5：一次查询获取全部离职员工；清空关键词，最低年龄为 0，从第一页开始。
  };
  const handleReset = () => {
    // TODO 6：恢复最初的不限条件并回到第一页，只请求一次。
  };
  // TODO 7：记录共同验收的页面及请求观察，解释条件变化与请求时机的区别。
  const handleFemale = () => {
    // TODO 8：新增仅女性快捷筛选，不增加查询栏字段；翻页保留，恢复默认时清除。
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={handleInactive}>仅离职（年龄不限）</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
        <Button onClick={handleFemale}>仅女性</Button>
      </div>
      <div className="status-bar">待完成条件预览</div>
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
