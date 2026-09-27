import React from 'react';
import ReactDOM from 'react-dom';
// 组件库样式：Pro 组件需要额外引入 choerodon-ui-pro.css
import 'choerodon-ui/dist/choerodon-ui.css';
import 'choerodon-ui/dist/choerodon-ui-pro.css';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 组件库内置文案（分页、按钮、校验提示等）使用中文
localeContext.setLocale(zhCN);

// No React.StrictMode: Choerodon UI 1.6.x relies on findDOMNode and legacy
// lifecycles, and StrictMode's double render would create two DataSets and
// send every autoQuery request twice in development.
ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
