"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../../../components/Navbar';

export default function AIExamView() {
  const router = useRouter();
  const { grade = '', term = '', subject = '' } = router.query;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateAIExam = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post(
          `https://ge-api.ghostexams.com/api/ai/generate-exam`,
          { grade, term, subject }
        );
        
        if (response.data.success && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
        } else {
          setError('⚠️ لم يتم العثور على أسئلة مناسبة لهذه المادة.');
        }
      } catch (err) {
        console.error('❌ فشل في توليد الامتحان:', err);
        setError('❌ فشل في توليد الامتحان. حاول مرة أخرى لاحقاً.');
      } finally {
        setLoading(false);
      }
    };

    if (grade && term && subject) {
      generateAIExam();
    }
  }, [grade, term, subject]);

  const handleAnswer = (isCorrect) => {
    setSelectedAnswer(isCorrect);
    setFeedback(isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة غير صحيحة!');
    if (isCorrect) setScore(score + 1);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🤖 امتحانات الذكاء الاصطناعي</h1>

        {loading && <p className="text-center text-blue-600">⏳ جاري تحميل الامتحان...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && currentQuestion ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h2>

            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`w-full py-2 px-4 rounded-md border transition ${
                    selectedAnswer !== null
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(option === currentQuestion.correctAnswer)}
                >
                  {option}
                </button>
              ))}
            </div>

            {feedback && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-center">
                <p>{feedback}</p>
                <p className="text-sm text-gray-600 mt-2">{currentQuestion.explanation}</p>
              </div>
            )}

            {selectedAnswer !== null && (
              <button
                onClick={nextQuestion}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                التالي ➡️
              </button>
            )}
          </div>
        ) : (
          !loading && (
            <div className="text-center">
              <h2 className="text-xl font-bold">🎉 لقد أكملت الامتحان!</h2>
              <p className="mt-2 text-lg">نتيجتك: {score} من {questions.length}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
