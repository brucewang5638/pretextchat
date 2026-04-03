// ============================================================
// main.tsx — renderer 挂载入口
// ============================================================
// 这里只做 React 根节点挂载，不放业务逻辑。
// 这样调试 renderer 启动问题时，入口文件的职责最单纯。

import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary/AppErrorBoundary';
import './assets/index.css';

const root = document.getElementById('root');
if (root) {
  // ErrorBoundary 放在最外层，能把渲染期异常兜住，
  // 避免 renderer 一崩就只剩白屏，至少还能给出错误说明。
  createRoot(root).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>,
  );
}
