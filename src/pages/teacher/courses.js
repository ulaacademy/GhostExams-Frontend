"use client";
// src/pages/teacher/courses.js

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import TeacherLayout from "@/components/TeacherLayout";
import CourseCard from "@/components/teacher/CourseCard";

export default function TeacherCoursesPage() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        "https://ge-api.ghostexams.com/api/teacher/courses",
        {
        headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Expecting: { courses: [{ name, description, studentsCount }, ...] }
      setCourses(res.data?.courses || []);
    } catch (e) {
      console.error("❌ فشل في جلب الدورات:", e);
      setError("فشل في جلب الدورات. تأكد من تسجيل الدخول ووجود بيانات.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCourses();
  }, [token, fetchCourses]);

  return (
    <TeacherLayout teacherName={user?.name}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">📚 الدورات</h1>

        {loading && <p className="text-gray-600">⏳ جاري تحميل الدورات...</p>}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {!loading && !error && courses.length === 0 && (
          <p className="text-gray-600">⚠️ لا توجد دورات حتى الآن.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course._id || course.id} course={course} />
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
}


