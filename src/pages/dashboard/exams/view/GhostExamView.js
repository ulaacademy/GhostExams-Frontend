"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardNavbar from "@/components/DashboardNavbar";
import { submitStudentAnswer, fetchGhostExamById } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function GhostExamView() {
  const router = useRouter();
  const { examId } = router.query;
  const { userId, user } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examReady, setExamReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState({});

  useEffect(() => {
    if (!router.isReady || !examId) return;

    const fetchExamData = async () => {
      try {
        setLoading(true);
        
        // ✅ استخدام الدالة من api.js التي تضيف التوكن تلقائياً
        const data = await fetchGhostExamById(examId);
        
        if (data && data.exam) {
          setExam(data.exam);
        } else {
          setError("❌ لم يتم العثور على الامتحان.");
        }
      } catch (err) {
        console.error("❌ خطأ أثناء جلب الامتحان:", err);
        console.error("❌ Error details:", err.response?.data || err.message);
        console.error("❌ Status:", err.response?.status);
        
        if (err.response?.status === 404) {
          setError("❌ الامتحان غير موجود.");
        } else if (err.response?.status === 401) {
          setError("❌ يجب تسجيل الدخول للوصول إلى هذا الامتحان.");
        } else {
          setError("❌ حدث خطأ أثناء تحميل الامتحان.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [router.isReady, examId]);

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !userId || !examId) return;

    const currentQuestion = exam.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      
      // ✅ Submit answer to backend with correct parameters
      // الدالة تأخذ: examId, userId, questionId, selectedAnswer, examType, correctAnswer
      await submitStudentAnswer(
        examId,
        userId,
        currentQuestion._id,
        selectedAnswer,
        "ghost", // ✅ تحديد نوع الامتحان كـ "ghost"
        currentQuestion.correctAnswer // ✅ تمرير correctAnswer لحساب score
      );

      setFeedback({
        correct: isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation || "",
      });

      if (isCorrect) {
        setScore(score + 1);
      }

      // Save answer
      setStudentAnswers({
        ...studentAnswers,
        [currentQuestion._id]: selectedAnswer,
      });
    } catch (err) {
      console.error("❌ خطأ في إرسال الإجابة:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setFeedback(null);
    } else {
      handleFinishExam();
    }
  };

  const handleFinishExam = async () => {
    if (!userId || !examId) return;

    try {
      // ✅ Submit final exam - يمكن استخدام نفس الدالة أو إنشاء endpoint منفصل
      // للبساطة، سنستخدم نفس الدالة مع آخر سؤال
      const lastQuestion = exam.questions[exam.questions.length - 1];
      if (lastQuestion) {
        await submitStudentAnswer(
          examId,
          userId,
          lastQuestion._id,
          studentAnswers[lastQuestion._id] || "",
          "ghost"
        );
      }

      setIsExamFinished(true);
    } catch (err) {
      console.error("❌ خطأ في إنهاء الامتحان:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
    }
  };

  const studentDetails = {
    name: user?.name || "الطالب",
    email: user?.email || "",
  };

  if (loading) {
    return (
      <DashboardNavbar student={studentDetails}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">⏳ جاري تحميل الامتحان...</p>
          </div>
        </div>
      </DashboardNavbar>
    );
  }

  if (error || !exam) {
    return (
      <DashboardNavbar student={studentDetails}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">{error || "❌ فشل في تحميل الامتحان"}</p>
            <button
              onClick={() => router.push("/dashboard/exams/ghost")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              العودة
            </button>
          </div>
        </div>
      </DashboardNavbar>
    );
  }

  if (isExamFinished) {
    const percentage = exam.questions.length > 0 
      ? Math.round((score / exam.questions.length) * 100) 
      : 0;

    return (
      <DashboardNavbar student={studentDetails}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">✅ انتهى الامتحان</h1>
            <div className="mb-6">
              <div className="text-6xl mb-4">{percentage >= 50 ? "🎉" : "📝"}</div>
              <p className="text-2xl font-semibold text-gray-700">
                النتيجة: {score} / {exam.questions.length}
              </p>
              <p className="text-xl text-gray-600 mt-2">
                النسبة المئوية: {percentage}%
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/exams/ghost")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              العودة إلى قائمة الامتحانات
            </button>
          </div>
        </div>
      </DashboardNavbar>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <DashboardNavbar student={studentDetails}>
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-800">👻 {exam.title}</h1>
                <span className="text-sm text-gray-600">
                  السؤال {currentQuestionIndex + 1} من {totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {!examReady ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600 mb-4">
                  📋 {exam.title}
                </p>
                <p className="text-gray-500 mb-4">
                  عدد الأسئلة: {totalQuestions} | المدة: {exam.duration} دقيقة
                </p>
                <button
                  onClick={() => setExamReady(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  🎯 ابدأ الامتحان
                </button>
              </div>
            ) : currentQuestion ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {currentQuestion.questionText}
                </h2>

                <div className="space-y-2 mb-4">
                  {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelection(option)}
                      className={`w-full p-3 rounded-lg text-right transition ${
                        selectedAnswer === option
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </button>
                  ))}
                </div>

                {feedback && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    feedback.correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}>
                    <p className={`font-semibold ${feedback.correct ? "text-green-700" : "text-red-700"}`}>
                      {feedback.correct ? "✅ إجابة صحيحة!" : "❌ إجابة غير صحيحة"}
                    </p>
                    <p className="text-gray-700 mt-2">
                      الإجابة الصحيحة: {feedback.correctAnswer}
                    </p>
                    {feedback.explanation && (
                      <p className="text-gray-600 mt-2">{feedback.explanation}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || !!feedback}
                    className={`px-6 py-2 rounded-lg ${
                      !selectedAnswer || !!feedback
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    تأكيد الإجابة
                  </button>
                  {feedback && (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      {currentQuestionIndex < totalQuestions - 1 ? "السؤال التالي" : "إنهاء الامتحان"}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardNavbar>
  );
}

