// 【练习】员工列表：参照「样例」页的角色列表，完成下面 9 个 TODO。
// 任务说明、验收标准和思考题见同目录的 README.md。
//
// 接口：GET /mock/guide/user?page=1&pagesize=5
// 响应：{ content: [员工, ...], totalElements: 45, totalPages, size, number, ... }
// 员工：{ id, name, code, sex, age, email, active, startDate: '2019-02-01 00:00:00' }
//       sex 取值 'M' / 'F'；active 表示是否在职
import React from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 6 时会用到，完成后可删除这行注释
import { observer } from 'mobx-react';

function createUserDataSet() {
  return new DataSet({
    // TODO 1：设置主键；每页 5 条；创建后自动查询

    // TODO 2：配置查询接口，并告诉 DataSet 列表数据和总条数分别在响应的哪个字段

    // TODO 3：定义 8 个字段（name / type / label）。
    //         想一想：active、startDate 分别该用什么 type？startDate 只需要显示日期。
    fields: [],
  });
}

// TODO 6：现在翻页、点击行时状态栏不会变化。让它在数据变化时自动刷新。
const UserStatusBar = ({ dataSet }) => {
  // TODO 7：显示「共 X 人 ｜ 当前行：姓名 ｜ 本页在职 Y 人」，没有当前行时显示「无」
  return <div className="status-bar">共 ? 人 ｜ 当前行：? ｜ 本页在职 ? 人</div>;
};

export default function Exercise() {
  // TODO 4：这样写页面也能显示，但有隐患。说说问题在哪，并改成正确写法。
  const userDS = createUserDataSet();

  // TODO 5：定义列：员工编码、姓名、性别、年龄、邮箱、在职、入职日期（不显示 id）
  const columns = [];

  const handleRefresh = () => {
    // TODO 8：重新查询当前页（不要跳回第 1 页）
  };

  const handleShowSelected = () => {
    // TODO 9：没有勾选时提示「请先勾选员工」；
    //         否则提示所有选中员工的姓名，以及其中女性（sex 为 'F'）有几人
    message.info('TODO 9 还没完成');
  };

  return (
    <div>
      <div className="toolbar">
        <Button icon="refresh" onClick={handleRefresh}>
          刷新
        </Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <UserStatusBar dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
