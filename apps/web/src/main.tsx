import React from 'react';
import ReactDOM from 'react-dom/client';
import { CalendarCell } from '@workwork/core-ui';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <main>
      <h1>workwork</h1>
      <CalendarCell date={new Date().toISOString()} active>
        오늘
      </CalendarCell>
    </main>
  </React.StrictMode>,
);
