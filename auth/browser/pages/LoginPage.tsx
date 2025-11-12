/**
 * LoginPage
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import type { LoginRequestDto } from '../../shared/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleLogin = async (data: LoginRequestDto) => {
    const result = await login(data);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        
        <div className="auth-links">
          <Link to="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

