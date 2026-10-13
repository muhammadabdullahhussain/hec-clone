"use client";
import { useState } from "react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                window.location.href = "/hec-admin";
            } else {
                setError(data.error || "Invalid username or password.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#0f281e] to-[#0a192f] p-4 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/40 overflow-hidden relative z-10 border border-white/20">
                {/* Top Accent Gradient Bar */}
                <div className="bg-gradient-to-r from-[#009049] via-emerald-400 to-[#006D9A] h-2 w-full"></div>
                
                <div className="p-8 sm:p-10">
                    {/* Official HEC Brand Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100 mb-4 ring-4 ring-emerald-50">
                            <img 
                                src="/hec-logo.png" 
                                alt="HEC Emblem" 
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Government of Pakistan
                        </div>

                        <h1 className="text-center text-2xl font-extrabold text-gray-900 tracking-tight">
                            HEC Admin Portal
                        </h1>
                        <p className="text-center text-xs text-gray-500 mt-1 font-medium">
                            Degree Attestation Management Console
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50/90 border border-red-200 text-red-700 p-3.5 rounded-xl mb-6 text-sm flex items-center gap-2.5 shadow-sm animate-shake">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-xs">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Administrator Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter administrative username"
                                    className="pl-11 w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#009049] focus:border-[#009049] outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Security Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="pl-11 w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#009049] focus:border-[#009049] outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-2 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 transform transition-all duration-200 flex justify-center items-center ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#009049] to-[#007b3e] hover:from-[#007b3e] hover:to-[#006533] hover:shadow-xl active:scale-[0.98]'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In to Console'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <a href="/" className="text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Public Verification Portal
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
