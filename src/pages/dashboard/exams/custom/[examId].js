"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import {
  submitTeacherExamResult,
  createShareLink,
  autosaveExamAttempt,
  finalizeExamAttempt,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/DashboardNavbar";
import { showToast } from "@/components/Toast";

const QUESTION_TIME_SECONDS = 60;

/* ===========================
   ✅ Language Direction Helper
=========================== */
function getTextDir(text = "") {
  const t = String(text || "");
  const arabic = (t.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || [])
    .length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;

  if (arabic === 0 && latin === 0) return "rtl";
  return arabic >= latin ? "rtl" : "ltr";
}

/* ===========================
   ✅ Shuffle deterministic
=========================== */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function deterministicShuffle(array, seedStr) {
  const arr = [...array];
  const seed = hashStringToSeed(seedStr);
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateSessionId() {
  try {
    const buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    return Array.from(buf)
      .map((n) => n.toString(16))
      .join("");
  } catch {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

/* ===========================
   ✅ score helper (for restore)
=========================== */
function computeScorePercentage({ exam, answers, questionOrder }) {
  const total = exam?.questions?.length || 0;
  if (!total) return 0;

  let correct = 0;
  for (let pos = 0; pos < total; pos++) {
    const qIdx = questionOrder?.length ? questionOrder[pos] : pos;
    const correctAnswer = exam.questions?.[qIdx]?.correctAnswer;
    if (answers?.[pos] && answers[pos] === correctAnswer) correct++;
  }
  return Math.round((correct / total) * 100);
}

export default function CustomTeacherExamPage() {
  const router = useRouter();
  const { examId } = router.query;
  const { user } = useAuth();

  const [examData, setExamData] = useState(null);

  // ✅ attempt session (changes on retake)
  const [attemptSessionId, setAttemptSessionId] = useState(null);

  // ✅ order of questions for THIS attempt (array of original question indexes)
  const [questionOrder, setQuestionOrder] = useState([]);

  // answers/status/feedback/timeSpent are keyed by "position" in questionOrder (0..n-1)
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [feedback, setFeedback] = useState({});
  const [timeSpent, setTimeSpent] = useState({});

  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    QUESTION_TIME_SECONDS,
  );

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showReview, setShowReview] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const [examResultId, setExamResultId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const [examMode, setExamMode] = useState(false);
  const examContainerRef = useRef(null);

  // ✅ shuffled options map by "position": { [pos]: [option1, option2, ...] }
  const [shuffledOptions, setShuffledOptions] = useState({});

  // ✅ autosave attemptId from server
  const [attemptId, setAttemptId] = useState(null);

  const lastCopyWarnRef = useRef(0);

  const totalQuestions = examData?.questions?.length || 0;

  const studentDetails = {
    name: user?.name || "الطالب",
    email: user?.email || "",
  };

  const isTeacherViewer = useMemo(() => {
    if (user?.role) return user.role === "teacher";
    return (
      user?.userId && examData?.teacherId && user.userId === examData.teacherId
    );
  }, [user, examData]);

  // ====== attempt storage keys (linked to session) ======
  const baseAttemptKey = useMemo(() => {
    return `exam_attempt_${examId}_${user?.userId || "anon"}`;
  }, [examId, user?.userId]);

  const lastSessionKey = useMemo(() => {
    return `${baseAttemptKey}_lastSession`;
  }, [baseAttemptKey]);

  const draftKey = useMemo(() => {
    if (!attemptSessionId) return null;
    return `${baseAttemptKey}_${attemptSessionId}`;
  }, [baseAttemptKey, attemptSessionId]);

  const saveDraftLocal = (payload) => {
    if (!draftKey) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(payload));
      localStorage.setItem(lastSessionKey, String(attemptSessionId || ""));
    } catch (e) {
      console.log(e);
    }
  };

  const flushDraftToServer = useCallback(async () => {
    if (!draftKey) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const payload = JSON.parse(raw);

      const res = await autosaveExamAttempt(payload);
      if (res?.attemptId) setAttemptId(res.attemptId);

      // ✅ مهم جدًا: لا نمسح الـ draft هنا
      // لأنه هو اللي بخلي الرجوع يكمل التقدم حتى لو السيرفر ما رجّع محاولة
    } catch (e) {
      console.log(e);
    }
  }, [draftKey]);

  // ====== Helpers for question mapping ======
  const getOriginalQuestionIndex = useCallback(
    (pos) => {
      // if order not ready, assume same index
      if (!questionOrder?.length) return pos;
      return questionOrder[pos];
    },
    [questionOrder],
  );

  const currentOriginalIndex = useMemo(() => {
    return getOriginalQuestionIndex(currentQuestionIndex);
  }, [getOriginalQuestionIndex, currentQuestionIndex]);

  const currentQuestion = useMemo(() => {
    if (!examData?.questions?.length) return null;
    const idx = currentOriginalIndex;
    return examData.questions[idx];
  }, [examData, currentOriginalIndex]);

  // ====== counters ======
  const attemptedCount = useMemo(
    () => Object.keys(questionStatus).length,
    [questionStatus],
  );

  const correctCount = useMemo(() => {
    if (!examData) return 0;
    let c = 0;
    for (let pos = 0; pos < totalQuestions; pos++) {
      const qIdx = getOriginalQuestionIndex(pos);
      const correctAnswer = examData.questions?.[qIdx]?.correctAnswer;
      if (answers[pos] && answers[pos] === correctAnswer) c++;
    }
    return c;
  }, [answers, examData, totalQuestions, getOriginalQuestionIndex]);

  const timeoutCount = useMemo(() => {
    let c = 0;
    Object.values(questionStatus).forEach((st) => {
      if (st === "timeout") c++;
    });
    return c;
  }, [questionStatus]);

  const correctStatusCount = useMemo(() => {
    return Object.values(questionStatus).filter((st) => st === "correct")
      .length;
  }, [questionStatus]);

  const wrongStatusCount = useMemo(() => {
    return Object.values(questionStatus).filter((st) => st === "wrong").length;
  }, [questionStatus]);

  const noAnswerCount = useMemo(() => {
    return Object.values(questionStatus).filter(
      (st) => st === "timeout" || st === "skipped",
    ).length;
  }, [questionStatus]);

  const notYetCount = useMemo(() => {
    const done = correctStatusCount + wrongStatusCount + noAnswerCount;
    return Math.max(totalQuestions - done, 0);
  }, [totalQuestions, correctStatusCount, wrongStatusCount, noAnswerCount]);

  const getQuestionStatus = (pos) => questionStatus[pos] || "unanswered";
  const currentStatus = questionStatus[currentQuestionIndex];
  const currentFeedback = feedback[currentQuestionIndex];

  const formatTime = (seconds) => {
    const s = Math.max(0, Number(seconds) || 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const questionDir = useMemo(() => {
    return getTextDir(currentQuestion?.questionText || "");
  }, [currentQuestion?.questionText]);

  const optionLabels = useMemo(() => {
    return questionDir === "rtl" ? ["أ", "ب", "ج", "د"] : ["A", "B", "C", "D"];
  }, [questionDir]);

  const progress = totalQuestions
    ? ((currentQuestionIndex + 1) / totalQuestions) * 100
    : 0;

  const timeWarning = questionTimeLeft <= 10;

  // ✅ refs
  const timerIntervalRef = useRef(null);
  const currentIndexRef = useRef(0);
  const statusRef = useRef({});
  const submittedRef = useRef(false);
  const examDataRef = useRef(null);

  useEffect(() => {
    currentIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    statusRef.current = questionStatus;
  }, [questionStatus]);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  useEffect(() => {
    examDataRef.current = examData;
  }, [examData]);

  // ====== Disable copy / cut / paste + Ctrl+C / Ctrl+V ======
  useEffect(() => {
    if (!examData || submitted) return;

    const warn = () => {
      const now = Date.now();
      if (now - lastCopyWarnRef.current > 1500) {
        lastCopyWarnRef.current = now;
        showToast("⚠️ النسخ/اللصق غير مسموح أثناء الامتحان", "warning");
      }
    };

    const prevent = (e) => {
      e.preventDefault();
      warn();
      return false;
    };

    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && ["c", "v", "x", "a", "p"].includes(key)) {
        e.preventDefault();
        warn();
      }

      if (e.key === "ArrowLeft") e.preventDefault();
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const st = questionStatus[currentQuestionIndex];
        if (st) goNext();
      }
    };

    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [examData, submitted, questionStatus, currentQuestionIndex]); // eslint-disable-line

  useEffect(() => {
    const onOnline = () => flushDraftToServer();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushDraftToServer]);

  // ====== init attempt (new or restore) ======
  const initAttempt = useCallback(
    (exam, sessionId, restoreDraft = null) => {
      const sid = user?.userId || "anon";
      const n = exam?.questions?.length || 0;

      const isRestoring =
        !!restoreDraft &&
        (restoreDraft?.answers ||
          restoreDraft?.questionStatus ||
          typeof restoreDraft?.currentQuestionIndex === "number" ||
          restoreDraft?.isSubmitted ||
          restoreDraft?.submittedAt);

      // ✅ build default question order (for NEW attempt OR fallback)
      const indices = Array.from({ length: n }).map((_, i) => i);
      const defaultOrder = deterministicShuffle(
        indices,
        `${examId}_${sid}_${sessionId}_QORDER`,
      );

      const finalOrder =
        restoreDraft?.questionOrder?.length === n
          ? restoreDraft.questionOrder
          : defaultOrder;

      // ✅ build shuffled options for each "position"
      const optMap = {};
      for (let pos = 0; pos < n; pos++) {
        const qIdx = finalOrder[pos];
        const opts = exam.questions?.[qIdx]?.options || [];
        optMap[pos] = deterministicShuffle(
          opts,
          `${examId}_${sid}_${sessionId}_OPT_${qIdx}`,
        );
      }

      // reset UI states
      setQuestionOrder(finalOrder);
      setShuffledOptions(optMap);

      setAnswers({});
      setFeedback({});
      setQuestionStatus({});
      setTimeSpent({});
      setSubmitted(false);
      setScore(0);
      setCurrentQuestionIndex(0);
      setQuestionTimeLeft(QUESTION_TIME_SECONDS);
      setAttemptId(null);
      setExamResultId(null);
      setShareUrl(null);
      setShowShareModal(false);
      setShowConfirmSubmit(false);
      setShowReview(false);

      // ✅ restore if exists
      if (restoreDraft) {
        if (restoreDraft?.answers) setAnswers(restoreDraft.answers);
        if (restoreDraft?.questionStatus)
          setQuestionStatus(restoreDraft.questionStatus);
        if (restoreDraft?.timeSpent) setTimeSpent(restoreDraft.timeSpent);
        if (typeof restoreDraft?.currentQuestionIndex === "number")
          setCurrentQuestionIndex(restoreDraft.currentQuestionIndex);
        if (restoreDraft?.attemptId) setAttemptId(restoreDraft.attemptId);

        // ✅ إذا الامتحان كان منهي سابقًا → اعرض النتيجة ولا تبدأ محاولة جديدة
        if (restoreDraft?.isSubmitted || restoreDraft?.submittedAt) {
          const restoredScore =
            typeof restoreDraft?.score === "number"
              ? restoreDraft.score
              : computeScorePercentage({
                  exam,
                  answers: restoreDraft?.answers || {},
                  questionOrder: finalOrder,
                });

          setScore(restoredScore);
          setSubmitted(true);
          setShowConfirmSubmit(false);
        }
      }

      if (isRestoring) {
        if (restoreDraft?.isSubmitted || restoreDraft?.submittedAt) {
          showToast("✅ تم تحميل نتيجتك السابقة", "success");
        } else {
          showToast("✅ تم استرجاع تقدمك في الامتحان", "success");
        }
      } else {
        showToast("✅ تم تجهيز محاولة جديدة بترتيب مختلف", "success");
      }
    },
    [user?.userId, examId],
  );

  // ====== Fetch exam ======
  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `https://ge-api.ghostexams.com/api/exams/custom-exams/${examId}`,
        );

        const exam = response.data.exam;
        setExamData(exam);

        // ✅ Try restore last session draft (for refresh while solving)
        let restoredSessionId = null;
        let restoredDraft = null;

        try {
          const lastSid = localStorage.getItem(lastSessionKey);
          if (lastSid) {
            restoredSessionId = lastSid;
            const dk = `${baseAttemptKey}_${lastSid}`;
            const raw = localStorage.getItem(dk);
            if (raw) restoredDraft = JSON.parse(raw);
          }
        } catch (e) {
          console.log(e);
        }

        // ✅ مهم: إذا في draft موجود بنرجع له (نفس session) بدون ترتيب جديد
        const sessionId =
          (restoredDraft?.attemptSessionId && restoredSessionId) ||
          restoredSessionId ||
          generateSessionId();

        setAttemptSessionId(sessionId);

        // init attempt (new or restore)
        initAttempt(exam, sessionId, restoredDraft);
      } catch (error) {
        console.error("❌ فشل في جلب الامتحان:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, baseAttemptKey, lastSessionKey, initAttempt]);

  // ====== Autosave helper ======
  const pushAutosave = useCallback(
    async (extra = {}) => {
      if (!examData || !examId || !attemptSessionId || !draftKey) return;

      const payload = {
        attemptSessionId,
        attemptId: attemptId || null,
        examId,
        studentId: user?.userId || null,
        teacherId: examData.teacherId || null,
        currentQuestionIndex,
        questionOrder,
        answers,
        questionStatus,
        timeSpent,
        updatedAt: new Date().toISOString(),
        ...extra,
      };

      // ✅ نخزن محليًا دائمًا (هذا اللي بيحافظ على التقدم)
      saveDraftLocal(payload);

      try {
        const res = await autosaveExamAttempt(payload);
        if (res?.attemptId) setAttemptId(res.attemptId);

        // ✅ مهم جدًا: لا نمسح local draft بعد نجاح autosave
        // لأنه إذا الطالب رجع/عمل refresh لازم نكمل من نفس التقدم
      } catch (e) {
        console.log(e);
      }
    },
    [
      attemptSessionId,
      draftKey,
      attemptId,
      examData,
      examId,
      user,
      currentQuestionIndex,
      questionOrder,
      answers,
      questionStatus,
      timeSpent,
    ],
  );

  // ====== Retry Exam (ONLY after finish) ======
  const handleRetryExam = useCallback(async () => {
    if (!examData || !examId) return;

    // close fullscreen if active
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
    } catch {}
    setExamMode(false);

    // remove old draft for current session (completed attempt)
    try {
      if (draftKey) localStorage.removeItem(draftKey);
    } catch {}

    const newSession = generateSessionId();
    setAttemptSessionId(newSession);
    try {
      localStorage.setItem(lastSessionKey, String(newSession));
    } catch {}

    // ✅ يبدأ محاولة جديدة بترتيب جديد
    initAttempt(examData, newSession, null);
  }, [examData, examId, draftKey, lastSessionKey, initAttempt]);

  const handleTimeout = useCallback(
    async (pos) => {
      if (!examDataRef.current || submittedRef.current) return;
      if (statusRef.current?.[pos]) return;

      const spent = QUESTION_TIME_SECONDS;
      setTimeSpent((prev) => ({ ...prev, [pos]: spent }));
      setQuestionStatus((prev) => ({ ...prev, [pos]: "timeout" }));

      showToast("⏳ انتهى وقت السؤال (لم تتم الإجابة)", "warning");
      setTimeout(() => pushAutosave({ lastEvent: "timeout", pos }), 0);
    },
    [pushAutosave],
  );

  // ====== Timer ======
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!examData || submitted || showConfirmSubmit) return;

    const st = questionStatus[currentQuestionIndex];
    if (st) {
      setQuestionTimeLeft(0);
      return;
    }

    setQuestionTimeLeft(QUESTION_TIME_SECONDS);

    timerIntervalRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        const next = (Number(prev) || 0) - 1;

        if (next <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }

          const pos = currentIndexRef.current;
          if (!statusRef.current?.[pos]) handleTimeout(pos);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [
    examData,
    submitted,
    showConfirmSubmit,
    currentQuestionIndex,
    questionStatus,
    handleTimeout,
  ]);

  const goNext = useCallback(() => {
    if (!examData) return;

    const st = questionStatus[currentQuestionIndex];
    if (!st) {
      showToast("⚠️ لازم تجاوب أو ينتهي وقت السؤال أولاً", "warning");
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      pushAutosave();
    } else {
      setShowConfirmSubmit(true);
      pushAutosave({ readyToSubmit: true });
    }
  }, [
    examData,
    currentQuestionIndex,
    questionStatus,
    pushAutosave,
    totalQuestions,
  ]);

  const handleSkip = useCallback(() => {
    if (!examData || submitted) return;
    const pos = currentQuestionIndex;
    if (questionStatus[pos]) return;

    const spent = QUESTION_TIME_SECONDS - Math.max(questionTimeLeft, 0);
    setTimeSpent((prev) => ({ ...prev, [pos]: spent }));
    setQuestionStatus((prev) => ({ ...prev, [pos]: "skipped" }));

    showToast("⏭️ تم تخطي السؤال", "warning");
    pushAutosave({ lastEvent: "skipped", pos });
  }, [
    examData,
    submitted,
    currentQuestionIndex,
    questionStatus,
    questionTimeLeft,
    pushAutosave,
  ]);

  const handleAnswer = useCallback(
    (pos, selected) => {
      if (!examData || submitted) return;
      if (questionStatus[pos]) return;

      const qIdx = getOriginalQuestionIndex(pos);
      const correctAnswer = examData.questions?.[qIdx]?.correctAnswer;
      const isCorrect = selected === correctAnswer;

      const spent = QUESTION_TIME_SECONDS - Math.max(questionTimeLeft, 0);

      setAnswers((prev) => ({ ...prev, [pos]: selected }));
      setTimeSpent((prev) => ({ ...prev, [pos]: spent }));
      setQuestionStatus((prev) => ({
        ...prev,
        [pos]: isCorrect ? "correct" : "wrong",
      }));
      setFeedback((prev) => ({
        ...prev,
        [pos]: { selected, correct: isCorrect, correctAnswer },
      }));

      showToast(
        isCorrect ? "✅ إجابة صحيحة" : "❌ إجابة خاطئة",
        isCorrect ? "success" : "error",
      );

      pushAutosave({ lastEvent: "answered", pos });
    },
    [
      examData,
      submitted,
      questionStatus,
      questionTimeLeft,
      pushAutosave,
      getOriginalQuestionIndex,
    ],
  );

  const toggleExamMode = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await examContainerRef.current?.requestFullscreen?.();
        setExamMode(true);
      } else {
        await document.exitFullscreen?.();
        setExamMode(false);
      }
    } catch (e) {
      console.log(e);
      setExamMode((p) => !p);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitted || !examData) return;

    let correct = 0;
    for (let pos = 0; pos < totalQuestions; pos++) {
      const qIdx = getOriginalQuestionIndex(pos);
      const correctAnswer = examData.questions?.[qIdx]?.correctAnswer;
      if (answers[pos] && answers[pos] === correctAnswer) correct++;
    }

    const total = totalQuestions;
    const percentage = Math.round((correct / total) * 100);

    setScore(percentage);
    setSubmitted(true);
    setShowConfirmSubmit(false);

    try {
      // ✅ نخزن محاولة "منهية" محليًا عشان إذا رجع الطالب نشوف زر إعادة الامتحان بدل ما يبدأ من الصفر
      await pushAutosave({
        lastEvent: "submit",
        submittedAt: new Date().toISOString(),
        isSubmitted: true,
        score: percentage,
      });

      if (attemptId) {
        try {
          await finalizeExamAttempt({ attemptId, score: percentage });
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
    }

    try {
      const result = await submitTeacherExamResult({
        studentId: user?.userId,
        examId: examData._id,
        teacherId: examData.teacherId,

        // ✅ score = عدد الصح (مش النسبة)
        score: correct,

        // ✅ النسبة نرسلها بحقل منفصل
        performancePercentage: percentage,

        totalQuestions: total,
        attemptSessionId,
      });

      if (result?.result?._id) setExamResultId(result.result._id);
    } catch (error) {
      console.error("❌ فشل في تسجيل نتيجة الامتحان:", error);
    }
  }, [
    submitted,
    examData,
    answers,
    user,
    attemptId,
    pushAutosave,
    totalQuestions,
    getOriginalQuestionIndex,
    attemptSessionId,
  ]);

  const summary = useMemo(() => {
    if (!examData) return null;

    const topicCountWrong = {};
    const topicCountTimeout = {};
    const wrongQuestions = [];
    const timeoutQuestions = [];

    for (let pos = 0; pos < totalQuestions; pos++) {
      const st = questionStatus[pos];
      const qIdx = getOriginalQuestionIndex(pos);
      const q = examData.questions?.[qIdx];
      const topic =
        q?.topic || q?.lesson || q?.unit || q?.chapter || "غير محدد";

      if (st === "wrong") {
        topicCountWrong[topic] = (topicCountWrong[topic] || 0) + 1;
        wrongQuestions.push(pos);
      }
      if (st === "timeout" || st === "skipped") {
        topicCountTimeout[topic] = (topicCountTimeout[topic] || 0) + 1;
        timeoutQuestions.push(pos);
      }
    }

    const topWrongTopics = Object.entries(topicCountWrong)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topTimeoutTopics = Object.entries(topicCountTimeout)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const recommendationTopic =
      topWrongTopics?.[0]?.[0] || topTimeoutTopics?.[0]?.[0] || null;

    return {
      topWrongTopics,
      topTimeoutTopics,
      wrongQuestions,
      timeoutQuestions,
      recommendationTopic,
    };
  }, [examData, questionStatus, totalQuestions, getOriginalQuestionIndex]);

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

  if (!examData) {
    return (
      <DashboardNavbar student={studentDetails}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-red-500">
            <p className="text-xl">❌ فشل في تحميل الامتحان</p>
            <button
              onClick={() => router.push("/dashboard/subscribed-teachers")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              العودة
            </button>
          </div>
        </div>
      </DashboardNavbar>
    );
  }

  const sidebarBtnClass = (pos) => {
    const st = getQuestionStatus(pos);
    const isCurrent = pos === currentQuestionIndex;

    if (isCurrent)
      return "bg-blue-600 text-white ring-2 ring-blue-300 scale-110";
    if (st === "correct") return "bg-green-500 text-white";
    if (st === "wrong") return "bg-red-500 text-white";
    if (st === "timeout" || st === "skipped") return "bg-orange-500 text-white";
    return "bg-gray-200 text-gray-700";
  };

  const currentOptions =
    shuffledOptions[currentQuestionIndex] || currentQuestion?.options || [];

  return (
    <DashboardNavbar student={studentDetails}>
      <div
        ref={examContainerRef}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        dir="rtl"
      >
        <div
          className={`max-w-7xl mx-auto p-4 md:p-6 ${
            examMode ? "select-none" : ""
          }`}
        >
          {!examMode && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
                    📘 {examData.examName}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📚 {examData.subject}</span>
                    <span>🎓 الصف: {examData.grade}</span>
                    <span>📅 الفصل: {examData.term}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleExamMode}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    {examMode
                      ? "🔙 خروج من وضع الامتحان"
                      : "🧠 وضع الامتحان (Fullscreen)"}
                  </button>
                </div>
              </div>

              {!submitted && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      السؤال {currentQuestionIndex + 1} من {totalQuestions}
                    </span>
                    <span>
                      تم إنهاء {attemptedCount} من {totalQuestions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!submitted ? (
            <div
              className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${
                examMode ? "lg:grid-cols-1" : ""
              }`}
            >
              {!examMode && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                    <h3 className="font-bold text-lg mb-3 text-gray-700">
                      📋 الأسئلة
                    </h3>

                    <div className="grid grid-cols-5 md:grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                      {Array.from({ length: totalQuestions }).map((_, pos) => (
                        <button
                          key={pos}
                          type="button"
                          disabled={pos !== currentQuestionIndex}
                          className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${sidebarBtnClass(
                            pos,
                          )} ${
                            pos !== currentQuestionIndex
                              ? "opacity-90 cursor-not-allowed"
                              : ""
                          }`}
                          title={getQuestionStatus(pos)}
                        >
                          {pos + 1}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>صح</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {correctStatusCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>غلط</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {wrongStatusCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span>لم تُجب / تخطي / انتهى الوقت</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {noAnswerCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <span>لم يتم بعد</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {notYetCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Main Question Area */}
              <div className={examMode ? "lg:col-span-1" : "lg:col-span-3"}>
                <div
                  className={`bg-white rounded-xl shadow-lg p-6 md:p-8 ${
                    examMode ? "max-w-3xl mx-auto" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    {!showConfirmSubmit && (
                      <div
                        className={`text-center px-4 py-3 rounded-lg ${
                          timeWarning && !currentStatus
                            ? "bg-red-100 border-2 border-red-500"
                            : "bg-blue-50"
                        }`}
                      >
                        <div
                          className={`text-2xl font-bold ${
                            timeWarning && !currentStatus
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          ⏰ {formatTime(questionTimeLeft)}
                        </div>
                        <p className="text-sm text-gray-600">
                          وقت السؤال (60 ثانية)
                        </p>
                      </div>
                    )}

                    {isTeacherViewer && currentQuestion?.difficulty && (
                      <div className="px-4 py-3 rounded-lg bg-gray-100 border text-gray-800 font-semibold">
                        🧩 صعوبة السؤال:{" "}
                        <span className="text-blue-700">
                          {currentQuestion.difficulty === "easy"
                            ? "سهل"
                            : currentQuestion.difficulty === "medium"
                              ? "متوسط"
                              : currentQuestion.difficulty === "hard"
                                ? "صعب"
                                : currentQuestion.difficulty}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ✅ Question */}
                  <div className="mb-6">
                    <div
                      dir={questionDir}
                      className={`flex items-start gap-3 mb-4 ${
                        questionDir === "rtl" ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
                        {currentQuestionIndex + 1}
                      </div>

                      <h2
                        dir={questionDir}
                        className={`text-xl md:text-2xl font-semibold text-gray-800 flex-1 leading-relaxed ${
                          questionDir === "rtl" ? "text-right" : "text-left"
                        }`}
                      >
                        {currentQuestion?.questionText}
                      </h2>
                    </div>

                    {/* ✅ Options */}
                    <div className="space-y-3 mt-6" dir={questionDir}>
                      {currentOptions.map((option, i) => {
                        const isSelected =
                          answers[currentQuestionIndex] === option;
                        const locked =
                          !!currentStatus || submitted || showConfirmSubmit;

                        return (
                          <button
                            key={`${i}_${option}`}
                            type="button"
                            onClick={() =>
                              handleAnswer(currentQuestionIndex, option)
                            }
                            disabled={locked}
                            dir={questionDir}
                            className={`w-full p-4 rounded-xl border-2 transition-all transform ${
                              questionDir === "rtl" ? "text-right" : "text-left"
                            } ${
                              locked
                                ? "cursor-not-allowed opacity-95"
                                : "hover:scale-[1.02] cursor-pointer"
                            } ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                : "bg-gray-50 text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <div
                              className="flex items-center gap-3"
                              dir={questionDir}
                            >
                              <span
                                className={`font-bold text-lg ${
                                  isSelected ? "text-white" : "text-blue-600"
                                }`}
                              >
                                {optionLabels[i] || "•"}
                              </span>

                              <span
                                dir={getTextDir(option)}
                                className={`flex-1 text-lg ${
                                  questionDir === "rtl"
                                    ? "text-right"
                                    : "text-left"
                                }`}
                              >
                                {option}
                              </span>

                              {isSelected && (
                                <span className="text-2xl">✓</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* ✅ Feedback */}
                    {currentFeedback && (
                      <div
                        className={`mt-6 p-4 rounded-xl ${
                          currentFeedback.correct
                            ? "bg-green-50 border-2 border-green-500"
                            : "bg-red-50 border-2 border-red-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {currentFeedback.correct ? (
                            <>
                              <span className="text-2xl">✅</span>
                              <p className="text-green-700 font-semibold text-lg">
                                إجابة صحيحة! ممتاز
                              </p>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl">❌</span>
                              <div>
                                <p className="text-red-700 font-semibold text-lg">
                                  إجابة خاطئة
                                </p>
                                <p className="text-gray-700 mt-1">
                                  💡 الإجابة الصحيحة:{" "}
                                  <span
                                    className="font-bold text-green-700"
                                    dir={getTextDir(
                                      currentFeedback.correctAnswer,
                                    )}
                                  >
                                    {currentFeedback.correctAnswer}
                                  </span>
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {(currentStatus === "timeout" ||
                      currentStatus === "skipped") && (
                      <div className="mt-6 p-4 rounded-xl bg-orange-50 border-2 border-orange-500">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⏳</span>
                          <p className="text-orange-700 font-semibold text-lg">
                            لم تتم الإجابة على هذا السؤال
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowReview(true)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
                      >
                        📋 مراجعة
                      </button>

                      {!currentStatus && (
                        <button
                          onClick={handleSkip}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                        >
                          ⏭️ تخطي
                        </button>
                      )}
                    </div>

                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <button
                        onClick={goNext}
                        disabled={!currentStatus}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                      >
                        التالي <span>➡️</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirmSubmit(true)}
                        disabled={attemptedCount < totalQuestions}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                      >
                        ✅ إنهاء الامتحان
                      </button>
                    )}
                  </div>

                  {!currentStatus && (
                    <p className="text-sm text-gray-500 mt-4">
                      ⏱️ تذكير: بعد 60 ثانية سيُعتبر السؤال بدون إجابة. (لن
                      تنتقل تلقائيًا، لكن سيُقفل السؤال ويصبح برتقالي)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ResultsScreen
              examData={examData}
              score={score}
              answers={answers}
              questionStatus={questionStatus}
              timeSpent={timeSpent}
              correctCount={correctCount}
              timeoutCount={timeoutCount}
              examResultId={examResultId}
              sharing={sharing}
              setSharing={setSharing}
              setShowShareModal={setShowShareModal}
              setShareUrl={setShareUrl}
              createShareLink={createShareLink}
              router={router}
              summary={summary}
              onRetry={handleRetryExam} // ✅ retry only after finish
            />
          )}
        </div>
      </div>

      {/* ✅ Share Modal */}
      {showShareModal && shareUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          dir="rtl"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">🔗 رابط مشاركة النتيجة</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">انسخ الرابط وشاركه:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    showToast("✅ تم نسخ الرابط بنجاح", "success");
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  📋 نسخ
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ✅ Review Modal */}
      {showReview && (
        <ReviewModal
          examData={examData}
          questionOrder={questionOrder}
          answers={answers}
          questionStatus={questionStatus}
          timeSpent={timeSpent}
          onClose={() => setShowReview(false)}
        />
      )}

      {/* ✅ Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ⚠️ تأكيد إنهاء الامتحان
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إنهاء الامتحان؟ لن تتمكن من تعديل إجاباتك بعد
              الإرسال.
              <br />
              <span className="font-semibold text-blue-600">
                تم إنهاء {attemptedCount} من {totalQuestions} سؤال
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={attemptedCount < totalQuestions}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                ✅ تأكيد الإرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardNavbar>
  );
}

/* ===========================
   ✅ Results Screen Component
=========================== */
function ResultsScreen({ examData, score, correctCount, router, onRetry }) {
  const totalQuestions = examData?.questions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 النتيجة</h2>

        <p className="text-gray-700 mb-4">
          نتيجتك: <b className="text-blue-700">{score}%</b> — صح:{" "}
          <b className="text-green-700">{correctCount}</b> / {totalQuestions}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🔁 إعادة الامتحان (بترتيب جديد)
          </button>

          <button
            onClick={() => router.push("/dashboard/")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            الرجوع
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   ✅ Review Modal
=========================== */
function ReviewModal({
  examData,
  questionOrder,
  answers,
  questionStatus,
  timeSpent,
  onClose,
}) {
  const total = examData?.questions?.length || 0;

  const label = (st) =>
    st === "correct"
      ? "✅ صح"
      : st === "wrong"
        ? "❌ غلط"
        : st === "timeout"
          ? "⏳ انتهى الوقت"
          : st === "skipped"
            ? "⏭️ تم التخطي"
            : "⬜ غير مجاب";

  const boxClass = (st) =>
    st === "correct"
      ? "bg-green-50 border-green-300"
      : st === "wrong"
        ? "bg-red-50 border-red-300"
        : st === "timeout" || st === "skipped"
          ? "bg-orange-50 border-orange-300"
          : "bg-gray-50 border-gray-200";

  const getQ = (pos) => {
    const qIdx = questionOrder?.length ? questionOrder[pos] : pos;
    return { q: examData.questions?.[qIdx], qIdx };
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">📋 مراجعة التقدم</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {Array.from({ length: total }).map((_, pos) => {
            const st = questionStatus[pos] || "unanswered";
            const { q } = getQ(pos);

            const userAns = answers[pos];
            const correctAns = q?.correctAnswer;

            const qDir = getTextDir(q?.questionText || "");
            const ansDir = getTextDir(userAns || "");
            const correctDir = getTextDir(correctAns || "");

            return (
              <div
                key={pos}
                className={`p-4 rounded-lg border-2 ${boxClass(st)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-700">
                    السؤال {pos + 1}
                  </span>
                  <span className="font-semibold">{label(st)}</span>
                </div>

                <p
                  className={`text-sm text-gray-700 mb-2 ${
                    qDir === "rtl" ? "text-right" : "text-left"
                  }`}
                  dir={qDir}
                >
                  {q?.questionText?.substring(0, 160)}
                  {q?.questionText?.length > 160 ? "..." : ""}
                </p>

                <div className="text-sm text-gray-700 flex flex-col gap-1">
                  <span>
                    ⏱️ وقتك:{" "}
                    <b>
                      {typeof timeSpent[pos] === "number"
                        ? `${timeSpent[pos]}s`
                        : "-"}
                    </b>
                  </span>

                  {userAns ? (
                    <span>
                      🧩 إجابتك:{" "}
                      <b dir={ansDir} className="text-gray-900">
                        {userAns}
                      </b>
                    </span>
                  ) : (
                    <span className="text-gray-600">🧩 لم تقم بالإجابة</span>
                  )}

                  {st === "correct" && (
                    <span className="text-green-700 font-semibold">
                      ✅ إجابتك صحيحة
                    </span>
                  )}

                  {(st === "wrong" || st === "timeout" || st === "skipped") && (
                    <div className="mt-2 p-3 rounded-lg bg-white/70 border">
                      <p className="text-red-700 font-semibold">
                        ❌ إجابتك كانت {st === "wrong" ? "غلط" : "غير مُجابة"}
                      </p>
                      <p className="text-gray-800 mt-1">
                        ✅ الإجابة الصحيحة هي:{" "}
                        <b dir={correctDir} className="text-green-700">
                          {correctAns}
                        </b>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
