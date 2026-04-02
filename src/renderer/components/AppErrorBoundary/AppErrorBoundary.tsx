import React from 'react';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string | null;
};

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Renderer ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100vw',
            height: '100vh',
            padding: '32px',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <h1 style={{ fontSize: '20px', margin: 0 }}>PretextChat 遇到了一个界面错误</h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            应用窗口已经打开，但 renderer 在初始化时发生了异常，所以没有正常渲染内容。
          </p>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            请重新启动应用；如果问题持续出现，请把控制台或日志中的错误信息反馈给开发者。
          </p>
          {this.state.message ? (
            <pre
              style={{
                margin: 0,
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {this.state.message}
            </pre>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
