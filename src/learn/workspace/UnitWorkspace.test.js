import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import UnitWorkspace, { MONACO_BASE_URL, monacoWorkerUrl, syntaxErrorText } from './UnitWorkspace';
import { learnApi, LearnApiError } from '../api';
import { HOME_ROUTE, navigate } from '../router';
import { loader } from '@monaco-editor/react';

// loader.config 在模块加载时调用一次；在任何 mock 清理之前先记下调用参数
const loaderConfigCalls = loader.config.mock.calls.slice();

jest.mock('@monaco-editor/react', () => {
  const React = require('react');

  const mockSetModelMarkers = jest.fn();
  const mockAddCommand = jest.fn();
  const mockRegisteredCommands = {};

  const mockModel = {
    getLineContent: () => 'const a = 1;',
  };

  const mockEditor = {
    getModel: () => mockModel,
    addCommand: (keybinding, handler) => {
      mockAddCommand(keybinding, handler);
      mockRegisteredCommands[keybinding] = handler;
    },
  };

  const mockMonaco = {
    KeyMod: { CtrlCmd: 2048 },
    KeyCode: { KeyS: 49 },
    MarkerSeverity: { Error: 8 },
    editor: {
      setModelMarkers: mockSetModelMarkers,
    },
    languages: {
      typescript: {
        javascriptDefaults: {
          setCompilerOptions: jest.fn(),
          setDiagnosticsOptions: jest.fn(),
        },
      },
    },
  };

  const Editor = ({ value, onChange, onMount, beforeMount, options, wrapperProps }) => {
    React.useEffect(() => {
      if (beforeMount) beforeMount(mockMonaco);
      if (onMount) onMount(mockEditor, mockMonaco);
    }, [beforeMount, onMount]);

    const testId = wrapperProps?.['data-testid'] || (options?.readOnly ? 'example-editor' : 'exercise-editor');

    return (
      <textarea
        data-testid={testId}
        value={value}
        readOnly={options?.readOnly}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    );
  };

  return {
    __esModule: true,
    default: Editor,
    loader: {
      config: jest.fn(),
    },
    _mockEditor: mockEditor,
    _mockMonaco: mockMonaco,
    _mockSetModelMarkers: mockSetModelMarkers,
    _mockAddCommand: mockAddCommand,
    _mockRegisteredCommands: mockRegisteredCommands,
  };
});

const {
  _mockSetModelMarkers: mockSetModelMarkers,
  _mockAddCommand: mockAddCommand,
  _mockRegisteredCommands: mockRegisteredCommands,
  _mockMonaco: mockMonaco,
  _mockEditor: mockEditor,
} = require('@monaco-editor/react');

// 模拟 learnApi
jest.mock('../api', () => {
  class LearnApiError extends Error {
    constructor({ status = 0, code = 'UNAVAILABLE', message = '本地学习接口不可用', line, column } = {}) {
      super(message);
      this.name = 'LearnApiError';
      this.status = status;
      this.code = code;
      this.line = line;
      this.column = column;
    }
  }

  return {
    __esModule: true,
    LearnApiError,
    learnApi: {
      getExercise: jest.fn(),
      saveExercise: jest.fn(),
      resetExercise: jest.fn(),
      getExample: jest.fn(),
      getReadme: jest.fn(),
    },
    unitNumberFromKey: (key) => {
      const match = /^unit-(\d{2})$/.exec(key || '');
      if (!match) throw new Error(`无效的单元 key：${key}`);
      return match[1];
    },
  };
});

describe('UnitWorkspace', () => {
  const dummyUnit = {
    key: 'unit-01',
    title: '01 DataSet 基础与 Table 绑定',
    doc: 'src/units/01-dataset-basics/README.md',
    points: ['point 1', 'point 2'],
    Example: () => <div data-testid="unit-example-preview">样例内容</div>,
    Exercise: () => <div data-testid="unit-exercise-preview">练习内容</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockRegisteredCommands).forEach((k) => delete mockRegisteredCommands[k]);
    window.location.hash = '#/unit-01';

    // 默认 mock 响应
    learnApi.getExercise.mockResolvedValue({
      code: 'const initialCode = true;',
      state: 'not-started',
      matched: 'normal',
    });
    learnApi.saveExercise.mockResolvedValue({
      saved: true,
      state: 'in-progress',
      matched: null,
    });
    learnApi.resetExercise.mockResolvedValue({
      code: 'const resetCode = true;',
      state: 'not-started',
      matched: 'hard',
      backupPath: '.backup/01/Exercise.bak.js',
    });
    learnApi.getExample.mockResolvedValue({
      code: 'const exampleCode = true;',
    });
    learnApi.getReadme.mockResolvedValue({
      markdown: '# 01 说明文档\n\n欢迎学习！',
    });
  });

  test('正确配置 Monaco 静态路径不走 CDN', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);
    // 必须是带 origin 的绝对地址：Web Worker 无法解析以 / 开头的相对路径
    expect(loaderConfigCalls).toEqual([[{ paths: { vs: 'http://localhost/__learn/monaco/vs' } }]]);
    await waitFor(() => {
      expect(learnApi.getExercise).toHaveBeenCalledWith('01');
    });
  });

  test('初始加载与渲染：显示代码、标题、状态标签和预览', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('01 DataSet 基础与 Table 绑定');

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    expect(screen.getByText('未开始 · 标准')).toBeInTheDocument();
    expect(screen.getByTestId('unit-exercise-preview')).toHaveTextContent('练习内容');
    expect(screen.queryByLabelText('有未保存修改')).not.toBeInTheDocument();
  });

  test('修改代码后出现未保存标记', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'const updatedCode = 123;' },
    });

    expect(screen.getByLabelText('有未保存修改')).toBeInTheDocument();
    expect(screen.getByText(/● \(未保存\)/)).toBeInTheDocument();
  });

  test('点击保存按钮成功保存：调用 saveExercise 并清除未保存状态与 markers', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'const updatedCode = 123;' },
    });

    const saveBtn = screen.getByRole('button', { name: /保存/ });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(learnApi.saveExercise).toHaveBeenCalledWith('01', 'const updatedCode = 123;');
    await waitFor(() => {
      expect(screen.queryByLabelText('有未保存修改')).not.toBeInTheDocument();
    });
    expect(screen.getByText('进行中')).toBeInTheDocument();
    expect(mockSetModelMarkers).toHaveBeenCalledWith(expect.anything(), 'syntax-error', []);
  });

  test('Ctrl/Cmd+S 快捷键调用保存', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'const updated = 999;' },
    });

    // 触发全局 keydown 事件
    await act(async () => {
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    });

    expect(learnApi.saveExercise).toHaveBeenCalledWith('01', 'const updated = 999;');

    // 验证 Monaco 内绑定的命令也可以触发
    const cmdKey = 2048 | 49;
    expect(mockRegisteredCommands[cmdKey]).toBeDefined();
    await act(async () => {
      mockRegisteredCommands[cmdKey]();
    });
    expect(learnApi.saveExercise).toHaveBeenCalledTimes(2);
  });

  test('422 语法错误处理：调用 setModelMarkers 标红并保留预览', async () => {
    learnApi.saveExercise.mockRejectedValueOnce(
      new LearnApiError({
        status: 422,
        code: 'SYNTAX_ERROR',
        message: 'Unexpected token',
        line: 3,
        column: 8,
      })
    );

    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'const buggy = ;' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /保存/ }));
    });

    expect(mockSetModelMarkers).toHaveBeenCalledWith(
      expect.anything(),
      'syntax-error',
      [
        expect.objectContaining({
          startLineNumber: 3,
          startColumn: 8,
          message: 'Unexpected token',
          severity: 8,
        }),
      ]
    );

    // 显示语法错误横幅
    expect(screen.getByText(/语法错误：Unexpected token（第 3 行，第 8 列）/)).toBeInTheDocument();
    // 预览保持不崩溃
    expect(screen.getByTestId('unit-exercise-preview')).toBeInTheDocument();
  });

  test('默认同时挂载两个预览；exclusivePreview 只挂载当前标签的预览', async () => {
    const { unmount } = render(<UnitWorkspace unit={dummyUnit} />);
    await waitFor(() => expect(learnApi.getExercise).toHaveBeenCalled());
    expect(screen.getByTestId('unit-exercise-preview')).toBeInTheDocument();
    expect(screen.getByTestId('unit-example-preview')).toBeInTheDocument();
    unmount();

    render(<UnitWorkspace unit={{ ...dummyUnit, exclusivePreview: true }} />);
    await waitFor(() => expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;'));
    expect(screen.getByTestId('unit-exercise-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-example-preview')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '样例' }));
    });
    expect(screen.getByTestId('unit-example-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-exercise-preview')).not.toBeInTheDocument();
  });

  test('422 使用接口的真实文案时不重复前缀，也不显示 0 起始的列号', async () => {
    const { _mockSetModelMarkers } = require('@monaco-editor/react');
    learnApi.saveExercise.mockRejectedValueOnce(
      new LearnApiError({
        status: 422,
        code: 'SYNTAX_ERROR',
        message: '代码语法错误：Unexpected token (4:6)',
        line: 4,
        column: 7,
      })
    );

    render(<UnitWorkspace unit={dummyUnit} />);
    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });
    fireEvent.change(screen.getByTestId('exercise-editor'), { target: { value: 'const = ;' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /保存/ }));
    });

    const banner = screen.getByText(/保存已终止/);
    expect(banner).toHaveTextContent('语法错误：Unexpected token（第 4 行，第 7 列），保存已终止。');
    expect(banner).not.toHaveTextContent('代码语法错误');
    expect(banner).not.toHaveTextContent('(4:6)');
    const markers = _mockSetModelMarkers.mock.calls[_mockSetModelMarkers.mock.calls.length - 1][2];
    expect(markers[0]).toEqual(expect.objectContaining({ startLineNumber: 4, startColumn: 7, message: 'Unexpected token' }));
  });

  test('未保存时通过 navigate 离开会被路由守卫拦截', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm');

    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'code changed;' },
    });

    // 用户选择取消
    confirmSpy.mockReturnValueOnce(false);
    const navResultCanceled = navigate(HOME_ROUTE);
    expect(confirmSpy).toHaveBeenCalled();
    expect(navResultCanceled).toBe(false);

    // 用户选择确认
    confirmSpy.mockReturnValueOnce(true);
    const navResultConfirmed = navigate(HOME_ROUTE);
    expect(navResultConfirmed).toBe(true);

    confirmSpy.mockRestore();
  });

  test('未保存时切换内部标签会被确认框拦截', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm');

    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'code changed;' },
    });

    const exampleTab = screen.getByRole('tab', { name: '样例' });

    // 用户取消切换
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(exampleTab);
    expect(exampleTab).not.toHaveClass('is-active');

    // 用户确认切换
    confirmSpy.mockReturnValueOnce(true);
    await act(async () => {
      fireEvent.click(exampleTab);
    });
    expect(exampleTab).toHaveClass('is-active');

    confirmSpy.mockRestore();
  });

  test('重置流程：选择难度并确认，调用 resetExercise 并提示备份路径', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    const select = screen.getByLabelText('重置难度选择');
    fireEvent.change(select, { target: { value: 'hard' } });

    const resetBtn = screen.getByRole('button', { name: '重置' });
    await act(async () => {
      fireEvent.click(resetBtn);
    });

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('挑战'));
    expect(learnApi.resetExercise).toHaveBeenCalledWith('01', 'hard');

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const resetCode = true;');
    });

    expect(screen.getByText('未开始 · 挑战')).toBeInTheDocument();
    expect(screen.getByText(/原代码已安全备份至：/)).toBeInTheDocument();
    expect(screen.getByText('.backup/01/Exercise.bak.js')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('现代确认弹窗：未保存时切换标签弹出自定义交互模态框并支持取消与确认', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    fireEvent.change(screen.getByTestId('exercise-editor'), {
      target: { value: 'code changed;' },
    });

    const exampleTab = screen.getByRole('tab', { name: '样例' });
    fireEvent.click(exampleTab);

    // 弹出自定义交互对话框
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('未保存代码提醒')).toBeInTheDocument();
    expect(within(dialog).getByText(/当前练习有未保存的代码修改/)).toBeInTheDocument();

    // 点击留在练习（取消）
    fireEvent.click(within(dialog).getByRole('button', { name: '留在练习' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(exampleTab).not.toHaveClass('is-active');

    // 再次点击切换标签并确认
    fireEvent.click(exampleTab);
    const dialogAgain = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.click(within(dialogAgain).getByRole('button', { name: '仍然切换' }));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(exampleTab).toHaveClass('is-active');
  });

  test('降级表现：接口不可用时显示只读提示，预览照常可用', async () => {
    learnApi.getExercise.mockRejectedValueOnce(
      new LearnApiError({
        status: 0,
        code: 'UNAVAILABLE',
        message: '本地学习接口不可用',
      })
    );

    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/本地接口不可用，已进入只读模式。请用 yarn start 启动以启用在线编辑。/);
    });

    expect(screen.getByText('接口不可用')).toBeInTheDocument();
    expect(screen.getByTestId('exercise-editor')).toHaveAttribute('readonly');
    expect(screen.getByTestId('exercise-editor')).toHaveValue('// 请用 yarn start 启动以启用在线编辑\n');
    expect(screen.getByTestId('unit-exercise-preview')).toHaveTextContent('练习内容');
    expect(screen.getByRole('button', { name: /保存/ })).toBeDisabled();
  });

  test('切换至「样例」标签展示 Example 代码与预览', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    const exampleTab = screen.getByRole('tab', { name: '样例' });
    await act(async () => {
      fireEvent.click(exampleTab);
    });

    expect(learnApi.getExample).toHaveBeenCalledWith('01');
    expect(screen.getByTestId('unit-example-preview')).toHaveTextContent('样例内容');
  });

  test('切换至「说明」标签用 marked 渲染 README 内容', async () => {
    render(<UnitWorkspace unit={dummyUnit} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-editor')).toHaveValue('const initialCode = true;');
    });

    const readmeTab = screen.getByRole('tab', { name: '说明' });
    await act(async () => {
      fireEvent.click(readmeTab);
    });

    expect(learnApi.getReadme).toHaveBeenCalledWith('01');
    await waitFor(() => {
      expect(screen.getByText('01 说明文档')).toBeInTheDocument();
      expect(screen.getByText('欢迎学习！')).toBeInTheDocument();
    });
  });

  test('未开放单元展示锁住提示，不崩溃', async () => {
    const lockedUnit = {
      key: 'unit-09',
      title: '09 全局配置与国际化',
      points: ['point 1'],
    };

    render(<UnitWorkspace unit={lockedUnit} />);

    expect(screen.getByText('09 全局配置与国际化')).toBeInTheDocument();
    expect(screen.getByText('未开放')).toBeInTheDocument();
    expect(screen.getByText('这个单元还没开始。完成上一个单元后，告诉 Claude「开始下一个单元」。')).toBeInTheDocument();

    await waitFor(() => {
      expect(learnApi.getExercise).toHaveBeenCalledWith('09');
    });
  });
});

describe('Monaco worker 与语法错误文案', () => {
  test('worker 用绝对地址启动，不依赖相对路径', () => {
    expect(MONACO_BASE_URL).toBe('http://localhost/__learn/monaco');
    expect(window.MonacoEnvironment.getWorkerUrl).toBe(monacoWorkerUrl);
    const url = monacoWorkerUrl();
    expect(url.startsWith('data:text/javascript;charset=utf-8,')).toBe(true);
    const bootstrap = decodeURIComponent(url.slice(url.indexOf(',') + 1));
    expect(bootstrap).toContain("baseUrl: 'http://localhost/__learn/monaco/'");
    expect(bootstrap).toContain("importScripts('http://localhost/__learn/monaco/vs/base/worker/workerMain.js')");
    expect(bootstrap).not.toMatch(/'\/__learn/);
  });

  test.each([
    ['代码语法错误：Unexpected token (4:6)', 'Unexpected token'],
    ['语法错误：Unterminated string constant (12:30)', 'Unterminated string constant'],
    ['Unexpected token', 'Unexpected token'],
    ['', '代码中存在语法错误'],
    [undefined, '代码中存在语法错误'],
  ])('syntaxErrorText(%p) → %p', (raw, expected) => {
    expect(syntaxErrorText(raw)).toBe(expected);
  });
});
