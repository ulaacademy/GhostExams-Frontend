/**
 * Protected Route Component
 *
 * Protects dashboard routes from unauthorized access
 * Redirects to login if user is not authenticated
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import { showError } from "@/utils/toastHelper";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if token exists
      const storedToken = localStorage.getItem("token");

      if (!storedToken && !token) {
        // No token - redirect to login
        setIsAuthorized(false);
        setIsChecking(false);

        // Show friendly message
        showError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");

        // Redirect to login with return URL
        const currentPath = router.asPath;
        router.push({
          pathname: "/auth/Login",
          query: {
            redirect: currentPath,
            message: "loginRequired",
          },
        });
        return;
      }

      // Check if user data exists
      if (!user) {
        // Token exists but no user data - might be loading
        // Wait a bit for auth context to load
        setTimeout(() => {
          const storedToken = localStorage.getItem("token");
          if (storedToken && !user) {
            // Still no user after waiting - invalid token
            setIsAuthorized(false);
            setIsChecking(false);
            showError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
            router.push("/auth/Login");
          }
        }, 1000);
        return;
      }

      // ✅ Check role if required (normalized)
      const userRole = (user?.role || "").toString().trim().toLowerCase();
      const neededRole = (requiredRole || "").toString().trim().toLowerCase();

      if (neededRole && userRole !== neededRole) {
        setIsAuthorized(false);
        setIsChecking(false);
        showError("لا تملك صلاحية للوصول إلى هذه الصفحة");
        router.push("/");
        return;
      }

      // User is authenticated
      setIsAuthorized(true);
      setIsChecking(false);
    };

    // Wait for router to be ready
    if (router.isReady) {
      checkAuth();
    }
  }, [user, token, router, requiredRole]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render children (redirect is happening)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              يجب تسجيل الدخول
            </h2>
            <p className="text-gray-600 mb-6">
              يرجى تسجيل الدخول للوصول إلى هذه الصفحة
            </p>
            <button
              onClick={() => router.push("/auth/Login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authorized - render children
  return <>{children}</>;
}
