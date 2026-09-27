// 【样例】对接「旧系统 v1」的角色列表：用全局配置一次性适配分页参数、响应格式和值集。
// 练习对接的是格式不同的 v2，不能照抄这里的配置；先读懂每处「知识点」注释再动手。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { getConfig } from 'choerodon-ui';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import enUS from 'choerodon-ui/pro/lib/locale-context/en_US';
import { observer } from 'mobx-react';
import LessonConfigScope from './LessonConfigScope';

// 旧系统 v1 的约定：
//   请求 GET /mock/unit-09/v1/roles?pageNo=0&pageSize=5   （pageNo 从 0 开始）
//   响应 { success: true, result: { records: [...], totalCount: 12 } }
//   值集 GET /mock/unit-09/v1/lookups/ROLE.LEVEL           （响应外壳与列表相同）
//
// 知识点 1：configure 的配置对象。真实项目里写在入口 src/index.js，只调用一次：
//   import { configure } from 'choerodon-ui';
//   configure(legacyV1Config);
// 本项目用 <LessonConfigScope> 代替直接调用：进入单元时应用，离开时恢复，不影响其他单元。
export const legacyV1Config = {
  // 知识点 2：generatePageQuery 把 DataSet 的分页信息翻译成后端要的参数名。
  // 参数里的 page 从 1 开始，返回值会整体替换默认的 page / pagesize
  generatePageQuery: ({ page, pageSize }) => ({ pageNo: page - 1, pageSize }),
  // 知识点 3：dataKey / totalKey 支持「a.b」形式的路径
  dataKey: 'result.records',
  totalKey: 'result.totalCount',
  // 知识点 4：全局值集。字段只写 lookupCode，请求地址由 lookupUrl 统一生成。
  // 1.6.7 的值集请求默认是 POST，旧系统只支持 GET
  lookupUrl: (code) => `/mock/unit-09/v1/lookups/${code}`,
  lookupAxiosMethod: 'get',
};

export function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    // 知识点 5：DataSet 上不再写 dataKey / totalKey，自动使用全局配置。
    // 如果这里写了，DataSet 自己的属性优先于全局配置
    transport: { read: { url: '/mock/unit-09/v1/roles', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      // 值集字段：表格显示 meaning（如「平台层」），record.get 仍然是 value（如 'site'）
      { name: 'level', type: 'string', label: '层级', lookupCode: 'ROLE.LEVEL' },
      { name: 'memberCount', type: 'number', label: '成员数' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

// 知识点 6：localeContext 是全局语言包。切换后，组件库的内置文案（分页、按钮、校验提示）立即改变；
// 字段的 label 是我们自己写的中文，不会跟着变
const LANGUAGES = { zh_CN: { label: '中文', locale: zhCN }, en_US: { label: 'English', locale: enUS } };

const RoleStatusBar = observer(({ dataSet }) => {
  const lang = localeContext.locale.lang;
  return (
    <div className="status-bar">
      共 {dataSet.totalCount} 个角色 ｜ 第 {dataSet.currentPage}/{dataSet.totalPage} 页 ｜ 当前语言：
      {LANGUAGES[lang] ? LANGUAGES[lang].label : lang}
    </div>
  );
});

// 知识点 7：用 getConfig 读取当前生效的全局配置，方便确认配置是否生效、离开后是否恢复
function ConfigInspector() {
  const show = (key) => {
    const value = getConfig(key);
    return typeof value === 'function' ? '（函数）' : String(value);
  };
  return (
    <p className="unit09-config">
      当前生效：dataKey = <code>{show('dataKey')}</code>，totalKey = <code>{show('totalKey')}</code>，
      lookupAxiosMethod = <code>{show('lookupAxiosMethod')}</code>
    </p>
  );
}

const RoleList = observer(function RoleList() {
  const roleDS = useMemo(createRoleDataSet, []);
  const columns = [
    { name: 'code', width: 150 },
    { name: 'name', width: 140 },
    { name: 'level', width: 110 },
    { name: 'memberCount', width: 90 },
    { name: 'enabled', width: 80 },
  ];
  const toggleLanguage = () => {
    localeContext.setLocale(localeContext.locale.lang === 'en_US' ? zhCN : enUS);
  };
  return (
    <div>
      <div className="toolbar">
        <Button onClick={toggleLanguage}>
          {localeContext.locale.lang === 'en_US' ? '切换为中文' : 'Switch to English'}
        </Button>
      </div>
      <ConfigInspector />
      <RoleStatusBar dataSet={roleDS} />
      <Table dataSet={roleDS} columns={columns} />
    </div>
  );
});

export default function Example() {
  return (
    <LessonConfigScope config={legacyV1Config}>
      <RoleList />
    </LessonConfigScope>
  );
}
