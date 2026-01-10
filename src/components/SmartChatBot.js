"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const SmartChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // ✅ للتحكم في إظهار الشات
  const chatEndRef = useRef(null);

  const isSubscribed = false;

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await axios.post("/api/chatbot", {
        message: userInput,
        isSubscribed,
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]); // ✅

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        sender: "bot",
        text: `\u200F👋 مرحبًا بك، اسألني وبساعدك!\n\n\u200F🟡 اسأل عن:\n\u200F- تفاصيل الاشتراك والباقات\n\u200F- طريقة استخدام المنصة\n\u200F- أي مشكلة تواجهك\n\n\u200F💬 اكتب سؤالك وسأقوم بمساعدتك!`,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]); // ✅

  return (
    <>
      {/* ✅ زر فتح/إغلاق الشات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        {isOpen ? "❌  إغلاق" : "💬 اسألني بساعدك بالموقع "}
      </button>

      {/* ✅ نافذة الشات */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[360px] bg-white rounded-xl shadow-lg overflow-hidden z-50 border border-gray-300">
          <div className="p-4 h-[400px] overflow-y-auto space-y-4 bg-gray-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-300 text-black self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 flex gap-2 border-t bg-white">
            <input
              type="text"
              placeholder="اكتب سؤالك هنا..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-black"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              إرسال
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartChatBot;
