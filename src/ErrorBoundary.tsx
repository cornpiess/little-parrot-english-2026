import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h2>应用出错了</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => { localStorage.clear(); location.href = '/'; }} style={{ marginTop: 16, padding: '8px 16px' }}>
            清除数据并重新开始
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
