// 导出 DataSet 的配置对象（官方推荐规范：配置与组件分离）
export const simpleDSConfig = {
    primaryKey: 'id',
    autoQuery: false, // ⚠️ 关键点：设置为 false，页面初次加载时不会发请求
    dataKey: 'content', // 👈 核心：指定后端列表数组所在的字段名（默认是 rows）
    totalKey: 'totalElements', // 👈 核心：指定后端总条数所在的字段名（默认是 total）
    pageSize: 5,
    transport: {
        read: {
            url: '/mock/guide/user', // 使用项目中已有的 Mock 接口
            method: 'GET',
        },
    },
    // 最简字段定义：只需要名字、类型、显示标签
    fields: [
        { name: 'id', type: 'number', label: 'ID' },
        { name: 'name', type: 'string', label: '姓名' },
        { name: 'code', type: 'string', label: '员工工号' },
        { name: 'age', type: 'number', label: '年龄' },
    ],
};

// 表格列定义
export const simpleColumns = [
    { name: 'id', width: 80 },
    { name: 'name', width: 120, editor: true },
    { name: 'code', width: 160 },
    { name: 'age', width: 80 },
];