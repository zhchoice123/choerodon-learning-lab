// 仅供受密码保护的个人云端实例使用；本地 yarn start / build 保持 CRA 默认配置。
// CRA 5 的 webpack.config.js 使用 filesystem cache，首次编译后的缓存序列化
// 会产生额外内存峰值。小内存服务器关闭该缓存和源码映射，仍保留 Fast Refresh。
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';
process.env.CI = 'true';

const configPath = require.resolve('react-scripts/config/webpack.config');
const createConfig = require(configPath);
require.cache[configPath].exports = (environment) => {
  const config = createConfig(environment);
  config.cache = false;
  config.devtool = false;
  return config;
};

require('react-scripts/scripts/start');
