import React, { useState, useRef, useEffect } from 'react';

const Select = ({ 
  label, 
  placeholder = 'Select...', 
  options = [], 
  value, 
  onChange, 
  className = '',
  required = false,
  error = null,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const selectRef = useRef(null);

  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: option.value } });
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={selectRef}>
      {label && (
          <label className="text-sm font-semibold text-black" style={{ 
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: '14px',

          }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-base text-left focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/30 focus:border-red-600' : 'focus:ring-cyan-500/30 focus:border-cyan-600'} transition-all flex items-center justify-between`}
          {...props}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-neutral-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No options available</div>
            ) : (
              options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-3 py-2 text-base transition-colors flex items-center justify-center
                    ${selectedOption?.value === option.value ? 'bg-cyan-50 text-cyan-700' : 'text-gray-900 hover:bg-gray-100'}
                  `}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;