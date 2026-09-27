import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function BuggyComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test preview runtime error');
  }
  return <div data-testid="preview-content">预览内容正常显示</div>;
}

describe('ErrorBoundary', () => {
  // 屏蔽 React 默认在控制台打印的错误堆栈输出
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  test('子组件无错误时正常渲染', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('preview-content')).toHaveTextContent('预览内容正常显示');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('运行时报错时捕获并在预览区显示错误和堆栈，不白屏', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('预览运行时错误')).toBeInTheDocument();
    expect(screen.getByText('Test preview runtime error')).toBeInTheDocument();
    expect(screen.queryByTestId('preview-content')).not.toBeInTheDocument();
  });

  test('resetKey 改变时自动恢复', () => {
    function Container() {
      const [shouldThrow, setShouldThrow] = useState(true);
      const [resetKey, setResetKey] = useState('v1');

      return (
        <div>
          <button
            onClick={() => {
              setShouldThrow(false);
              setResetKey('v2');
            }}
          >
            修复代码并热更新
          </button>
          <ErrorBoundary resetKey={resetKey}>
            <BuggyComponent shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </div>
      );
    }

    render(<Container />);
    expect(screen.getByText('预览运行时错误')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '修复代码并热更新' }));
    expect(screen.getByTestId('preview-content')).toHaveTextContent('预览内容正常显示');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('点击重试按钮可手动触发恢复', () => {
    let throwError = true;
    function DynamicBuggy() {
      if (throwError) {
        throw new Error('Dynamic error');
      }
      return <div data-testid="preview-content">恢复成功</div>;
    }

    render(
      <ErrorBoundary>
        <DynamicBuggy />
      </ErrorBoundary>
    );

    expect(screen.getByText('Dynamic error')).toBeInTheDocument();

    throwError = false;
    fireEvent.click(screen.getByRole('button', { name: '重试预览' }));

    expect(screen.getByTestId('preview-content')).toHaveTextContent('恢复成功');
  });
});
