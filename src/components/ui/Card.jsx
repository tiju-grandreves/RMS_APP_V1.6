import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = true,
  shadow = true,
  ...props 
}) => {
  const baseClasses = `bg-white rounded-lg border border-gray-300 overflow-hidden ${
    shadow ? 'shadow-md' : ''
  } ${padding ? 'p-5' : ''}`;

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className = '',
  border = true,
  ...props 
}) => {
  return (
    <div 
      className={`px-5 py-4 ${border ? 'border-b border-gray-300' : ''} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  className = '',
  border = true,
  ...props 
}) => {
  return (
    <div 
      className={`px-5 py-4 ${border ? 'border-t border-gray-300' : ''} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
