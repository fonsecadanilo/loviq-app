import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-[#7D2AE8] text-white hover:bg-[#8D3AEC] focus-visible:ring-[#7D2AE8]',
    secondary: 'bg-[#F1F5F9] text-gray-900 hover:bg-[#E2E8F0] focus-visible:ring-gray-500',
    outline: 'border border-[#E2E8F0] bg-white text-gray-900 hover:bg-[#F8FAFC] focus-visible:ring-gray-500',
    ghost: 'text-gray-900 hover:bg-[#F8FAFC] focus-visible:ring-gray-500',
    glow: 'bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] text-white shadow-[0_0_0_0_rgba(125,42,232,0.0)] hover:shadow-[0_0_18px_0_rgba(125,42,232,0.35)] focus-visible:ring-[#7D2AE8]'
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};