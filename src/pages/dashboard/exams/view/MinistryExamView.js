"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchExamQuestions } from "@/services/api";
import { submitStudentAnswer } from "@/services/api";
import Head from "next/head";

export default function MinistryExamView({ selectedSubject, selectedGrade }) {
  const router = useRouter();
  const { examId, userId, examType } = router.query;
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [score, setScore] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(120);
  const [studentAnswers, setStudentAnswers] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [feedback, setFeedback] = useState({
    correct: null,
    correctAnswer: "",
  });

  const arabicOptions = { B: "ب", A: "أ", D: "د", C: "ج" };

  const correctAnswersMapping = {
    أ: ["أ", "ا", "A"],
    ا: ["أ", "ا", "A"],
    ب: ["ب", "B"],
    ج: ["ج", "C"],
    د: ["د", "D"],
    A: ["أ", "ا", "A"],
    B: ["ب", "B"],
    C: ["ج", "C"],
    D: ["د", "D"],
  };

  useEffect(() => {
    if (!userId || !examId || !examType) {
      console.warn("⚠️ البيانات غير متوفرة بالشكل الصحيح!");
      return;
    }

    fetchExamQuestions(examId, null, null, null, userId, examType)
      .then((data) => {
        if (data && data.questions) {
          setQuestions(data.questions);
          setExam(data);
        } else {
          console.warn("⚠️ لم يتم العثور على الأسئلة!");
        }
      })
      .catch((err) => console.error("❌ خطأ في جلب الأسئلة:", err));
  }, [examId, userId, examType]);

  const handleAnswerSelection = (option) => {
    if (selectedAnswer !== null) return;

    const currentQuestionId = exam?.questions?.[currentQuestionIndex]?._id;
    if (!currentQuestionId) return;

    // ✅ **تحويل الإجابة إلى النسخة العربية دائمًا قبل تخزينها**
    const normalizedAnswer = correctAnswersMapping[option]
      ? correctAnswersMapping[option][0] // استخدم النسخة العربية دائمًا
      : option;

    setStudentAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionId]: { answer: normalizedAnswer, isCorrect: false },
    }));

    setSelectedAnswer(normalizedAnswer);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < exam?.questions?.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsExamFinished(true);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmitAnswer = async () => {
    console.log("📡 إرسال الإجابة...");

    const currentQuestion = exam?.questions[currentQuestionIndex];

    console.log("🆔 examId:", examId);
    console.log("👤 userId:", userId);
    console.log("📌 فهرس السؤال الحالي:", currentQuestionIndex);
    console.log(
      "📌 مصدر السؤال:",
      examType === "ministry" ? "ministryexams" : "questions",
    );
    console.log("🔵 الإجابة المختارة:", selectedAnswer);

    if (!currentQuestion || !examId || !userId || !selectedAnswer) {
      console.warn("⚠️ بيانات غير مكتملة، لا يمكن إرسال الإجابة!");
      setFeedback({
        correct: false,
        correctAnswer: "",
      });
      return;
    }

    try {
      // ✅ **إرسال الإجابة إلى السيرفر**
      const result = await submitStudentAnswer(
        examId,
        userId,
        currentQuestion._id,
        selectedAnswer,
        examType, // ✅ تحديد نوع الامتحان
      );

      console.log("✅ النتيجة المسترجعة من السيرفر:", result);

      let correctAnswer =
        result?.correctAnswer?.trim() || "❌ لم يتم العثور على إجابة صحيحة.";

      // ✅ **مطابقة الإجابة المختارة مع الإجابة الصحيحة**
      const isCorrect =
        correctAnswersMapping[correctAnswer] &&
        correctAnswersMapping[correctAnswer].includes(selectedAnswer);

      console.log("🔎 الإجابة المختارة:", selectedAnswer);
      console.log("🔎 الإجابة الصحيحة المستلمة:", correctAnswer);
      console.log(
        "🔎 هل القيم متطابقة؟",
        selectedAnswer.trim().toLowerCase() ===
          correctAnswer.trim().toLowerCase(),
      );

      console.log("🔍 هل الإجابة صحيحة؟", isCorrect);

      setStudentAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestion._id]: { answer: selectedAnswer, isCorrect },
      }));

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

  const handleFinishExam = async () => {
    try {
      if (!exam || !exam.questions) return;

      // ✅ **التأكد من البيانات قبل حساب السكور**
      console.log("📌 بيانات الطالب قبل حساب السكور:", studentAnswers);

      // ✅ **حساب السكور النهائي بناءً على الإجابات الصحيحة**
      const score = Object.values(studentAnswers).filter(
        (answer) => answer.isCorrect,
      ).length;
      const totalQuestions = exam.questions.length;

      console.log("🔢 السكور المحسوب:", score, "/", totalQuestions);

      console.log("🔎 examId المراد إرساله:", examId); // ✅ التحقق من examId قبل الإرسال

      const payload = {
        examId: String(examId),
        userId: String(userId),
        score: Number(score), // ✅ السكور يتم إرساله مباشرة
        totalQuestions: Number(totalQuestions),
        date: new Date().toISOString(),
      };

      console.log("📡 البيانات المرسلة إلى السيرفر:", payload);

      const response = await fetch(
        "https://ge-api.ghostexams.com/api/ministry-exams/submit-exam", // ✅ تغيير المسار هنا
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      console.log("📡 انتظار استجابة السيرفر...");

      if (response.ok) {
        const result = await response.json();
        console.log("✅ تم حفظ نتيجة الامتحان في قاعدة البيانات:", result);
        router.push(`/dashboard/studentDashboard?userId=${userId}`);
      } else {
        console.error(
          "❌ فشل في حفظ النتيجة، تحقق من الرد:",
          await response.text(),
        );
      }
    } catch (error) {
      console.error("❌ خطأ أثناء إنهاء الامتحان:", error);
    }
  };

  return (
    <>
      <Head>
        <title>امتحان تفاعلي وزاري | منصة الشبح </title>
        <meta
          name="description"
          content="حل امتحانات وزارية تفاعلية مباشرة مع مساعد ذكي، تحليل نتائج فوري وأسئلة مخصصة لطلاب التوجيهي 2007 و2008 و2009."
        />
        <meta
          name="keywords"
          content="توجيهي, امتحان وزاري, توجيهي الأردن, امتحان فيزياء, امتحان عربي, امتحانات سابقة, منصة الشبح التعليمية, امتحان وزاري لجميع المواد"
        />
      </Head>
      <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
        {exam ? (
          isExamFinished ? (
            <h1 className="text-2xl font-bold text-green-600">
              ✅ انتهى الامتحان! نتيجتك: {score} / {exam.questions.length}
            </h1>
          ) : (
            <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-full flex justify-between items-center bg-blue-900 text-white p-4 rounded-t-lg font-semibold text-lg shadow-md">
                <span>
                  📘 المادة: {selectedSubject || exam?.subject || "غير محددة"}
                </span>
                <span>
                  🎓 الصف: {selectedGrade || exam?.grade || "غير محدد"}
                </span>
              </div>

              <div className="mt-3 text-2xl font-bold text-white bg-orange-600 p-3 rounded-lg shadow-lg">
                ⏳ الوقت المتبقي:{" "}
                <span className="text-blue-200">{timer} ثانية</span>
              </div>

              {exam?.questions?.[currentQuestionIndex]?.image_url ? (
                <Image
                  src={exam.questions[currentQuestionIndex].image_url}
                  alt={`السؤال ${currentQuestionIndex + 1}`}
                  width={800}
                  height={600}
                  priority
                  className="mb-4 border border-gray-300 rounded-lg shadow-md"
                />
              ) : (
                <p className="text-red-500 font-semibold">
                  ⚠️ لا توجد صورة لهذا السؤال
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                {["B", "A", "D", "C"].map((option) => (
                  <button
                    key={option}
                    className={`p-4 rounded-lg font-semibold text-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? selectedAnswer ===
                          exam.questions[currentQuestionIndex].correct_answer
                          ? "bg-green-500 text-white border-green-700 shadow-md"
                          : "bg-red-500 text-white border-red-700 shadow-md"
                        : "bg-orange-500 text-white border-orange-700 hover:bg-orange-600 shadow-md"
                    }`}
                    onClick={() => handleAnswerSelection(option)}
                    disabled={selectedAnswer !== null}
                  >
                    {arabicOptions[option]}
                  </button>
                ))}
              </div>

              {currentQuestionIndex + 1 === exam.questions.length ? (
                <>
                  <button
                    onClick={handleFinishExam}
                    className="mt-6 w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300"
                  >
                    📊 انتهت الأسئلة، احصل على نتيجتك
                  </button>
                  <button
                    onClick={() => router.push("/subscription")}
                    className="mt-4 w-full px-6 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300"
                  >
                    🛒 هل تريد المزيد من الأسئلة؟
                  </button>
                </>
              ) : (
                <button
                  className="mt-6 px-12 py-4 text-lg bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-all w-full shadow-lg"
                  onClick={async () => {
                    if (selectedAnswer) {
                      await handleSubmitAnswer(); // ✅ تأكيد الإجابة قبل الانتقال
                    }
                    handleNextQuestion(); // ✅ الانتقال للسؤال التالي بعد التأكيد
                  }}
                  disabled={selectedAnswer === null}
                >
                  ✅ تأكيد الإجابة & ➡️ السؤال التالي
                </button>
              )}
            </div>
          )
        ) : (
          <h1 className="text-2xl font-bold text-gray-800">
            📡 جاري تحميل الامتحان...
          </h1>
        )}
      </div>
    </>
  );
}
