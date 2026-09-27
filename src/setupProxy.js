// CRA 在 yarn start 时自动加载本文件（只支持 CommonJS 语法），修改后需重启 dev server。
// 本地 mock 接口在 mock/；在线学习工作台的本地接口和 Monaco 静态资源在 devtools/。
const registerMock = require('../mock');
const registerMonacoStatic = require('../devtools/monaco-static');
const registerLearnApi = require('../devtools/learn-api');

module.exports = function setupProxy(app) {
  registerMock(app);
  registerMonacoStatic(app);
  registerLearnApi(app);
};
