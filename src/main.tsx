import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LandscapeGuard } from './components/LandscapeGuard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandscapeGuard>
      <App />
    </LandscapeGuard>
  </React.StrictMode>
);
