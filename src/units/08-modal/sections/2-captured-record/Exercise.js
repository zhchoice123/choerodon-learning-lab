// 【练习】08-2 绑定捕获的记录：打开编辑后点「（演示）切换列表的当前行」，表单变成了另一名员工。修好它。
// 接口：GET /mock/s/08-2/employees
import React, { useMemo } from 'react';
import { DataSet, Table, Form, TextField, Button, Modal } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/08-2/employees', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [{ name: 'name', type: 'string', label: '姓名' }],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);

  const edit = () => {
    if (!employeeDS.current) return;
    Modal.open({
      // TODO 1：标题显示「编辑：姓名」，姓名是打开时那名员工的
      title: '编辑员工',
      children: (
        <div>
          {/* TODO 2：这里有隐患：表单绑定了 dataSet，会跟着当前行变。改成绑定打开时捕获的记录 */}
          <Form dataSet={employeeDS} columns={1}>
            <TextField name="name" />
          </Form>
          <Button onClick={() => { employeeDS.current = employeeDS.get(employeeDS.indexOf(employeeDS.current) === 0 ? 1 : 0); }}>
            （演示）切换列表的当前行
          </Button>
        </div>
      ),
    });
  };

  return (
    <div>
      <Button onClick={edit}>编辑当前员工</Button>
      <Table dataSet={employeeDS} columns={[{ name: 'name' }]} />
    </div>
  );
}
