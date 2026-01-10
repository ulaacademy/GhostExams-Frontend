"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const SmartChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ NEW: Teacher buttons state
  const [activeTeacher, setActiveTeacher] = useState(null);

  // ✅ NEW: Teacher buttons config
  const TEACHERS = [
    {
      key: "history",
      button: "معلم تاريخ AI",
      labelAr: "التاريخ",
      labelEn: "History",
      lang: "ar",
    },
    {
      key: "arabic",
      button: "معلم عربي AI",
      labelAr: "اللغة العربية",
      labelEn: "Arabic",
      lang: "ar",
    },
    {
      key: "english",
      button: "معلم انجليزي AI",
      labelAr: "اللغة الإنجليزية",
      labelEn: "English",
      lang: "en",
    },
    {
      key: "religion",
      button: "معلم دين AI",
      labelAr: "الدين",
      labelEn: "Religion",
      lang: "ar",
    },
  ];

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  // ✅ NEW: Select teacher handler
  const selectTeacher = (teacherKey) => {
    const t = TEACHERS.find((x) => x.key === teacherKey);
    if (!t) return;

    setActiveTeacher(t);

    const msg =
      t.lang === "en"
        ? `Hi! I’m your AI teacher for ${t.labelEn}. Ask me any question from your subject and I’ll solve it step-by-step and explain it clearly.`
        : `أهلًا فيك! أنا معلمك الذكي لمادة ${t.labelAr} 🤖\nاسألني أي سؤال من مادتك (توجيهي أو أي صف) وأنا بحلّ لك خطوة بخطوة وبشرح بطريقة سهلة.`;

    setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
  };

  // ✅ لو عندك لاحقًا حالة اشتراك من AuthContext استبدلها
  const isSubscribed = false;

  // ✅ تنظيف وترتيب مبدئي للنص المستخرج (خصوصًا MCQ بالإنجليزي)
  const preprocessOcrText = (raw = "") => {
    let t = String(raw || "");

    // توحيد الأسطر والمسافات
    t = t.replace(/\r/g, "\n");
    t = t.replace(/[ \t]+/g, " ");
    t = t.replace(/\n{3,}/g, "\n\n");

    // إزالة رموز وضجيج شائع
    t = t.replace(/[|]/g, " ");
    t = t.replace(/[•●■◆]/g, "*");
    t = t.replace(/[_]{3,}/g, " ");

    // توحيد ترقيم الأسئلة: "* 1." -> "1."
    t = t.replace(/\*\s*(\d+)\s*[.)]/g, "$1.");
    t = t.replace(/^\s*\*\s*/gm, "");

    // فصل الخيارات A)B)C)D) لو ملزقة
    // مثال: "A)furry B) slimy C) ozone layer D) solitary"
    t = t.replace(/\s*([A-D])\)\s*/g, "\n$1) ");

    // تنظيف نهائي
    t = t.replace(/\n{3,}/g, "\n\n").trim();

    return t;
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await axios.post("/api/chatbot", {
        message: userInput,
        isSubscribed,
        // ✅ NEW: pass subject + preferredLang
        subject: activeTeacher?.key || "general",
        preferredLang: activeTeacher?.lang || "ar",
      });

      const botMessage = { sender: "bot", text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ حدث خطأ أثناء التواصل مع الشات بوت." },
      ]);
    }

    setUserInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // نقبل صورة أو PDF
    const isOk =
      file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isOk) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ ارفع صورة أو ملف PDF فقط." },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "📤 تم رفع الملف، جارٍ استخراج النص..." },
    ]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      // ✅ 1) OCR فقط عبر /api/ocr-space
      const ocrRes = await axios.post("/api/ocr-space", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const success = !!ocrRes?.data?.success;
      const extractedRaw = ocrRes?.data?.text || "";

      if (!success || !extractedRaw.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `❌ فشل استخراج النص.\n${ocrRes?.data?.message || ""}`,
          },
        ]);
        return;
      }

      // ✅ تنظيف وترتيب مبدئي للنص
      const extractedText = preprocessOcrText(extractedRaw);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `📄 النص المستخرج:\n${extractedText}` },
        { sender: "bot", text: "🧠 جاري ترتيب الأسئلة وحلّها..." },
      ]);

      // ✅ 2) حل + ترتيب من /api/chatbot
      const aiRes = await axios.post("/api/chatbot", {
        message: extractedText,
        isSubscribed,
        // ✅ NEW: pass subject + preferredLang
        subject: activeTeacher?.key || "general",
        preferredLang: activeTeacher?.lang || "ar",
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: aiRes?.data?.reply || "❌ لم يصل رد من الشات." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ فشل في معالجة الملف.\n${
            err?.response?.data?.message || err?.message || ""
          }`,
        },
      ]);
    } finally {
      // ✅ عشان تقدر ترفع نفس الملف مرة ثانية
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      sender: "bot",
      text: `👻 مرحبًا! أنا الشبح — مساعدك الذكي 🤖\n\n📤 ارفع سؤالك كصورة أو ملف (PDF) وسأقوم بـ:\n- حل السؤال خطوة بخطوة ✅\n- شرح الإجابة وتفسيرها بطريقة سهلة 🧠\n- مساعدتك بالمراجعة قبل الامتحان 📚\n\n🎯 مناسب لـ:\n- طلاب التوجيهي 🇯🇴\n- طلاب المدارس (أي صف)\n- أي مادة: رياضيات، عربي، إنجليزي، علوم… 💡\n\n💬 جرّبني الآن: اكتب سؤالك أو ارفع الملف وأنا معك!`,
    };
    setMessages([welcomeMessage]);
  }, []);

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
        {/* ✅ NEW: Teacher buttons row */}
        <div className="w-full flex gap-2 flex-wrap mb-2">
          {TEACHERS.map((t) => (
            <button
              key={t.key}
              onClick={() => selectTeacher(t.key)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                activeTeacher?.key === t.key
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
              title={
                t.lang === "en"
                  ? `Choose AI teacher: ${t.labelEn}`
                  : `اختر معلم AI: ${t.labelAr}`
              }
            >
              {t.button}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="اكتب سؤالك هنا..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          إرسال
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
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg"
        >
          📷 ارفع صورة / PDF
        </button>
      </div>
    </div>
  );
};

export default SmartChatBox;
