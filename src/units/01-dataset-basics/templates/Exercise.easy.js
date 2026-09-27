// 【练习·入门】员工列表：按编号完成填空，再按 README 的共同标准验收。
import React from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';

function createUserDataSet() {
  return new DataSet({
    // TODO 1：补 primaryKey，设为接口的唯一标识字段。
    // TODO 2：补 pageSize（5）和 autoQuery（true）。
    // TODO 3：补 transport.read，url 为 /mock/guide/user，method 为 GET。
    // TODO 4：补 dataKey 和 totalKey，对应 content / totalElements。
    // TODO 5：照着 id 补全 name、code、sex、age、email、active、startDate。
    //         type 从 string / number / boolean / date 中选择，label 使用中文。
    fields: [{ name: 'id', type: 'number', label: '员工ID' }],
  });
}

// TODO 6：从 mobx-react 导入 observer 并包裹状态栏函数。
const UserStatusBar = ({ dataSet }) => {
  // TODO 7：用 totalCount、current、record.get()、filter() 替换问号。
  //         current 为空时显示「无」，本页在职人数只统计 active 为 true 的记录。
  return <div className="status-bar">共 ? 人 ｜ 当前行：? ｜ 本页在职 ? 人</div>;
};

export default function Exercise() {
  // TODO 8：这行能运行，但组件重新渲染会怎样？从 React 导入 useMemo 后修正。
  const userDS = createUserDataSet();

  // TODO 9：补 7 列，只写 name 和布局属性；不要显示 id。
  const columns = [];

  const handleRefresh = () => {
    // TODO 10：用 query(page) 刷新，page 从 currentPage 读取。
  };

  const handleShowSelected = () => {
    // TODO 11：先检查 selected.length，为 0 时用 message.warning 提示并结束。
    // TODO 12：用 selected.map 取姓名，selected.filter 统计 sex === 'F'，再展示结果。
    message.info('查看选中还没完成');
  };

  return (
    <div>
      <div className="toolbar">
        <Button icon="refresh" onClick={handleRefresh}>刷新</Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <UserStatusBar dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
