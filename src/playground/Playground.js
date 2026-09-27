// 自由练习区：保留你在学习单元之前自己探索的全部代码（原 src/App.js）。
// 组件库样式和中文语言包已移到 src/index.js 全局引入。
import React, { useMemo } from 'react';
import {
    DataSet,
    Table,
    Button,
    Modal,
    Form,
    TextField,
    Select,
    NumberField,
    Tabs
} from 'choerodon-ui/pro';
import { simpleDSConfig, simpleColumns } from './simpleDS';
import LearningResources from './LearningResources';

const { TabPane } = Tabs;
export default function Playground() {
    // 实例化新创建的 simpleDS（使用 useMemo 确保组件更新时不重复创建）
    const simpleDS = useMemo(() => new DataSet(simpleDSConfig), []);

    // 使用 useMemo 确保组件重新渲染时 DataSet 实例不会被重复创建
    // 1. 性别下拉选项数据集（静态数据）
    const sexOptionDS = useMemo(() => new DataSet({
        data: [
            { value: 'M', meaning: '男' },
            { value: 'F', meaning: '女' },
        ],
    }), []);
    const handleTabChange = (key) => {
        // 切换到新 Tab 时触发加载
        if (key === 'simpleTab') {
            // 如果还没有数据（避免每次点击重复请求），则发起查询；若想每次切换都刷新，可直接 simpleDS.query()
            if (simpleDS.length === 0) {
                console.log('正在加载 simpleDS 数据...');
                simpleDS.query();
            }
        }
    };
    // 2. 子数据集：地址明细列表（由父 DataSet 的 children 属性级联驱动）
    const addressDS = useMemo(() => new DataSet({
        primaryKey: 'id',
        fields: [
            { name: 'id', type: 'number', label: '地址ID' },
            { name: 'city', type: 'string', label: '城市', required: true },
            { name: 'detail', type: 'string', label: '详细地址', required: true },
            { name: 'isDefault', type: 'boolean', label: '默认地址', defaultValue: false },
            { name: 'phone', type: 'string', label: '电话', required: true, pattern: /^1[3-9]\d{9}$/, defaultValidationMessages: { patternMismatch: '电话格式不合规（示例：13812345678）' } },
        ],
    }), []);

    const myValidtor = async (value, name, record) => {
        if (!value) return true;
        await new Promise(resolve => setTimeout(resolve, 1000));

        const blackList = ['EMP001', 'EMP002', 'EMP003'];

        if (blackList.includes(value)) {
            return '该员工编码已在系统中存在，请更换！';
        }
        return true;
    }
    const openEditModal = (record) => {
        Modal.open({
            key: 'user-edit-modal',
            title: `编辑用户 - ${record.get('name')}`,
            drawer: false, // 设为 true 可变成抽屉模式！
            // 弹窗主体内容：一个绑定了当前 record 的 Form
            children: (
                <Form record={record} columns={1} style={{ padding: '20px 40px 0 0' }}>
                    <TextField name="name" />
                    <TextField name="code" />
                    <Select name="sex" />
                    <NumberField name="age" />
                </Form>
            ),
            // 点击弹窗【确定】按钮的回调
            onOk: async () => {
                // 1. 触发整行校验
                const isValid = await record.validate();
                if (isValid) {
                    // 2. 校验通过，提交保存到 Node Mock 服务
                    await userDS.submit();
                    return true; // 返回 true 会自动关闭弹窗
                }
                return false; // 校验失败，保持弹窗打开，提示用户修改
            },
            // 点击弹窗【取消】或右上角关闭时的回调
            onCancel: () => {
                // 撤销用户在弹窗中所做的未保存修改（优雅回滚）
                record.reset();
            },
        });
    };
    // 3. 主数据集
    const userDS = useMemo(() => new DataSet({
        autoQuery: true, // 页面加载后自动触发 transport.read 中的请求
        primaryKey: 'id',
        dataKey: 'content', // 指定解析后端 JSON 数据的层级
        totalKey: 'totalElements', // 指定总条数字段（默认读取 total，接口返回的是 totalElements）
        // 核心：绑定子数据集，当前选中用户的 addresses 会自动注入 addressDS
        children: {
            addresses: addressDS,
        },
        fields: [
            { name: 'id', type: 'number', label: '用户ID' },
            { name: 'name', type: 'string', label: '姓名', required: true },
            {
                name: 'code', type: 'string', label: '员工编码', required: true,
                pattern: /^EMP\d{3}$/, defaultValidationMessages: {
                    patternMismatch: '员工编码格式不合规（示例：EMP001）'
                },
                validator: myValidtor
            },
            {
                name: 'sex',
                type: 'string',
                label: '性别',
                options: sexOptionDS, // 绑定下拉数据集
            },
            {
                name: 'age',
                type: 'number',
                label: '年龄',
                min: 18,
                max: 100,
                step: 1, // 步进值
                validator: (value, name, record) => {
                    if (!value) return true;
                    // 关键点：通过 record.get 获取当前记录的另一个字段值
                    const currentSex = record.get('sex');
                    if (currentSex === 'F' && value > 55) {
                        return '女员工已超过法定退休年龄（55岁）';
                    }
                    return true;
                }
            }
        ], events: {
            update: ({ dataSet, record, name, value, oldValue }) => {
                if (name === 'sex' && value === 'F' && !record.get('age')) {
                    record.set('age', 20); // 自动联动赋初值
                }
            }
        },
        queryFields: [
            {
                name: 'name',
                type: 'string',
                label: '姓名'
            }, {
                name: 'sex',
                type:
                    'string',
                label:
                    '性别',
                options:
                    sexOptionDS, // 搜索栏同样拥有下拉能力
            }
        ],
        transport: {
            // 1. 查询数据接口 (GET)
            read: {
                // 自由练习区独立内存数据；读写同源，重启 yarn start 恢复种子。
                url: '/mock/playground/users',
                method: 'GET',
            },
            // 2. 更新修改接口 (PUT) - 关键：点击保存时触发
            update: {
                url: '/mock/playground/users',
                method: 'PUT',
            },
            // 3. 新增数据接口 (POST) - 点击新增并保存时触发
            create: {
                url: '/mock/playground/users',
                method: 'POST',
            },
            // 4. 删除数据接口 (DELETE) - 点击删除时触发
            destroy: {
                url: '/mock/playground/users',
                method: 'DELETE',
            },
        }
    }),
        [sexOptionDS, addressDS]
    )
        ;

    // 1. 父表格（用户）的列定义
    const columns = [
        { name: 'id', width: 100, editor: true },
        { name: 'name', width: 150, editor: true },
        { name: 'age', width: 150, editor: true },
        { name: 'code', editor: true },
        { name: 'sex', editor: true },
        {
            header: '操作',
            width: 120,
            lock: 'right', // 固定在最右侧
            renderer: ({ record }) => (
                <Button
                    funcType="flat"
                    color="primary"
                    onClick={() => openEditModal(record)}
                >
                    编辑
                </Button>
            ),
        },
    ];

    // 2. 子表格（地址）的列定义
    const addressColumns = [
        { name: 'city', width: 180, editor: true },
        { name: 'detail', editor: true },
        { name: 'phone', editor: true },
        { name: 'isDefault', editor: true },
    ];

    return (
        <div>
            <h2>自由练习区</h2>
            <LearningResources />

            <Tabs defaultActiveKey="originTab" onChange={handleTabChange}>
                {/* 第一个 Tab：保留原有的复杂用户管理 */}
                <TabPane tab="1. 原用户列表（现有页面）" key="originTab">
                    <Table dataSet={userDS} columns={columns} queryFieldsLimit={3} buttons={[
                        ['add', { children: '新建员工', icon: 'person_add' }],
                        ['save', { children: '提交保存' }],
                        ['delete', { children: '移除选中' }],
                        'reset',
                    ]} />

                    <div style={{ marginTop: '36px', borderTop: '2px dashed #e8e8e8', paddingTop: '24px' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1a73e8' }}>
                            🏠 当前选中用户的关联地址列表 (头行主从联动样例)
                        </h3>
                        <Table
                            dataSet={addressDS}
                            columns={addressColumns}
                            buttons={['add', 'delete']}
                        />
                    </div>
                </TabPane>

                {/* 第二个 Tab：从0搭建的简单页面 */}
                {/* 第二个 Tab：从0构建的新页面 */}
                <TabPane tab="2. 从0构建的新页面（按需加载）" key="simpleTab">
                    <div style={{ padding: '16px 0' }}>
                        {/* 1. 绑定同一个 DataSet 的表单：自动呈现并编辑当前行 (simpleDS.current) */}
                        <div style={{ background: '#f7f8fa', padding: '16px 20px', borderRadius: '4px', marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#1a73e8' }}>
                                📝 当前选中员工详情（Form 与下方 Table 实时双向联动）
                            </h4>
                            <Form dataSet={simpleDS} columns={3}>
                                <TextField name="name" />
                                <TextField name="code" />
                                <NumberField name="age" />
                            </Form>
                        </div>

                        {/* 2. 绑定同一个 DataSet 的表格 */}
                        <Table dataSet={simpleDS} columns={simpleColumns} />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
}
