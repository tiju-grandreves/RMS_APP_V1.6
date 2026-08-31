const TextArea = ({
  label,
  optional = false,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  error,
  className = "",
  ...rest
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: "#0E9594" }}
        >
          {label}
          {optional ? " (Optional)" : ""}
        </label>
      )}
 
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none placeholder:text-[#9aa8b0]"
        style={{
          borderColor: error ? "#E0556F" : "rgba(57,80,98,0.2)",
          color: "#1a2e38",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? "#E0556F" : "#0E9594";
          e.target.style.boxShadow = "0 0 0 3px rgba(14,149,148,0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#E0556F" : "rgba(57,80,98,0.2)";
          e.target.style.boxShadow = "none";
        }}
        {...rest}
      />
 
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: "#E0556F" }}>
          {error}
        </p>
      )}
    </div>
  );
};
 
export default TextArea;