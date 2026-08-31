import React from 'react';

const Input = React.forwardRef(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  className = '',
  inputClassName = '',
  required = false,
  multiline = false,
  rows = 4,
  children,
  bgVariant = "default",
  error = null,
  ...props
}, ref) => {
  const isPasswordInput = !multiline && type === 'password';
  const baseInputClasses = `
  w-full 
  ${bgVariant === "filled" ? "bg-[#E8ECF0]" : "bg-white"}
  border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-base text-gray-900 
  placeholder:text-neutral-400 
  focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-600 
  transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${inputClassName}
`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-black" style={{
          fontFamily: 'DM Sans',
          fontWeight: 600,
          fontSize: '14px',
        }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {multiline ? (
          <textarea
            ref={ref}
            className={baseInputClasses}
            placeholder={!children ? placeholder : ""}
            value={value}
            onChange={onChange}
            rows={rows}
            required={required}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            className={`${baseInputClasses} ${isPasswordInput ? 'hide-password-reveal' : ''}`}
            placeholder={!children ? placeholder : ""}
            value={value}
            onChange={onChange}
            required={required}
            {...props}
          />
        )}

        {!value && children && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {children}
          </div>
        )}
      </div>
      {isPasswordInput && (
        <style>{`
          .hide-password-reveal::-ms-reveal,
          .hide-password-reveal::-ms-clear,
          .hide-password-reveal::-webkit-credentials-auto-fill-button,
          .hide-password-reveal::-webkit-textfield-decoration-container,
          .hide-password-reveal::-webkit-password-toggle-button,
          .hide-password-reveal::-webkit-reveal-button {
            display: none !important;
            appearance: none;
          }
        `}</style>
      )}
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
