// 【练习·入门】员工查询：逐个补齐属性或方法。共同验收见 README。
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createUserDataSet() {
  const queryDataSet = new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'keyword', type: 'string', label: '关键词' },
      // TODO 1：增加 active 字段，type 用 boolean，label 用「在职」。不设默认值。
      // TODO 2：增加 minAge 字段，type 用 number，label 用「最低年龄」。不设默认值。
    ],
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
        // TODO 3：对字符串用 trim()，再判断是否是空条件；不要直接改 data。
        // TODO 4：把 keyword 的参数名改为 q；active、minAge 的名称保持不变。
        const conditions = {};
        Object.entries(data).forEach(([key, value]) => {
          // TODO 5：这句能运行，但 false、0 会怎样？只应排除 undefined、null、空字符串。
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
  // TODO 6：从 dataSet.queryDataSet.current.get() 读取三个条件，替换问号。
  //         用 totalCount 显示上次查询总数。false 显示「否」，0 显示 0，空值显示「不限」。
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
    // TODO 7：对 queryDataSet.current 调用 set()：清空 keyword、active 为 false、minAge 为 0。
    // TODO 8：设置完毕后仅调用一次 userDS.query(1)。
    message.info('快捷查询还没完成');
  };
  const handleReset = () => {
    // TODO 9：对查询记录调用 reset()，再调用 userDS.query(1)。
    message.info('恢复默认条件还没完成');
  };

  // TODO 10：在这个对象补 queryBar: 'normal'、queryFieldsLimit: 3，交给 Table。
  const queryBarProps = {};
  // TODO 11：按 README 检查 Network，记录请求次数、q / active / minAge / page / pagesize。
  //          特别检查 false、0 和只有空格的关键词，并说明原来的 if(value) 为什么有隐患。

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
