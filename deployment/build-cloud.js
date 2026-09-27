// 云端产物使用独立入口；本地学习入口、练习文件与 yarn build 均不改动。
const path = require('path');
const webpack = require('webpack');
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
process.env.PUBLIC_URL = '/choerodon';
process.env.BUILD_PATH = 'cloud-build';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.REACT_APP_CLOUD_WORKSPACE = 'true';
const configPath = require.resolve('react-scripts/config/webpack.config');
const createConfig = require(configPath);
require.cache[configPath].exports = (environment) => {
  const config = createConfig(environment);
  config.entry = path.resolve(__dirname, '../src/learn/cloud/index.js');
  config.cache = false;
  config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^\.\/Exercise(?:\.js)?$/, (resource) => {
    if (/[/\\]src[/\\]units[/\\]\d+-[^/\\]+$/.test(resource.context)) {
      resource.request = path.resolve(__dirname, '../src/learn/cloud/Placeholder.js');
    }
  }));
  config.plugins.push({
    apply(compiler) {
      compiler.hooks.compilation.tap('RejectSharedExercises', (compilation) => {
        compilation.hooks.finishModules.tap('RejectSharedExercises', (modules) => {
          for (const module of modules) {
            if (/[/\\]src[/\\]units[/\\]\d+-[^/\\]+[/\\]Exercise\.js$/.test(module.resource || '')) {
              throw new Error('云端发布包不能包含管理员 Exercise.js');
            }
          }
        });
      });
    },
  });
  return config;
};
require('react-scripts/scripts/build');
