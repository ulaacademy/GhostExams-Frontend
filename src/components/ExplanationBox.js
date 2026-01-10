"use client";
import React from "react";
import "../styles/teacherExamStyles.css"; // ✅ استيراد ملف التنسيق الخاص بالتصميم
import "../styles/schoolExamStyles.css"; // ✅ استيراد ملف التنسيق الخاص بالتصميم

const ExplanationBox = ({ explanation, onClose }) => {
  return (
    <div className="explanation-box">
      <div className="explanation-header">
        <h3>📖 الشرح المفصل</h3>
        <button className="close-button" onClick={onClose}>
          ❌
        </button>
      </div>
      <p className="explanation-text">{explanation}</p>
    </div>
  );
};

export default ExplanationBox;
