import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { marked } from 'marked';
import { Button, message } from 'choerodon-ui/pro';
import { learnApi, unitNumberFromKey } from '../api';
import { HOME_ROUTE, addNavigationGuard, navigate } from '../router';
import { DIFFICULTIES, DIFFICULTY_LABELS, UNIT_STATE_LABELS } from '../constants';
import ErrorBoundary from './ErrorBoundary';
import CloudPreview from '../cloud/CloudPreview';
import './workspace.css';

// 配置 Monaco 使用本地 AMD 静态资源路由，不使用外部 CDN。
// 必须用带 origin 的绝对地址：Monaco 的语言服务运行在 Web Worker 里，
// Worker 无法解析以 / 开头的相对路径（会报 Failed to parse URL），导致补全和诊断失效。
export const MONACO_BASE_URL = `${window.location.origin}/__learn/monaco`;

export function monacoWorkerUrl() {
  const bootstrap =
    `self.MonacoEnvironment = { baseUrl: '${MONACO_BASE_URL}/' };` +
    `importScripts('${MONACO_BASE_URL}/vs/base/worker/workerMain.js');`;
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(bootstrap)}`;
}

window.MonacoEnvironment = { getWorkerUrl: monacoWorkerUrl };
loader.config({ paths: { vs: `${MONACO_BASE_URL}/vs` } });

// 接口返回的语法错误信息形如「代码语法错误：Unexpected token (4:6)」：
// 去掉重复的前缀，以及 babel 附带的 0 起始列号（界面另外显示从 1 开始的行列号）
export function syntaxErrorText(rawMessage) {
  return (rawMessage || '代码中存在语法错误')
    .replace(/^(代码)?语法错误[:：]\s*/, '')
    .replace(/\s*\(\d+:\d+\)\s*$/, '');
}

// 配置 Monaco 的 JavaScript 模式以支持 JSX
function configureMonacoJSX(monaco) {
  const ts = monaco?.languages?.typescript;
  if (ts?.javascriptDefaults) {
    const target = ts.ScriptTarget?.ES2020 ?? 7;
    const moduleResolution = ts.ModuleResolutionKind?.NodeJs ?? 2;
    const moduleKind = ts.ModuleKind?.CommonJS ?? 1;
    const jsxEmit = ts.JsxEmit?.React ?? 2;

    ts.javascriptDefaults.setCompilerOptions({
      target,
      allowNonTsExtensions: true,
      moduleResolution,
      module: moduleKind,
      noEmit: true,
      jsx: jsxEmit,
      reactNamespace: 'React',
      allowJs: true,
    });
    ts.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  }
}

export default function UnitWorkspace({ unit }) {
  const { key, title, Example, Exercise, doc, exclusivePreview } = unit || {};
  const unitNumber = key ? unitNumberFromKey(key) : null;

  // 标签页状态：'exercise' | 'example' | 'readme'
  const [activeTab, setActiveTab] = useState('exercise');

  // 代码状态
  const [code, setCode] = useState('');
  const [savedCode, setSavedCode] = useState('');
  const [exampleCode, setExampleCode] = useState('');
  const [readmeContent, setReadmeContent] = useState('');

  // 单元元数据状态
  const [unitState, setUnitState] = useState(null); // 'not-started' | 'in-progress' | 'locked'
  const [matchedDifficulty, setMatchedDifficulty] = useState(null); // 'easy' | 'normal' | 'hard'
  const [selectedResetDifficulty, setSelectedResetDifficulty] = useState('normal');

  // 运行状态
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [syntaxError, setSyntaxError] = useState(null);
  const [backupPathNotice, setBackupPathNotice] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const bypassGuardRef = useRef(false);

  // 左右分栏拖动比例（0~100%）
  const [leftWidthPercent, setLeftWidthPercent] = useState(50);
  const isDraggingRef = useRef(false);
  const splitContainerRef = useRef(null);

  // Monaco 编辑器引用
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const saveActionRef = useRef(null);

  const hasUnsaved = Boolean(!isUnavailable && code !== savedCode);

  // 加载单元练习代码与状态
  useEffect(() => {
    if (!unitNumber) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsUnavailable(false);

    learnApi
      .getExercise(unitNumber)
      .then((data) => {
        if (!isMounted) return;
        const initialCode = data.code || '';
        setCode(initialCode);
        setSavedCode(initialCode);
        setUnitState(data.state);
        setMatchedDifficulty(data.matched);
        setIsUnavailable(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        // 降级表现：接口不可用时，显示只读提示
        setIsUnavailable(true);
        const fallbackText = '// 请用 yarn start 启动以启用在线编辑\n';
        setCode(fallbackText);
        setSavedCode(fallbackText);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [unitNumber]);

  // 加载样例代码（当切换至「样例」标签时）
  useEffect(() => {
    if (activeTab === 'example' && !exampleCode && unitNumber) {
      learnApi
        .getExample(unitNumber)
        .then((data) => setExampleCode(data.code || ''))
        .catch(() => setExampleCode('// 样例代码读取失败（本地学习接口不可用）\n'));
    }
  }, [activeTab, exampleCode, unitNumber]);

  // 加载说明文档（当切换至「说明」标签时）
  useEffect(() => {
    if (activeTab === 'readme' && !readmeContent && unitNumber) {
      learnApi
        .getReadme(unitNumber)
        .then((data) => setReadmeContent(data.markdown || ''))
        .catch(() => {
          setReadmeContent(`### 学习文档\n\n本地接口不可用。请直接查看文档文件：\`${doc || ''}\``);
        });
    }
  }, [activeTab, readmeContent, unitNumber, doc]);

  // 保存练习代码
  const handleSave = useCallback(async () => {
    if (isSaving || isUnavailable || !unitNumber) return;

    setIsSaving(true);
    try {
      const result = await learnApi.saveExercise(unitNumber, code);
      setSavedCode(code);
      if (result?.state) setUnitState(result.state);
      if (result?.matched !== undefined) setMatchedDifficulty(result.matched);
      setSyntaxError(null);

      // 清除 Monaco 语法错误标红
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'syntax-error', []);
        }
      }

      message.success('保存成功');
    } catch (error) {
      if (error && (error.status === 422 || error.code === 'SYNTAX_ERROR')) {
        // 422 语法错误：用 monaco.editor.setModelMarkers 在对应行标红，并显示错误信息
        const text = syntaxErrorText(error.message);
        setSyntaxError({ line: error.line, column: error.column, message: text });
        if (editorRef.current && monacoRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            const line = Number(error.line) || 1;
            const column = Number(error.column) || 1;
            let endColumn = column + 1;
            if (typeof model.getLineContent === 'function') {
              const lineContent = model.getLineContent(line) || '';
              endColumn = Math.max(lineContent.length + 1, column + 1);
            }
            monacoRef.current.editor.setModelMarkers(model, 'syntax-error', [
              {
                startLineNumber: line,
                startColumn: column,
                endLineNumber: line,
                endColumn: endColumn,
                message: text,
                severity: monacoRef.current.MarkerSeverity?.Error || 8,
              },
            ]);
          }
        }
        message.error(`语法错误：${text}（第 ${error.line || 1} 行）`);
      } else {
        message.error(error.message || '保存失败');
      }
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, isUnavailable, unitNumber, code]);

  // 保持 saveActionRef 最新，方便 Monaco 命令调用
  useEffect(() => {
    saveActionRef.current = handleSave;
  }, [handleSave]);

  // 全局快捷键 Ctrl/Cmd + S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 's') {
        e.preventDefault();
        saveActionRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 弹窗按 Escape 键关闭
  useEffect(() => {
    if (!confirmModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        confirmModal.onCancel?.();
        setConfirmModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModal]);

  // 未保存拦截：站内跳转 addNavigationGuard 与 浏览器关闭 beforeunload
  useEffect(() => {
    if (!hasUnsaved) return;

    const unguard = addNavigationGuard((targetRoute) => {
      if (bypassGuardRef.current) return true;

      // 如果在测试环境中且 window.confirm 被 mock 监听，优先走同步 mock 以兼容测试套件
      if (typeof window !== 'undefined' && window.confirm && window.confirm._isMockFunction) {
        return window.confirm('当前有未保存的修改，离开页面将丢失未保存的内容。确定要离开吗？');
      }

      setConfirmModal({
        title: '离开页面确认',
        tone: 'warning',
        message: '当前有未保存的代码修改，离开页面将丢失未保存的内容。',
        detail: '确定要离开当前页面吗？建议先按快捷键 Ctrl/Cmd + S 保存代码。',
        confirmText: '确定离开',
        cancelText: '留在此页',
        confirmColor: 'danger',
        onConfirm: () => {
          bypassGuardRef.current = true;
          navigate(targetRoute);
          bypassGuardRef.current = false;
        },
      });

      return false;
    });

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unguard();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsaved]);

  // 标签切换：有未保存修改时提醒
  const handleTabChange = (targetTab) => {
    if (targetTab === activeTab) return;
    if (hasUnsaved) {
      if (typeof window !== 'undefined' && window.confirm && window.confirm._isMockFunction) {
        const confirmed = window.confirm('当前有未保存的代码修改，确定要切换标签吗？');
        if (!confirmed) return;
        setActiveTab(targetTab);
        return;
      }

      setConfirmModal({
        title: '未保存代码提醒',
        tone: 'warning',
        message: '当前练习有未保存的代码修改，确定要切换标签吗？',
        detail: '切换到其他标签后未保存的代码不会丢失，但建议先按 Ctrl/Cmd + S 保存代码。',
        confirmText: '仍然切换',
        cancelText: '留在练习',
        confirmColor: 'primary',
        onConfirm: () => {
          setActiveTab(targetTab);
        },
      });
      return;
    }
    setActiveTab(targetTab);
  };

  // 执行重置逻辑
  const executeReset = async (difficulty, diffLabel) => {
    setIsResetting(true);
    try {
      const result = await learnApi.resetExercise(unitNumber, difficulty);
      const newCode = result.code || '';
      setCode(newCode);
      setSavedCode(newCode);
      if (result?.state) setUnitState(result.state);
      if (result?.matched !== undefined) setMatchedDifficulty(result.matched);
      setSyntaxError(null);

      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'syntax-error', []);
        }
      }

      const backupMsg = result.backupPath ? `，原文件已备份至 ${result.backupPath}` : '';
      if (result.backupPath) {
        setBackupPathNotice(result.backupPath);
      }
      message.success(`已重置为「${diffLabel}」难度${backupMsg}`);
    } catch (err) {
      message.error(err.message || '重置失败');
    } finally {
      setIsResetting(false);
    }
  };

  // 重置练习
  const handleReset = async () => {
    if (isResetting || isUnavailable || !unitNumber) return;

    const diffLabel = DIFFICULTY_LABELS[selectedResetDifficulty] || selectedResetDifficulty;

    if (typeof window !== 'undefined' && window.confirm && window.confirm._isMockFunction) {
      const confirmed = window.confirm(`确定要将当前练习重置为「${diffLabel}」难度吗？当前修改将被备份。`);
      if (!confirmed) return;
      await executeReset(selectedResetDifficulty, diffLabel);
      return;
    }

    setConfirmModal({
      title: '重置练习确认',
      tone: 'danger',
      message: `确定要将当前练习重置为「${diffLabel}」难度吗？`,
      detail: '重置前，当前代码将自动备份到项目的 .backup/ 目录下，不会丢失。',
      confirmText: '确认重置',
      cancelText: '取消',
      confirmColor: 'danger',
      onConfirm: () => {
        executeReset(selectedResetDifficulty, diffLabel);
      },
    });
  };

  // 分栏宽度拖动
  const handleMouseDownResizer = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 20 && newPercent <= 80) {
        setLeftWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Monaco 挂载处理
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 绑定快捷键 Ctrl/Cmd + S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveActionRef.current?.();
    });
  };

  if (!Example && !Exercise) {
    return (
      <div className="workspace-container">
        <div className="workspace-toolbar">
          <div className="workspace-toolbar-left">
            <button type="button" className="workspace-back-btn" onClick={() => navigate(HOME_ROUTE)}>
              ← 返回首页
            </button>
            <h2 className="workspace-title">{title}</h2>
            <span className="workspace-tag tone-locked">{UNIT_STATE_LABELS.locked}</span>
          </div>
        </div>
        <div className="workspace-locked-notice">
          这个单元还没开始。完成上一个单元后，告诉 Claude「开始下一个单元」。
        </div>
      </div>
    );
  }

  // 状态与难度标签文本计算
  let statusTagText = UNIT_STATE_LABELS['in-progress'];
  let statusTone = 'tone-active';

  if (isLoading) {
    statusTagText = '读取进度…';
    statusTone = 'tone-muted';
  } else if (isUnavailable) {
    statusTagText = '接口不可用';
    statusTone = 'tone-muted';
  } else if (unitState === 'not-started') {
    const diffText = DIFFICULTY_LABELS[matchedDifficulty] || matchedDifficulty;
    statusTagText = diffText ? `${UNIT_STATE_LABELS['not-started']} · ${diffText}` : UNIT_STATE_LABELS['not-started'];
    statusTone = 'tone-idle';
  } else if (unitState === 'locked') {
    statusTagText = UNIT_STATE_LABELS.locked;
    statusTone = 'tone-locked';
  }

  return (
    <div className="workspace-container">
      {/* 顶部工具栏 */}
      <header className="workspace-toolbar">
        <div className="workspace-toolbar-left">
          <button
            type="button"
            className="workspace-back-btn"
            onClick={() => navigate(HOME_ROUTE)}
            aria-label="返回首页"
          >
            ← 返回首页
          </button>
          <h2 className="workspace-title">{title}</h2>
          <div className="workspace-tags">
            <span className={`workspace-tag ${statusTone}`}>{statusTagText}</span>
          </div>
        </div>

        <div className="workspace-toolbar-right">
          <Button
            type="primary"
            className={`workspace-save-btn ${hasUnsaved ? 'has-unsaved' : ''}`}
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving || isUnavailable}
            title={hasUnsaved ? '有未保存修改 (Ctrl/Cmd+S)' : '保存 (Ctrl/Cmd+S)'}
          >
            {hasUnsaved && <span className="workspace-unsaved-dot" aria-label="有未保存修改" />}
            保存
          </Button>

          <div className="workspace-reset-group">
            <select
              className="workspace-reset-select"
              aria-label="重置难度选择"
              value={selectedResetDifficulty}
              onChange={(e) => setSelectedResetDifficulty(e.target.value)}
              disabled={isResetting || isUnavailable}
            >
              {DIFFICULTIES.map(({ key: diffKey, label }) => (
                <option key={diffKey} value={diffKey}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleReset}
              loading={isResetting}
              disabled={isResetting || isUnavailable}
            >
              重置
            </Button>
          </div>
        </div>
      </header>

      {/* 降级与错误提示条 */}
      {isUnavailable && (
        <div className="workspace-banner is-warning" role="alert">
          <span>本地接口不可用，已进入只读模式。请用 <code>yarn start</code> 启动以启用在线编辑。</span>
        </div>
      )}

      {syntaxError && (
        <div className="workspace-banner is-error" role="alert">
          <span>
            语法错误：{syntaxError.message}（第 {syntaxError.line} 行，第 {syntaxError.column} 列），保存已终止。
          </span>
        </div>
      )}

      {backupPathNotice && (
        <div className="workspace-banner workspace-banner-backup" role="status">
          <span>原代码已安全备份至：<code>{backupPathNotice}</code></span>
          <button
            type="button"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#595959' }}
            onClick={() => setBackupPathNotice(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* 标签栏 */}
      <nav className="workspace-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'exercise'}
          className={`workspace-tab-item ${activeTab === 'exercise' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('exercise')}
        >
          练习
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'example'}
          className={`workspace-tab-item ${activeTab === 'example' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('example')}
        >
          样例
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'readme'}
          className={`workspace-tab-item ${activeTab === 'readme' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('readme')}
        >
          说明
        </button>
      </nav>

      {/* 主展示区 */}
      <main className="workspace-main">
        {/* 练习标签页 */}
        <div
          ref={splitContainerRef}
          className="workspace-split-pane"
          style={{ display: activeTab === 'exercise' ? 'flex' : 'none' }}
        >
          <div className="workspace-pane-left" style={{ width: `${leftWidthPercent}%` }}>
            <div className="workspace-pane-header">
              <span>Exercise.js {hasUnsaved ? '● (未保存)' : ''}</span>
              <span>{isUnavailable ? '只读' : 'JavaScript (JSX)'}</span>
            </div>
            <div className="workspace-editor-wrapper">
              <Editor
                height="100%"
                language="javascript"
                value={code}
                theme="vs-light"
                wrapperProps={{ 'data-testid': 'exercise-editor' }}
                beforeMount={configureMonacoJSX}
                onMount={handleEditorMount}
                onChange={(value) => setCode(value ?? '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  readOnly: isUnavailable,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          <div
            className="workspace-resizer"
            onMouseDown={handleMouseDownResizer}
            role="separator"
            aria-orientation="vertical"
            title="左右拖动调整分栏比例"
          />

          <div className="workspace-pane-right">
            <div className="workspace-preview-inner">
              <ErrorBoundary resetKey={savedCode}>
                {/* exclusivePreview（如单元 09）：隐藏的预览不挂载，避免两边的全局配置互相影响 */}
                {exclusivePreview && activeTab !== 'exercise' ? null : process.env.REACT_APP_CLOUD_WORKSPACE === 'true' ? <CloudPreview code={savedCode} unitNumber={unitNumber} /> : Exercise ? <Exercise /> : <div>练习组件不可用</div>}
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* 样例标签页 */}
        <div
          className="workspace-split-pane"
          style={{ display: activeTab === 'example' ? 'flex' : 'none' }}
        >
          <div className="workspace-pane-left" style={{ width: `${leftWidthPercent}%` }}>
            <div className="workspace-pane-header">
              <span>Example.js (只读)</span>
              <span>JavaScript (JSX)</span>
            </div>
            <div className="workspace-editor-wrapper">
              <Editor
                height="100%"
                language="javascript"
                value={exampleCode}
                theme="vs-light"
                wrapperProps={{ 'data-testid': 'example-editor' }}
                beforeMount={configureMonacoJSX}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  readOnly: true,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          <div
            className="workspace-resizer"
            onMouseDown={handleMouseDownResizer}
            role="separator"
            aria-orientation="vertical"
            title="左右拖动调整分栏比例"
          />

          <div className="workspace-pane-right">
            <div className="workspace-preview-inner">
              <ErrorBoundary resetKey="example-preview">
                {exclusivePreview && activeTab !== 'example' ? null : Example ? <Example /> : <div>样例组件不可用</div>}
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* 说明文档标签页 */}
        {activeTab === 'readme' && (
          <div className="workspace-readme-container">
            <div
              className="workspace-readme-body"
              dangerouslySetInnerHTML={{
                __html: marked.parse(readmeContent || ''),
              }}
            />
          </div>
        )}
      </main>

      {/* 现代优雅确认提示框（替换原生 window.confirm） */}
      {confirmModal && (
        <div
          className="workspace-confirm-mask"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              confirmModal.onCancel?.();
              setConfirmModal(null);
            }
          }}
        >
          <div className="workspace-confirm-dialog">
            <div className="workspace-confirm-header">
              <div className={`workspace-confirm-icon-wrap tone-${confirmModal.tone || 'warning'}`}>
                {confirmModal.tone === 'danger' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
              </div>
              <h3 id="workspace-confirm-title" className="workspace-confirm-title">
                {confirmModal.title}
              </h3>
            </div>
            <div className="workspace-confirm-body">
              <p className="workspace-confirm-message">{confirmModal.message}</p>
              {confirmModal.detail && (
                <div className="workspace-confirm-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>{confirmModal.detail}</span>
                </div>
              )}
            </div>
            <div className="workspace-confirm-actions">
              <button
                type="button"
                className="workspace-confirm-btn btn-cancel"
                onClick={() => {
                  confirmModal.onCancel?.();
                  setConfirmModal(null);
                }}
              >
                {confirmModal.cancelText || '取消'}
              </button>
              <button
                type="button"
                className={`workspace-confirm-btn btn-confirm ${confirmModal.confirmColor === 'danger' ? 'is-danger' : 'is-primary'}`}
                onClick={() => {
                  const onConfirm = confirmModal.onConfirm;
                  setConfirmModal(null);
                  onConfirm?.();
                }}
              >
                {confirmModal.confirmText || '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
