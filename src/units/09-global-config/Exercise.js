// 【练习·标准】对接「旧系统 v2」的员工列表：用全局配置适配，完成 6 个 TODO，不提供员工答案。
// 知识点编号对应样例 Example.js；验收标准见 README。
//
// 旧系统 v2 的约定（和样例的 v1 不同）：
//   请求 GET /mock/unit-09/v2/employees?current=1&limit=5   （current 从 1 开始）
//   响应 { code: 0, data: { items: [...], total: 45 } }
//   值集 GET /mock/unit-09/v2/lookups/EMP.SEX              → { code: 0, data: { items: [{ value, meaning }] } }
//   员工 { id, code, name, sex: 'M' | 'F', age, email, active, startDate }
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import LessonConfigScope from './LessonConfigScope';

// TODO 1：分页参数翻译成 v2 的 current / limit（知识点 2）
// TODO 2：告诉组件库列表和总数在 v2 响应里的位置（知识点 3）
// TODO 3：全局值集地址与请求方式；并让下面的「性别」显示「男 / 女」（知识点 4）
const legacyV2Config = {};

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    // TODO 4：这两行是从前面单元复制来的。页面「能显示一行」，但那一行其实是整条响应。
    //         想一想 DataSet 自己的属性和全局配置谁优先，然后修正（知识点 5）
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-09/v2/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

// TODO 5：显示「共 X 人 ｜ 第 n/m 页 ｜ 当前语言：中文 / English」，数据和语言变化时自动刷新（知识点 6，复习单元 01）
const EmployeeStatusBar = ({ dataSet }) => <div className="status-bar">共 ? 人 ｜ 第 ?/? 页 ｜ 当前语言：?</div>;

const EmployeeList = observer(function EmployeeList() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const columns = [
    { name: 'code', width: 130 },
    { name: 'name', width: 110 },
    { name: 'sex', width: 80 },
    { name: 'age', width: 80 },
    { name: 'active', width: 80 },
  ];
  const toggleLanguage = () => {
    // TODO 6：在中文和英文语言包之间切换（知识点 6）。语言包的引入路径见样例
  };
  return (
    <div>
      <div className="toolbar">
        <Button onClick={toggleLanguage}>切换语言</Button>
      </div>
      <EmployeeStatusBar dataSet={employeeDS} />
      <Table dataSet={employeeDS} columns={columns} />
    </div>
  );
});

// 配置交给 LessonConfigScope：进入单元时应用，离开时恢复（为什么不直接调用 configure？见 README 思考题）
export default function Exercise() {
  return (
    <LessonConfigScope config={legacyV2Config}>
      <EmployeeList />
    </LessonConfigScope>
  );
}
