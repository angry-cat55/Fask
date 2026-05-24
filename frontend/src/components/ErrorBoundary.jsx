import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // 로깅을 원한다면 여기서 전송
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center bg-white text-slate-900">
          <div className="max-w-2xl rounded-md border p-6">
            <h2 className="text-xl font-bold mb-2">앱 오류가 발생했습니다.</h2>
            <pre className="whitespace-pre-wrap text-sm text-red-600">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
