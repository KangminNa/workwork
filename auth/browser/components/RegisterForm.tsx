/**
 * RegisterForm Component
 */

import React, { useState } from 'react';
import type { RegisterRequestDto } from '../../shared/types';

interface RegisterFormProps {
  onSubmit: (data: RegisterRequestDto) => void;
  loading?: boolean;
  error?: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<RegisterRequestDto>({
    username: '',
    password: '',
    email: '',
    phone: '',
  });

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 클라이언트 유효성 검증
    if (formData.password !== passwordConfirm) {
      setValidationError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (formData.username.length < 3) {
      setValidationError('아이디는 최소 3자 이상이어야 합니다.');
      return;
    }

    if (!formData.email.includes('@')) {
      setValidationError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>회원가입</h2>

      {(error || validationError) && (
        <div className="error-message">{error || validationError}</div>
      )}

      <div className="form-group">
        <label htmlFor="username">아이디</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          minLength={3}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">전화번호</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          minLength={10}
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
};

