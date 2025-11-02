import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* Header */}
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🎓</div>
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Math Learning Hub
        </h1>
        <p className="text-2xl text-white/90 mb-8 drop-shadow">
          Fun and interactive math practice for young learners!
        </p>
      </div>

      {/* Math Apps Grid */}
      <div className="max-w-6xl mx-auto px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Multiplication Test Card */}
          <a
            href="/multiplication-test"
            className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-blue-200 hover:border-blue-400"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">🧮</div>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                Multiplication Test
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Practice multiplication tables (2-10) with an interactive number
                pad!
              </p>
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-blue-800 mb-2">Perfect for:</h3>
                <ul className="text-blue-700 text-left">
                  <li>• Ages 7+ learning multiplication</li>
                  <li>• Times tables practice (2×2 to 10×9)</li>
                  <li>• Building math confidence</li>
                  <li>• Touch-friendly tablet use</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full inline-block group-hover:scale-110 transition-transform">
                Start Learning! →
              </div>
            </div>
          </a>

          {/* Decimal Math Card */}
          <a
            href="/decimal-math"
            className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-green-200 hover:border-green-400"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">🔢</div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                Decimal Math
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Master addition and subtraction with decimal numbers
                (10.0-99.9)!
              </p>
              <div className="bg-green-50 rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-green-800 mb-2">Perfect for:</h3>
                <ul className="text-green-700 text-left">
                  <li>• Students learning decimals</li>
                  <li>• Real-world math applications</li>
                  <li>• Money and measurement practice</li>
                  <li>• Advanced elementary math</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-8 rounded-full inline-block group-hover:scale-110 transition-transform">
                Start Learning! →
              </div>
            </div>
          </a>
        </div>

        {/* Features Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white">
          <h2 className="text-4xl font-bold text-center mb-8">✨ Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-2xl font-bold mb-2">Touch Friendly</h3>
              <p className="text-white/90">
                Custom number pads perfect for tablets and touch devices
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-2xl font-bold mb-2">Instant Feedback</h3>
              <p className="text-white/90">
                Real-time scoring and encouraging messages for motivation
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-2xl font-bold mb-2">Kid-Friendly Design</h3>
              <p className="text-white/90">
                Colorful, engaging interface designed specifically for children
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
            <div className="text-3xl font-bold">2-10</div>
            <div className="text-sm opacity-90">Multiplication Tables</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
            <div className="text-3xl font-bold">10-99.9</div>
            <div className="text-sm opacity-90">Decimal Range</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
            <div className="text-3xl font-bold">∞</div>
            <div className="text-sm opacity-90">Unlimited Questions</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
            <div className="text-3xl font-bold">📊</div>
            <div className="text-sm opacity-90">Progress Tracking</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-white/70">
        <p className="text-lg">Made with ❤️ for young math learners</p>
        <p className="text-sm mt-2 opacity-75">
          Access from any device on your network: http://192.168.86.158:3002
        </p>
      </footer>
    </main>
  );
}
