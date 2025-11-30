import React from 'react';
import { BaseCard } from '../components/BaseCard';
import { useBaseHook } from '../hooks/useBaseHook';

export const BasePage: React.FC = () => {
  const { count, increment } = useBaseHook();

  return (
    <div>
      <h1>Base Page</h1>
      <BaseCard title="Counter">
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
      </BaseCard>
    </div>
  );
};
