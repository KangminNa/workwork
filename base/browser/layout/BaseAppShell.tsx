import React from 'react';
import { BaseProviders } from '../providers/BaseProviders';

export type BaseAppShellProps = {
  title?: string;
  description?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Minimal page chrome intended to be reused across modules.
 */
export function BaseAppShell({
  title = 'Base App',
  description,
  headerSlot,
  footerSlot,
  children,
}: BaseAppShellProps) {
  return (
    <BaseProviders>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#f7f8fb',
          color: '#111827',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
          {headerSlot ?? (
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h1>
              {description ? (
                <p style={{ margin: '0.35rem 0 0', color: '#4b5563' }}>{description}</p>
              ) : null}
            </div>
          )}
        </header>

        <main style={{ flex: 1, padding: '2rem' }}>{children}</main>

        <footer style={{ padding: '1.25rem 2rem', borderTop: '1px solid #e5e7eb' }}>
          {footerSlot ?? <small style={{ color: '#6b7280' }}>Powered by base/browser</small>}
        </footer>
      </div>
    </BaseProviders>
  );
}
