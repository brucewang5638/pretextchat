import { createRoot } from 'react-dom/client';
import { App } from './App';
import './assets/index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
