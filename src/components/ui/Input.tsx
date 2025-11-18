import React from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'number';
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  startIcon?: React.ReactNode;
  unstyled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  startIcon,
  unstyled = false
}) => {
  return (
    <div className={unstyled ? '' : 'space-y-2'}>
      {!unstyled && label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full ${startIcon ? 'pl-10' : 'px-4'} py-2 border bg-white text-gray-900 
            placeholder:text-gray-500 focus:outline-none focus:ring-2 
            focus:ring-[#7D2AE8] focus:border-transparent transition-colors
            ${error ? 'border-red-500' : 'border-[#E2E8F0]'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
            ${unstyled ? 'rounded-none shadow-none' : 'rounded-lg'}
            ${className}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};