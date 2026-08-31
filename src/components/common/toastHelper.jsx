import toast from "react-hot-toast";
import CustomToast from "./CustomToast";

const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#3D8C05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.75 12.0018L10.58 14.8318L16.25 9.17188" stroke="#3D8C05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12V17" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 12V17" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 7H20" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V12" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16H12.01" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V12" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16H12.01" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11V17" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11V17" stroke="#F20303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CautionIcon = () => (
  <img
    src="/icons/ic_caution.svg"
    alt="delete"
    className="w-5 h-5"
  />
);

export const showEventToast = (type, title, message, customIcon, options = {}) => {
  let icon;
  if (customIcon) {
    icon = customIcon;
  } else {
    switch (type) {
      case 'success':
        icon = <SuccessIcon />;
        break;
      case 'error':
        icon = <ErrorIcon />;
        break;
      case 'info':
        icon = <InfoIcon />;
        break;
      case 'warning':
        icon = <WarningIcon />;
        break;
      case 'delete':
        icon = <DeleteIcon />;
        break;
      case 'caution':
        icon = <CautionIcon />;
        break;
      default:
        icon = <InfoIcon />;
    }
  }

  return toast.custom((t) => (
    <div className="rounded-lg" style={{ boxShadow: '0px 0px 9.6px 2px #80CAD640' }}>
      <CustomToast
        type={type}
        title={title}
        message={message}
        toastId={t.id}
        icon={icon}
      />
    </div>
  ), {
    id: options.id,
    duration: options.duration ?? 4000,
  });
};
