import React from 'react';

interface BaseCardProps {
  title: string;
  children: React.ReactNode;
}

export const BaseCard: React.FC<BaseCardProps> = ({ title, children }) => {
  return (
    <div style={{ border: '1px solid gray', padding: '16px', borderRadius: '8px' }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};
