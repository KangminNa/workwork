import { useEffect, useState } from 'react';

type HelloResponse = {
  message: string;
};

const App = () => {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data: HelloResponse) => setMessage(data.message))
      .catch(() => setMessage('API 호출에 실패했어요. 서버를 켰는지 확인해주세요.'));
  }, []);

  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\'',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: 'white',
      }}
    >
      <h1>React + NestJS Hello World</h1>
      <p>{message}</p>
      <p style={{ fontSize: 14, opacity: 0.75 }}>
        Nest 서버는 3000번 포트, React 클라이언트는 5173번 포트로 실행돼요.
      </p>
    </main>
  );
};

export default App;
