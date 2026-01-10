import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import { fetchUserId, logoutUser } from "../services/api"; // ✅ استيراد `fetchUserId` و `logoutUser` من API

// ✅ إنشاء `AuthContext`
const AuthContext = createContext();

// ✅ المزوّد (Provider) لتخزين بيانات المستخدم
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  // ✅ تسجيل الخروج مع `useCallback` لمنع إعادة تعريفه
  const logout = useCallback(async () => {
    try {
      // ✅ استدعاء API للخروج وحذف التوكن من localStorage
      await logoutUser();
      
      // ✅ تنظيف الحالة المحلية
      setUser(null);
      setToken(null);
      setUserId(null);
      
      console.log("✅ تم تسجيل الخروج بنجاح");
      
      // ✅ إعادة توجيه لصفحة تسجيل الدخول
      router.push("/auth/Login");
    } catch (error) {
      console.error("❌ خطأ في تسجيل الخروج:", error);
      // ✅ حتى لو فشل، نظف الحالة المحلية
      setUser(null);
      setToken(null);
      setUserId(null);
      localStorage.removeItem("token");
      router.push("/auth/Login");
    }
  }, [router]);

  // ✅ استعادة بيانات المستخدم عند تحميل التطبيق
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        // ✅ تحقق مما إذا كان التوكن صالحًا قبل فك تشفيره
        if (typeof storedToken !== "string") {
          console.warn("⚠️ التوكن غير صالح أو غير موجود");
          localStorage.removeItem("token"); // ✅ إزالة التوكن الفاسد
          return;
        }

        const decodedUser = jwtDecode(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
        console.log("✅ تم فك تشفير التوكن بنجاح:", decodedUser);

        // 🔹 جلب userId من API بدلاً من `jwtDecode`
        fetchUserId()
          .then((id) => {
            if (id) {
              setUserId(id);
              console.log("✅ تم استرجاع userId من API:", id);
            } else {
              console.warn("⚠️ لم يتم العثور على userId في API");
              // لا نقوم بـ logout هنا، فقط نسجل تحذير
            }
          })
          .catch((error) => {
            console.error("❌ خطأ أثناء جلب userId:", error);
            // لا نقوم بـ logout هنا أيضاً
          });
      } catch (error) {
        console.error("❌ خطأ في فك تشفير التوكن:", error);
        localStorage.removeItem("token"); // ✅ إزالة التوكن الفاسد
        logout(); // ✅ تسجيل خروج إذا كان هناك خطأ
      }
    }
  }, [logout]); // ✅ إزالة userId من dependencies لمنع infinite loop

  // ✅ تسجيل الدخول وتخزين البيانات
  const login = (userData, authToken) => {
    try {
      console.log("🔎 بيانات المستخدم عند تسجيل الدخول:", userData);
      console.log("🔎 قيمة authToken:", authToken);
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("token", authToken); // ✅ تخزين التوكن في `localStorage`

      // ✅ استخراج userId مباشرة من userData بدلاً من استدعاء API
      const userId = userData?._id || userData?.id || userData?.userId;
      if (userId) {
        setUserId(userId);
        console.log("✅ تم تعيين userId من بيانات المستخدم:", userId);
      } else {
        console.warn("⚠️ لم يتم العثور على userId في بيانات المستخدم");
      }
    } catch (error) {
      console.error("❌ خطأ في تسجيل الدخول:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId, token, authToken: token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ دالة للوصول إلى بيانات المستخدم في أي مكون
export const useAuth = () => useContext(AuthContext);
