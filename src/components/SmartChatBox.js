// ✅ SmartChatBox.js (FINAL)
"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import axios from "axios";

const SmartChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [activeTeacher, setActiveTeacher] = useState(null);

  const [isSending, setIsSending] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  // ✅ Replace later with real subscription state
  const isSubscribed = false;

  const TEACHERS = useMemo(
    () => [
      { key: "history", button: "معلم تاريخ AI", labelAr: "التاريخ", lang: "ar" },
      { key: "arabic", button: "معلم عربي AI", labelAr: "اللغة العربية", lang: "ar" },
      { key: "english", button: "معلم انجليزي AI", labelAr: "اللغة الإنجليزية", lang: "en" },
      { key: "religion", button: "معلم دين AI", labelAr: "الدين", lang: "ar" },
    ],
    []
  );

  const isArabic = (text = "") => /[\u0600-\u06FF]/.test(String(text || ""));

  const pushMsg = (msg) => setMessages((prev) => [...prev, msg]);

  const abortActiveRequest = () => {
    try {
      if (abortRef.current) abortRef.current.abort();
    } catch {}
    abortRef.current = null;
  };

  const selectTeacher = (teacherKey) => {
    const t = TEACHERS.find((x) => x.key === teacherKey);
    if (!t) return;
    setActiveTeacher(t);

    pushMsg({
      sender: "bot",
      text:
        t.lang === "en"
          ? `Hi! I’m your AI English teacher. Upload an image/PDF and I’ll solve it question-by-question.`
          : `أهلًا فيك! أنا معلمك الذكي لمادة ${t.labelAr} 🤖\nارفع السؤال صورة أو PDF وأنا بحلّه سؤال سؤال مع الشرح.`,
    });
  };

  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text) return;

    abortActiveRequest();
    pushMsg({ sender: "user", text });

    setIsSending(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const teacherKey = activeTeacher?.key || "auto";
    const preferredLang = activeTeacher?.lang || "auto";

    try {
      const response = await axios.post(
        "/api/chatbot",
        {
          message: text,
          isSubscribed,
          subject: teacherKey,
          preferredLang,
          teacherKey,
          ocrMeta: null,
        },
        { signal: controller.signal }
      );

      pushMsg({ sender: "bot", text: response?.data?.reply || "❌ لم يصل رد من الشات." });
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      pushMsg({ sender: "bot", text: `❌ خطأ.\n${err?.response?.data?.error || err?.message || ""}` });
    } finally {
      setIsSending(false);
      setUserInput("");
      abortRef.current = null;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    abortActiveRequest();

    const isOk = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isOk) {
      pushMsg({ sender: "bot", text: "❌ ارفع صورة أو PDF فقط." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const teacherKey = activeTeacher?.key || "auto";
    const preferredLang = activeTeacher?.lang || "auto";

    // ✅ Step 1 message (NO OCR text shown)
    pushMsg({ sender: "bot", text: "✅ تم رفع الأسئلة، جاري تحليل النص..." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("preferredLang", preferredLang);
    formData.append("mode", "exam");
    formData.append("teacherKey", teacherKey);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsOcrLoading(true);

      const ocrRes = await axios.post("/api/ocr-space", formData, { signal: controller.signal });

      if (!ocrRes?.data?.success || !ocrRes?.data?.text?.trim()) {
        pushMsg({ sender: "bot", text: `❌ فشل تحليل الملف.\n${ocrRes?.data?.message || ""}` });
        return;
      }

      // ✅ Step 2 message
      pushMsg({ sender: "bot", text: "🧠 تم تحليل النص، جاري حل الأسئلة وشرحها..." });
      setIsSolving(true);

      const aiRes = await axios.post(
        "/api/chatbot",
        {
          message: ocrRes.data.text,
          isSubscribed,
          forceExam: true,
          subject: teacherKey,
          preferredLang,
          teacherKey,
          ocrMeta: ocrRes?.data?.meta || null,
        },
        { signal: controller.signal }
      );

      pushMsg({ sender: "bot", text: aiRes?.data?.reply || "❌ لم يصل رد." });
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      pushMsg({ sender: "bot", text: `❌ فشل.\n${err?.response?.data?.error || err?.message || ""}` });
    } finally {
      setIsOcrLoading(false);
      setIsSolving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      abortRef.current = null;
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text:
          "👻 مرحبًا! ارفع صورة/PDF.\n" +
          "✅ لن أعرض النص المستخرج.\n" +
          "✅ سأحل سؤال سؤال مع الشرح.\n" +
          "✅ إذا ما اخترت معلم، سأحدد المادة تلقائيًا.",
      },
    ]);
  }, []);

  const busy = isSending || isOcrLoading || isSolving;

  return (
    <div className="max-w-2xl w-full mx-auto mt-10 bg-white text-gray-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-6 h-[60vh] overflow-y-auto space-y-4 bg-gray-100 flex flex-col">
        {messages.map((msg, idx) => {
          const rtl = isArabic(msg.text);
          return (
            <div
              key={idx}
              dir={rtl ? "rtl" : "ltr"}
              className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                rtl ? "text-right" : "text-left"
              } ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-black self-start"
              }`}
            >
              {msg.text}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 flex gap-2 flex-wrap sm:flex-nowrap border-t bg-white">
        <div className="w-full flex gap-2 flex-wrap mb-2">
          {TEACHERS.map((t) => (
            <button
              key={t.key}
              onClick={() => selectTeacher(t.key)}
              disabled={busy}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                activeTeacher?.key === t.key
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {t.button}
            </button>
          ))}
        </div>

        <textarea
          placeholder="اكتب سؤالك هنا... (Enter للإرسال | Shift+Enter لسطر جديد)"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!busy) sendMessage();
            }
          }}
          rows={2}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 resize-none"
          disabled={busy}
        />

        <button
          onClick={sendMessage}
          disabled={busy || !userInput.trim()}
          className={`px-4 py-2 rounded-lg text-white ${
            busy || !userInput.trim()
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSending ? "..." : "إرسال"}
        </button>

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleImageUpload}
          className="hidden"
          ref={fileInputRef}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className={`px-4 py-2 rounded-lg ${
            busy
              ? "bg-yellow-300 cursor-not-allowed text-black"
              : "bg-yellow-500 hover:bg-yellow-600 text-black"
          }`}
        >
          {isOcrLoading ? "📷 ..." : "📷 ارفع صورة / PDF"}
        </button>

        <button
          onClick={abortActiveRequest}
          disabled={!busy}
          className={`px-4 py-2 rounded-lg border ${
            busy
              ? "bg-white hover:bg-gray-50 text-gray-900"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          title="إيقاف العملية الحالية"
        >
          إيقاف
        </button>
      </div>

      {(isOcrLoading || isSolving) && (
        <div className="px-4 pb-4 text-sm text-gray-600">
          {isOcrLoading ? "🔎 جارٍ تحليل النص..." : "🧠 جارٍ حلّ الأسئلة..."}
        </div>
      )}
    </div>
  );
};

export default SmartChatBox;
