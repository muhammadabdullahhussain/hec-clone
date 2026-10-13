
"use client";
import { useState } from "react";

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<{type: "error" | "success"; msg: string} | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword)
            return setStatus({ type: "error", msg: "New passwords do not match." });
        if (newPassword.length < 4)
            return setStatus({ type: "error", msg: "Password must be at least 4 characters long." });

        setLoading(true); setStatus(null);
        try {
            const res = await fetch("/api/auth/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.status === 401) { window.location.href = '/hec-admin/login?expired=true'; return; }
            if (!res.ok) {
                setStatus({ type: "error", msg: data.error || "Failed to update password." });
            } else {
                setStatus({ type: "success", msg: "Password updated successfully!" });
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            }
        } catch { setStatus({ type: "error", msg: "Network error occurred." }); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-500 mb-8">Manage your admin portal security and preferences.</p>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="bg-[#006D9A] p-2 rounded-lg text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                </div>
                
                {status && (
                    <div className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-center ${status.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            {status.type === 'error' ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            )}
                        </svg>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#006D9A] focus:border-[#006D9A] outline-none transition-shadow bg-gray-50 focus:bg-white"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#009049] focus:border-[#009049] outline-none transition-shadow bg-gray-50 focus:bg-white"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#009049] focus:border-[#009049] outline-none transition-shadow bg-gray-50 focus:bg-white"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-lg text-white font-bold transition-all shadow-sm flex items-center justify-center min-w-[140px] ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#009049] hover:bg-[#007b3e] hover:-translate-y-0.5 hover:shadow-md'}`}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
