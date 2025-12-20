import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>WorkWork</h1>
        <p>React + TypeScript + NestJS 모노레포 프로젝트</p>
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
        
        <p className="info">
          개발 환경이 성공적으로 구축되었습니다!
        </p>
      </header>
    </div>
  )
}

export default App

