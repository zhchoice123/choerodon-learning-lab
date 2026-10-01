// 【样例】08-2 绑定捕获的记录：打开弹窗时就确定要编辑哪一条，之后 current 怎么变都不受影响。
// 接口：GET /mock/s/08-2/roles。本节只编辑内存里的记录，不保存
import React, { useMemo } from 'react';
import { DataSet, Table, Form, TextField, Button, Modal } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/08-2/roles', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [{ name: 'name', type: 'string', label: '角色名称' }],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);

  const edit = () => {
    // 知识点 1：打开时就把要编辑的记录取出来（捕获）
    const record = roleDS.current;
    if (!record) return;
    Modal.open({
      title: `编辑：${record.get('name')}`,
      children: (
        <div>
          {/* 知识点 2：Form 用 record 绑定捕获的记录，而不是 dataSet（那样会跟着 current 变） */}
          <Form record={record} columns={1}>
            <TextField name="name" />
          </Form>
          {/* 演示用：在弹窗打开期间，用程序把列表的当前行换掉 */}
          <Button onClick={() => { roleDS.current = roleDS.get(roleDS.indexOf(record) === 0 ? 1 : 0); }}>
            （演示）切换列表的当前行
          </Button>
        </div>
      ),
    });
  };

  return (
    <div>
      <p>打开编辑后点「（演示）切换列表的当前行」：表单仍然是打开时的那个角色。</p>
      <Button onClick={edit}>编辑当前角色</Button>
      <Table dataSet={roleDS} columns={[{ name: 'name' }]} />
    </div>
  );
}
