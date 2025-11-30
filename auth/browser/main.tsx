import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthApp } from './pages/AuthApp';

function App() {
  return <AuthApp />;
}

const rootEl = document.getElementById('root');

if (rootEl) {
  createRoot(rootEl).render(<App />);
} else {
  console.error('Missing #root element');
}
