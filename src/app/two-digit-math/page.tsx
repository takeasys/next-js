"use client";

import { useState, useEffect } from "react";

// Global configuration
const QUESTION_TIME_LIMIT = 600; // seconds per question

interface Question {
  num1: number;
  num2: number;
  operation: "+" | "-";
  answer: number;
}

export default function TwoDigitMathTest() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    num1: 0,
    num2: 0,
    operation: "+",
    answer: 0,
  });
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [answerDigits, setAnswerDigits] = useState<{ [key: string]: string }>({
    hundreds: "",
    tens: "",
    ones: "",
  });
  const [selectedPosition, setSelectedPosition] = useState<string>("ones");
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // Generate a new 2-digit math question
  const generateQuestion = () => {
    // Clear existing timer
    if (timerId) {
      clearInterval(timerId);
    }

    // Generate 2-digit numbers (10-99)
    const num1 = Math.floor(Math.random() * 90) + 10; // 10-99
    const num2 = Math.floor(Math.random() * 90) + 10; // 10-99
    const operation = Math.random() < 0.5 ? "+" : "-";

    let answer: number;
    if (operation === "+") {
      answer = num1 + num2;
    } else {
      // For subtraction, ensure result is positive
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      answer = larger - smaller;
      setCurrentQuestion({ num1: larger, num2: smaller, operation, answer });
      setUserAnswer("");
      setAnswerDigits({ hundreds: "", tens: "", ones: "" });
      setSelectedPosition("ones");
      setFeedback("");
      setIsCorrect(null);
      setTimeLeft(QUESTION_TIME_LIMIT);
      startTimer();
      return;
    }

    setCurrentQuestion({ num1, num2, operation, answer });
    setUserAnswer("");
    setAnswerDigits({ hundreds: "", tens: "", ones: "" });
    setSelectedPosition("ones");
    setFeedback("");
    setIsCorrect(null);
    setTimeLeft(QUESTION_TIME_LIMIT);
    startTimer();
  };

  // Start timer
  const startTimer = () => {
    const newTimerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - automatically check answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(newTimerId);
  };

  // Handle time up
  const handleTimeUp = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setIsCorrect(false);
    setTotalQuestions((prev) => prev + 1);
    setFeedback(
      `⏰ Time's up! The answer was ${currentQuestion.answer}. Try the next one!`
    );
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
    // Clear timer when answer is submitted
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    const userNum = parseInt(userAnswer);
    const correct = userNum === currentQuestion.answer;

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

    // Check if 10 questions completed and unlock reward
    const newTotalQuestions = totalQuestions + 1;
    if (newTotalQuestions >= 10 && !rewardUnlocked) {
      setRewardUnlocked(true);
      setShowRewardModal(true);
    }
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim() !== "") {
      checkAnswer();
    }
  };

  // Build answer string from digit positions
  const buildAnswerString = (digits: { [key: string]: string }) => {
    const { hundreds, tens, ones } = digits;
    let result = "";

    // Add digits from left to right
    if (hundreds) result += hundreds;
    if (tens) result += tens;
    if (ones) result += ones;

    return result;
  };

  // Handle number pad input
  const handleNumberPadInput = (value: string) => {
    if (value === "clear") {
      setAnswerDigits({ hundreds: "", tens: "", ones: "" });
      setUserAnswer("");
      setSelectedPosition("ones"); // Reset to starting position
    } else if (value === "backspace") {
      // Clear only the currently selected position
      setAnswerDigits((prev) => ({
        ...prev,
        [selectedPosition]: "",
      }));
    } else {
      // Add digit to the currently selected position
      setAnswerDigits((prev) => ({
        ...prev,
        [selectedPosition]: value,
      }));

      // Auto-advance to next position
      if (selectedPosition === "ones") {
        setSelectedPosition("tens");
      } else if (selectedPosition === "tens") {
        setSelectedPosition("hundreds");
      }
      // If already at hundreds, stay there
    }
  };

  // Rebuild userAnswer whenever answerDigits change
  useEffect(() => {
    const newAnswerString = buildAnswerString(answerDigits);
    setUserAnswer(newAnswerString);
  }, [answerDigits]);

  // Handle position selection
  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-5xl w-full h-[80vh]">
        {!gameStarted ? (
          // Welcome Screen
          <div className="text-center h-full flex flex-col justify-center">
            <div className="text-5xl mb-3">🔢</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Two-Digit Math Challenge!
            </h1>
            <p className="text-base text-gray-600 mb-4">
              Practice addition and subtraction with 2-digit numbers! 🌟
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-lg font-bold py-2 px-4 rounded-full hover:scale-105 transform transition-all duration-200 shadow-lg"
            >
              Start Challenge! 🚀
            </button>
          </div>
        ) : (
          // Game Screen - Left/Right Layout
          <div className="h-full flex">
            {/* Left Side - Question and Input */}
            <div className="flex-1 flex flex-col justify-center items-center pr-4">
              {/* Score Display */}
              <div className="flex justify-center items-center gap-2 mb-4">
                <div className="bg-yellow-100 rounded-full px-2 py-1">
                  <span className="text-sm font-bold text-yellow-800">
                    Score: {score}/{totalQuestions}
                  </span>
                </div>
                <div className="bg-green-100 rounded-full px-2 py-1">
                  <span className="text-sm font-bold text-green-800">
                    {getPercentage()}% 🎯
                  </span>
                </div>
                {/* Reward Progress */}
                {!rewardUnlocked && totalQuestions < 10 && (
                  <div className="bg-purple-100 rounded-full px-2 py-1">
                    <span className="text-sm font-bold text-purple-800">
                      🏎️ {10 - totalQuestions} to unlock reward!
                    </span>
                  </div>
                )}
                {rewardUnlocked && (
                  <div className="bg-purple-100 rounded-full px-2 py-1">
                    <span className="text-sm font-bold text-purple-800">
                      🏎️ Reward Unlocked!
                    </span>
                  </div>
                )}
                {/* Timer Display */}
                {isCorrect === null && (
                  <div
                    className={`rounded-full px-2 py-1 ${
                      timeLeft <= 10 ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        timeLeft <= 10 ? "text-red-800" : "text-blue-800"
                      }`}
                    >
                      ⏰ {timeLeft}s
                    </span>
                  </div>
                )}
              </div>

              {/* Question */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  Calculate:
                </h2>
                {/* Column Format Display */}
                <div className="inline-block bg-gray-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="font-mono space-y-1">
                    {/* Top number - right aligned with fixed width */}
                    <div
                      className="text-4xl font-bold text-gray-800 text-right"
                      style={{ width: "120px" }}
                    >
                      {currentQuestion.num1}
                    </div>
                    {/* Operation and second number */}
                    <div
                      className="text-4xl font-bold text-gray-800 flex items-center"
                      style={{ width: "120px" }}
                    >
                      <span className="text-orange-600 mr-4">
                        {currentQuestion.operation}
                      </span>
                      <span className="flex-1 text-right">
                        {currentQuestion.num2}
                      </span>
                    </div>
                    {/* Line separator */}
                    <div
                      className="border-b-2 border-gray-800"
                      style={{ width: "120px" }}
                    ></div>
                    {/* Answer area */}
                    <div
                      className="text-2xl font-bold text-gray-400 pt-1 text-right"
                      style={{ width: "120px" }}
                    >
                      ?
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Input with Clickable Position Selector */}
              <div className="mb-4">
                <div className="mb-3">
                  <p className="text-sm font-bold text-gray-600 mb-2 text-center">
                    Click on a digit position to select where to enter:
                  </p>
                  <div className="text-xs text-gray-500 text-center mb-2">
                    <span className="text-purple-600">■ Hundreds</span> |
                    <span className="text-blue-600"> ■ Tens</span> |
                    <span className="text-green-600"> ■ Ones</span>
                  </div>
                </div>

                {/* Clickable Answer Display */}
                <div className="flex justify-center items-center">
                  <div className="bg-white border-2 border-orange-300 rounded-xl px-4 py-2 font-mono text-3xl font-bold text-gray-800">
                    <button
                      onClick={() => handlePositionSelect("hundreds")}
                      className={`px-1 rounded transition-all duration-200 hover:scale-110 ${
                        selectedPosition === "hundreds"
                          ? "bg-purple-200 border-2 border-purple-500"
                          : "hover:bg-purple-100"
                      }`}
                      disabled={isCorrect !== null}
                    >
                      {answerDigits.hundreds || "_"}
                    </button>
                    <button
                      onClick={() => handlePositionSelect("tens")}
                      className={`px-1 rounded transition-all duration-200 hover:scale-110 ${
                        selectedPosition === "tens"
                          ? "bg-blue-200 border-2 border-blue-500"
                          : "hover:bg-blue-100"
                      }`}
                      disabled={isCorrect !== null}
                    >
                      {answerDigits.tens || "_"}
                    </button>
                    <button
                      onClick={() => handlePositionSelect("ones")}
                      className={`px-1 rounded transition-all duration-200 hover:scale-110 ${
                        selectedPosition === "ones"
                          ? "bg-green-200 border-2 border-green-500"
                          : "hover:bg-green-100"
                      }`}
                      disabled={isCorrect !== null}
                    >
                      {answerDigits.ones || "_"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-3">
                {isCorrect === null ? (
                  <button
                    onClick={checkAnswer}
                    disabled={userAnswer.trim() === ""}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold py-2 px-5 rounded-full hover:scale-105 transform transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check Answer! ✨
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-green-500 to-orange-600 text-white text-lg font-bold py-2 px-5 rounded-full hover:scale-105 transform transition-all duration-200 shadow-lg"
                  >
                    Next Question! 🎈
                  </button>
                )}
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`text-lg font-bold mb-2 ${
                    isCorrect ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>

            {/* Right Side - Number Pad */}
            <div className="flex-1 flex flex-col justify-center items-center pl-4 border-l-2 border-gray-200">
              {isCorrect === null ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2 text-center">
                    Enter digit for selected position:
                  </h3>
                  <div className="mb-2 text-center">
                    <span className="text-sm text-gray-600">
                      Currently entering:{" "}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        selectedPosition === "hundreds"
                          ? "text-purple-600"
                          : selectedPosition === "tens"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedPosition === "hundreds"
                        ? "Hundreds (100s)"
                        : selectedPosition === "tens"
                        ? "Tens (10s)"
                        : "Ones (1s)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-w-xs">
                    {/* Numbers 0-9 */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumberPadInput(num.toString())}
                        className="bg-gradient-to-b from-orange-400 to-red-600 text-white text-xl font-bold py-3 px-3 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                      >
                        {num}
                      </button>
                    ))}

                    {/* Bottom row: Clear and Backspace */}
                    <button
                      onClick={() => handleNumberPadInput("clear")}
                      className="bg-gradient-to-b from-red-400 to-red-700 text-white text-base font-bold py-3 px-3 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                    >
                      Clear All
                    </button>

                    <button
                      onClick={() => handleNumberPadInput("backspace")}
                      className="bg-gradient-to-b from-orange-500 to-orange-700 text-white text-base font-bold py-3 px-3 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg active:scale-95"
                    >
                      ⌫ Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">{isCorrect ? "🎉" : "🤔"}</div>
                  <p className="text-lg text-gray-600">
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
            <div className="animate-bounce text-5xl absolute top-1/4 left-1/4">
              🎉
            </div>
            <div className="animate-bounce text-5xl absolute top-1/3 right-1/4 animation-delay-200">
              ⭐
            </div>
            <div className="animate-bounce text-5xl absolute bottom-1/3 left-1/3 animation-delay-400">
              🎊
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

        {/* Car Racing Button (when reward unlocked) */}
        {gameStarted && rewardUnlocked && (
          <a
            href="/car-racing"
            className="absolute top-4 right-20 bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600 transition-colors text-sm"
          >
            🏎️ Race!
          </a>
        )}

        {/* Reward Modal */}
        {showRewardModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉🏎️🎉</div>
              <h2 className="text-3xl font-bold text-purple-600 mb-4">
                Congratulations!
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                You&apos;ve completed 10 questions! You&apos;ve unlocked a
                special reward:
              </p>
              <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                <div className="text-4xl mb-2">🏎️</div>
                <h3 className="text-2xl font-bold text-purple-800 mb-2">
                  Car Racing Game!
                </h3>
                <p className="text-purple-700">
                  Take a fun break and race through traffic!
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <a
                  href="/car-racing"
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
                >
                  🏎️ Play Car Racing!
                </a>
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="bg-gray-500 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-600 transition-colors"
                >
                  Continue Math
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
