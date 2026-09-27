import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError) {
      // 当 resetKey 发生变化（如保存代码、热更新、或重置组件）或者 children 引用改变时，重置错误状态
      if (
        prevProps.resetKey !== this.props.resetKey ||
        prevProps.children !== this.props.children
      ) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error
        ? this.state.error.message || String(this.state.error)
        : '未知运行时错误';
      const stack = this.state.errorInfo?.componentStack || this.state.error?.stack;

      return (
        <div className="workspace-preview-error" role="alert">
          <div className="workspace-preview-error-header">
            <span className="workspace-preview-error-title">预览运行时错误</span>
            <button
              type="button"
              className="workspace-preview-error-retry"
              onClick={this.reset}
            >
              重试预览
            </button>
          </div>
          <div className="workspace-preview-error-body">
            <div className="workspace-preview-error-msg">{errorMessage}</div>
            {stack && (
              <pre className="workspace-preview-error-stack">{stack}</pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
