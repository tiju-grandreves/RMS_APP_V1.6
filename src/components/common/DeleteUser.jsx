import { useState } from "react";
 
const WarningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
 
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
 
/**
 * Reusable delete confirmation popup.
 *
 * Props:
 * - isOpen: boolean — whether the popup is visible
 * - onClose: () => void — called when cancel/backdrop/close is clicked
 * - onConfirm: (user) => void | Promise<void> — called with the user when "Delete" is clicked
 * - user: { id, name, email } | null — the record being deleted
 */
const DeleteUser = ({ isOpen, onClose, onConfirm, user, entityName = "User" }) => {
  const [isDeleting, setIsDeleting] = useState(false);
 
  if (!isOpen || !user) return null;
 
  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(user);
    } finally {
      setIsDeleting(false);
    }
  };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />
 
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-text/40 hover:text-text/70 transition-colors disabled:opacity-40"
        >
          <CloseIcon />
        </button>
 
        <div className="flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#FCE9EA", color: "#E0556F" }}
          >
            <WarningIcon />
          </div>
 
          <h3 className="text-lg font-semibold text-text mb-1">Delete {entityName}?</h3>
          <p className="text-sm text-text/60 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-text">{user.name}</span>
            {user.email ? <> ({user.email})</> : null}? This action cannot be undone.
          </p>
 
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-text/70 text-sm font-medium hover:bg-[#f9fafa] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#E0556F] text-white text-sm font-medium hover:bg-[#c8475e] transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default DeleteUser;