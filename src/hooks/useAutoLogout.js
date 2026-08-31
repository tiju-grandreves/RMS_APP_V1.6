import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getShopLoginPath } from "../services/authRedirect";
// import toast from "react-hot-toast";

const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes

export default function useAutoLogout() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    // toast.error("Session expired due to inactivity");

    setTimeout(() => {
      const loginPath = getShopLoginPath();

      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      localStorage.removeItem("lastActivity");

      sessionStorage.clear();

      navigate(loginPath, { replace: true });
    }, 1000);
  }, [navigate]);

  const resetTimer = useCallback(() => {
    localStorage.setItem("lastActivity", Date.now().toString());

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIME);
  }, [logout]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");

    // Only run if user is logged in
    if (!userData) return;

    const events = [
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress",
      "touchstart",
    ];

    // Check if already inactive before page refresh
    const lastActivity = localStorage.getItem("lastActivity");

    if (
      lastActivity &&
      Date.now() - Number(lastActivity) > INACTIVITY_TIME
    ) {
      logout();
      return;
    }

    // Start timer
    resetTimer();

    // Listen for user activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Listen for activity from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "lastActivity") {
        resetTimer();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });

      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, logout, resetTimer]);
}