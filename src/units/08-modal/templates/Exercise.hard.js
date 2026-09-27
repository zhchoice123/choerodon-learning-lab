// 【练习·挑战】员工弹窗维护，原始模板只读；请自行完成 TODO，不提供员工答案。
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：完成员工维护数据、字段校验与界面；在职邮箱必填，已有编码不可改。
// TODO 2：弹窗和抽屉共用新增/编辑流程，始终针对打开时的记录。
// TODO 3：修正提前关闭的隐患；保存成功才关闭，失败原地提示且输入保留。
// TODO 4：取消正确撤销本次修改，新建取消不留空行；保存期间不能重复提交或撤销。
// TODO 5：离开单元清理本单元编辑器，完成可观察状态及共同验收。
// TODO 6：有未保存修改时，取消需二次确认；选择继续编辑保留窗口/草稿，确认放弃才撤销并关闭。

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id', autoQuery: true, pageSize: 5, strictPageSize: false, autoQueryAfterSubmit: false,
    dataKey: 'content', totalKey: 'totalElements',
    transport: { read: { url: '/mock/unit-08/employees', method: 'GET' } },
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
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
    setOpened(true);
    modalRef.current = Modal.open({
      title: `${create ? '新增' : '编辑'}员工（骨架）`, drawer, style: { width: 560 },
      maskClosable: false, keyboardClosable: false, closeOnLocationChange: false,
      okText: '确认保存', cancelText: '取消修改',
      children: <p>员工编辑器待完成；原始模板不创建新记录，也不保存。</p>,
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
      <Table dataSet={employeeDS} columns={[]} />
      <p role="status">{result}</p>
    </div>
  );
});
