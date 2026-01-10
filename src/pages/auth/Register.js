"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext"; // ✅ صحيح
import Head from "next/head";
import Image from "next/image";
import { showError, showSuccess } from "@/utils/toastHelper";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "", // ✅ رقم الهاتف (للطلاب والمعلمين)
    grade: "", // ✅ للطلاب
    subject: "", // ✅ للمعلمين
    role: "student", // 🔹 تحديد الدور افتراضيًا كطالب
  });
  const { login } = useAuth(); // ✅ صحيح
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teacherImage, setTeacherImage] = useState(null);
  const [teacherImagePreview, setTeacherImagePreview] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        grade: value === "student" ? prev.grade : "",
        subject: value === "teacher" ? prev.subject : "",
      }));

      if (value !== "teacher") {
        setTeacherImage(null);
        setTeacherImagePreview(null);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTeacherImageChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setTeacherImage(null);
      setTeacherImagePreview(null);
      return;
    }

    setTeacherImage(selectedFile);
    const previewUrl = URL.createObjectURL(selectedFile);
    setTeacherImagePreview(previewUrl);
  }, []);

  useEffect(() => {
    return () => {
      if (teacherImagePreview) {
        URL.revokeObjectURL(teacherImagePreview);
      }
    };
  }, [teacherImagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.role === "teacher" && !teacherImage) {
      setLoading(false);
      setError("❌ يجب رفع صورة المعلم قبل إنشاء الحساب.");
      return;
    }

    try {
      const endpoint =
        formData.role === "student"
          ? "https://ge-api.ghostexams.com/api/auth/register-student"
          : "https://ge-api.ghostexams.com/api/auth/register-teacher";

      let response;

      if (formData.role === "teacher") {
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("email", formData.email);
        payload.append("password", formData.password);
        payload.append("phone", formData.phone); // ✅ إرسال رقم الهاتف للمعلم
        payload.append("role", formData.role);
        if (formData.subject) {
          payload.append("subject", formData.subject);
        }
        if (teacherImage) {
          payload.append("profileImage", teacherImage);
        }

        response = await fetch(endpoint, {
          method: "POST",
          body: payload,
        });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // ✅ phone داخل formData تلقائياً
        });
      }

      const result = await response.json();
      console.log("🔍 بيانات الاستجابة من السيرفر:", result);

      if (response.ok) {
        const successMessage = result.message || "تم إنشاء الحساب بنجاح";
        showSuccess(successMessage);
        console.log("🔍 التوكن المستلم قبل تسجيل الدخول:", result.token);

        // ✅ تسجيل الدخول حسب الدور
        if (formData.role === "teacher") {
          const teacherProfile = result.teacher || result.user;

          // ✅ مهم: تثبيت الدور حتى ما تطلع "لا تملك صلاحية"
          login({ ...teacherProfile, role: "teacher" }, result.token); // 👨‍🏫 تسجيل بيانات المعلم

          const teacherId =
            teacherProfile?.id || teacherProfile?._id || teacherProfile?.userId;
          router.push(`/teacher?userId=${teacherId}`);
        } else {
          const studentProfile = result.student || result.user;

          const studentId =
            studentProfile?._id || studentProfile?.id || studentProfile?.userId;

          // ✅ مهم: تثبيت الدور حتى ما تطلع "لا تملك صلاحية"
          login({ ...studentProfile, role: "student" }, result.token);

          if (!studentId) {
            console.log("❌ studentId مش موجود داخل الاستجابة:", result);
            showError("❌ لم يتم العثور على studentId بعد التسجيل");
            return;
          }

          router.push(`/dashboard/studentDashboard?userId=${studentId}`);
        }

        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "", // ✅ reset
          grade: "",
          subject: "",
          role: "student",
        });
        setTeacherImage(null);
        setTeacherImagePreview(null);
      } else {
        // Handle error gracefully - don't throw
        const errorMessage = result.message || "حدث خطأ أثناء التسجيل";
        const cleanMessage = errorMessage.replace(/^❌\s*/, "").trim();
        setError(cleanMessage);
        showError(cleanMessage);
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("❌ خطأ في الاتصال بالخادم:", error);
      const errorMessage = error.message || "لا يمكن الاتصال بالخادم";
      const cleanMessage = errorMessage.replace(/^❌\s*/, "").trim();
      setError(cleanMessage);
      showError(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-100">
      <Link
        href="/"
        className="absolute top-6 left-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-blue-600 shadow-md transition hover:bg-white hover:text-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        🏠 العودة إلى الرئيسية
      </Link>
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          ✍️ إنشاء حساب جديد ( معلم او طالب ) ✍️
        </h2>

        <Head>
          <title>سجل الآن | منصة الشبح</title>
          <meta
            name="description"
            content="انضم إلى آلاف الطلاب الذين يراجعون يوميًا على منصة الشبح واحصل على أسئلة تفاعلية وتحليل أداء دقيق."
          />
          <meta
            name="keywords"
            content="تسجيل توجيهي, سجل الآن توجيهي, منصة الشبح, تسجيل منصة الشبح, توجيهي 2009, مراجعة توجيهي"
          />
        </Head>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ الاسم */}
          <div>
            <label className="block text-gray-700">👤 الاسم الكامل:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* ✅ البريد الإلكتروني */}
          <div>
            <label className="block text-gray-700">📧 البريد الإلكتروني:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* ✅ رقم الهاتف */}
          <div>
            <label className="block text-gray-700">📱 رقم الهاتف:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="07xxxxxxxx"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* ✅ كلمة المرور */}
          <div>
            <label className="block text-gray-700">🔑 كلمة المرور:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* ✅ تحديد نوع الحساب (طالب أو معلم) */}
          <div>
            <label className="block text-gray-700">🎭 نوع الحساب:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="student">طالب / معلم</option>
              <option value="student">🎓 طالب</option>
              <option value="teacher">👨‍🏫 معلم</option>
            </select>
          </div>

          {/* ✅ الصف الدراسي (للطالب فقط) */}
          {formData.role === "student" && (
            <div>
              <label className="block text-gray-700">📚 الصف الدراسي:</label>

              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="" disabled>
                  اختر الصف الدراسي
                </option>
                <option value="2009">طالب 2009</option>
                <option value="2008">طالب 2008</option>
                <option value="2007">طالب 2007</option>
              </select>
            </div>
          )}

          {/* ✅ المادة التي يدرسها المعلم (للمعلم فقط) */}
          {formData.role === "teacher" && (
            <div>
              <label className="block text-gray-700">
                📖 المادة التي تُدرس:
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required={formData.role === "teacher"}
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          )}

          {formData.role === "teacher" && (
            <div>
              <label className="block text-gray-700">🖼️ صورة المعلم:</label>
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleTeacherImageChange}
                required
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              />
              {teacherImagePreview && (
                <Image
                  src={teacherImagePreview}
                  alt="Teacher preview"
                  width={96}
                  height={96}
                  className="mt-2 h-24 w-24 rounded-full object-cover border"
                  unoptimized
                  priority
                />
              )}
            </div>
          )}

          {/* ✅ زر التسجيل */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
            disabled={loading}
          >
            {loading ? "⏳ جاري إنشاء الحساب..." : "✅ إنشاء الحساب"}
          </button>
        </form>

        {/* ✅ رابط العودة لتسجيل الدخول */}
        <div className="text-center mt-4">
          <p className="text-gray-600">لديك حساب بالفعل؟</p>
          <Link href="/auth/Login">
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              🚀 تسجيل الدخول
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
