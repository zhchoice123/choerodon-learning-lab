// 【练习·标准】员工弹窗维护，原始模板只读；请自行完成 TODO，不提供员工答案。
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet, Table, Button, Modal, Form, Output, TextField, NumberField, Switch } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：员工字段规则与本单元写接口接入，新增默认值正确（知识点 1）。
// TODO 2：完成在职邮箱必填与已有编码不可改这两个变化点（复习 03、06）。
// TODO 3：新增/编辑共用弹窗与抽屉，绑定打开时捕获的记录，解除骨架只读（知识点 2、4）。
// TODO 4：修正提前允许关闭的隐患；等待校验和单条提交，准确返回布尔结果（知识点 5、6）。
// TODO 5：失败留窗保留输入、显示原因并可重试；保存过程中防止重复操作（知识点 5、7）。
// TODO 6：取消编辑回滚，取消新增移除草稿；正确区分成功关闭与取消关闭（知识点 3、8）。
// TODO 7：处理卸载清理与状态展示，完成所有共同验收（知识点 8、9）。

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
