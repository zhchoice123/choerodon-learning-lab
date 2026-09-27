/* eslint-disable no-new-func */
// 仅在 sandbox="allow-scripts" 的不透明来源 iframe 中运行访客代码。
// 服务端 CSP 禁止网络连接；宿主消息桥只允许同身份的 /mock/ 请求。
import React from 'react';
import ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as ui from 'choerodon-ui';
import * as pro from 'choerodon-ui/pro';
import axios from 'axios';
import datasetAxios from 'choerodon-ui/dataset/axios';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import enUS from 'choerodon-ui/pro/lib/locale-context/en_US';
import LessonConfigScope from '../../units/09-global-config/LessonConfigScope';
import ErrorBoundary from '../workspace/ErrorBoundary';

export function startPreview() {
  if (window.parent === window) return;
  const parentOrigin = window.location.origin;
  const pending = new Map();
  let sequence = 0;
  const send = (value) => window.parent.postMessage(value, parentOrigin);
  const call = (url, method = 'GET', body) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('mock 请求超时')); }, 30000);
    pending.set(id, { resolve, reject, timer });
    send({ type: 'choero-mock', id, url, method, body });
  });
  const adapter = async (config) => {
    const result = await call(axios.getUri(config), (config.method || 'get').toUpperCase(), config.data);
    const response = { data: result.data, status: result.status, statusText: String(result.status), headers: {}, config };
    if (config.validateStatus && !config.validateStatus(response.status)) {
      const error = new Error(result.data?.message || `请求失败（${response.status}）`);
      error.response = response; error.config = config; error.isAxiosError = true;
      throw error;
    }
    return response;
  };
  axios.defaults.adapter = adapter;
  datasetAxios.defaults.adapter = adapter;
  // 覆盖课程中直接使用 fetch 的异步校验，同样只能走 mock 白名单。
  window.fetch = async (url, options = {}) => {
    const result = await call(String(url), options.method || 'GET', options.body);
    return new Response(JSON.stringify(result.data), { status: result.status, headers: { 'Content-Type': 'application/json' } });
  };
  const modules = {
    react: React, 'react-dom': ReactDOM, mobx, 'mobx-react': mobxReact, axios,
    'choerodon-ui': ui, 'choerodon-ui/pro': pro,
    'choerodon-ui/pro/lib/locale-context': localeContext,
    'choerodon-ui/pro/lib/locale-context/zh_CN': zhCN,
    'choerodon-ui/pro/lib/locale-context/en_US': enUS,
    './LessonConfigScope': LessonConfigScope,
  };
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== parentOrigin) return;
    const message = event.data;
    if (message?.type === 'choero-result') {
      const request = pending.get(message.id);
      if (!request) return;
      clearTimeout(request.timer); pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error)); else request.resolve(message);
    }
    if (message?.type === 'choero-run' && typeof message.compiled === 'string') {
      try {
        const module = { exports: {} };
        const localRequire = (name) => {
          if (!Object.prototype.hasOwnProperty.call(modules, name)) throw new Error(`云端预览不支持模块：${name}`);
          return modules[name];
        };
        new Function('require', 'module', 'exports', message.compiled)(localRequire, module, module.exports);
        const Exercise = module.exports.default;
        if (!Exercise) throw new Error('练习需要 export default 导出组件。');
        ReactDOM.render(<ErrorBoundary resetKey={message.compiled}><Exercise /></ErrorBoundary>, document.getElementById('root'));
      } catch (error) {
        document.getElementById('root').textContent = `预览错误：${error.message}`;
      }
    }
  });
  send({ type: 'choero-ready' });
}
