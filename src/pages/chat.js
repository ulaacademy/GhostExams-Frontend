"use client";
// 📁 /frontend/src/pages/chat.js
import React from "react";
import Navbar from "../components/Navbar";
import SmartChatBox from "../components/SmartChatBox"; // ✅ البوكس الثابت
import SmartChatBot from "../components/SmartChatBot"; // ✅ الزر العائم

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ✅ شريط التنقل */}
      <Navbar />

      {/* ✅ محتوى الشات */}
      <div
        className="flex flex-col items-center justify-center px-6 pt-28 pb-10"
        dir="rtl"
      >
        {/* ✅ CSS حركات بسيطة داخل الصفحة */}
        <style>{`
          @keyframes floaty {
            0%   { transform: translateY(0px); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          @keyframes glow {
            0%   { text-shadow: 0 0 10px rgba(250,204,21,.25); }
            50%  { text-shadow: 0 0 22px rgba(250,204,21,.55); }
            100% { text-shadow: 0 0 10px rgba(250,204,21,.25); }
          }
          @keyframes shine {
            0%   { transform: translateX(-120%); opacity: 0; }
            20%  { opacity: .35; }
            60%  { opacity: .15; }
            100% { transform: translateX(120%); opacity: 0; }
          }
          @keyframes softBounce {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(-4px); }
          }
          .heroFloat { animation: floaty 3.2s ease-in-out infinite; }
          .heroGlow  { animation: glow 2.4s ease-in-out infinite; }
          .shineWrap { position: relative; overflow: hidden; }
          .shineWrap::after{
            content:"";
            position:absolute;
            top:-40%;
            left:-30%;
            width:35%;
            height:180%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
            transform: translateX(-120%);
            animation: shine 3.8s ease-in-out infinite;
            pointer-events:none;
          }
          .softBounce { animation: softBounce 1.6s ease-in-out infinite; }
        `}</style>

        {/* ✅ العنوان الرئيسي بحركات حلوة */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-yellow-400 text-center leading-relaxed max-w-3xl heroFloat heroGlow shineWrap">
          <span className="inline-block animate-pulse">أنا الشبح 👻</span>{" "}
          <span className="inline-block softBounce">أول معلم Ai ذكي 🤖</span>{" "}
          <span className="inline-block">جربني!!</span>
        </h1>

        {/* ✅ سطر توضيحي أصغر باللون الأخضر الفاتح */}
        <p className="text-base md:text-lg text-green-300 text-center max-w-3xl leading-relaxed mb-3">
          أول معلم Ai ذكي 🤖 بساعدك على التفوق في امتحانات التوجيهي بأسلوب حديث
          وتفاعلي.
        </p>

        {/* ✅ سطر ثالث مع لمسة حركة على عبارة معينة */}
        <p className="text-sm md:text-base text-gray-200 text-center max-w-3xl leading-relaxed mb-6">
          بساعدك تحل وتحلل الأسئلة باستخدام الذكاء الاصطناعي —{" "}
          <span className="inline-block font-bold text-yellow-300 animate-pulse">
            🤖 أول معلم Ai ذكي 🤖
          </span>
        </p>

        {/* ✅ صندوق الشات */}
        <SmartChatBox />
      </div>

      {/* ✅ زر الشات العائم */}
      <SmartChatBot />
    </div>
  );
};

export default ChatPage;
