import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  typography = 'default',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'inline-flex justify-center items-center gap-3 rounded-[4px]  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const typographyStyles = {
    default: 'font-inter text-sm leading-tight tracking-tight',
    openSans: 'font-open-sans text-[16px] leading-[24px] font-normal tracking-[0.0015em]',
  };
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-md active:scale-95',
    secondary: 'bg-white text-primary border border-border hover:border-accent hover:text-accent hover:shadow-sm',
    outline: 'bg-transparent text-text border border-border hover:border-accent hover:bg-bg-light'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-5 py-2.5 text-sm',
    large: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${typographyStyles[typography]} ${className}`}      {...props}
    >
      {children}
    </button>
  );
};

export default Button;