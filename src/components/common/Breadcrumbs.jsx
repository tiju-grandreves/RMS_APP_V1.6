import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HOME_ROUTES = {
  admin:    "/AdminDashboard",
  reception: "/ReceptionistHome",
  service:  "/ServiceOffHome",
};

const Breadcrumb = ({ items = [], role = "admin" }) => {
  const navigate = useNavigate();
  const homeRoute = HOME_ROUTES[role] || "/AdminDashboard";

  return (
    <nav className="flex items-center gap-1.5">
      {/* Home icon */}
      <button
        type="button"
        onClick={() => navigate(homeRoute)}
        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-black/5"
      >
        <Home className="w-4 h-4" style={{ color: "#5a7585" }} />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "#5a7585" }} />
            {isLast ? (
              <span
                className="text-sm font-medium px-2 py-1 rounded-lg"
                style={{ color: "#02949D", background: "rgba(2,148,157,0.08)" }}
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.path) navigate(item.path);
                }}
                className="text-sm px-2 py-1 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: "#5a7585" }}
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;