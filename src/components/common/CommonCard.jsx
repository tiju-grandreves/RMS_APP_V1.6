export function CommonCard({
    title,
    subtitle,
    children,
    className = "",
    contentClassName = "",
    action,
    style,
  }) {
    return (
      <div
        className={`rounded-2xl bg-white border overflow-hidden ${className}`}
        style={{
          borderColor: "rgba(57,80,98,0.1)",
          boxShadow: "0 1px 4px rgba(2,80,98,0.06)",
          ...style,
        }}
      >
        {(title || subtitle || action) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div>
              {title && (
                <p className="text-sm font-semibold" style={{ color: "#1a2e38" }}>
                  {title}
                </p>
              )}
  
              {subtitle && (
                <p className="text-xs mt-1" style={{ color: "#5a7585" }}>
                  {subtitle}
                </p>
              )}
            </div>
  
            {action}
          </div>
        )}
  
        <div className={`p-5 ${title || subtitle || action ? "pt-4" : ""} ${contentClassName}`}>
          {children}
        </div>
      </div>
    );
  }