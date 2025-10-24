import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Logs({ ensureCsrf, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", type: "" });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setStatus({ message: "", type: "" });
      if (ensureCsrf) await ensureCsrf();
      const { data } = await api.get("/logs", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      setLogs(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to fetch login logs. Please try again.";
      setStatus({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 top-0 left-1/4 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 bottom-0 right-1/4 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* NAV */}
      <nav className="relative z-10 bg-slate-900 bg-opacity-60 backdrop-blur-xl border-b border-cyan-500 border-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PALPAY BANKING — Login Activity
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-lg text-cyan-300 transition"
              >
                Refresh
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Recent Login Activity</h2>
          <p className="text-cyan-300">
            Last 10 login attempts recorded for your account.
          </p>
        </div>

        <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-6 shadow-xl relative">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl opacity-50"></div>

          {status.message && (
            <p
              className={`mb-4 text-sm ${
                status.type === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {status.message}
            </p>
          )}

          {loading ? (
            <div className="text-cyan-300">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="text-gray-400">No login activity yet.</div>
          ) : (
            <div className="space-y-3">
              {logs.map((row, idx) => (
                <div
                  key={`${row.created_at}-${idx}`}
                  className="bg-slate-800 bg-opacity-40 rounded-lg p-4 border border-cyan-500 border-opacity-20 hover:border-opacity-40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500 bg-opacity-20 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {new Date(row.created_at).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          IP: <span className="font-mono">{row.ip_address || "—"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="max-w-md text-right">
                      <p className="text-gray-300 text-sm truncate">
                        {row.user_agent || "Unknown user agent"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
