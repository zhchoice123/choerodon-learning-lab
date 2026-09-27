import React, { useEffect, useRef, useState } from 'react';

export function mockRequest(message) {
  if (typeof message?.url !== 'string' || !/^\/mock\/[a-zA-Z0-9/_.-]+(?:\?[^#]*)?$/.test(message.url)) return null;
  if (message.url.split('?')[0].split('/').some((part) => part === '.' || part === '..')) return null;
  const method = String(message.method || 'GET').toUpperCase();
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) return null;
  let body = message.body;
  if (body !== undefined && typeof body !== 'string') body = JSON.stringify(body);
  if (body && body.length > 200 * 1024) return null;
  return { url: message.url, options: { method, headers: { 'Content-Type': 'application/json' }, body: method === 'GET' ? undefined : body } };
}

export default function CloudPreview({ code, unitNumber }) {
  const frame = useRef(null);
  const [compiled, setCompiled] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setCompiled(null); setError('');
    if (!code) return undefined;
    fetch('/__learn/api/compile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || '预览编译失败');
        if (!cancelled) setCompiled(data.compiled);
      }).catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [code, unitNumber, revision]);
  useEffect(() => {
    if (!compiled) return undefined;
    const receive = async (event) => {
      if (!frame.current || event.source !== frame.current.contentWindow || event.origin !== 'null') return;
      const target = event.source;
      if (event.data?.type === 'choero-ready') target.postMessage({ type: 'choero-run', compiled }, '*');
      if (event.data?.type === 'choero-mock') {
        const { id } = event.data;
        if (!Number.isSafeInteger(id)) return;
        const request = mockRequest(event.data);
        if (!request) { target.postMessage({ type: 'choero-result', id, error: '预览只允许课程 /mock/ 请求。' }, '*'); return; }
        try {
          const response = await fetch(request.url, request.options);
          const data = await response.json();
          target.postMessage({ type: 'choero-result', id, status: response.status, data }, '*');
        } catch (err) { target.postMessage({ type: 'choero-result', id, error: 'mock 请求失败' }, '*'); }
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [compiled]);
  return <div style={{ width: '100%' }}>
    <button type="button" onClick={() => setRevision((value) => value + 1)} style={{ marginBottom: 8 }}>重新运行已保存代码</button>
    {error ? <div role="alert">{error}</div> : compiled ? <iframe key={`${unitNumber}-${revision}-${compiled}`} ref={frame}
      title="独立练习预览" src="/choerodon/preview" sandbox="allow-scripts" referrerPolicy="no-referrer"
      style={{ width: '100%', minHeight: 640, border: 0, background: '#fff' }} /> : <div>正在准备预览…</div>}
  </div>;
}
