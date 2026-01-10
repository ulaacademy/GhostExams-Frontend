"use client";
// frontend/src/pages/teacher/exams.js

import TeacherLayout from "@/components/TeacherLayout";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchTeacherCustomExamsWithResults,
  fetchExamStudentsCount,
  createShareLink,

  // ✅ NEW: Teacher Custom Exams CRUD + Questions + Active
  updateTeacherCustomExam,
  setTeacherCustomExamActive,
  addQuestionToTeacherCustomExam,
  updateQuestionInTeacherCustomExam,
  deleteQuestionFromTeacherCustomExam,
  deleteTeacherCustomExam,
} from "@/services/api";
import { showToast } from "@/components/Toast";

export default function TeacherExamsPage() {
  const [teacherExams, setTeacherExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [gradeFilter, setGradeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log("📡 بدء جلب امتحانات المعلم...");
        const exams = await fetchTeacherCustomExamsWithResults();
        console.log("✅ تم جلب الامتحانات:", exams);
        setTeacherExams(exams || []);
        setFilteredExams(exams || []);
      } catch (error) {
        console.error("❌ فشل في جلب الامتحانات:", error);
        console.error("❌ تفاصيل الخطأ:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        showToast("❌ فشل في جلب الامتحانات", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // ✅ فلترة الامتحانات حسب القيم
  useEffect(() => {
    let filtered = teacherExams;

    if (gradeFilter)
      filtered = filtered.filter((exam) => exam.grade === gradeFilter);
    if (subjectFilter)
      filtered = filtered.filter((exam) => exam.subject === subjectFilter);
    if (termFilter)
      filtered = filtered.filter((exam) => exam.term === termFilter);

    setFilteredExams(filtered);
  }, [gradeFilter, subjectFilter, termFilter, teacherExams]);

  const resetFilters = () => {
    setGradeFilter("");
    setSubjectFilter("");
    setTermFilter("");
  };

  // ✅ تحديث امتحان داخل state (بدون إعادة تحميل)
  const handleExamUpdated = (updatedExam) => {
    if (!updatedExam?._id) return;

    setTeacherExams((prev) =>
      prev.map((e) =>
        e._id === updatedExam._id ? { ...e, ...updatedExam } : e
      )
    );
  };

  // ✅ حذف امتحان من state (بدون إعادة تحميل)
  const handleExamDeleted = (examId) => {
    setTeacherExams((prev) => prev.filter((e) => e._id !== examId));
  };

  // ✅ كومبوننت داخلي لكل كارد امتحان
  function ExamCard({ exam, onUpdated, onDeleted }) {
    const [studentsCount, setStudentsCount] = useState(0);

    const [shareUrl, setShareUrl] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // ✅ إدارة الامتحان
    const [showEditModal, setShowEditModal] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);

    // ✅ إدارة الأسئلة
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [savingQuestions, setSavingQuestions] = useState(false);

    // ✅ حذف
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ✅ تفعيل/إخفاء
    const [togglingActive, setTogglingActive] = useState(false);

    // ✅ Local view state (لتحسين UX داخل الكارد)
    const [localExam, setLocalExam] = useState(exam);

    useEffect(() => {
      setLocalExam(exam);
    }, [exam]);

    const isActive =
      typeof localExam.isActive === "undefined" ? true : !!localExam.isActive;

    useEffect(() => {
      const getCount = async () => {
        try {
          const count = await fetchExamStudentsCount(localExam._id);
          setStudentsCount(count);
        } catch (error) {
          console.error("❌ فشل في جلب عدد الطلاب:", error);
        }
      };
      getCount();
    }, [localExam._id]);

    // ✅ Edit form state
    const [editForm, setEditForm] = useState({
      examName: localExam.examName || "",
      subject: localExam.subject || "",
      grade: localExam.grade || "",
      term: localExam.term || "",
      duration: localExam.duration || 0,
    });

    useEffect(() => {
      setEditForm({
        examName: localExam.examName || "",
        subject: localExam.subject || "",
        grade: localExam.grade || "",
        term: localExam.term || "",
        duration: localExam.duration || 0,
      });
    }, [localExam, showEditModal]);

    // ✅ Questions local state
    const initialQuestions = useMemo(
      () => localExam.questions || [],
      [localExam.questions]
    );
    const [questions, setQuestions] = useState(initialQuestions);

    useEffect(() => {
      setQuestions(initialQuestions);
    }, [initialQuestions, showQuestionsModal]);

    const [newQ, setNewQ] = useState({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });

    const handleShare = async () => {
      try {
        setSharing(true);
        const result = await createShareLink({
          shareType: "exam",
          resourceId: localExam._id,
          expiresInDays: 30,
        });
        setShareUrl(result.share.url);
        setShowShareModal(true);
      } catch (error) {
        console.error("❌ فشل في إنشاء رابط المشاركة:", error);
      } finally {
        setSharing(false);
      }
    };

    const copyToClipboard = () => {
      if (shareUrl) {
        navigator.clipboard.writeText(shareUrl);
        showToast("✅ تم نسخ الرابط بنجاح", "success");
      }
    };

    // ✅ Toggle Active/Inactive
    const toggleActive = async () => {
      try {
        setTogglingActive(true);
        const updated = await setTeacherCustomExamActive(
          localExam._id,
          !isActive
        );

        if (updated) {
          setLocalExam((prev) => ({ ...prev, ...updated }));
          onUpdated?.(updated);
          showToast(
            updated.isActive ? "✅ تم تفعيل الامتحان" : "✅ تم إخفاء الامتحان",
            "success"
          );
        }
      } catch (error) {
        console.error("❌ فشل في تغيير حالة الامتحان:", error);
        showToast("❌ فشل في تغيير حالة الامتحان", "error");
      } finally {
        setTogglingActive(false);
      }
    };

    // ✅ Save Exam Edit
    const saveEdit = async () => {
      try {
        setSavingEdit(true);

        const payload = {
          examName: editForm.examName,
          subject: editForm.subject,
          grade: editForm.grade,
          term: editForm.term,
          duration: Number(editForm.duration) || 0,
        };

        const updated = await updateTeacherCustomExam(localExam._id, payload);

        if (updated) {
          setLocalExam((prev) => ({ ...prev, ...updated }));
          onUpdated?.(updated);
          showToast("✅ تم تحديث بيانات الامتحان", "success");
          setShowEditModal(false);
        }
      } catch (error) {
        console.error("❌ فشل تعديل الامتحان:", error);
        showToast("❌ فشل تعديل الامتحان", "error");
      } finally {
        setSavingEdit(false);
      }
    };

    // ✅ Add Question
    const addQuestion = async () => {
      try {
        setSavingQuestions(true);

        const payload = {
          questionText: (newQ.questionText || "").trim(),
          options: (newQ.options || [])
            .map((x) => (x || "").trim())
            .filter(Boolean),
          correctAnswer: (newQ.correctAnswer || "").trim(),
        };

        if (
          !payload.questionText ||
          payload.options.length < 2 ||
          !payload.correctAnswer
        ) {
          showToast(
            "❌ بيانات السؤال ناقصة (نص + خيارين + إجابة صحيحة)",
            "error"
          );
          return;
        }

        const updated = await addQuestionToTeacherCustomExam(
          localExam._id,
          payload
        );
        if (updated) {
          setLocalExam((prev) => ({ ...prev, ...updated }));
          onUpdated?.(updated);
          setQuestions(updated.questions || []);

          setNewQ({
            questionText: "",
            options: ["", "", "", ""],
            correctAnswer: "",
          });
          showToast("✅ تم إضافة السؤال", "success");
        }
      } catch (error) {
        console.error("❌ فشل إضافة السؤال:", error);
        showToast("❌ فشل إضافة السؤال", "error");
      } finally {
        setSavingQuestions(false);
      }
    };

    // ✅ Update Question
    const updateQuestion = async (questionId, patch) => {
      try {
        setSavingQuestions(true);
        const updated = await updateQuestionInTeacherCustomExam(
          localExam._id,
          questionId,
          patch
        );
        if (updated) {
          setLocalExam((prev) => ({ ...prev, ...updated }));
          onUpdated?.(updated);
          setQuestions(updated.questions || []);
          showToast("✅ تم تعديل السؤال", "success");
        }
      } catch (error) {
        console.error("❌ فشل تعديل السؤال:", error);
        showToast("❌ فشل تعديل السؤال", "error");
      } finally {
        setSavingQuestions(false);
      }
    };

    // ✅ Delete Question
    const deleteQuestion = async (questionId) => {
      try {
        const ok = confirm("هل أنت متأكد من حذف السؤال؟");
        if (!ok) return;

        setSavingQuestions(true);
        const updated = await deleteQuestionFromTeacherCustomExam(
          localExam._id,
          questionId
        );
        if (updated) {
          setLocalExam((prev) => ({ ...prev, ...updated }));
          onUpdated?.(updated);
          setQuestions(updated.questions || []);
          showToast("✅ تم حذف السؤال", "success");
        }
      } catch (error) {
        console.error("❌ فشل حذف السؤال:", error);
        showToast("❌ فشل حذف السؤال", "error");
      } finally {
        setSavingQuestions(false);
      }
    };

    // ✅ Delete Exam
    const confirmDeleteExam = async () => {
      try {
        setDeleting(true);
        await deleteTeacherCustomExam(localExam._id);
        showToast("✅ تم حذف الامتحان", "success");
        setShowDeleteModal(false);
        onDeleted?.(localExam._id);
      } catch (error) {
        console.error("❌ فشل حذف الامتحان:", error);
        showToast("❌ فشل حذف الامتحان", "error");
      } finally {
        setDeleting(false);
      }
    };

    return (
      <>
        <div  dir="rtl"
          className={`border p-4 rounded shadow transition ${
            isActive
              ? "bg-blue-50 hover:bg-blue-100"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-semibold text-lg flex-1">
              <span className={isActive ? "text-blue-700" : "text-gray-700"}>
                📘 {localExam.examName}
              </span>
              {!isActive && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  مخفي
                </span>
              )}
            </h3>
          </div>

          <p className="text-sm text-gray-700">
            📚 المادة: {localExam.subject} | 🧪 الصف: {localExam.grade} | 📅
            الفصل: {localExam.term}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            📝 عدد الأسئلة: {localExam.questions?.length || 0}
          </p>

          <p className="text-sm text-green-600 mt-2 font-semibold">
            👨‍🎓 عدد مرات تقديم الامتحان: {studentsCount}
          </p>

          {/* ✅ Actions (كل الأزرار تحت جنب بعض) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* ✅ Preview */}
            <Link
              href={`/teacher/exams/preview/${localExam._id}`}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
              title="معاينة الامتحان"
            >
              👁️ معاينة
            </Link>

            {/* ✅ Share */}
            <button
              onClick={handleShare}
              disabled={sharing}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 transition"
              title="مشاركة الامتحان"
            >
              {sharing ? "⏳" : "🔗 مشاركة"}
            </button>

            <button
              onClick={toggleActive}
              disabled={togglingActive}
              className={`px-3 py-2 rounded text-sm text-white shadow transition disabled:opacity-50 ${
                isActive
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              title="تفعيل/إخفاء الامتحان"
            >
              {togglingActive ? "⏳" : isActive ? "🙈 إخفاء" : "👁️ تفعيل"}
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white shadow transition"
              title="تعديل بيانات الامتحان"
            >
              ✏️ تعديل
            </button>

            <button
              onClick={() => setShowQuestionsModal(true)}
              className="px-3 py-2 rounded text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow transition"
              title="إدارة الأسئلة"
            >
              🧩 إدارة الأسئلة
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 rounded text-sm bg-red-600 hover:bg-red-700 text-white shadow transition"
              title="حذف الامتحان"
            >
              🗑️ حذف
            </button>
          </div>
        </div>

        {/* ✅ Modal للمشاركة */}
        {showShareModal && shareUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            dir="rtl"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">🔗 رابط المشاركة</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  انسخ الرابط وشاركه:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    📋 نسخ
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* ✅ Modal تعديل الامتحان */}
        {showEditModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            dir="rtl"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-4">
                ✏️ تعديل بيانات الامتحان
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">اسم الامتحان</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={editForm.examName}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, examName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">المدة (دقائق)</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, duration: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">المادة</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={editForm.subject}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, subject: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">الصف</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={editForm.grade}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, grade: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">الفصل</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={editForm.term}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, term: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {savingEdit ? "⏳ جاري الحفظ..." : "✅ حفظ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Modal إدارة الأسئلة */}
        {showQuestionsModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            dir="rtl"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[85vh] overflow-auto">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-xl font-bold">🧩 إدارة الأسئلة</h3>
                <button
                  onClick={() => setShowQuestionsModal(false)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  إغلاق
                </button>
              </div>

              {/* ✅ قائمة الأسئلة */}
              <div className="space-y-3">
                {(questions || []).map((q, idx) => (
                  <QuestionRow
                    key={q._id || idx}
                    q={q}
                    index={idx}
                    onSave={(patch) => updateQuestion(q._id, patch)}
                    onDelete={() => deleteQuestion(q._id)}
                    disabled={savingQuestions}
                  />
                ))}
                {(!questions || questions.length === 0) && (
                  <div className="text-gray-600">⚠️ لا يوجد أسئلة بعد.</div>
                )}
              </div>

              {/* ✅ إضافة سؤال جديد */}
              <div className="mt-6 border-t pt-5">
                <h4 className="font-bold mb-3">➕ إضافة سؤال جديد</h4>

                <label className="text-sm text-gray-600">نص السؤال</label>
                <textarea
                  className="w-full border p-2 rounded mb-3"
                  rows={3}
                  value={newQ.questionText}
                  onChange={(e) =>
                    setNewQ((p) => ({ ...p, questionText: e.target.value }))
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {newQ.options.map((opt, i) => (
                    <input
                      key={i}
                      className="border p-2 rounded"
                      placeholder={`الخيار ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewQ((p) => {
                          const next = [...p.options];
                          next[i] = val;
                          return { ...p, options: next };
                        });
                      }}
                    />
                  ))}
                </div>

                <label className="text-sm text-gray-600">الإجابة الصحيحة</label>
                <input
                  className="w-full border p-2 rounded mb-4"
                  placeholder="اكتب نص الإجابة الصحيحة كما هو أحد الخيارات"
                  value={newQ.correctAnswer}
                  onChange={(e) =>
                    setNewQ((p) => ({ ...p, correctAnswer: e.target.value }))
                  }
                />

                <button
                  onClick={addQuestion}
                  disabled={savingQuestions}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingQuestions ? "⏳" : "✅ إضافة السؤال"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Modal حذف الامتحان */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            dir="rtl"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-3">🗑️ حذف الامتحان</h3>
              <p className="text-gray-700 mb-5">
                هل أنت متأكد أنك تريد حذف الامتحان؟
                <br />
                <span className="font-semibold text-red-600">
                  هذا الإجراء لا يمكن التراجع عنه.
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDeleteExam}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "⏳ جاري الحذف..." : "✅ حذف"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ✅ Row component لتعديل سؤال بسرعة
  function QuestionRow({ q, index, onSave, onDelete, disabled }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
      questionText: q.questionText || "",
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || "",
    });

    useEffect(() => {
      setForm({
        questionText: q.questionText || "",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer || "",
      });
    }, [q]);

    return (
      <div className="border rounded p-3 bg-gray-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-semibold text-gray-800">
              {index + 1}) {q.questionText}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              ✅ الإجابة:{" "}
              <span className="font-semibold">{q.correctAnswer}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpen((v) => !v)}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              disabled={disabled}
            >
              {open ? "إغلاق" : "تعديل"}
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              disabled={disabled}
            >
              حذف
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-3 space-y-2">
            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={form.questionText}
              onChange={(e) =>
                setForm((p) => ({ ...p, questionText: e.target.value }))
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(form.options || []).map((opt, i) => (
                <input
                  key={i}
                  className="border p-2 rounded"
                  value={opt}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((p) => {
                      const next = [...(p.options || [])];
                      next[i] = val;
                      return { ...p, options: next };
                    });
                  }}
                />
              ))}
            </div>

            <input
              className="w-full border p-2 rounded"
              value={form.correctAnswer}
              onChange={(e) =>
                setForm((p) => ({ ...p, correctAnswer: e.target.value }))
              }
              placeholder="الإجابة الصحيحة"
            />

            <button
              disabled={disabled}
              onClick={() =>
                onSave({
                  questionText: form.questionText,
                  options: (form.options || []).filter(Boolean),
                  correctAnswer: form.correctAnswer,
                })
              }
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              ✅ حفظ التعديل
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-6">
        {/* ✅ أزرار إدارة الامتحانات (أعلى الصفحة) */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ✅ أنت الآن هنا (غير قابل للنقر) */}
            <div className="bg-blue-600 text-white rounded-xl shadow-lg p-5 opacity-90 cursor-default">
              <div className="text-2xl font-extrabold mb-2 flex items-center justify-center gap-2">
                📚 عرض الامتحانات
              </div>
              <p className="text-sm text-blue-100 text-center leading-6">
                أنت الآن داخل صفحة عرض جميع الامتحانات.
              </p>
            </div>

            {/* ✅ إنشاء امتحان يدوي */}
            <Link href="/teacher/create-exam" className="block">
              <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg p-5 transition">
                <div className="text-2xl font-extrabold mb-2 flex items-center justify-center gap-2">
                  ➕ إنشاء امتحان يدوي
                </div>
                <p className="text-sm text-green-100 text-center leading-6">
                  من هنا انشاء الامتحان يدوي سؤال سؤال مع خيارات وإجابات صحيحة.
                </p>
              </div>
            </Link>

            {/* ✅ رفع Excel جاهز */}
            <Link href="/teacher/upload-questions" className="block">
              <div className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg p-5 transition">
                <div className="text-2xl font-extrabold mb-2 flex items-center justify-center gap-2">
                  📥 رفع Excel جاهز
                </div>
                <p className="text-sm text-emerald-100 text-center leading-6">
                  من هنا ارفع ملفات Excel الجاهزة لاستيراد الأسئلة بسرعة وبدون
                  تعب.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          📚 جميع امتحانات المعلم
        </h1>

        {/* ✅ الفلاتر + زر مسح الفلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            className="border p-2 rounded"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">كل الصفوف</option>
            <option value="عاشر">عاشر</option>
            <option value="حادي عشر">حادي عشر</option>
            <option value="توجيهي">توجيهي</option>
          </select>

          <select
            className="border p-2 rounded"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">كل المواد</option>
            <option value="رياضيات">رياضيات</option>
            <option value="فيزياء">فيزياء</option>
            <option value="كيمياء">كيمياء</option>
            <option value="أحياء">أحياء</option>
          </select>

          <select
            className="border p-2 rounded"
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
          >
            <option value="">كل الفصول</option>
            <option value="الأول">الفصل الأول</option>
            <option value="الثاني">الفصل الثاني</option>
          </select>

          <button
            onClick={resetFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
          >
            🔄 مسح الفلاتر
          </button>
        </div>

        {/* ✅ عدد النتائج */}
        <div className="text-gray-600 mb-4">
          <p>🔍 عدد الامتحانات الظاهرة: {filteredExams.length}</p>
        </div>

        {/* ✅ عرض الامتحانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <p>⏳ جاري تحميل الامتحانات...</p>
          ) : filteredExams.length === 0 ? (
            <p>⚠️ لا يوجد امتحانات تطابق الفلاتر المختارة.</p>
          ) : (
            filteredExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onUpdated={handleExamUpdated}
                onDeleted={handleExamDeleted}
              />
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
