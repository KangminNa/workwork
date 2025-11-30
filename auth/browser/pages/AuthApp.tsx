import React from 'react';
import { BasePage } from '@base/browser/pages/BasePage';

export function AuthApp() {
  return (
    <BasePage title="Auth Service" description="Hello world from auth/browser">
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '1.5rem',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(17, 24, 39, 0.08)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>👋 Welcome</h2>
        <p style={{ marginBottom: '0.5rem' }}>
          This is a simple hello world screen for the auth module.
        </p>
        <p style={{ color: '#6b7280' }}>
          Extend this component with login/signup flows, auth provider wiring, and shared UI pieces
          from <code>base/browser</code>.
        </p>
      </div>
    </BasePage>
  );
}
