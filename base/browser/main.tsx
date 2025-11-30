import React from 'react';
import { createRoot } from 'react-dom/client';
import { BasePage } from './pages/BasePage';

function App() {
  return (
    <BasePage title="Base Module" description="모듈 엔트리 포인트">
      <div
        style={{
          display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
        <Card title="Auth Module" description="Hello World 화면 + API">
          <a href="/auth" style={{ color: '#2563eb', fontWeight: 600 }}>
            /auth (Auth UI)
          </a>
          <div style={{ marginTop: '0.35rem' }}>
            <a href="http://localhost:3001/api/health">Auth 서버 health</a>
          </div>
        </Card>
      </div>
    </BasePage>
  );
}

type CardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

function Card({ title, description, children }: CardProps) {
  return (
    <div
      style={{
        padding: '1.25rem',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 24px rgba(17, 24, 39, 0.08)',
        border: '1px solid #e5e7eb',
      }}
    >
      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ margin: '0 0 0.75rem', color: '#4b5563' }}>{description}</p>
      {children}
    </div>
  );
}

const rootEl = document.getElementById('root');

if (rootEl) {
  createRoot(rootEl).render(<App />);
} else {
  console.error('Missing #root element');
}
