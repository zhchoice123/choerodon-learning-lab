// 【练习·标准】员工查询：完成 7 个 TODO，知识点编号和验收见 README。
// 接口：GET /mock/guide/user/search；keyword 需映射为 q；active 与 minAge 保持原名。
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createUserDataSet() {
  // TODO 1：显式定义查询 DataSet 的 3 个字段：keyword、active、minAge。
  //         默认均不限；分别使用文本、布尔、数字类型。参照知识点 1、2。
  const queryDataSet = new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [],
  });

  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryDataSet,
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 2：完成接口参数适配，参照知识点 3、4。
        //         当前代码能查列表，但隐藏了哪些值丢失问题？说明并修正。
        //         去掉空条件和首尾空白，keyword 改名为 q，保留分页参数。
        const conditions = {};
        Object.entries(data).forEach(([key, value]) => {
          if (value) conditions[key] = value;
        });
        return {
          url: '/mock/guide/user/search',
          method: 'GET',
          params: { ...params, ...conditions },
          data: {},
        };
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '员工ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

const QueryStatus = observer(({ dataSet }) => {
  // TODO 3：展示待查询的 keyword、active、minAge 和上次查询总人数，参照知识点 5。
  //         空值显示「不限」；false 显示「否」；年龄 0 应显示为 0。
  return <div className="status-bar">关键词：? ｜ 在职：? ｜ 最低年龄：? ｜ 上次查询共 ? 人</div>;
});

export default function Exercise() {
  const userDS = useMemo(createUserDataSet, []);
  const columns = [
    { name: 'code', width: 140 },
    { name: 'name', width: 120 },
    { name: 'sex', width: 80 },
    { name: 'age', width: 90 },
    { name: 'active', width: 80 },
  ];
  const handleInactive = () => {
    // TODO 4：将关键词清空，在职设为 false，最低年龄设为 0，再查询第 1 页。
    //         只发 1 次请求；参照知识点 6。
    message.info('快捷查询还没完成');
  };
  const handleReset = () => {
    // TODO 5：恢复最初的全部不限条件并查询第 1 页；参照知识点 7。
    message.info('恢复默认条件还没完成');
  };

  // TODO 6：补全 Table 配置，让查询栏直接显示全部 3 个条件；参照知识点 8。
  const queryBarProps = {};
  // TODO 7：按 README 的 Network 验收逐项检查：首次查询、翻页、空白、false、0。
  //         这是观察任务：在这里记录现象，并解释 TODO 2 的原写法为什么有隐患。

  return (
    <div>
      <p>关键词匹配姓名或编码；在职可选是、否或清空为不限；最低年龄包含边界。</p>
      <div className="toolbar">
        <Button onClick={handleInactive}>仅离职（年龄不限）</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
      </div>
      <QueryStatus dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} {...queryBarProps} />
    </div>
  );
}
