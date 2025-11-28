import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    // PRIMÁRIO: Agora é Escuro (Slate 900) para contraste máximo e seriedade
    primary: 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm focus-visible:ring-[#0F172A]',
    
    // SECUNDÁRIO: Fundo Lilás suave com texto roxo
    secondary: 'bg-[#F5F3FF] text-[#7D2AE8] hover:bg-[#EDE9FE] focus-visible:ring-[#7D2AE8]',
    
    // OUTLINE: Clean
    outline: 'border border-[#E2E8F0] bg-white text-gray-900 hover:bg-[#F8FAFC] focus-visible:ring-gray-500',
    
    ghost: 'text-gray-900 hover:bg-[#F8FAFC] focus-visible:ring-gray-500'
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
