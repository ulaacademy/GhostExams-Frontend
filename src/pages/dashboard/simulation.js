"use client";
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Simulation() {
  const { user } = useAuth();

  const studentDetails = {
    name: user?.name || "الطالب",
    email: user?.email || "",
  };

  return (
    <ProtectedRoute requiredRole="student">
      <DashboardNavbar student={studentDetails}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">🏛️ امتحانات الوزارية Simulation</h1>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
            <p className="text-xl font-semibold text-yellow-800">
              ⚠️ هذه الخدمة غير متوفرة حالياً
            </p>
            <p className="text-gray-600 mt-2">
              نعمل على تطوير هذه الميزة. يرجى العودة لاحقاً.
            </p>
          </div>

          <div className="mt-6">
            <Link href="/dashboard/studentDashboard">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
                🔙 العودة إلى لوحة التحكم
              </button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardNavbar>
    </ProtectedRoute>
  );
}
