import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignupPage } from '@domain-user/browser';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
