"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../../components/Navbar";
import {
  submitStudentAnswer,
  likeQuestion,
  listenToQuestion,
  fetchExamQuestions,
  fetchAIExplanation,
} from "../../../../services/api";
import { useAuth } from "@/context/AuthContext"; // ✅ استيراد `useAuth` بشكل صحيح
import axios from "axios";
import Head from "next/head";

export default function BooksExamView() {
  const { userId } = useAuth(); // ✅ استرداد userId مباشرة من AuthContext
  console.log("📌 userId داخل BooksExamView:", userId);
  const router = useRouter();
  const { examId } = router.query;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questions, setQuestions] = useState([]); // ✅ أضف هذا السطر لحفظ الأسئلة
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [renderTrigger, setRenderTrigger] = useState(false); // ✅ تعريف المتغير
  const [studentAnswers, setStudentAnswers] = useState({});

  useEffect(() => {
    console.log("📡 قيمة userId من AuthContext:", userId); // ✅ تتبع القيمة المستردة
    if (!userId) {
      console.warn("⚠️ لم يتم العثور على userId! تأكد من تسجيل الدخول.");
      return;
    }

    if (examId) {
      fetchExamQuestions(examId, userId)
        .then((data) => {
          console.log("✅ بيانات الامتحان المسترجعة:", data);

          if (data && data.questions) {
            // ✅ تأكد من أن البيانات صحيحة قبل استخدامها
            setQuestions(data.questions);
          } else {
            console.warn("⚠️ لم يتم العثور على أسئلة، تعيين مصفوفة فارغة.");
            setQuestions([]); // ✅ تعيين مصفوفة فارغة بدلاً من ترك `questions` undefined
          }
        })
        .catch((error) => console.error("❌ خطأ في جلب الأسئلة:", error));
    }
  }, [examId, userId]);

  // ✅ باقي الكود يعمل بشكل طبيعي دون أي `if (!userId)` في `return`
  console.log("📡 البيانات المستقبلة من `router.query`:", router.query);
  console.log("📌 قيمة userId الحالية:", userId); // ✅ طباعة `userId` للتحقق
  console.log("📡 البيانات المستقبلة من `router.query`:", router.query);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examReady, setExamReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // ✅ دالة جلب بيانات الامتحان

  const fetchExamData = async (examId, subject) => {
    try {
      setLoading(true);
      console.log("📡 جلب بيانات الامتحان ID:", examId, "📚 المادة:", subject);

      const response = await fetchExamQuestions(examId, subject, "books");
      console.log("✅ استجابة السيرفر:", response); // 🔍 تحقق من الرد القادم من السيرفر

      if (!response || !response.questions) {
        setError("❌ لم يتم العثور على الأسئلة لهذا الامتحان.");
        setLoading(false);
        return;
      }

      setExam(response);
      setExamReady(true);
      console.log("✅ بيانات الامتحان المسترجعة:", response);
    } catch (error) {
      console.error("❌ خطأ أثناء جلب الامتحان:", error);
      setError("❌ حدث خطأ أثناء تحميل الامتحان. الرجاء المحاولة لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ التحقق من router.query قبل استدعاء fetchExamData
  useEffect(() => {
    if (!router.isReady) return; // ✅ تأكد من أن router.query جاهز

    const { examId, subject } = router.query;

    if (!examId) {
      setError("❌ لم يتم العثور على examId. الرجاء المحاولة لاحقًا.");
      setLoading(false);
      return;
    }
    console.log("📡 استدعاء fetchExamData مع:", examId, subject);
    fetchExamData(examId, subject);
  }, [router.isReady, router.query]);

  const handleSubmitAnswer = async () => {
    console.log("📡 إرسال الإجابة...");

    // ✅ **جلب السؤال الحالي**
    const currentQuestion = exam?.questions[currentQuestionIndex];

    console.log("🆔 examId:", examId);
    console.log("👤 userId:", userId);
    console.log("📌 فهرس السؤال الحالي:", currentQuestionIndex);
    console.log("📝 بيانات الامتحان:", exam);
    console.log("❓ السؤال الحالي:", currentQuestion);
    console.log("❓ questionId:", currentQuestion?._id);
    console.log("🔵 الإجابة المختارة:", selectedAnswer);

    // ✅ **التحقق من توفر البيانات قبل الإرسال**
    if (!currentQuestion || !examId || !userId || !selectedAnswer) {
      console.warn("⚠️ بيانات غير مكتملة، لا يمكن إرسال الإجابة!");
      setFeedback({
        correct: false,
        correctAnswer: "",
      });
      return;
    }

    try {
      // ✅ **إرسال الإجابة إلى الباك إند**
      const result = await submitStudentAnswer(
        examId,
        userId,
        currentQuestion._id,
        selectedAnswer
      );

      console.log("✅ النتيجة المسترجعة من السيرفر:", result);

      let correctAnswer = result.correctAnswer
        ? result.correctAnswer.trim()
        : "❌ لم يتم العثور على إجابة صحيحة.";

      console.log("🔵 الإجابة الصحيحة المسترجعة:", correctAnswer);

      // ✅ **تحسين مقارنة الإجابات**
      const normalizeText = (text) =>
        text
          ?.trim()
          .toLowerCase()
          .replace(/\s+/g, " ") // ✅ إزالة المسافات الزائدة داخل النص
          .replace(/[.,!?،؛ـ]/g, "") // ✅ إزالة علامات الترقيم
          .normalize("NFD") // ✅ إزالة التشكيل والأحرف غير المرئية
          .replace(/[\u064B-\u065F]/g, ""); // ✅ إزالة الحركات والتشكيل في العربية

      // ✅ **التحقق مما إذا كانت الإجابة صحيحة**
      const isCorrect =
        normalizeText(selectedAnswer) === normalizeText(correctAnswer);

      console.log("🔍 هل الإجابة صحيحة؟", isCorrect);

      // ✅ **إعداد مخرجات التغذية الراجعة**
      setFeedback({
        correct: isCorrect,
        correctAnswer: isCorrect ? "" : `💡 الحل الصحيح: ${correctAnswer}`,
      });
    } catch (error) {
      console.error("❌ خطأ أثناء إرسال الإجابة:", error);
      setFeedback({
        correct: false,
        correctAnswer:
          "❌ حدث خطأ أثناء إرسال الإجابة. الرجاء المحاولة لاحقًا.",
      });
    }
  };

  const handleAnswerSelection = (option) => {
    setStudentAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [exam.questions[currentQuestionIndex]._id]: option,
      };
      console.log("✅ تحديث إجابات الطالب:", updatedAnswers);
      return updatedAnswers;
    });

    setSelectedAnswer(option); // ✅ تحديث الزر المختار
  };

  const handleNextQuestion = () => {
    setAiExplanation(""); // ✅ مسح الشرح
    setRenderTrigger((prev) => !prev); // ✅ إجبار React على إعادة التصيير
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const calculateScore = () => {
    if (!examId || !exam.questions) {
      console.error("❌ لا توجد بيانات امتحان متاحة لحساب الدرجة.");
      return 0;
    }

    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;

    exam.questions.forEach((question) => {
      let studentAnswer = studentAnswers[question._id]?.trim().toLowerCase();
      let correctAnswer = question.correctAnswer?.trim().toLowerCase();

      // ✅ إزالة الكلمات الإضافية من الإجابة الصحيحة
      correctAnswer = correctAnswer
        .replace(/^(الإجابة الصحيحة:\s*|الإجابة:\s*)/i, "")
        .trim();

      console.log(
        `🔍 السؤال: ${question._id} | إجابة الطالب: ${studentAnswer} | الإجابة الصحيحة المعالجة: ${correctAnswer}`
      );

      if (studentAnswer && correctAnswer && studentAnswer === correctAnswer) {
        correctAnswers++; // ✅ كل إجابة صحيحة تأخذ نقطة واحدة
      }
    });

    console.log(
      `📊 تم حساب درجة الامتحان: ${correctAnswers}/${totalQuestions}`
    );

    return correctAnswers; // ✅ النتيجة النهائية هي عدد الإجابات الصحيحة فقط
  };

  const handleFinishExam = async () => {
    try {
      console.log("📡 إرسال بيانات الامتحان إلى API...");

      const score = calculateScore(); // ✅ تأكد أن `score` يتم حسابه بشكل صحيح
      const totalQuestions = exam.questions.length;

      // ✅ إعداد البيانات لضمان عدم وجود مراجع دائرية
      const payload = {
        examId: String(examId), // ✅ تأكد أنه `String`
        userId: String(userId), // ✅ تأكد أنه `String`
        score: Number(score), // ✅ تأكد أنه `Number`
        totalQuestions: Number(totalQuestions), // ✅ تأكد أنه `Number`
        date: new Date().toISOString(), // ✅ تحويل التاريخ إلى نص
        isFinalSubmission: true, // ✅ ضروري!
      };

      console.log("📤 البيانات المرسلة:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "https://ge-api.ghostexams.com/api/exams/submit",
        payload
      );

      if (response.status === 200) {
        console.log("✅ تم حفظ نتيجة الامتحان:", response.data);
        router.push(`/dashboard/studentDashboard?userId=${userId}`);
      } else {
        console.error("❌ فشل في حفظ النتيجة:", response.data.message);
      }
    } catch (error) {
      console.error("❌ خطأ أثناء إنهاء الامتحان:", error);
    }
  };

  const handleListenToQuestion = async () => {
    const currentQuestion = exam?.questions[currentQuestionIndex];
    if (currentQuestion) {
      console.log("🔊 تشغيل الصوت للسؤال:", currentQuestion.questionText);
      await listenToQuestion(currentQuestion.questionText);
    } else {
      console.warn("⚠️ لم يتم العثور على السؤال الحالي!");
    }
  };

  const handleLikeQuestion = async () => {
    const currentQuestion = exam?.questions[currentQuestionIndex];
    if (currentQuestion) {
      console.log("👍 إرسال إعجاب بالسؤال:", currentQuestion._id);
      const updatedLikes = await likeQuestion(currentQuestion._id);
      setLikeCount(updatedLikes);
    } else {
      console.warn("⚠️ لم يتم العثور على السؤال الحالي للإعجاب!");
    }
  };
  console.log("🎯 `aiExplanation` قبل العرض:", aiExplanation); // ✅ طباعة قيمة `aiExplanation` قبل `return`

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <Navbar />

      <Head>
        <title>امتحانات توجيهي - المنهاج | منصة الشبح</title>
        <meta
          name="description"
          content="حل امتحانات المعلمين من سنوات سابقة مع التصحيح والتحليل الفوري. منصة الشبح للتوجيهي الأردني."
        />
        <meta
          name="keywords"
          content="امتحانات معلمين, توجيهي 2007, توجيهي 2008, اسئلة سنوات سابقة, امتحان عربي وزاري, امتحان رياضيات علمي"
        />
      </Head>

      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-700">
          📋 امتحان {exam?.title}
        </h1>

        {loading ? (
          <p>⏳ جارٍ تحميل الامتحان...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !examReady ? (
          <button
            onClick={() => setExamReady(true)}
            className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            🎯 ابدأ الامتحان
          </button>
        ) : (
          <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 text-right">
              {exam.questions[currentQuestionIndex]?.questionText}
            </h2>

            {/* ✅ زر استماع للسؤال */}
            <button
              onClick={handleListenToQuestion}
              className="mt-2 p-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition"
            >
              🔊 استمع للسؤال
            </button>

            <div className="mt-4 space-y-2">
              {exam.questions[currentQuestionIndex]?.options.map(
                (option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelection(option)} // ✅ تحديث الإجابة هنا
                    className={`w-full p-2 rounded-lg shadow-md ${
                      selectedAnswer === option
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    } hover:bg-blue-400 transition`}
                  >
                    {option}
                  </button>
                )
              )}
            </div>

            {/* ✅ زر تأكيد الإجابة */}
            <button
              onClick={handleSubmitAnswer}
              className="mt-4 w-full p-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
              disabled={!selectedAnswer}
            >
              ✅ تأكيد الإجابة
            </button>

            {/* ✅ عرض النتيجة والتفسير أسفل السؤال */}
            {feedback && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  feedback.correct ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="text-lg font-semibold">
                  {feedback.correct ? "✔️ إجابة صحيحة!" : "❌ إجابة خاطئة!"}
                </p>
                {feedback.correctAnswer && (
                  <p className="mt-2 text-md text-gray-700">
                    <strong>💡 الحل الصحيح:</strong> {feedback.correctAnswer}
                  </p>
                )}
                {feedback.explanation && (
                  <p className="mt-2 text-md text-gray-700">
                    <strong>📖 الشرح:</strong> {feedback.explanation}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={async () => {
                setLoadingExplanation(true);
                console.log("🚀 طلب شرح من الذكاء الاصطناعي...");
                const explanation = await fetchAIExplanation(
                  exam.questions[currentQuestionIndex]?.questionText
                );
                console.log("✅ الشرح المستلم من API:", explanation);
                setLoadingExplanation(false);
                setAiExplanation(explanation); // ✅ استخدم useState بدلاً من innerText
              }}
              className="mt-4 w-full p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition"
            >
              🧠 توليد شرح مفصل
            </button>

            {/* ✅ بوكس الشرح يبقى حتى لو تم مسحه عند تغيير السؤال */}
            <div
              id="ai-explanation-box"
              className="mt-4 p-4 bg-gray-200 rounded-lg shadow-md min-h-[80px] flex items-center"
            >
              {loadingExplanation ? (
                <p className="text-blue-600">⏳ جاري توليد الشرح...</p>
              ) : (
                <p className="text-gray-800">
                  {aiExplanation
                    ? aiExplanation
                    : "🔍 الشرح سيظهر هنا بعد التوليد..."}
                </p>
              )}
            </div>

            {/* ✅ زر "السؤال التالي" أو "إنهاء الامتحان" بناءً على السؤال الحالي */}
            {currentQuestionIndex < exam.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                ⏭️ السؤال التالي
              </button>
            ) : (
              <>
                {/* ✅ زر إنهاء الامتحان عند آخر سؤال */}
                <button
                  onClick={handleFinishExam}
                  className="mt-4 w-full p-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
                >
                  📊 انتهت الأسئلة، احصل على نتيجتك
                </button>

                {/* ✅ زر الاشتراك عند آخر سؤال */}
                <button
                  onClick={() => navigate("/subscription")}
                  className="mt-2 w-full p-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition"
                >
                  🛒 هل تريد المزيد من الأسئلة؟
                </button>
              </>
            )}

            {/* ✅ زر الإعجاب بالسؤال */}
            <button
              onClick={handleLikeQuestion}
              className="mt-4 p-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
            >
              👍 أعجبني ({likeCount?.likes ?? 0})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
