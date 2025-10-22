export default function Login({ onLogin, switchToRegister }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
    
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 relative z-10">
      
        <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-8 shadow-2xl">
         
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl"></div>
          
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 text-cyan-400 tracking-wider">Sign in to Palpay</h1>
            <p className="text-cyan-300 text-sm mb-8 opacity-70">Log in to continue sending, saving, and managing your money effortlessly.</p>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
              {/* <div className="relative">
              </div> */}
            </div>

            <button
              onClick={onLogin}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/50 transition transform hover:scale-105 hover:shadow-cyan-400/60"
            >
              Login
            </button>

            <div className="flex justify-center items-center mt-6 text-sm">
              <button
                onClick={switchToRegister}
                className="text-cyan-400 hover:text-cyan-300 transition"
              >
                Don't have an account? Register
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-30"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center text-white space-y-6 p-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PALPAY BANKING
            </h1>
          </div>
          
          <div className="h-px bg-gradient-to-r from-cyan-500 to-transparent w-3/4"></div>
          
          <p className="text-2xl text-cyan-200 font-light leading-relaxed">
            The Future of Digital Finance
          </p>
          
          <p className="text-lg text-slate-300 leading-relaxed">
            Experience seamless, secure, and intelligent banking solutions powered by cutting-edge technology. Your financial freedom starts here.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              ⚡ Instant Transfers
            </span>
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              🔒 Bank-Level Security
            </span>
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              🌐 Global Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
