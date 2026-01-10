/**
 * Frontend Error Handler Utility
 * 
 * Ensures consistent error display across all pages using Toast
 */

import { showToast } from "@/components/Toast";

/**
 * Display error message using Toast
 * @param {Error|string} error - Error object or error message
 * @param {string} defaultMessage - Default message if error doesn't have a message
 */
export const handleError = (error, defaultMessage = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً") => {
  let message = defaultMessage;
  
  // Extract message from error object
  if (error instanceof Error) {
    message = error.message || defaultMessage;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data?.message) {
    // API error response
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }
  
  // Clean up message (remove emojis and extra formatting if needed)
  message = message.replace(/^❌\s*/, '').replace(/^⚠️\s*/, '').trim();
  
  // Show toast
  showToast(message, "error", 5000);
  
  // Also log to console for developers
  console.error("❌ [Error Handler]", {
    message,
    error: error instanceof Error ? error : error?.response?.data || error,
    stack: error instanceof Error ? error.stack : undefined
  });
};

/**
 * Display success message using Toast
 * @param {string} message - Success message
 */
export const handleSuccess = (message) => {
  showToast(message, "success", 3000);
};

/**
 * Display info message using Toast
 * @param {string} message - Info message
 */
export const handleInfo = (message) => {
  showToast(message, "info", 3000);
};

/**
 * Handle API errors consistently
 * @param {Error} error - Axios error or other error
 * @param {Object} options - Options for error handling
 */
export const handleApiError = (error, options = {}) => {
  const {
    defaultMessage = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً",
    showToast: showToastOption = true,
    logError: logErrorOption = true
  } = options;
  
  let message = defaultMessage;
  
  // Extract message from API response
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }
  
  // Handle specific status codes
  if (error?.response?.status === 401) {
    message = "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى";
    // Token removal and redirect handled by axios interceptor
  } else if (error?.response?.status === 403) {
    message = message || "لا تملك صلاحية للوصول";
  } else if (error?.response?.status === 404) {
    message = message || "المورد المطلوب غير موجود";
  } else if (error?.response?.status === 400) {
    message = message || "البيانات المدخلة غير صحيحة";
  } else if (error?.response?.status >= 500) {
    message = "حدث خطأ في الخادم، يرجى المحاولة لاحقاً";
  }
  
  // Clean message
  message = message.replace(/^❌\s*/, '').replace(/^⚠️\s*/, '').trim();
  
  // Show toast if enabled
  if (showToastOption) {
    showToast(message, "error", 5000);
  }
  
  // Log error if enabled
  if (logErrorOption) {
    console.error("❌ [API Error]", {
      status: error?.response?.status,
      message,
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.response?.data
    });
  }
  
  return message;
};

