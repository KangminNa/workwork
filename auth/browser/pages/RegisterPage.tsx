/**
 * RegisterPage
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import type { RegisterRequestDto } from '../../shared/types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const handleRegister = async (data: RegisterRequestDto) => {
    const result = await register(data);
    
    if (result.success) {
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
        
        <div className="auth-links">
          <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
        </div>
      </div>
    </div>
  );
};

