// 【练习·入门】对接「旧系统 v2」的员工列表：步骤拆得更细，并点名要用的 API，完成 11 个 TODO。
// 知识点编号对应样例 Example.js；验收标准见 README。
//
// 旧系统 v2 的约定（和样例的 v1 不同）：
//   请求 GET /mock/unit-09/v2/employees?current=1&limit=5   （current 从 1 开始）
//   响应 { code: 0, data: { items: [...], total: 45 } }
//   值集 GET /mock/unit-09/v2/lookups/EMP.SEX              → { code: 0, data: { items: [{ value, meaning }] } }
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import enUS from 'choerodon-ui/pro/lib/locale-context/en_US';
import { observer } from 'mobx-react';
import LessonConfigScope from './LessonConfigScope';

const LANGUAGES = { zh_CN: { label: '中文', locale: zhCN }, en_US: { label: 'English', locale: enUS } };

const legacyV2Config = {
  // TODO 1：generatePageQuery 收到的 page 从 1 开始，v2 的 current 也从 1 开始。
  //         返回 { current: ?, limit: ? }（知识点 2）
  generatePageQuery: ({ page, pageSize }) => ({}),
  // TODO 2：dataKey 写成列表所在的路径，形如 'a.b'（知识点 3）
  // TODO 3：totalKey 写成总数所在的路径
  // TODO 4：lookupUrl 是一个函数：(code) => 值集地址（知识点 4）
  // TODO 5：lookupAxiosMethod 设为 v2 值集接口支持的请求方式（1.6.7 默认是 'post'）
};

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    // TODO 6：删除下面两行。DataSet 自己的 dataKey / totalKey 优先于全局配置，
    //         不删的话，全局配置里写的路径不会生效（知识点 5）
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-09/v2/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      // TODO 7：给「性别」加上 lookupCode: 'EMP.SEX'，表格就会显示「男 / 女」
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

// TODO 8：用 observer 包住这个组件，让它在数据和语言变化时自动刷新（复习单元 01）
const EmployeeStatusBar = ({ dataSet }) => {
  // TODO 9：用 dataSet.totalCount、dataSet.currentPage、dataSet.totalPage
  //         和 LANGUAGES[localeContext.locale.lang].label 替换下面的「?」
  return <div className="status-bar">共 ? 人 ｜ 第 ?/? 页 ｜ 当前语言：?</div>;
};

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
    // TODO 10：当前是 'en_US' 时切回中文，否则切到英文（知识点 6）
    localeContext.setLocale(LANGUAGES.zh_CN.locale);
  };
  return (
    <div>
      <div className="toolbar">
        {/* TODO 11：按钮文案随当前语言变化：英文时显示「切换为中文」，中文时显示「Switch to English」 */}
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
