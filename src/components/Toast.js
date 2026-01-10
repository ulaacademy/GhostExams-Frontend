"use client";
import { useEffect, useState, createContext, useContext } from "react";

// ✅ Toast Context
const ToastContext = createContext(null);

// ✅ Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  };

  // Listen for custom toast events
  useEffect(() => {
    const handleToastEvent = (event) => {
      const { message, type, duration } = event.detail;
      showToast(message, type, duration);
    };

    window.addEventListener("show-toast", handleToastEvent);
    return () => {
      window.removeEventListener("show-toast", handleToastEvent);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

// ✅ Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback: create a simple DOM-based toast if context is not available
    return {
      showToast: (message, type = "success", duration = 3000) => {
        showToastFallback(message, type, duration);
      }
    };
  }
  return context;
};

// ✅ Fallback toast function (for use outside React context)
export const showToast = (message, type = "success", duration = 3000) => {
  if (typeof window === "undefined") return;
  
  // Try to use React context first
  const toastContainer = document.getElementById("toast-container");
  if (toastContainer) {
    // If container exists, it means ToastProvider is active
    // Dispatch a custom event that ToastProvider can listen to
    window.dispatchEvent(new CustomEvent("show-toast", { 
      detail: { message, type, duration } 
    }));
    return;
  }
  
  // Fallback to DOM manipulation
  showToastFallback(message, type, duration);
};

// ✅ Fallback DOM-based toast
const showToastFallback = (message, type = "success", duration = 3000) => {
  if (typeof window === "undefined") return;
  
  let container = document.getElementById("toast-container-fallback");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container-fallback";
    container.className = "fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none";
    container.setAttribute("dir", "rtl");
    document.body.appendChild(container);
  }
  
  const toastId = `toast-${Date.now()}-${Math.random()}`;
  const toast = document.createElement("div");
  toast.id = toastId;
  
  const bgColor = type === "success" ? "bg-green-500" 
    : type === "error" ? "bg-red-500" 
    : type === "info" ? "bg-blue-500" 
    : "bg-gray-500";
  
  toast.className = `
    ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl
    flex items-center gap-3 min-w-[300px] max-w-md
    transform transition-all duration-300 ease-in-out pointer-events-auto
    translate-x-0 opacity-100
  `;
  
  const iconSvg = type === "success" 
    ? `<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>`
    : type === "error"
    ? `<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>`
    : `<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`;
  
  toast.innerHTML = `
    ${iconSvg}
    <p class="flex-1 text-sm font-medium">${message}</p>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration - 300);
  
  return toastId;
};

// ✅ Toast Container Component
const ToastContainer = ({ toasts }) => {
  return (
    <div
      id="toast-container"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// ✅ Individual Toast Item
const ToastItem = ({ toast }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setIsVisible(false), 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const bgColor =
    toast.type === "success"
      ? "bg-green-500"
      : toast.type === "error"
      ? "bg-red-500"
      : toast.type === "info"
      ? "bg-blue-500"
      : "bg-gray-500";

  return (
    <div
      className={`
        ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl
        flex items-center gap-3 min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out pointer-events-auto
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
      `}
    >
      <div className="flex-shrink-0">
        {toast.type === "success" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {toast.type === "error" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {toast.type === "info" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
    </div>
  );
};

// ✅ React Toast Component (for use in React components)
export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration - 300);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "info"
      ? "bg-blue-500"
      : "bg-gray-500";

  return (
    <div
      className={`
        ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl
        flex items-center gap-3 min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out pointer-events-auto
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
      `}
      dir="rtl"
    >
      <div className="flex-shrink-0">
        {type === "success" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {type === "error" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {type === "info" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <p className="flex-1 text-sm font-medium">{message}</p>
    </div>
  );
}

