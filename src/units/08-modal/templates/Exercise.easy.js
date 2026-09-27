// 【练习·入门】员工弹窗维护，原始模板只读；请自行完成 TODO，不提供员工答案。
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet, Table, Button, Modal, Form, Output, TextField, NumberField, Switch } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：补齐 fields：员工编码 required/pattern、姓名 required、年龄整数 18～60、active 默认 true。
// TODO 2：邮箱随 active 动态必填；编辑旧员工时编码 readOnly，新增时可填写（变化点）。
// TODO 3：配置 transport.create / update；URL 见 README，保留记录数组和 content 回写。
// TODO 4：新增时 employeeDS.create，编辑时捕获 employeeDS.current；Form 用 record 绑定。
// TODO 5：Modal.open 的 drawer 参数复用同一编辑器；完成取消规则后解除 Form 的骨架 readOnly。
// TODO 6：onOk 先 await record.validate，再提交该 record；不要把提前 return true 当成保存成功。
// TODO 7：校验失败、HTTP 失败或无写请求返回 false；保存成功才返回 true，失败显示后端信息。
// TODO 8：onCancel 用 record.reset；新增草稿还需要 employeeDS.remove，不发送删除请求。
// TODO 9：保存期间阻止重复确认/取消，捕获的 record 不随 current 改变；离开单元只关闭自己句柄。
// TODO 10：显示 ID/status/dirty 和结果，验证取消后恢复最新已保存值，并完成 README 共同验收。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 5, strictPageSize: false, autoQueryAfterSubmit: false,
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-08/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

export default observer(function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const modalRef = useRef();
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState('员工已读取，弹窗业务待完成');
  // 仅给安全骨架提供自身句柄清理；新增/编辑后的回滚与异步收尾需在 TODO 中完善。
  useEffect(() => () => {
    const modal = modalRef.current;
    modalRef.current = undefined;
    modal?.update({ afterClose: () => {} });
    modal?.close(true);
  }, []);
  const openEditor = (create, drawer) => {
    if (modalRef.current) return;
    const record = employeeDS.current;
    setOpened(true);
    modalRef.current = Modal.open({
      title: `${create ? '新增' : '编辑'}员工（骨架）`, drawer, style: { width: 560 },
      maskClosable: false, keyboardClosable: false, closeOnLocationChange: false,
      okText: '确认保存', cancelText: '取消修改',
      children: <div>
        <p>骨架尚未创建新记录；完成取消与保存流程后，再解除表单只读。</p>
        <Form record={record} columns={1} readOnly>
          <Output name="id" /><TextField name="code" /><TextField name="name" />
          <NumberField name="age" /><TextField name="email" /><Switch name="active" />
        </Form>
      </div>,
      onOk: async () => {
        // 能跑但有隐患：没有等待校验和保存就允许关闭；Promise 完成不代表数据已保存。
        setResult('骨架提前允许关闭，尚未校验或保存');
        return true;
      },
      onCancel: () => true,
      afterClose: () => { modalRef.current = undefined; setOpened(false); },
    });
  };
  return (
    <div>
      <p>原始模板可以打开只读骨架，不创建草稿、不发写请求。完成 TODO 后验收员工业务。</p>
      <div className="toolbar">
        <Button disabled={opened} onClick={() => openEditor(true, false)}>新增员工（弹窗）</Button>
        <Button disabled={opened || !employeeDS.current} onClick={() => openEditor(false, false)}>编辑员工（弹窗）</Button>
        <Button disabled={opened} onClick={() => openEditor(true, true)}>新增员工（抽屉）</Button>
        <Button disabled={opened || !employeeDS.current} onClick={() => openEditor(false, true)}>编辑员工（抽屉）</Button>
      </div>
      <div className="status-bar">已读取 {employeeDS.length} 位员工 ｜ 当前：{employeeDS.current?.get('name') || '无'} ｜ 保存状态：待完成</div>
      <Table dataSet={employeeDS} columns={[{ name: 'id', width: 100 }, { name: 'code', width: 130 }, { name: 'name', width: 130 },
        { name: 'age', width: 80 }, { name: 'email', width: 230 }, { name: 'active', width: 80 }]} />
      <p role="status">{result}</p>
    </div>
  );
});
