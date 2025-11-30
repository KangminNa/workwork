import { useState, useEffect } from 'react';

export const useBaseHook = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Base hook initialized');
  }, []);

  const increment = () => setCount((prev) => prev + 1);

  return { count, increment };
};
