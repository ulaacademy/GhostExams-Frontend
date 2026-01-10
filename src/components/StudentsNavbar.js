"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentsNavbar() {
  const [stats, setStats] = useState({
    students2007: 0,
    students2008: 0,
    subscribers: 0,
    visitors: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("📡 جلب الإحصائيات من API...");
        const response = await axios.get("/api/stats", {
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        });
        console.log("✅ البيانات المسترجعة:", response.data);
        setStats(response.data);
      } catch (error) {
        console.error("❌ خطأ في جلب الإحصائيات:", error);
      }
    };

    fetchStats(); // ✅ جلب البيانات عند تحميل الصفحة

    const interval = setInterval(() => {
      console.log("🔄 تحديث الأرقام...");
      fetchStats();
    }, 60000); // ✅ تحديث البيانات كل دقيقة

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-blue-900 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-center space-x-8 text-lg font-semibold">
        <span>📚 طلاب 2007: {stats.students2007}</span>
        <span>📘 طلاب 2008: {stats.students2008}</span>
        <span>👨‍🎓 المشتركين: {stats.subscribers}</span>
        <span>🌍 الزوار: {stats.visitors}</span>
      </div>
    </nav>
  );
}
