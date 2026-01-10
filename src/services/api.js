// ✅ استيراد axios لجلب البيانات
import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ge-api.ghostexams.com/api";
// ✅ يمكن ضبطه من خلال متغير البيئة

// export const API_URL = "http://localhost:3000/api";

// ✅ Helper function to create proper error objects for axios interceptor
const createApiError = (message, status = 400) => {
  const error = new Error(message.replace(/^❌\s*/, "").trim());
  error.response = { status, data: { message: error.message } };
  return error;
};
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL غير مضبوط. يتم الإفتراضي إلى https://ge-api.ghostexams.com/api. اضبط المتغير في ملف .env.local لتجنب أخطاء الاتصال."
  );
}

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  // ✅ إعداد axios interceptor لإضافة التوكن تلقائياً لجميع الطلبات
  axios.interceptors.request.use(
    (config) => {
      // ✅ إضافة التوكن من localStorage إذا كان موجوداً
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ✅ إعداد axios interceptor لمعالجة الأخطاء تلقائياً
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // ✅ معالجة خطأ 401 (غير مصرح) - خاص
      if (error.response?.status === 401) {
        console.warn("⚠️ انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
        localStorage.removeItem("token");

        // عرض رسالة الخطأ باستخدام Toast
        if (typeof window !== "undefined") {
          const errorMessage =
            error.response?.data?.message ||
            "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى";

          const toastEvent = new CustomEvent("show-toast", {
            detail: {
              message: errorMessage,
              type: "error",
              duration: 5000,
            },
          });
          window.dispatchEvent(toastEvent);

          // إعادة توجيه إلى صفحة تسجيل الدخول بعد تأخير قصير
          setTimeout(() => {
            window.location.href = "/auth/Login";
          }, 2000);
        }
      } else {
        // ✅ عرض رسالة الخطأ باستخدام Toast للأخطاء الأخرى
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً";

        if (typeof window !== "undefined") {
          const toastEvent = new CustomEvent("show-toast", {
            detail: {
              message: errorMessage,
              type: "error",
              duration: 5000,
            },
          });
          window.dispatchEvent(toastEvent);
        }

        // ✅ تسجيل الخطأ الكامل في console للمطورين فقط
        console.error("❌ [API Error]", {
          status: error.response?.status,
          message: errorMessage,
          url: error.config?.url,
          method: error.config?.method,
        });
      }

      return Promise.reject(error);
    }
  );
}

// ✅ دالة عامة لجلب البيانات من API باستخدام fetch
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        return []; // ✅ إرجاع مصفوفة فارغة بدلًا من خطأ
      }
      // Create error object that matches axios format
      const error = new Error(`فشل في جلب البيانات`);
      error.response = {
        status: response.status,
        data: { message: error.message },
      };
      throw error;
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [fetchData Error]:", error);
    throw error;
  }
};

// ✅ جلب امتحانات الذكاء الاصطناعي
export const fetchAIExams = () => fetchData(`${API_URL}/exams/ai`);

// ✅ جلب امتحانات المعلمين
export const fetchTeacherExams = () => fetchData(`${API_URL}/exams/teacher`);

// ✅ جلب الامتحانات المدرسية
export const fetchSchoolExams = () => fetchData(`${API_URL}/exams/school`);

// ✅ جلب الامتحانات الكتب المدرسية
export const fetchBooksExams = () => fetchData(`${API_URL}/exams/books`);

// ✅ جلب جميع الامتحانات
export const fetchAllExams = () => fetchData(`${API_URL}/exams`);

// ✅ رفع ملف Excel واستيراد الأسئلة إلى قاعدة البيانات
export const uploadExcelQuestions = async (
  { file, examTitle, grade, term, subject, unit, difficultyLevel },
  token
) => {
  if (!file) {
    const error = new Error("يرجى اختيار ملف Excel أولاً");
    error.response = { status: 400, data: { message: error.message } };
    throw error;
  }

  if (!examTitle || !examTitle.trim()) {
    const error = new Error("يرجى إدخال عنوان الامتحان");
    error.response = { status: 400, data: { message: error.message } };
    throw error;
  }

  if (!token) {
    const error = new Error("يجب تسجيل الدخول لرفع الملف");
    error.response = { status: 401, data: { message: error.message } };
    throw error;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("examTitle", examTitle.trim());

  if (grade) formData.append("grade", grade);
  if (term) formData.append("term", term);
  if (subject) formData.append("subject", subject);
  if (unit) formData.append("unit", unit);
  if (difficultyLevel) formData.append("difficultyLevel", difficultyLevel);

  const response = await fetch(`${API_URL}/files/import-excel-questions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.message ||
      "❌ فشل رفع الملف. يرجى التأكد من التنسيق والمحاولة مجددًا.";
    const error = new Error(errorMessage);
    error.details = result?.errors || result?.details;
    throw error;
  }

  return result;
};

// ✅ جلب امتحانات المكس (الامتحانات المختلطة)
export const fetchMixedExams = () => fetchData(`${API_URL}/exams/mixed`);

// ✅ جلب امتحانات الوزارية المخزنة في قاعدة البيانات
export const fetchMinistryExams = () => fetchData(`${API_URL}/exams/ministry`);

// ✅ جلب امتحانات Ghost Examinations
export const fetchGhostExams = () => fetchData(`${API_URL}/exams/ghost`);

// ✅ جلب امتحان Ghost محدد بالـ ID
export const fetchGhostExamById = async (examId) => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.get(
      `${API_URL}/exams/get-exam/ghost/${examId}`
    );
    return response.data;
  } catch (error) {
    // Error is handled by axios interceptor (Toast + redirect if 401)
    console.error(
      "❌ خطأ في جلب امتحان Ghost:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ جلب الخطط النشطة
export const fetchActivePlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/plans/active`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب الخطط النشطة:",
      error.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};

// ✅ جلب خطة واحدة بالـ ID
export const fetchPlanById = async (planId) => {
  try {
    const response = await axios.get(`${API_URL}/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب الخطة:",
      error.response?.data || error.message
    );
    return { success: false, data: null };
  }
};

// =========================
// ✅ Student Plans (NEW)
// =========================

// ✅ جلب الخطط النشطة للطلاب
export const fetchActiveStudentPlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/student-plans/active`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب خطط الطلاب النشطة:",
      error.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};

// ✅ جلب جميع خطط الطلاب (للإدارة أو الداشبورد لاحقًا)
export const fetchAllStudentPlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/student-plans`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب جميع خطط الطلاب:",
      error.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};

// ✅ جلب خطة طالب واحدة بالـ ID
export const fetchStudentPlanById = async (planId) => {
  try {
    const response = await axios.get(`${API_URL}/student-plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب خطة الطالب:",
      error.response?.data || error.message
    );
    return { success: false, data: null };
  }
};

// ✅ جلب محاكاة الطالب
export const fetchStudentSimulations = async (studentId) => {
  if (!studentId) {
    throw createApiError("معرف الطالب مطلوب", 400);
  }

  try {
    const response = await axios.get(
      `${API_URL}/exam-generation/get-student-simulations`,
      {
        params: { studentId },
      }
    );
    return response.data?.simulations || [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }

    console.error(
      "❌ خطأ في جلب محاكاة الطالب:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ إنشاء اشتراك للمعلم
export const createTeacherSubscription = async (subscriptionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/subscriptions`,
      subscriptionData
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في إنشاء الاشتراك:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ جلب اشتراكات المعلم
export const fetchTeacherSubscriptions = async (teacherId) => {
  try {
    const response = await axios.get(
      `${API_URL}/subscriptions/teacher/${teacherId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب اشتراكات المعلم:",
      error.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};

// ✅ جلب الاشتراك النشط للمعلم
export const fetchActiveSubscription = async (teacherId) => {
  try {
    const response = await axios.get(
      `${API_URL}/subscriptions/teacher/${teacherId}/active`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب الاشتراك النشط:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ إنشاء اشتراك للطالب
export const createStudentSubscription = async (subscriptionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/student-subscriptions`,
      subscriptionData
    );
    return response.data;
  } catch (error) {
    // ✅ إذا الطالب عنده طلب Pending أو اشتراك Active (الـ backend بيرجع 409)
    // رجّع رسالة الباك كـ response طبيعي بدل ما يصير AxiosError
    if (error?.response?.status === 409) {
      return error.response.data; // فيها success:false + message
    }

    // باقي الأخطاء خليها تطلع مثل قبل (عشان تعرف إذا في مشكلة حقيقية)
    throw error;
  }
};

// ✅ جلب اشتراكات الطالب
export const fetchStudentSubscriptions = async (studentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/subscriptions/student/${studentId}`
    );
    return response.data;
  } catch (error) {
    // 404 = الطالب جديد وما عنده اشتراكات → رجّع فاضي بدون رسائل مزعجة
    if (error?.response?.status === 404) {
      return { success: true, data: [] };
    }

    console.error(
      "❌ خطأ في جلب اشتراكات الطالب:",
      error.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};

// ✅ جلب الاشتراك النشط للطالب
export const fetchActiveStudentSubscription = async (studentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/subscriptions/student/${studentId}/active`
    );
    return response.data;
  } catch (error) {
    // 404 أو عدم وجود اشتراك → null
    if (error?.response?.status === 404) return null;

    console.error(
      "❌ خطأ في جلب الاشتراك النشط للطالب:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ جلب حالة اشتراك الطالب (active/pending)
export const fetchMyStudentSubscriptionStatus = async () => {
  const response = await axios.get(`${API_URL}/student-subscriptions/me`);
  return response.data;
};

// ✅ جلب امتحانات بناءً على القسم والصف والفصل الدراسي والمادة
export const fetchExamsByCriteria = (examType, grade, term, subject) => {
  const url = `${API_URL}/exams?examType=${examType}&grade=${grade}&term=${term}&subject=${subject}`;
  return fetchData(url);
};

// ✅ جلب بيانات الامتحان والأسئلة بناءً على examId أو الفلترة
export const fetchExamQuestions = async (
  examId,
  grade,
  term,
  subject,
  userId,
  examType // ✅ تحديد نوع الامتحان
) => {
  console.log(`📡 طلب جلب الامتحان ID: ${examId}, النوع: ${examType}`);

  try {
    let response;

    if (examId) {
      console.log(`📡 جلب الامتحان باستخدام examId: ${examId}`);

      // ✅ استخدم API صحيحة بناءً على `examType`
      const apiEndpoint =
        examType === "ministry"
          ? `${API_URL}/exams/ministry/get-exam/${examId}` // 🔹 المسار الصحيح للوزارة
          : `${API_URL}/exams/get-exam/${examId}`; // 🔹 لجميع الأقسام الأخرى

      response = await axios.get(apiEndpoint);
    } else {
      console.log(
        `📡 جلب الامتحان بناءً على الفلترة: ${subject}, ${grade}, ${term}`
      );
      response = await axios.get(`${API_URL}/questions/get-exam-questions`, {
        params: { grade, term, subject, userId, examType },
      });
    }

    // ✅ التأكد من وجود البيانات
    if (!response.data || !response.data.exam) {
      console.error("❌ لم يتم العثور على بيانات الامتحان.");
      return null;
    }

    console.log("✅ تم جلب بيانات الامتحان بنجاح:", response.data.exam);
    return response.data.exam; // ✅ إرجاع بيانات الامتحان بالكامل
  } catch (error) {
    console.error(
      "❌ خطأ في جلب بيانات الامتحان:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ جلب بيانات امتحان مختلط بناءً على examId و userId
export const fetchMixedExamQuestions = async (examId, userId) => {
  console.log(`📡 طلب جلب امتحان مختلط ID: ${examId}`);

  try {
    const response = await axios.get(
      `${API_URL}/exams/get-exam/mixed/${examId}`,
      {
        params: { userId },
      }
    );

    if (!response.data || !response.data.exam) {
      console.error("❌ لم يتم العثور على بيانات الامتحان المختلط.");
      return null;
    }

    console.log("✅ تم جلب بيانات الامتحان المختلط بنجاح:", response.data.exam);
    return response.data.exam;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب بيانات الامتحان المختلط:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ تسجيل إجابة الطالب على السؤال ومعالجة الذكاء الاصطناعي

const correctAnswersMapping = {
  أ: ["أ", "A"],
  ب: ["ب", "B"],
  ج: ["ج", "C"],
  د: ["د", "D"],
  A: ["أ", "A"],
  B: ["ب", "B"],
  C: ["ج", "C"],
  D: ["د", "D"],
};

export const submitStudentAnswer = async (
  examId,
  userId,
  questionId,
  selectedAnswer,
  examType,
  correctAnswer = null // ✅ إضافة correctAnswer كـ parameter اختياري
) => {
  try {
    console.log("📡 إرسال إجابة الطالب...");
    console.log("🆔 examId:", examId);
    console.log("👤 userId:", userId);
    console.log("❓ questionId:", questionId);
    console.log("📌 نوع الامتحان قبل التصحيح:", examType);
    console.log("🔵 الإجابة المختارة:", selectedAnswer);

    // ✅ **دالة لتنظيف وتحسين مقارنة الإجابات**
    const normalizeText = (text) =>
      text
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, " ") // ✅ إزالة المسافات الزائدة داخل النص
        .replace(/[.,!?،؛ـ]/g, "") // ✅ إزالة علامات الترقيم
        .replace(/^الإجابة الصحيحة هي:\s*/, "") // ✅ إزالة النص الزائد
        .normalize("NFD") // ✅ إزالة التشكيل والأحرف غير المرئية
        .replace(/[\u064B-\u065F]/g, ""); // ✅ إزالة الحركات والتشكيل في العربية

    // ✅ **ضبط `examType` بناءً على `examData.source`**
    const validExamTypes = [
      "teacher",
      "school",
      "books",
      "mixed",
      "ministry",
      "ghost",
    ];
    if (!examType || !validExamTypes.includes(examType)) {
      console.warn(
        "⚠️ نوع الامتحان غير صحيح، سيتم تعيينه بناءً على `examData.source`."
      );
      examType = "ghost"; // ✅ افتراضي لـ Ghost Exams إذا لم يتم تحديده
    }

    console.log("📌 نوع الامتحان بعد التصحيح:", examType);

    // ✅ **تحديد المسار الصحيح بناءً على نوع الامتحان**
    const endpoint =
      examType === "ministry"
        ? `${API_URL}/ministry-exams/submit`
        : `${API_URL}/exams/submit`;

    // ✅ **استخدام `correctAnswer` من المعاملات**
    // ✅ **حساب score قبل الإرسال إذا كان correctAnswer متوفراً**
    let calculatedScore = 0;
    let correctAnswerFromDB = correctAnswer || "";

    if (correctAnswer && examType !== "ministry") {
      const cleanedSelected = normalizeText(selectedAnswer);
      const cleanedCorrect = normalizeText(correctAnswer);
      calculatedScore = cleanedSelected === cleanedCorrect ? 1 : 0;
      console.log("✅ تم حساب score قبل الإرسال:", calculatedScore);
    }

    // ✅ **إعداد بيانات الطلب**
    let requestData = {
      examId,
      userId,
      questionId,
      correctAnswer: correctAnswerFromDB,
      selectedAnswer: normalizeText(selectedAnswer), // ✅ تنظيف الإجابة المختارة
      examType,
    };

    // ✅ **إضافة `score` و `totalQuestions` فقط للأقسام غير `ministry`**
    if (examType !== "ministry") {
      requestData.score = calculatedScore; // ✅ استخدام الـ score المحسوب
      requestData.totalQuestions = 10; // ✅ تحديد العدد الإجمالي للأسئلة
      requestData.isFinalSubmission = false; // ✅ تحديد أنه ليس إنهاء نهائي
    }

    console.log("📡 إرسال البيانات إلى:", endpoint);
    console.log("📡 بيانات الطلب:", JSON.stringify(requestData, null, 2));
    console.log("📡 استعلام قاعدة البيانات لاستخراج الإجابة الصحيحة...");
    console.log("🔍 نوع الامتحان:", examType);
    console.log("🔍 استعلام قاعدة البيانات عن السؤال:", questionId);
    console.log("🔍 استعلام قاعدة البيانات عن السؤال:", correctAnswer);

    // ✅ **إرسال الإجابة إلى السيرفر**
    const response = await axios.post(endpoint, requestData);
    if (!response.data) {
      throw new Error("❌ لم يتم استلام بيانات من الخادم");
    }
    console.log("✅ البيانات المسترجعة من الخادم:", response.data);
    console.log(
      "🔵 الإجابة الصحيحة المسترجعة من الخادم:",
      response.data.correctAnswer
    );

    // ✅ **تعريف `correctAnswer` وتنظيفه من النص الزائد**
    let { explanation } = response.data;

    correctAnswer = response.data.correctAnswer
      ? normalizeText(response.data.correctAnswer) // ✅ تنظيف الإجابة الصحيحة بعد استرجاعها
      : "❌ لم يتم العثور على إجابة صحيحة.";

    console.log("🔵 الإجابة الصحيحة المسترجعة بعد التصحيح:", correctAnswer);
    console.log("🔍 التحقق من correctAnswersMapping:");
    console.log("🔵 correctAnswer:", correctAnswer);
    console.log("🔵 selectedAnswer:", normalizeText(selectedAnswer));

    // ✅ **تصحيح مقارنة الإجابات**
    const isCorrect =
      examType === "ministry"
        ? correctAnswersMapping[correctAnswer] &&
          Array.isArray(correctAnswersMapping[correctAnswer]) &&
          correctAnswersMapping[correctAnswer].includes(
            normalizeText(selectedAnswer)
          )
        : normalizeText(selectedAnswer) === normalizeText(correctAnswer);

    console.log("🔍 الإجابة الصحيحة من قاعدة البيانات:", correctAnswer);
    console.log("🔵 الإجابة المختارة من الطالب:", selectedAnswer);
    console.log("✅ هل الإجابة صحيحة؟", isCorrect);

    // ✅ **إضافة `score` إذا لم يكن `ministry`**
    if (examType !== "ministry") {
      requestData.score = isCorrect ? 1 : 0;
      console.log(
        isCorrect
          ? `✅ تمت إضافة +1 إلى السكور`
          : "❌ لم يتم إضافة أي نقاط، الإجابة خاطئة."
      );
      console.log("✅ تم تحديث الـ score قبل الإرسال:", requestData.score);
    }

    return {
      correct: isCorrect,
      correctAnswer,
      explanation,
      score: requestData.score,
    };
  } catch (error) {
    console.error("❌ خطأ أثناء إرسال الإجابة:", error);
    return null;
  }
};

export const generateExplanation = async (questionText) => {
  try {
    const response = await fetch(`${API_URL}/exam/generate-explanation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionText }),
    });

    if (!response.ok) {
      const error = new Error("فشل جلب الشرح من الذكاء الاصطناعي");
      error.response = {
        status: response.status,
        data: { message: error.message },
      };
      throw error;
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الشرح:", error);
    return "❌ حدث خطأ أثناء جلب الشرح.";
  }
};

// ✅ تسجيل إعجاب على السؤال (لايك)
export const likeQuestion = async (questionId) => {
  try {
    const response = await axios.post(`${API_URL}/questions/like`, {
      questionId,
    });

    return response.data; // تأكد من أن الباك إند يُرجع `{ likes: 10 }`
  } catch (error) {
    console.error(
      "❌ خطأ في تسجيل الإعجاب بالسؤال:",
      error.response?.data || error.message
    );
    return { likes: 0 }; // **في حالة الخطأ، إرجاع 0 بدلاً من undefined**
  }
};

// ✅ الاستماع إلى السؤال باستخدام TTS
export const listenToQuestion = async (questionText) => {
  try {
    const response = await axios.post(
      `${API_URL}/tts`,
      { text: questionText },
      { responseType: "blob" }
    );

    if (response.data) {
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  } catch (error) {
    console.error(
      "❌ خطأ في تشغيل الصوت:",
      error.response?.data || error.message
    );
  }
};

// ✅ استدعاء توليد امتحان جديد بناءً على طلب الطالب
export const generateTeacherExam = async (grade, term, subject, userId) => {
  try {
    console.log("📡 إرسال طلب إنشاء امتحان مع البيانات:", {
      grade,
      term,
      subject,
      userId,
    });

    const response = await axios.post(
      `${API_URL}/exams/generate-teacher-exam`,
      { grade, term, subject, userId }
    );

    console.log("✅ استجابة السيرفر:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ خطأ أثناء إنشاء الامتحان:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ استدعاء توليد امتحان جديد بناءً على طلب الطالب
export const generateSchoolExam = async (grade, term, subject, userId) => {
  try {
    console.log("📡 إرسال طلب إنشاء امتحان مع البيانات:", {
      grade,
      term,
      subject,
      userId,
    });

    const response = await axios.post(`${API_URL}/exams/generate-school-exam`, {
      grade,
      term,
      subject,
      userId,
    });

    console.log("✅ استجابة السيرفر:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ خطأ أثناء إنشاء الامتحان:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ استدعاء توليد امتحان جديد بناءً على طلب الطالب
export const generateBooksExam = async (grade, term, subject, userId) => {
  try {
    console.log("📡 إرسال طلب إنشاء امتحان مع البيانات:", {
      grade,
      term,
      subject,
      userId,
    });

    const response = await axios.post(`${API_URL}/exams/generate-books-exam`, {
      grade,
      term,
      subject,
      userId,
    });

    console.log("✅ استجابة السيرفر:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ خطأ أثناء إنشاء الامتحان:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const fetchAIExplanation = async (questionText) => {
  try {
    console.log("📡 إرسال طلب شرح السؤال:", questionText);

    const response = await fetch(`${API_URL}/exam/generate-explanation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionText, maxTokens: 500 }), // ✅ تحديد الحد الأقصى للحروف
    });

    console.log("📡 استجابة HTTP:", response.status); // ✅ تتبع كود الاستجابة

    if (!response.ok) {
      const error = new Error("فشل جلب الشرح من الذكاء الاصطناعي");
      error.response = {
        status: response.status,
        data: { message: error.message },
      };
      throw error;
    }

    const data = await response.json();
    console.log("✅ استجابة API:", data); // ✅ تتبع البيانات المستلمة

    // ✅ تحقق من وجود شرح صحيح
    if (!data?.explanation?.trim()) {
      console.warn("⚠️ لم يتم العثور على شرح صالح، سيتم إرجاع النص الافتراضي.");
      return "❌ لا يوجد شرح متاح.";
    }

    // ✅ تنظيف الشرح وإزالة السؤال منه
    const explanation = data.explanation.replace(/^.*?: /, "").trim();

    return explanation.length > 500
      ? explanation.slice(0, 500) + "..."
      : explanation; // ✅ تقصير الشرح إلى 500 حرف كحد أقصى
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الشرح:", error);
    return "❌ حدث خطأ أثناء جلب الشرح.";
  }
};

export const fetchUserId = async () => {
  try {
    const token = localStorage.getItem("token"); // ✅ جلب التوكن من localStorage
    if (!token) {
      console.warn("❌ لم يتم العثور على التوكن، تأكد من تسجيل الدخول");
      return null;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      credentials: "include", // ✅ يرسل الجلسة أو الكوكيز
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ إرسال التوكن
      },
    });

    if (!response.ok) {
      // ✅ تعامل لطيف مع الأخطاء بدل الرمي
      let errorBody = null;
      try {
        errorBody = await response.json();
      } catch {
        // Ignore parsing errors
      }
      console.warn(
        "⚠️ فشل جلب الملف الشخصي:",
        response.status,
        response.statusText,
        errorBody
      );
      return null;
    }

    const data = await response.json();
    console.log("✅ البيانات المسترجعة من API:", data); // 🔎 تتبع البيانات المسترجعة
    return data.userId; // ✅ إعادة userId فقط
  } catch (error) {
    console.error("❌ خطأ أثناء جلب userId:", error);
    return null;
  }
};

export const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("❌ لا يوجد توكن، لا يمكن جلب الملف الشخصي.");
      return null;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorBody = null;
      try {
        errorBody = await response.json();
      } catch {
        // ignore
      }
      console.warn(
        "⚠️ فشل جلب الملف الشخصي:",
        response.status,
        response.statusText,
        errorBody
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الملف الشخصي:", error);
    return null;
  }
};

// ✅ تسجيل الخروج
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ لا يوجد توكن للخروج");
      return { success: true };
    }

    const response = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ حذف التوكن من localStorage
    localStorage.removeItem("token");
    console.log("✅ تم تسجيل الخروج بنجاح وحذف التوكن");

    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في تسجيل الخروج:",
      error.response?.data || error.message
    );
    // ✅ حتى لو فشل الطلب، احذف التوكن من localStorage
    localStorage.removeItem("token");
    return { success: true, message: "تم تسجيل الخروج محلياً" };
  }
};

// ✅ نتيجة افتراضية "صفر" للطالب الجديد
const buildZeroLatestResult = (userId) => ({
  userId,
  score: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  performancePercentage: 0,
  subject: null,
  grade: null,
  term: null,
  examId: null,
  createdAt: new Date().toISOString(),
  isDefault: true, // 🔸 تمييز أنها نتيجة افتراضية
});

export const fetchLatestExamResult = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/exams/latest-result/${userId}`
    );

    // إذا رجع 200 بس ما في latestResult
    const latest = response.data?.latestResult;
    if (!latest) return buildZeroLatestResult(userId);

    return latest;
  } catch (error) {
    // ✅ الطالب جديد: السيرفر يرجع 404 -> لا نطبع ولا نرمي Error
    if (error?.response?.status === 404) {
      return buildZeroLatestResult(userId);
    }

    // أي خطأ ثاني: برضه ما نطلع مسجات للطالب، ونرجّع صفر
    return buildZeroLatestResult(userId);
  }
};

export const fetchUserExamResults = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/exams/results/${userId}`);
    const results = response.data?.results;

    // إذا ما في نتائج، رجّع "نتيجة صفر" داخل array عشان الرسوم ما تخرب
    if (!Array.isArray(results) || results.length === 0) {
      return [buildZeroLatestResult(userId)];
    }

    return results;
  } catch (error) {
    // ✅ الطالب جديد: 404 -> رجّع نتيجة صفر بدون أي رسالة
    if (error?.response?.status === 404) {
      return [buildZeroLatestResult(userId)];
    }

    // أي خطأ ثاني: نفس الشي
    return [buildZeroLatestResult(userId)];
  }
};

export const fetchStudentPerformance = async (userId) => {
  try {
    console.log("📡 طلب بيانات الأداء لـ:", userId); // ✅ للتأكد من أن userId يتم تمريره
    const response = await axios.get(
      `${API_URL}/student-performance/get-student-performance?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب بيانات الأداء:",
      error.response?.data || error
    );
    return null;
  }
};

export const generateMixedExam = async (grade, term, subject, userId) => {
  try {
    console.log("📡 إرسال طلب إنشاء امتحان مختلط:", {
      grade,
      term,
      subject,
      userId,
    });

    const response = await axios.post(
      `${API_URL}/exams/generate-mixed-exam`, // 🔹 التأكد من استخدام الرابط الصحيح
      { grade, term, subject, userId }
    );

    console.log("✅ استجابة السيرفر:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ خطأ أثناء إنشاء الامتحان المختلط:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ دالة لإنشاء امتحان وزاري جديد
export const generateMinistryExam = async (grade, term, subject, userId) => {
  try {
    console.log("📌 إرسال طلب إلى API:", `${API_URL}/generate-ministry-exam`);
    console.log("📌 البيانات المرسلة:", {
      grade,
      term,
      subject,
      userId,
      examType: "ministry",
    });

    const response = await axios.post(
      `${API_URL}/exams/ministry/generate-ministry-exam`, // ✅ تأكد من صحة المسار
      {
        grade,
        term,
        subject,
        userId,
        examType: "ministry", // ✅ إضافة examType لضمان تخزين الامتحان بشكل صحيح
      }
    );

    console.log("✅ استجابة API:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الامتحان الوزاري:", error);
    return null;
  }
};

export const createTeacherExam = async (examData) => {
  try {
    // Let axios interceptor handle token automatically
    // If no token, backend returns 401 and interceptor handles it
    const response = await axios.post(
      `${API_URL}/exams/custom-exams/create`,
      examData
    );
    return response.data;
  } catch (error) {
    // Error is handled by axios interceptor (Toast + redirect if 401/403)
    console.error("❌ فشل في إرسال امتحان المعلم:", error);
    throw error;
  }
};

export const fetchTeacherCustomExams = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return [];

    // ✅ فقط امتحانات المعلم الافتراضي (Ghost) — endpoint مباشر
    const res = await axios.get(`${API_URL}/student/ghost-teacher-exams`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ فشل في جلب امتحانات المعلم الافتراضي:", error);
    return [];
  }
};

// 🔥 دالة جديدة لجلب بيانات teacher dashboard
export const fetchTeacherDashboardMetrics = async () => {
  try {
    // Let axios interceptor handle token automatically
    // If no token, backend returns 401 and interceptor handles it
    const response = await axios.get(`${API_URL}/teacher/dashboard-metrics`);
    return response.data;
  } catch (error) {
    // Error is handled by axios interceptor (Toast + redirect if 401/403)
    console.error("❌ خطأ في جلب بيانات الداشبورد:", error);
    throw error;
  }
};

// ✅ جلب أداء الطلاب لامتحانات المعلم
export const fetchTeacherStudentsPerformance = async (authToken) => {
  try {
    const response = await fetch(
      `${API_URL}/teacher-dashboard/students-performance`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("❌ فشل في تحميل بيانات الطلاب");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ خطأ أثناء تحميل بيانات أداء الطلاب:", error);
    throw error;
  }
};

export const fetchTeacherCustomExamsWithResults = async () => {
  try {
    // Let axios interceptor handle token automatically
    console.log(
      "📡 جلب امتحانات المعلم من:",
      `${API_URL}/teacher/custom-exams/with-results`
    );

    const response = await axios.get(
      `${API_URL}/teacher/custom-exams/with-results`
    );

    console.log("✅ استجابة API:", response.data);

    // ✅ التحقق من بنية البيانات المسترجعة
    if (response.data && response.data.exams) {
      console.log("✅ تم جلب", response.data.exams.length, "امتحان");
      return response.data.exams;
    } else if (Array.isArray(response.data)) {
      // ✅ في حالة كانت البيانات مصفوفة مباشرة
      console.log("✅ تم جلب", response.data.length, "امتحان (مصفوفة مباشرة)");
      return response.data;
    } else {
      console.warn("⚠️ البيانات المسترجعة غير متوقعة:", response.data);
      return [];
    }
  } catch (error) {
    // Error is handled by axios interceptor (Toast + redirect if 401)
    console.error("❌ خطأ في جلب امتحانات المعلم:", error);
    throw error;
  }
};

// 🔥 تسجيل نتيجة امتحان الطالب (امتحانات المعلمين)
export const submitTeacherExamResult = async (resultData) => {
  try {
    const response = await axios.post(
      `${API_URL}/teacher-exam-results/submit`,
      resultData
    );
    return response.data;
  } catch (error) {
    console.error("❌ فشل في تسجيل نتيجة امتحان المعلم:", error);
    throw error;
  }
};

// ✅ جلب عدد الطلاب الذين قدموا امتحان معين
export const fetchExamStudentsCount = async (examId) => {
  try {
    const token = localStorage.getItem("token");

    // ✅ التحقق من وجود التوكن قبل إرسال الطلب
    if (!token) {
      console.warn("⚠️ لم يتم العثور على التوكن، يرجى تسجيل الدخول");
      return 0; // إرجاع 0 بدلاً من إعادة التوجيه لهذه الدالة (لأنها تُستدعى من داخل component)
    }

    const response = await axios.get(
      `${API_URL}/teacher/exams/${examId}/students-count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.count;
  } catch (error) {
    // ✅ معالجة خطأ 401 (غير مصرح)
    if (error.response?.status === 401) {
      console.warn("⚠️ انتهت صلاحية الجلسة");
      localStorage.removeItem("token");
      // لا نعيد التوجيه هنا لأنه سيتم من الدالة الرئيسية
      return 0;
    }
    console.error("❌ فشل في جلب عدد الطلاب للامتحان:", error);
    return 0; // إرجاع 0 في حالة الخطأ
  }
};

// ✅ دالة جديدة تجيب بيانات الطلاب مع دعم pagination و sorting
export const fetchAllTeacherStudentsPerformance = async (params = {}) => {
  try {
    // Let axios interceptor handle token automatically
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "totalExams",
      sortOrder = "desc",
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (search.trim()) {
      queryParams.append("search", search.trim());
    }

    const response = await axios.get(
      `${API_URL}/teacher-dashboard/students-performance?${queryParams.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("❌ خطأ أثناء تحميل بيانات الطلاب:", error);
    throw error;
  }
};

export const fetchActiveTeachersWithPlans = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/teacher-students/all-teachers`
    );
    return response.data?.teachers ?? [];
  } catch (error) {
    console.error(
      "❌ خطأ في جلب قائمة المعلمين النشطين:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const subscribeToTeacher = async ({
  teacherId,
  studentId,
  type = "basic",
  startDate,
  endDate,
}) => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.post(`${API_URL}/teacher-students/subscribe`, {
      teacherId,
      studentId,
      type,
      startDate,
      endDate,
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في الاشتراك بالمعلم:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        message: "❌ فشل الاشتراك بالمعلم.",
      }
    );
  }
};

// ✅ دالة مساعدة لتطبيع رابط المشاركة لاستخدام رابط الإنتاج
const normalizeShareUrl = (url) => {
  if (!url) return url;

  // ✅ استبدال أي رابط localhost برابط الإنتاج
  const productionDomain = "https://ghostexams.com";

  // إذا كان الرابط يحتوي على localhost، استبدله برابط الإنتاج
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const sharePath = url.split("/share/")[1] || url.split("share/")[1];
    if (sharePath) {
      return `${productionDomain}/share/${sharePath}`;
    }
  }

  // ✅ التأكد من أن الرابط يبدأ بـ https://ghostexams.com
  if (url.startsWith("/share/")) {
    return `${productionDomain}${url}`;
  }

  return url;
};

// ✅ إنشاء رابط مشاركة
export const createShareLink = async (shareData) => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.post(`${API_URL}/share/create`, shareData);

    // ✅ تطبيع رابط المشاركة لضمان استخدام رابط الإنتاج
    if (response.data && response.data.share && response.data.share.url) {
      response.data.share.url = normalizeShareUrl(response.data.share.url);
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في إنشاء رابط المشاركة:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ عرض المحتوى المشترك
export const viewSharedContent = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/share/${token}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في عرض المحتوى المشترك:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ التحقق من اشتراك الطالب مع المعلم
export const checkStudentSubscription = async (shareToken) => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.get(
      `${API_URL}/share/${shareToken}/check-subscription`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في التحقق من الاشتراك:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ الحصول على روابط المشاركة الخاصة بالمستخدم
export const getMyShares = async () => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.get(`${API_URL}/share/my/shares`);

    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب روابط المشاركة:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ إلغاء رابط مشاركة
export const revokeShare = async (token) => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.delete(`${API_URL}/share/${token}`);

    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في إلغاء رابط المشاركة:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ جلب المعلمين المشترك معهم الطالب
export const fetchSubscribedTeachers = async () => {
  try {
    // Let axios handle token via interceptor
    // If no token, backend will return 401 and interceptor will handle it
    const response = await axios.get(`${API_URL}/student/subscribed-teachers`);

    return response.data;
  } catch (error) {
    // Error will be handled by axios interceptor (shows Toast, redirects if 401)
    // Just log for debugging
    console.error(
      "❌ خطأ في جلب المعلمين المشترك معهم:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ جلب جميع امتحانات معلم معين للطالب
export const fetchTeacherExamsByStudent = async (teacherId) => {
  try {
    // Let axios interceptor handle token automatically
    const response = await axios.get(
      `${API_URL}/student/teacher/${teacherId}/exams`
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ خطأ في جلب امتحانات المعلم:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Autosave محاولة الامتحان (يحفظ تقدم الطالب)
export const autosaveExamAttempt = async ({
  studentId,
  examId,
  answers,
  questionIndex,
  timeSpent,
}) => {
  const res = await fetch(`/api/exams/attempts/autosave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId,
      examId,
      answers,
      questionIndex,
      timeSpent,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Autosave failed");
  return data;
};

// ✅ Finalize (إنهاء المحاولة وحفظ النتيجة النهائية)
export const finalizeExamAttempt = async ({
  studentId,
  examId,
  score,
  totalQuestions,
  timeSpent,
}) => {
  const res = await fetch(`/api/exams/attempts/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId,
      examId,
      score,
      totalQuestions,
      timeSpent,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Finalize failed");
  return data;
};

// =========================
// ✅ Teacher Custom Exams CRUD (Edit/Active/Questions)
// =========================

// ✅ جلب امتحان معلم بالـ ID (للمعاينة/التعديل)
export const fetchTeacherCustomExamById = async (examId) => {
  const res = await axios.get(`${API_URL}/exams/custom-exams/${examId}`);
  return res.data;
};

// ✅ تحديث بيانات الامتحان كاملة
export const updateTeacherCustomExam = async (examId, payload) => {
  const res = await axios.patch(
    `${API_URL}/exams/custom-exams/${examId}`,
    payload
  );
  return res.data?.exam || res.data;
};
export const setTeacherCustomExamActive = async (examId, isActive) => {
  const res = await axios.patch(
    `${API_URL}/exams/custom-exams/${examId}/active`,
    { isActive }
  );
  return res.data?.exam || res.data;
};
// ✅ تعديل سؤال داخل الامتحان
export const updateTeacherCustomExamQuestion = async (
  examId,
  questionId,
  payload
) => {
  const res = await axios.put(
    `${API_URL}/exams/custom-exams/${examId}/questions/${questionId}`,
    payload
  );
  return res.data;
};

export const deleteTeacherCustomExam = async (examId) => {
  const res = await axios.delete(`${API_URL}/exams/custom-exams/${examId}`);
  return res.data?.exam || res.data;
};
export const addQuestionToTeacherCustomExam = async (examId, payload) => {
  const res = await axios.post(
    `${API_URL}/exams/custom-exams/${examId}/questions`,
    payload
  );
  return res.data?.exam || res.data;
};
export const updateQuestionInTeacherCustomExam = async (
  examId,
  questionId,
  payload
) => {
  const res = await axios.patch(
    `${API_URL}/exams/custom-exams/${examId}/questions/${questionId}`,
    payload
  );
  return res.data?.exam || res.data;
};
export const deleteQuestionFromTeacherCustomExam = async (
  examId,
  questionId
) => {
  const res = await axios.delete(
    `${API_URL}/exams/custom-exams/${examId}/questions/${questionId}`
  );
  return res.data?.exam || res.data;
};
