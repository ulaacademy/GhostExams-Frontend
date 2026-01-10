"use client";
// frontend/src/pages/teacher/performance.js

import TeacherLayout from "@/components/TeacherLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchAllTeacherStudentsPerformance, fetchTeacherDashboardMetrics } from "@/services/api";

export default function TeacherPerformancePage() {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState({});
  const [studentsPerformance, setStudentsPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("totalExams");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(0);
  const [expandedStudent, setExpandedStudent] = useState(null);

  // ✅ جلب بيانات الأداء - يستخدم API service
  const loadDashboardMetrics = useCallback(async () => {
    try {
      return await fetchTeacherDashboardMetrics();
    } catch (error) {
      console.error("❌ فشل في جلب بيانات Teacher Dashboard Metrics:", error);
      throw error;
    }
  }, []);

  // ✅ جلب أداء الطلاب مع pagination و sorting
  const loadStudentsPerformance = useCallback(async () => {
    try {
      const params = { page, limit, sortBy, sortOrder, search };
      return await fetchAllTeacherStudentsPerformance(params);
    } catch (error) {
      console.error("❌ خطأ أثناء تحميل بيانات الطلاب:", error);
      throw error;
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [metricsData, studentsData] = await Promise.all([
          loadDashboardMetrics(),
          loadStudentsPerformance()
        ]);
        
        setMetrics(metricsData || {});
        setStudentsPerformance(studentsData.students || []);
        setTotal(studentsData.total || 0);
        setTotalPages(studentsData.totalPages || 0);
      } catch (error) {
        console.error("❌ فشل في تحميل البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, page, limit, search, sortBy, sortOrder, loadDashboardMetrics, loadStudentsPerformance]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <TeacherLayout teacherName={user?.name}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">📊 أداء طلابك</h1>

        {/* ✅ عرض الكروت الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-blue-700">
              {metrics.totalStudents ?? 0}
            </div>
            <div className="text-gray-700 mt-2">عدد الطلاب</div>
          </div>

          <div className="bg-green-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-green-700">
              {metrics.totalExamsSubmitted ?? 0}
            </div>
            <div className="text-gray-700 mt-2">عدد الامتحانات المقدمة</div>
          </div>

          <div className="bg-yellow-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-yellow-700">
              {metrics.averageScore ?? 0}%
            </div>
            <div className="text-gray-700 mt-2">متوسط الدرجات</div>
          </div>

          <div className="bg-purple-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-purple-700">
              {metrics.topPerformers ?? 0}
            </div>
            <div className="text-gray-700 mt-2">أفضل الطلاب</div>
          </div>
        </div>

        {/* ✅ رسم بياني لتوزيع الدرجات */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">
            📈 توزيع الدرجات
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.gradeDistribution || []}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ جدول أداء الطلاب */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold text-blue-700 mb-4">
            🎯 نتائج امتحانات الطلاب
          </h2>

          {/* Search, sort, and pagination controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="🔍 البحث بالاسم، البريد الإلكتروني، أو المادة..."
                value={search}
                onChange={handleSearchChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
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
            
            {/* Sort controls */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="text-gray-600 font-semibold">ترتيب حسب:</span>
              <button
                onClick={() => handleSortChange("totalExams")}
                className={`px-3 py-1 rounded-lg transition ${
                  sortBy === "totalExams"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                عدد الامتحانات {sortBy === "totalExams" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("averageScore")}
                className={`px-3 py-1 rounded-lg transition ${
                  sortBy === "averageScore"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                المعدل {sortBy === "averageScore" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("bestScore")}
                className={`px-3 py-1 rounded-lg transition ${
                  sortBy === "bestScore"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                أفضل درجة {sortBy === "bestScore" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("lastExamDate")}
                className={`px-3 py-1 rounded-lg transition ${
                  sortBy === "lastExamDate"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                آخر امتحان {sortBy === "lastExamDate" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("studentName")}
                className={`px-3 py-1 rounded-lg transition ${
                  sortBy === "studentName"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                الاسم {sortBy === "studentName" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          {loading ? (
            <p>⏳ جاري تحميل البيانات...</p>
          ) : studentsPerformance.length === 0 ? (
            <p>⚠️ لا يوجد بيانات لعرضها.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="py-3 px-4 border-b text-right">👨‍🎓 اسم الطالب</th>
                      <th className="py-3 px-4 border-b text-center">📊 عدد الامتحانات</th>
                      <th className="py-3 px-4 border-b text-center">📈 المعدل (%)</th>
                      <th className="py-3 px-4 border-b text-center">⭐ أفضل درجة</th>
                      <th className="py-3 px-4 border-b text-center">📉 أقل درجة</th>
                      <th className="py-3 px-4 border-b text-center">📚 المواد</th>
                      <th className="py-3 px-4 border-b text-center">📅 آخر امتحان</th>
                      <th className="py-3 px-4 border-b text-center">📈 التحسن</th>
                      <th className="py-3 px-4 border-b text-center">🏆 الإنجازات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsPerformance.map((student, index) => (
                      <React.Fragment key={student.studentId || index}>
                        <tr 
                          className="hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => setExpandedStudent(expandedStudent === student.studentId ? null : student.studentId)}
                        >
                          <td className="py-3 px-4 border-b">
                            <div className="text-right flex items-center gap-2">
                              <span className="text-gray-400">
                                {expandedStudent === student.studentId ? '▼' : '▶'}
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">{student.studentName || 'غير محدد'}</div>
                                {student.studentEmail && (
                                  <div className="text-xs text-gray-500">{student.studentEmail}</div>
                                )}
                              </div>
                            </div>
                          </td>
                        <td className="py-3 px-4 border-b text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold">
                            {student.totalExams || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            (student.averageScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                            (student.averageScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.averageScore || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {student.bestScore || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            {student.worstScore || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {student.subjects && student.subjects.length > 0 ? (
                              <>
                                {student.subjects.slice(0, 2).map((subject, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {subject}
                                  </span>
                                ))}
                                {student.subjects.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    +{student.subjects.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                          {student.subjectsCount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              ({student.subjectsCount} مادة)
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          {student.lastExamDate ? (
                            <div className="text-sm">
                              {new Date(student.lastExamDate).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          {student.improvement !== null ? (
                            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                              student.improvement > 0 
                                ? 'bg-green-100 text-green-800' 
                                : student.improvement < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {student.improvement > 0 ? '↑' : student.improvement < 0 ? '↓' : '='} {Math.abs(student.improvement)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 border-b text-center">
                          {student.achievements && student.achievements.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {student.achievements.map((achievement, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold"
                                  title={achievement}
                                >
                                  {achievement === 'ممتاز' && '⭐'}
                                  {achievement === 'نشط' && '🔥'}
                                  {achievement === 'محسّن' && '📈'}
                                  {achievement === 'متنوع' && '🎯'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                      {/* ✅ تفاصيل الامتحانات للطالب */}
                      {expandedStudent === student.studentId && student.examAttemptsList && student.examAttemptsList.length > 0 && (
                        <tr>
                          <td colSpan={9} className="py-4 px-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-700 mb-3 text-right">
                                📋 تفاصيل الامتحانات للطالب: {student.studentName}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {student.examAttemptsList.map((examAttempt, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="font-semibold text-gray-800 mb-2 text-right">
                                      {examAttempt.examName || 'غير محدد'}
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">عدد المرات:</span>
                                        <span className="font-bold text-blue-600">{examAttempt.count || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">المعدل:</span>
                                        <span className={`font-semibold ${
                                          (examAttempt.averageScore || 0) >= 80 ? 'text-green-600' :
                                          (examAttempt.averageScore || 0) >= 60 ? 'text-yellow-600' :
                                          'text-red-600'
                                        }`}>
                                          {examAttempt.averageScore || 0}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">أفضل درجة:</span>
                                        <span className="font-semibold text-green-600">{examAttempt.bestScore || 0}%</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">أقل درجة:</span>
                                        <span className="font-semibold text-red-600">{examAttempt.worstScore || 0}%</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  ← السابق
                </button>
                
                <div className="text-sm text-gray-600">
                  صفحة {page} من {totalPages || Math.ceil(total / limit)} - إجمالي {total} طالب
                </div>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages || Math.ceil(total / limit), 5) }, (_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === (totalPages || Math.ceil(total / limit)) || 
                        (pageNum >= page - 1 && pageNum <= page + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  disabled={page >= (totalPages || Math.ceil(total / limit))}
                  onClick={() => setPage(p => p + 1)}
                >
                  التالي →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
