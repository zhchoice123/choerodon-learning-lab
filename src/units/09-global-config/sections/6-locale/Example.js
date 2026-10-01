// 【样例】09-6 语言包：localeContext.setLocale 切换组件库的内置文案（分页器、按钮、校验提示）。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import enUS from 'choerodon-ui/pro/lib/locale-context/en_US';
import { observer } from 'mobx-react';
import LessonConfigScope from './LessonConfigScope';

const RoleList = observer(function RoleList() {
  const roleDS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 5,
        transport: { read: { url: '/mock/roles', method: 'GET' } },
        dataKey: 'content',
        totalKey: 'totalElements',
        fields: [{ name: 'name', type: 'string', label: '角色名称' }],
      }),
    [],
  );
  // 知识点 1：localeContext 是全局单例，locale.lang 是当前语言，setLocale 切换
  // 知识点 2：只影响组件库自带的文案；字段的 label 是我们自己写的中文，不会变
  const isEnglish = localeContext.locale.lang === 'en_US';
  return (
    <div>
      <Button onClick={() => localeContext.setLocale(isEnglish ? zhCN : enUS)}>
        {isEnglish ? '切换为中文' : 'Switch to English'}
      </Button>
      <Table dataSet={roleDS} columns={[{ name: 'name' }]} />
    </div>
  );
});

export default function Example() {
  // 知识点 3：语言包也是全局的，LessonConfigScope 离开本课时会恢复成进入前的语言
  return (
    <LessonConfigScope config={{}}>
      <RoleList />
    </LessonConfigScope>
  );
}
