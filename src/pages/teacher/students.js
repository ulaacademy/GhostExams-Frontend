"use client";
// ✅ استيراد الملفات المطلوبة
import TeacherLayout from "@/components/TeacherLayout";
import { useAuth } from "@/context/AuthContext"; // نحتاجها فقط لعرض اسم المعلم
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { API_URL } from "@/services/api";

export default function TeacherStudentsPage() {
  const { user, token } = useAuth(); // نحتاجها فقط لعرض اسم المعلم
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  // ✅ دالة لجلب طلاب المعلم مع التوكن
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      
      const response = await axios.get(
        `${API_URL}/teacher-students/my-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );
      
      setStudents(response.data.students || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("❌ خطأ في جلب الطلاب:", error);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search]);

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token, fetchStudents]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to first page when changing limit
  };

  return (
    <TeacherLayout teacherName={user?.name}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          🎓 طلابي المسجلين
        </h1>

        {/* Search and pagination controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minWidth: "300px" }}
          />
          <select
            value={limit}
            onChange={handleLimitChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 لكل صفحة</option>
            <option value={20}>20 لكل صفحة</option>
            <option value={50}>50 لكل صفحة</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">⏳ جاري تحميل الطلاب...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-600">⚠️ لا يوجد طلاب حاليًا.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {students
                .filter((student) => student && student.name) // ✅ فلترة الطلاب الفارغين
                .map((student) => (
                <div
                  key={student._id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center">
                    {/* ✅ صورة أو أول حرف من الاسم */}
                    <div className="bg-blue-500 text-white w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold mb-4">
                      {student.name && student.name.length > 0 ? student.name.charAt(0).toUpperCase() : '?'}
                    </div>

                    {/* ✅ اسم الطالب */}
                    <h2 className="text-lg font-semibold text-blue-700">
                      {student.name || 'بدون اسم'}
                    </h2>

                    {/* ✅ الصف */}
                    <p className="text-gray-500 text-sm mt-1">
                      الصف: {student.grade || 'غير محدد'}
                    </p>

                    {/* ✅ البريد (اختياري) */}
                    <p className="text-gray-400 text-xs mt-1">{student.email || 'بدون بريد'}</p>

                    {/* ✅ نوع الاشتراك */}
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.subscriptionType === 'premium' 
                          ? 'bg-green-100 text-green-800' 
                          : student.subscriptionType === 'free'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.subscriptionType === 'premium' ? 'مميز' : student.subscriptionType === 'free' ? 'مجاني' : 'عادي'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="mt-6 flex justify-between items-center">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                السابق
              </button>
              
              <div className="text-sm text-gray-600">
                صفحة {page} - إجمالي {total} طالب
              </div>
              
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={students.length < limit || (total && page * limit >= total)}
                onClick={() => setPage(p => p + 1)}
              >
                التالي
              </button>
            </div>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
