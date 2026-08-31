import { X } from "lucide-react";

/**
 * Reusable SideDrawer component
 *
 * Props:
 * - open: boolean
 * - onClose: function
 * - title: string
 * - subtitle: string (optional)
 * - width: string (optional, default "min(520px, 100vw)")
 * - children: main body content
 * - footer: footer content (buttons etc)
 */
const SideDrawer = ({
  open,
  onClose,
  title,
  subtitle,
  width = "min(520px, 100vw)",
  children,
  footer,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(2, 40, 50, 0.45)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width,
          background: "#F7FDFF",
          boxShadow: "-8px 0 40px rgba(2,80,98,0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: "rgba(57,80,98,0.12)", background: "white" }}
        >
          <div>
            {title && (
              <h2 className="text-lg font-semibold" style={{ color: "#02949D" }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "#5a7585" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ color: "#5a7585" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: "rgba(57,80,98,0.12)", background: "white" }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default SideDrawer;