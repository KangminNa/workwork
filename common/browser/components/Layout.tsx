/**
 * Layout Component
 * 공통 레이아웃
 */

import React from 'react';

export interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  header,
  footer,
  className = '',
}) => {
  return (
    <div className={`layout ${className}`}>
      {header && <header className="layout-header">{header}</header>}
      <main className="layout-main">{children}</main>
      {footer && <footer className="layout-footer">{footer}</footer>}
    </div>
  );
};

