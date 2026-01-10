"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  fetchTeacherExamsByStudent,
  createShareLink,
} from "@/services/api";
import { showToast } from "@/components/Toast";

export default function TeacherExamsPage() {
  const router = useRouter();
  const { teacherId } = router.query;
  const { user } = useAuth();
  
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(12);
  const [shareModals, setShareModals] = useState({});
  const [shareUrls, setShareUrls] = useState({});
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [filters, setFilters] = useState({
    subject: "",
    grade: "",
    term: "",
  });

  // ✅ جلب امتحانات المعلم
  const loadTeacherExams = useCallback(async () => {
    if (!teacherId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchTeacherExamsByStudent(teacherId);
      console.log(`📊 Exams data for teacher ${teacherId}:`, data);
      
      // Extract exams array and teacher info
      const examsList = data.exams || data || [];
      if (data.teacher) {
        setTeacherInfo(data.teacher);
      }
      
      setExams(examsList);
      setFilteredExams(examsList);
    } catch (err) {
      console.error(`❌ فشل في جلب امتحانات المعلم ${teacherId}:`, err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "فشل في تحميل الامتحانات";
      setError(errorMessage);
      setExams([]);
      setFilteredExams([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      loadTeacherExams();
    }
  }, [teacherId, loadTeacherExams]);

  // ✅ فلترة الامتحانات
  useEffect(() => {
    let filtered = [...exams];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((exam) => {
        const examName = String(exam.examName || exam.title || "").toLowerCase();
        const subject = String(exam.subject || "").toLowerCase();
        const grade = String(exam.grade || "").toLowerCase();
        return examName.includes(query) || 
               subject.includes(query) || 
               grade.includes(query);
      });
    }

    // Subject filter
    if (filters.subject) {
      filtered = filtered.filter((exam) => exam.subject === filters.subject);
    }

    // Grade filter
    if (filters.grade) {
      filtered = filtered.filter((exam) => exam.grade === filters.grade);
    }

    // Term filter
    if (filters.term) {
      filtered = filtered.filter((exam) => exam.term === filters.term);
    }

    setFilteredExams(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [exams, searchQuery, filters]);

  // ✅ Pagination calculations
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);

  // ✅ Get unique values for filters
  const uniqueSubjects = [...new Set(exams.map((exam) => exam.subject).filter(Boolean))];
  const uniqueGrades = [...new Set(exams.map((exam) => exam.grade).filter(Boolean))];
  const uniqueTerms = [...new Set(exams.map((exam) => exam.term).filter(Boolean))];

  // ✅ الانتقال إلى صفحة الامتحان
  const handleExamClick = (examId, isGhostExam = false) => {
    if (isGhostExam) {
      router.push(`/dashboard/exams/view/GhostExamView?examId=${examId}`);
    } else {
      router.push(`/dashboard/exams/custom/${examId}`);
    }
  };

  // ✅ مشاركة امتحان
  const handleShareExam = async (examId, e) => {
    e.stopPropagation();
    
    try {
      const result = await createShareLink({
        shareType: "exam",
        resourceId: examId,
        expiresInDays: 30
      });
      
      setShareUrls(prev => ({ ...prev, [examId]: result.share.url }));
      setShareModals(prev => ({ ...prev, [examId]: true }));
    } catch (error) {
      console.error("❌ فشل في إنشاء رابط المشاركة:", error);
    }
  };

  // ✅ نسخ الرابط
  const copyToClipboard = (url) => {
    if (url) {
      navigator.clipboard.writeText(url);
      showToast("✅ تم نسخ الرابط بنجاح", "success");
    }
  };

  // ✅ Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({ subject: "", grade: "", term: "" });
  };

  const studentDetails = {
    name: user?.name || "الطالب",
    email: user?.email || "",
  };

  return (
    <ProtectedRoute requiredRole="student">
      <DashboardNavbar student={studentDetails}>
        <div className="max-w-7xl mx-auto bg-white p-6 shadow-md rounded-lg" dir="rtl">
          {/* ✅ Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-blue-600 mb-2">
                  📚 امتحانات المعلم
                </h1>
                {teacherInfo && (
                  <div className="flex items-center gap-3">
                    {teacherInfo.profileImage ? (
                      <img
                        src={teacherInfo.profileImage}
                        alt={teacherInfo.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        👩‍🏫
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {teacherInfo.name}
                      </h2>
                      {teacherInfo.subjects && teacherInfo.subjects.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {teacherInfo.subjects.join("، ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push("/dashboard/subscribed-teachers")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                ← العودة
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">⏳ جاري تحميل الامتحانات...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={loadTeacherExams}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <>
              {/* ✅ Search and Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 ابحث عن امتحان (بالاسم، المادة، أو الصف)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">كل المواد</option>
                    {uniqueSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.grade}
                    onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">كل الصفوف</option>
                    {uniqueGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.term}
                    onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">كل الفصول</option>
                    {uniqueTerms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    🔄 مسح الفلاتر
                  </button>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  عرض {currentExams.length} من {filteredExams.length} امتحان
                  {filteredExams.length !== exams.length && (
                    <span className="text-blue-600">
                      {" "}(تمت الفلترة من {exams.length} امتحان)
                    </span>
                  )}
                </div>
              </div>

              {/* ✅ Exams Grid */}
              {currentExams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">
                    {filteredExams.length === 0 && exams.length > 0
                      ? "⚠️ لا توجد امتحانات تطابق الفلاتر المحددة"
                      : "⚠️ لا توجد امتحانات متاحة من هذا المعلم حالياً"}
                  </p>
                  {filteredExams.length === 0 && exams.length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      مسح الفلاتر
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {currentExams.map((exam) => (
                      <div
                        key={exam._id}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-800 flex-1 text-lg">
                            {exam.examName || exam.title}
                            {exam.isGhostExam && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                👻
                              </span>
                            )}
                          </h4>
                          <button
                            onClick={(e) => handleShareExam(exam._id, e)}
                            className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            title="مشاركة الامتحان"
                          >
                            🔗
                          </button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-2 flex-1">
                          <p>
                            📚 المادة: <span className="font-semibold">{exam.subject}</span>
                          </p>
                          <p>
                            🧪 الصف: <span className="font-semibold">{exam.grade}</span>
                          </p>
                          <p>📅 الفصل: {exam.term}</p>
                          <p>🕒 المدة: {exam.duration} دقيقة</p>
                          {exam.questions && (
                            <p>❓ عدد الأسئلة: {exam.questions.length}</p>
                          )}
                          {exam.createdAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              📆 {new Date(exam.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleExamClick(exam._id, exam.isGhostExam)}
                          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <span>👁️ عرض الامتحان</span>
                          <span>→</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ✅ Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        ← السابق
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-4 py-2 rounded-lg transition ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        التالي →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ✅ Share Modals */}
          {Object.keys(shareModals).map((key) => {
            if (!shareModals[key]) return null;
            const url = shareUrls[key];
            return (
              <div
                key={key}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                dir="rtl"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold mb-4">🔗 رابط المشاركة</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">انسخ الرابط وشاركه:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={url || ""}
                        readOnly
                        className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(url)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        📋 نسخ
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShareModals(prev => ({ ...prev, [key]: false }))}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardNavbar>
    </ProtectedRoute>
  );
}

