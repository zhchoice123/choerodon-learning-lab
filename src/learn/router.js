// hash 路由（契约：docs/workspace/CONTRACT.md 第 2 节）
// 路由对象：{ page: 'home' } | { page: 'unit', key: 'unit-05' } | { page: 'playground' } | { page: 'not-found', path }
import { useEffect, useState } from 'react';

export const HOME_ROUTE = { page: 'home' };
export const PLAYGROUND_ROUTE = { page: 'playground' };
export const unitRoute = (key) => ({ page: 'unit', key });

export function parseHash(hash = '') {
  // 同时兼容新格式 #/unit-05 和旧格式 #unit-05
  const path = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (!path) return HOME_ROUTE;
  if (path === 'playground') return PLAYGROUND_ROUTE;
  // 章节 unit-05，小节 unit-05-2
  if (/^unit-\d{2}(-\d{1,2})?$/.test(path)) return unitRoute(path);
  return { page: 'not-found', path };
}

export function toHash(route) {
  if (route.page === 'unit') return `#/${route.key}`;
  if (route.page === 'playground') return '#/playground';
  return '#/';
}

// 离开页面前的拦截：guard(目标路由) 返回 false 时取消跳转。
// 只对通过 navigate() 发起的跳转生效；浏览器前进后退、关闭页面需另外处理（beforeunload）。
const guards = new Set();

export function addNavigationGuard(guard) {
  guards.add(guard);
  return () => guards.delete(guard);
}

export function navigate(route) {
  for (const guard of guards) {
    if (guard(route) === false) return false;
  }
  window.location.hash = toHash(route);
  return true;
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return route;
}
