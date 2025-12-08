// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { helloFromTest } from '@workwork/test';

export function App() {
  return (
    <div>
      <h1>Hello from React App!</h1>
      <p>Message from shared library:</p>
      <pre
        style={{
          background: '#eee',
          padding: '1rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      >
        {helloFromTest()}
      </pre>
    </div>
  );
}

export default App;
