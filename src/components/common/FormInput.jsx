import { forwardRef } from "react";

const FormInput = forwardRef(function FormInput(
  {
    type = "text",
    value,
    onChange,
    onBlur,
    name,
    label,
    placeholder,
    error,
    disabled = false,
    required = false,
    className = "",
    ...rest
  },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-medium"
          style={{ color: "#395062" }}
        >
          {label}
          {required && <span style={{ color: "#e0576b" }}> *</span>}
        </label>
      )}

      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        style={{
          borderColor: error ? "#e0576b" : "#d8e2e7",
          color: "#395062",
        }}
        {...rest}
      />

      {error && (
        <span className="text-xs" style={{ color: "#e0576b" }}>
          {error}
        </span>
      )}
    </div>
  );
});

export default FormInput;