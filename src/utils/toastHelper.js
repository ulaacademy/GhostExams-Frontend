/**
 * Toast Helper Utility
 * 
 * Provides a simple way to show toast messages from anywhere in the app
 * Works even outside React components
 */

/**
 * Show a toast message
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showToastMessage = (message, type = "success", duration = 3000) => {
  if (typeof window === "undefined") return;
  
  const toastEvent = new CustomEvent("show-toast", {
    detail: { message, type, duration }
  });
  window.dispatchEvent(toastEvent);
};

/**
 * Show success message
 */
export const showSuccess = (message) => {
  showToastMessage(message, "success", 3000);
};

/**
 * Show error message
 */
export const showError = (message) => {
  showToastMessage(message, "error", 5000);
};

/**
 * Show info message
 */
export const showInfo = (message) => {
  showToastMessage(message, "info", 3000);
};

/**
 * Show warning message
 */
export const showWarning = (message) => {
  showToastMessage(message, "warning", 4000);
};

