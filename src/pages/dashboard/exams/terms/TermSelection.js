"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../../components/Navbar";

export default function TermSelection() {
  const router = useRouter();
  const [selectedTerm, setSelectedTerm] = useState(null);

  const handleTermSelection = (term) => {
    setSelectedTerm(term);
    router.push(`/dashboard/exams/view/AIExamView?term=${term}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-700">
          📚 اختر الفصل الدراسي المناسب
        </h1>
        <p className="text-lg text-gray-600">
          يرجى اختيار الفصل الدراسي للانتقال لاختيار المادة
        </p>

        <div className="flex space-x-4">
          <button
            onClick={() => handleTermSelection("term1")}
            className={`w-48 h-20 ${
              selectedTerm === "term2"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
            disabled={selectedTerm === "term2"}
          >
            الفصل الدراسي الأول
          </button>

          <button
            onClick={() => handleTermSelection("term2")}
            className={`w-48 h-20 ${
              selectedTerm === "term1"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white text-lg font-semibold rounded-lg shadow-md transition duration-300`}
            disabled={selectedTerm === "term1"}
          >
            الفصل الدراسي الثاني
          </button>
        </div>
      </div>
    </div>
  );
}
