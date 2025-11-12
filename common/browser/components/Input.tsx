/**
 * Input Component
 * 공통 입력 컴포넌트
 */

import React from 'react';

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'tel' | 'number';
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  disabled = false,
  minLength,
  maxLength,
  className = '',
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        className={`input ${error ? 'input-error' : ''}`}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

