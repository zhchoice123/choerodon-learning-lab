// 【样例】01-5 useMemo：组件每次重新渲染，函数体都会从头执行一遍。
// 点击「重新渲染」，对比两种写法创建 DataSet 的次数。
import React, { useMemo, useState } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';

const created = { inline: 0, memo: 0 };

function createRoleDataSet(kind) {
  created[kind] += 1;
  return new DataSet({ data: [{ name: '平台管理员' }, { name: '访客' }], fields: [{ name: 'name', type: 'string' }] });
}

export default function Example() {
  const [renders, setRenders] = useState(1);
  // 错误写法：每次渲染都 new 一个新的 DataSet，勾选、当前行、已加载的数据都会丢，还会重复发请求
  const inlineDS = createRoleDataSet('inline');
  // 知识点：useMemo 的依赖是 []，只在第一次渲染时执行，之后一直返回同一个 DataSet
  const memoDS = useMemo(() => createRoleDataSet('memo'), []);

  return (
    <div>
      <Button onClick={() => setRenders(renders + 1)}>重新渲染（第 {renders} 次）</Button>
      <p>直接创建：已创建 {created.inline} 个 DataSet（本次有 {inlineDS.length} 条数据）</p>
      <p>useMemo 创建：已创建 {created.memo} 个 DataSet（本次有 {memoDS.length} 条数据）</p>
    </div>
  );
}
