import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary/AppErrorBoundary';
import './assets/index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>,
  );
}
