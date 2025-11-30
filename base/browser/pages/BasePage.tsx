import React from 'react';
import { BaseAppShell } from '../layout/BaseAppShell';

export type BasePageProps = {
  title?: string;
  description?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Base page wrapper used by downstream modules to render page content within
 * the shared shell and provider stack.
 */
export function BasePage({
  title = 'Base Page',
  description,
  headerSlot,
  footerSlot,
  children,
}: BasePageProps) {
  return (
    <BaseAppShell
      title={title}
      description={description}
      headerSlot={headerSlot}
      footerSlot={footerSlot}
    >
      {children}
    </BaseAppShell>
  );
}
