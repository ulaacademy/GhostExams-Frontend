"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext"; // ✅ استيراد useAuth من AuthContext
import Link from "next/link";
import Head from "next/head";
import { showError, showSuccess } from "@/utils/toastHelper";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const getRedirectTarget = () => {
      const { redirect } = router.query;
      if (!redirect) return null;
      if (Array.isArray(redirect)) {
        return redirect[0] || null;
      }
      return redirect;
    };
// http://localhost:3001
    try {
      const response = await fetch(
        "https://ge-api.ghostexams.com/api/auth/login",
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Don't throw - handle error gracefully
        const errorMessage = result.message || "حدث خطأ أثناء تسجيل الدخول";
        // Clean message (remove emojis for cleaner display)
        const cleanMessage = errorMessage.replace(/^❌\s*/, '').trim();
        setError(cleanMessage);
        showError(cleanMessage);
        return;
      }

      // ✅ طباعة البيانات للتحقق من الهيكل
      console.log("📡 بيانات تسجيل الدخول:", result);

      const user = result.user;
      const userId = user?._id || user?.id || user?.userId;

      if (!userId || !user?.role) {
        // Don't throw - handle error gracefully
        const errorMessage = "بيانات المستخدم غير مكتملة";
        setError(errorMessage);
        showError(errorMessage);
        return;
      }

      login(user, result.token); // ✅ تخزين بيانات المستخدم في السياق
      showSuccess("تم تسجيل الدخول بنجاح");

      // ✅ التوجيه حسب الدور
      const redirectTargetValue = getRedirectTarget();
      if (redirectTargetValue && typeof redirectTargetValue === "string") {
        const safeRedirect =
          redirectTargetValue.startsWith("/") ? redirectTargetValue : "/";
        router.push(safeRedirect);
        return;
      }

      if (user.role === "teacher") {
        router.push(`/teacher?userId=${userId}`);
      } else {
        router.push(`/dashboard/studentDashboard?userId=${userId}`);
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("❌ خطأ في تسجيل الدخول:", error);
      const errorMessage = error.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول";
      const cleanMessage = errorMessage.replace(/^❌\s*/, '').trim();
      setError(cleanMessage);
      showError(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    // ✅ معالجة حالة الحظر
    const isBanned = router.query?.banned === "true" || router.query?.banned === true;
    if (isBanned) {
      setError("🚫 تم حظر حسابك. تواصل مع الدعم للمزيد.");
      // إزالة query parameter من URL
      router.replace("/auth/Login", undefined, { shallow: true });
      return;
    }

    const rawMessage = router.query?.message;
    const normalizedMessage = Array.isArray(rawMessage)
      ? rawMessage[0]
      : rawMessage || "";

    if (normalizedMessage === "loginRequired") {
      setInfoMessage("يرجى تسجيل الدخول لإكمال عملية الاشتراك.");
    } else if (normalizedMessage) {
      setInfoMessage(normalizedMessage);
    } else {
      setInfoMessage("");
    }
  }, [router.isReady, router.query?.message, router.query?.banned, router]);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-100">
      <Link
        href="/"
        className="absolute top-6 left-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-blue-600 shadow-md transition hover:bg-white hover:text-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        🏠 العودة إلى الرئيسية
      </Link>
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          🔐 تسجيل الدخول
        </h2>

        {infoMessage && (
          <div className="mt-4 mb-2 rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            {infoMessage}
          </div>
        )}

        <Head>
          <title>تسجيل الدخول | منصة الشبح </title>
          
                    <meta
            name="description"
            content="ادخل إلى حسابك على منصة الشبح لتبدأ رحلتك في حل امتحانات الذكاء الاصطناعي، الامتحانات الوزارية، وتحليل الأداء اليومي."
          />
          <meta
            name="keywords"
            content="تسجيل دخول, دخول توجيهي, منصة الشبح, توجيهي الأردن, مراجعة توجيهي, امتحانات توجيهي"
          />
        </Head>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block mt-4 mb-2 text-gray-700">
            📧 البريد الإلكتروني:
          </label>
          <input
            type="email"
            name="email" // ✅ أضف `name` لتحديد الحقل
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={formData.email} // ✅ استخدم `formData`
            onChange={handleChange} // ✅ استخدم `handleChange`
            required
          />

          <label className="block mt-4 mb-2 text-gray-700">
            🔑 كلمة المرور:
          </label>
          <input
            type="password"
            name="password" // ✅ أضف `name` لتحديد الحقل
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={formData.password} // ✅ استخدم `formData`
            onChange={handleChange} // ✅ استخدم `handleChange`
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 mt-4"
            disabled={loading}
          >
            {loading ? "⏳ جاري تسجيل الدخول..." : "🚀 تسجيل الدخول"}
          </button>
        </form>

        {/* ✅ نسيت كلمة المرور؟ */}
        <div className="text-right text-sm mt-2">
          <Link href="/auth/reset-password">
            <span className="text-blue-500 hover:underline cursor-pointer">
              🔑 نسيت كلمة المرور؟
            </span>
          </Link>
        </div>

        {/* ✅ رابط إنشاء حساب جديد */}
        <div className="text-center mt-4">
          <p className="text-gray-600">ليس لديك حساب؟</p>
          <Link href="/auth/Register">
            <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
              ✍️ إنشاء حساب جديد
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
