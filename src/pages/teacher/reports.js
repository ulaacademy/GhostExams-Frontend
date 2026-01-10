"use client";
// src/pages/teacher/reports.js

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import TeacherLayout from "@/components/TeacherLayout";
import ReportTable from "@/components/teacher/ReportTable";

export default function TeacherReportsPage() {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        "https://ge-api.ghostexams.com/api/teacher/reports",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Expecting: { reports: [{ subject, examName, studentsCount, averageScore, updatedAt }, ...] }
      setReports(res.data?.reports || []);
    } catch (e) {
      console.error("❌ فشل في جلب التقارير:", e);
      setError("فشل في جلب التقارير. تأكد من تسجيل الدخول ووجود بيانات.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchReports();
  }, [token, fetchReports]);

  return (
    <TeacherLayout teacherName={user?.name}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">📝 التقارير</h1>

        {loading && <p className="text-gray-600">⏳ جاري تحميل التقارير...</p>}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {!loading && !error && <ReportTable rows={reports} />}
      </div>
    </TeacherLayout>
  );
}


