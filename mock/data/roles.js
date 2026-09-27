// 角色数据：学习单元「样例」使用，和练习用的员工数据区分开
const ROLES = [
  ['平台管理员', 'site-admin', 'site', 3],
  ['租户管理员', 'tenant-admin', 'organization', 8],
  ['项目所有者', 'project-owner', 'project', 12],
  ['项目成员', 'project-member', 'project', 56],
  ['开发工程师', 'developer', 'project', 34],
  ['测试工程师', 'tester', 'project', 15],
  ['运维工程师', 'ops', 'organization', 6],
  ['财务专员', 'finance', 'organization', 4],
  ['人事专员', 'hr', 'organization', 5],
  ['审计员', 'auditor', 'site', 2],
  ['访客', 'guest', 'site', 120],
  ['数据分析师', 'analyst', 'organization', 9],
];

const roles = ROLES.map(([name, code, level, memberCount], index) => ({
  id: 101 + index,
  name,
  code,
  level,
  memberCount,
  enabled: index % 5 !== 4,
  createdAt: `2023-${String(1 + index).padStart(2, '0')}-15 09:30:00`,
}));

module.exports = roles;
