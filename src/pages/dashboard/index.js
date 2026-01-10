"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLanding() {
  const router = useRouter();
  const { user, userId } = useAuth();

  useEffect(() => {
    if (!router.isReady) return;

    // Redirect based on user role
    if (user?.role === "student") {
      const studentId = userId || user?._id || user?.id || user?.userId;
      router.push(`/dashboard/studentDashboard${studentId ? `?userId=${studentId}` : ""}`);
    } else if (user?.role === "teacher") {
      const teacherId = userId || user?._id || user?.id || user?.userId;
      router.push(`/teacher${teacherId ? `?userId=${teacherId}` : ""}`);
    } else {
      // Not logged in - redirect to login
      router.push({
        pathname: "/auth/Login",
        query: { redirect: "/dashboard" }
      });
    }
  }, [router, user, userId]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التوجيه...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
