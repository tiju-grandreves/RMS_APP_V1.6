import React from "react";
import toast from "react-hot-toast";

const TYPE_COLORS = {
  success: "#3D8C05",
  error:   "#F20303",
  delete:  "#F20303",
  warning: "#EAB308",
  caution: "#EAB308",
  info:    "#0284C7",
};

const CustomToast = ({ type, title, message, toastId, icon }) => {
  const bgColor = "bg-white";
  const accentColor = TYPE_COLORS[type] ?? TYPE_COLORS.info;

  return (
    <div
      className={`relative flex flex-col gap-3 p-3 rounded shadow-lg ${bgColor} w-80`}
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <button
        type="button"
        // onClick={() => toast.dismiss(toastId)}
        onClick={() => toast.remove(toastId)}
        className="absolute top-2 right-2 z-10"
      >
        <img
          src="/icons/icon-closes.svg"
          alt="close"
          className="w-4 h-4 cursor-pointer"
        />
      </button>
      <div className="flex items-start gap-2">
        {icon && (
          <div className="w-5 h-5 mt-1 flex items-center justify-center">
            {typeof icon === "string" ? (
              <img src={icon} alt="toast icon" className="w-5 h-5" />
            ) : (
              icon
            )}
          </div>
        )}
        <div>
          <div
            className="font-semibold font-inter text-[14px]"
            style={{ color: accentColor }}
          >
            {title}
          </div>
          <div className="text-[14px] font-inter text-[#374151]">{message}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomToast;