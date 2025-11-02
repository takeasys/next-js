"use client";

import { useState } from "react";

interface Question {
  num1: number;
  num2: number;
  operation: "+" | "-";
  answer: number;
}

export default function DecimalMathTest() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    num1: 0,
    num2: 0,
    operation: "+",
    answer: 0,
  });
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Generate a new decimal math question
  const generateQuestion = () => {
    // Generate numbers with 1 decimal place (10.0 to 99.9)
    const num1 = Math.round((Math.random() * 89.9 + 10.0) * 10) / 10;
    const num2 = Math.round((Math.random() * 89.9 + 10.0) * 10) / 10;
    const operation = Math.random() < 0.5 ? "+" : "-";

    let answer: number;
    if (operation === "+") {
      answer = Math.round((num1 + num2) * 10) / 10;
    } else {
      // For subtraction, ensure result is positive
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      answer = Math.round((larger - smaller) * 10) / 10;
      setCurrentQuestion({ num1: larger, num2: smaller, operation, answer });
      setUserAnswer("");
      setFeedback("");
      setIsCorrect(null);
      return;
    }

    setCurrentQuestion({ num1, num2, operation, answer });
    setUserAnswer("");
    setFeedback("");
    setIsCorrect(null);
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTotalQuestions(0);
    generateQuestion();
  };

  // Check the answer
  const checkAnswer = () => {
    const userNum = parseFloat(userAnswer);
    const correct = Math.abs(userNum - currentQuestion.answer) < 0.01; // Allow small floating point errors

    setIsCorrect(correct);
    setTotalQuestions((prev) => prev + 1);

    if (correct) {
      setScore((prev) => prev + 1);
      setFeedback("🎉 Excellent! You got it right!");
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    } else {
      setFeedback(
        `Not quite! The answer is ${currentQuestion.answer}. Keep trying!`
      );
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim() !== "") {
      checkAnswer();
    }
  };

  // Handle number pad input
  const handleNumberPadInput = (input: string) => {
    if (isCorrect !== null) return; // Don't allow input after answer is checked

    if (input === "clear") {
      setUserAnswer("");
    } else if (input === "backspace") {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else if (input === ".") {
      // Only allow one decimal point
      if (!userAnswer.includes(".") && userAnswer.length > 0) {
        setUserAnswer((prev) => prev + input);
      }
    } else {
      // Limit to reasonable number length (e.g., 199.8)
      if (userAnswer.length < 6) {
        setUserAnswer((prev) => prev + input);
      }
    }
  };

  // Next question
  const nextQuestion = () => {
    generateQuestion();
  };

  // Calculate percentage
  const getPercentage = () => {
    if (totalQuestions === 0) return 0;
    return Math.round((score / totalQuestions) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full h-[90vh]">
        {!gameStarted ? (
          // Welcome Screen
          <div className="text-center h-full flex flex-col justify-center">
            <div className="text-8xl mb-6">🔢</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Decimal Math Fun!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Practice addition and subtraction with decimal numbers! 🌟
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-2xl font-bold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-200 shadow-lg"
            >
              Start Learning! 🚀
            </button>
          </div>
        ) : (
          // Game Screen - Left/Right Layout
          <div className="h-full flex">
            {/* Left Side - Question and Input */}
            <div className="flex-1 flex flex-col justify-center items-center pr-8">
              {/* Score Display */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <div className="bg-yellow-100 rounded-full px-4 py-2">
                  <span className="text-lg font-bold text-yellow-800">
                    Score: {score}/{totalQuestions}
                  </span>
                </div>
                <div className="bg-green-100 rounded-full px-4 py-2">
                  <span className="text-lg font-bold text-green-800">
                    {getPercentage()}% 🎯
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-700 mb-6">
                  Calculate:
                </h2>
                {/* Column Format Display */}
                <div className="inline-block bg-gray-50 rounded-2xl p-8 border-4 border-teal-200">
                  <div className="font-mono space-y-2">
                    {/* Top number - right aligned with fixed width */}
                    <div
                      className="text-6xl font-bold text-gray-800 text-right"
                      style={{ width: "280px" }}
                    >
                      {currentQuestion.num1.toFixed(1)}
                    </div>
                    {/* Operation and second number - aligned to decimal */}
                    <div
                      className="text-6xl font-bold text-gray-800 flex items-center"
                      style={{ width: "280px" }}
                    >
                      <span className="text-teal-600 mr-4">
                        {currentQuestion.operation}
                      </span>
                      <span className="flex-1 text-right">
                        {currentQuestion.num2.toFixed(1)}
                      </span>
                    </div>
                    {/* Line separator */}
                    <div
                      className="border-b-4 border-gray-800"
                      style={{ width: "280px" }}
                    ></div>
                    {/* Answer area */}
                    <div
                      className="text-4xl font-bold text-gray-400 pt-2 text-right"
                      style={{ width: "280px" }}
                    >
                      ?
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              <div className="mb-8">
                <input
                  type="text"
                  value={userAnswer}
                  readOnly
                  className="text-5xl text-center border-4 border-teal-300 rounded-2xl px-8 py-6 w-72 focus:border-teal-500 focus:outline-none text-gray-800 font-bold bg-white cursor-default"
                  placeholder="0.0"
                  disabled={isCorrect !== null}
                />
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                {isCorrect === null ? (
                  <button
                    onClick={checkAnswer}
                    disabled={userAnswer.trim() === ""}
                    className="bg-gradient-to-r from-teal-500 to-blue-600 text-white text-2xl font-bold py-4 px-10 rounded-full hover:scale-105 transform transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check Answer! ✨
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl font-bold py-4 px-10 rounded-full hover:scale-105 transform transition-all duration-200 shadow-lg"
                  >
                    Next Question! 🎈
                  </button>
                )}
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`text-2xl font-bold mb-4 ${
                    isCorrect ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>

            {/* Right Side - Number Pad */}
            <div className="flex-1 flex flex-col justify-center items-center pl-8 border-l-2 border-gray-200">
              {isCorrect === null ? (
                <div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Tap to enter your answer:
                  </h3>
                  <div className="grid grid-cols-3 gap-4 max-w-sm">
                    {/* Numbers 1-9 */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumberPadInput(num.toString())}
                        className="bg-gradient-to-b from-teal-400 to-teal-600 text-white text-3xl font-bold py-6 px-6 rounded-2xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                      >
                        {num}
                      </button>
                    ))}

                    {/* Bottom row: Clear, 0, Decimal Point */}
                    <button
                      onClick={() => handleNumberPadInput("clear")}
                      className="bg-gradient-to-b from-red-400 to-red-600 text-white text-xl font-bold py-6 px-6 rounded-2xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                    >
                      Clear
                    </button>

                    <button
                      onClick={() => handleNumberPadInput("0")}
                      className="bg-gradient-to-b from-teal-400 to-teal-600 text-white text-3xl font-bold py-6 px-6 rounded-2xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                    >
                      0
                    </button>

                    <button
                      onClick={() => handleNumberPadInput(".")}
                      className="bg-gradient-to-b from-blue-400 to-blue-600 text-white text-3xl font-bold py-6 px-6 rounded-2xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                    >
                      .
                    </button>

                    {/* Backspace button on new row */}
                    <div className="col-span-3 mt-2">
                      <button
                        onClick={() => handleNumberPadInput("backspace")}
                        className="bg-gradient-to-b from-orange-400 to-orange-600 text-white text-2xl font-bold py-4 px-8 rounded-2xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95 w-full"
                      >
                        ⌫ Backspace
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">{isCorrect ? "🎉" : "🤔"}</div>
                  <p className="text-2xl text-gray-600">
                    {isCorrect ? "Perfect!" : "Try the next one!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="animate-bounce text-8xl absolute top-1/4 left-1/4">
              🎉
            </div>
            <div className="animate-bounce text-8xl absolute top-1/3 right-1/4 animation-delay-200">
              ⭐
            </div>
            <div className="animate-bounce text-8xl absolute bottom-1/3 left-1/3 animation-delay-400">
              🎊
            </div>
          </div>
        )}

        {/* Encouragement Messages */}
        {gameStarted && totalQuestions > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-yellow-50 rounded-2xl px-6 py-3">
              <p className="text-lg text-yellow-800 text-center">
                {getPercentage() >= 80
                  ? "You&apos;re a decimal master! 🌟"
                  : getPercentage() >= 60
                  ? "Great decimal work! Keep it up! 💪"
                  : "You&apos;re learning decimals so well! 📚"}
              </p>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {gameStarted && (
          <button
            onClick={() => setGameStarted(false)}
            className="absolute top-4 right-4 bg-gray-500 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600 transition-colors text-sm"
          >
            🏠 Home
          </button>
        )}
      </div>
    </div>
  );
}
