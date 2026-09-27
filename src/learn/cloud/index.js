import React from 'react';
import ReactDOM from 'react-dom';
import 'choerodon-ui/dist/choerodon-ui.css';
import 'choerodon-ui/dist/choerodon-ui-pro.css';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import '../../index.css';

localeContext.setLocale(zhCN);
if (window.location.pathname.endsWith('/preview')) {
  require('./runtime').startPreview();
} else {
  const App = require('../../App').default;
  // 先取得 HttpOnly 身份 Cookie，再挂载会并发发请求的课程和首页。
  fetch('/__learn/api/units').then((response) => {
    if (!response.ok) throw new Error('学习服务暂时不可用，请稍后刷新。');
    ReactDOM.render(<><div style={{ padding: '8px 20px', background: '#eff6ff', color: '#334155', fontSize: 13 }}>
      免登录工作台 · 作业按此浏览器独立保存；清除网站 Cookie 或使用无痕模式后会创建新身份。
    </div><App /></>, document.getElementById('root'));
  }).catch((error) => { document.getElementById('root').textContent = error.message; });
}
