'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";

export default function UploadBooks() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [books, setBooks] = useState([]); // ✅ قائمة الكتب المرفوعة

  // ✅ جلب قائمة الكتب عند تحميل الصفحة
  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ استدعاء API لجلب قائمة الكتب بدون أي تعديل على الأسماء
  const fetchBooks = async () => {
    try {
      const response = await axios.get("https://ge-api.ghostexams.com/api/books/list");
      setBooks(response.data.books); // ✅ استخدام الأسماء كما هي بدون تعديل
    } catch (error) {
      console.error("❌ خطأ في جلب الكتب:", error);
      setMessage("❌ حدث خطأ أثناء جلب قائمة الكتب.");
    }
  };

  // ✅ عند اختيار ملف
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // ✅ رفع الملف إلى السيرفر
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("❌ يرجى اختيار ملف قبل الرفع.");
      return;
    }

    const formData = new FormData();
    formData.append("bookFile", selectedFile);

    try {
      setUploading(true);
      setMessage("⏳ جاري رفع الكتاب...");
      const response = await axios.post(
        "https://ge-api.ghostexams.com/api/books/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(`✅ تم رفع الكتاب بنجاح: ${response.data.filePath}`);
      setUploading(false);
      fetchBooks(); // ✅ تحديث القائمة بعد الرفع
    } catch (error) {
      console.error("❌ فشل في رفع الكتاب:", error);
      setMessage("❌ حدث خطأ أثناء رفع الكتاب.");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          📚 رفع كتب تعليمية
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept=".pdf,.docx,.xlsx,.png,.jpg"
            onChange={handleFileChange}
            className="border p-2 rounded-md"
          />

          <button
            onClick={handleUpload}
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={uploading}
          >
            🚀 رفع الكتاب
          </button>

          {message && (
            <p className="text-center text-gray-700 mt-4">{message}</p>
          )}

          {/* ✅ عرض قائمة الكتب كما هي دون أي تعديل */}
          <div className="mt-6 w-full">
            <h2 className="text-lg font-semibold text-gray-800">
              📚 قائمة الكتب
            </h2>
            <ul className="list-disc pl-5 mt-2">
              {books.length > 0 ? (
                books.map((book, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-bold">{book.fileName}</span> - 📅{" "}
                    {new Date(book.lastModified).toLocaleDateString()}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">لا توجد كتب مرفوعة حاليًا.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
