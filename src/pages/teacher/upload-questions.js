"use client";

import { useState } from "react";
import TeacherLayout from "@/components/TeacherLayout";
import { useAuth } from "@/context/AuthContext";
import { uploadExcelQuestions } from "@/services/api";

export default function UploadTeacherQuestionsPage() {
  const { authToken } = useAuth();

  const [file, setFile] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [term, setTerm] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");

  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [skippedRows, setSkippedRows] = useState([]);

  const resetStatus = () => {
    setStatus({ type: "idle", message: "" });
    setSkippedRows([]);
  };

  const handleFileChange = (event) => {
    resetStatus();
    const selectedFile = event.target.files?.[0];
    if (selectedFile && !selectedFile.name.match(/\.(xls|xlsx)$/i)) {
      setStatus({
        type: "error",
        message: "❌ الرجاء اختيار ملف Excel بصيغة .xls أو .xlsx.",
      });
      setFile(null);
      return;
    }
    setFile(selectedFile || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setStatus({
        type: "error",
        message: "⚠️ يرجى اختيار ملف Excel قبل الرفع.",
      });
      return;
    }

    if (!examTitle || !examTitle.trim()) {
      setStatus({
        type: "error",
        message: "⚠️ يرجى إدخال عنوان الامتحان.",
      });
      return;
    }

    setStatus({ type: "loading", message: "⏳ جاري تحميل الملف..." });

    try {
      const result = await uploadExcelQuestions(
        {
          file,
          examTitle: examTitle.trim(),
          grade,
          term,
          subject,
          unit,
          difficultyLevel,
        },
        authToken
      );

      setStatus({
        type: "success",
        message: `✅ تم رفع الملف بنجاح! تم حفظ ${result.insertedCount} سؤال.`,
      });
      setSkippedRows(result.skippedRows || []);

      // إعادة ضبط الحقول بعد النجاح
      setFile(null);
      setExamTitle("");
      setGrade("");
      setTerm("");
      setSubject("");
      setUnit("");
      setDifficultyLevel("");
      event.target.reset();
    } catch (error) {
      const details =
        Array.isArray(error.details) && error.details.length
          ? error.details
              .map(
                (detail) =>
                  `• الصف ${detail.row}: ${detail.reason || "خطأ غير محدد"}`
              )
              .join("\n")
          : error.details || "";

      setStatus({
        type: "error",
        message: `${error.message}${
          details ? `\n${details}` : ""
        }`.trim(),
      });
      setSkippedRows([]);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          📤 استيراد أسئلة من ملف Excel
        </h1>

        <p className="text-gray-600 mb-6">
          قم برفع ملف Excel يحتوي على الأسئلة بصيغة مشابهة:
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">الأعمدة المطلوبة:</span> Question،
            Option A، Option B، Option C، Option D، Correct Answer.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            سيتم تجاهل أي صف يحتوي على بيانات ناقصة أو إجابة صحيحة غير مطابقة
            للخيارات.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📄 ملف الأسئلة (Excel)
            </label>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 عنوان الامتحان <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(event) => setExamTitle(event.target.value)}
              placeholder="مثال: امتحان الرياضيات - الفصل الأول"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              هذا العنوان سيظهر في لوحة التحكم ولوحة الطلاب
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📚 المادة (اختياري)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="مثال: الرياضيات"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎓 الصف (اختياري)
              </label>
              <input
                type="text"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                placeholder="مثال: الصف التاسع"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 الفصل (اختياري)
              </label>
              <input
                type="text"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="مثال: الفصل الأول"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📘 الوحدة (اختياري)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="مثال: الوحدة الثانية"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎯 مستوى الصعوبة (اختياري)
              </label>
              <select
                value={difficultyLevel}
                onChange={(event) => setDifficultyLevel(event.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- اختر مستوى الصعوبة --</option>
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="صعب">صعب</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded transition"
            disabled={status.type === "loading"}
          >
            {status.type === "loading" ? "⏳ جاري الرفع..." : "✅ رفع الملف"}
          </button>
        </form>

        {status.type !== "idle" && (
          <div
            className={`mt-6 rounded p-4 text-sm whitespace-pre-line ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : status.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {status.message}
          </div>
        )}

        {skippedRows.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-2">
              ⚠️ تم تخطي بعض الصفوف بسبب أخطاء في البيانات:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {skippedRows.map((rowInfo) => (
                <li key={rowInfo.row}>
                  الصف {rowInfo.row}: {rowInfo.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

