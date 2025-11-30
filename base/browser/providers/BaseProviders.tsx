import React from 'react';

export type BaseProvidersProps = {
  children: React.ReactNode;
};

/**
 * Placeholder for common providers (query client, theme, i18n, etc.) that downstream apps can extend.
 */
export function BaseProviders({ children }: BaseProvidersProps) {
  return <>{children}</>;
}
