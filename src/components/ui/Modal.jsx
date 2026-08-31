import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium', // small, medium, large, xl
  className = '',
  contentClassName = '',
    closeOnOverlayClick = true

}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

 const handleBackdropClick = (e) => {
  if (
    closeOnOverlayClick &&
    e.target === e.currentTarget
  ) {
    if (typeof onClose === 'function') {
      const result = onClose();
      if (result === false) {
        return;
      }
    }
  }
};
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className={`
        bg-white rounded-[10px] shadow-2xl w-full ${sizeClasses[size]} 
        max-h-[90vh] overflow-hidden flex flex-col
        transform transition-all
        ${className}
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 gap-4">
            {typeof title === 'string' ? (
              <h2 className="flex-1 min-w-0 text-lg font-semibold text-black">{title}</h2>
            ) : (
              <div className="flex-1 min-w-0">{title}</div>
            )}
            {/* <button
              onClick={onClose}
              className="flex h-[34px] w-[34px] items-center justify-center bg-transparent text-[#2D2C2F] hover:bg-gray-100 transition-colors"
            > */}
            <button
              onClick={onClose}
              title="Close"
              aria-label="Close"
              className="
    flex
    h-[34px]
    w-[34px]
    items-center
    justify-center
    bg-transparent
    text-[#2D2C2F]
    hover:bg-gray-100
    transition-colors
    rounded-full
    
  "
            >
              <svg className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 overflow-y-auto px-6 py-4 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-300 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default Modal;
