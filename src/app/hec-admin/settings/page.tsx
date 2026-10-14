"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<{type: "error" | "success"; msg: string} | null>(null);
    const [loading, setLoading] = useState(false);

    // 2FA States
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);
    const [is2FALoading, setIs2FALoading] = useState(true);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    
    // Setup Data
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verifyCode, setVerifyCode] = useState("");
    const [setupError, setSetupError] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [copiedCodes, setCopiedCodes] = useState(false);

    useEffect(() => {
        fetch2FAStatus();
    }, []);

    const fetch2FAStatus = async () => {
        setIs2FALoading(true);
        try {
            const res = await fetch("/api/auth/2fa/status");
            if (res.ok) {
                const data = await res.json();
                setTwoFactorEnabled(data.twoFactorEnabled);
                setRemainingBackupCodes(data.remainingBackupCodesCount || 0);
            }
        } catch (err) {
            console.error("Failed to load 2FA status", err);
        } finally {
            setIs2FALoading(false);
        }
    };

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

    const start2FASetup = async () => {
        setSetupError("");
        setVerifyCode("");
        setCopiedCodes(false);
        try {
            const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
            const data = await res.json();
            if (res.ok && data.success) {
                setQrCodeUrl(data.qrCodeUrl);
                setSecretKey(data.secret);
                setBackupCodes(data.backupCodes);
                setShowSetupModal(true);
            } else {
                alert("Could not initialize 2FA setup.");
            }
        } catch {
            alert("Network error.");
        }
    };

    const confirm2FAEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setSetupError("");
        if (!verifyCode || verifyCode.trim().length !== 6) {
            setSetupError("Please enter the 6-digit code from your app.");
            return;
        }

        try {
            const res = await fetch("/api/auth/2fa/enable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: verifyCode.trim(),
                    secret: secretKey,
                    backupCodes
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setShowSetupModal(false);
                setTwoFactorEnabled(true);
                setRemainingBackupCodes(backupCodes.length);
                alert("🎉 Two-Factor Authentication has been successfully enabled!");
            } else {
                setSetupError(data.error || "Invalid code. Please check your authenticator.");
            }
        } catch {
            setSetupError("Network error occurred.");
        }
    };

    const handle2FADisable = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/2fa/disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: disablePassword })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setShowDisableModal(false);
                setDisablePassword("");
                setTwoFactorEnabled(false);
                setRemainingBackupCodes(0);
                alert("Two-Factor Authentication has been disabled.");
            } else {
                alert(data.error || "Incorrect password.");
            }
        } catch {
            alert("Network error.");
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join("\n"));
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 3000);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Account & Security Settings</h1>
                <p className="text-sm text-gray-500">Configure administrative access credentials and military-grade two-factor authentication.</p>
            </div>

            {/* TWO-FACTOR AUTHENTICATION CARD */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">Google Authenticator (2FA)</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {twoFactorEnabled ? 'Active' : 'Disabled'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Protect your console with RFC 6238 standard TOTP codes + 5 emergency backup recovery codes.</p>
                        </div>
                    </div>

                    {!is2FALoading && (
                        <div>
                            {twoFactorEnabled ? (
                                <button
                                    onClick={() => setShowDisableModal(true)}
                                    className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                                >
                                    Disable 2FA
                                </button>
                            ) : (
                                <button
                                    onClick={start2FASetup}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                                >
                                    Enable 2FA Protection
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {twoFactorEnabled ? (
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">✓</div>
                            <div>
                                <p className="text-xs font-bold text-emerald-900">Your account is fortified with 2FA.</p>
                                <p className="text-xs text-emerald-700">Every sign-in requires username, password, and your smartphone authenticator code.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-gray-700">Emergency Backup Codes:</span>
                            <span className="ml-1.5 px-2 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs font-bold text-gray-800">{remainingBackupCodes} remaining</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <span className="font-bold">Recommended Security Measure:</span> Enabling Two-Factor Authentication ensures that nobody can breach the HEC admin portal even if your password is stolen or intercepted.
                        </div>
                    </div>
                )}
            </div>

            {/* CHANGE PASSWORD CARD */}
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

            {/* 2FA SETUP MODAL */}
            {showSetupModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-4 mb-5">
                            <h3 className="text-xl font-bold text-gray-900">Setup Google Authenticator</h3>
                            <button onClick={() => setShowSetupModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {setupError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs mb-4">{setupError}</div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Step 1: Scan QR Code</span>
                                <p className="text-xs text-gray-600 mb-3">Open Google Authenticator, Microsoft Authenticator, or Apple Passwords on your phone and scan:</p>
                                <div className="bg-gray-50 p-4 rounded-2xl flex justify-center border border-gray-100">
                                    {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 rounded-xl shadow-sm" />}
                                </div>
                                <div className="mt-2 text-center">
                                    <span className="text-[11px] text-gray-500">Or enter secret key manually: </span>
                                    <code className="text-xs font-mono font-bold text-gray-800 select-all bg-gray-100 px-2 py-0.5 rounded">{secretKey}</code>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Step 2: Save Emergency Backup Codes</span>
                                <p className="text-xs text-gray-600 mb-2">If your phone is ever lost or damaged, each of these 5 codes can be used once to access your console:</p>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs font-bold grid grid-cols-2 gap-2 text-center text-gray-800">
                                    {backupCodes.map((code, idx) => (
                                        <div key={idx} className="bg-white py-1 px-2 rounded border border-gray-100">{code}</div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={copyBackupCodes}
                                    className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                                >
                                    {copiedCodes ? "✓ Copied to Clipboard!" : "📋 Copy All Backup Codes"}
                                </button>
                            </div>

                            <form onSubmit={confirm2FAEnable} className="border-t pt-4 space-y-3">
                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Step 3: Enter 6-Digit Verification Code</span>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full text-center tracking-widest text-2xl font-mono font-bold border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#009049] outline-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#009049] hover:bg-[#007b3e] text-white font-bold rounded-xl shadow-md transition-all text-sm"
                                >
                                    Verify Code & Activate 2FA
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 2FA DISABLE MODAL */}
            {showDisableModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Disable Two-Factor Authentication</h3>
                        <p className="text-xs text-gray-600 mb-4">Please confirm your current administrator password to turn off 2FA protection.</p>
                        <form onSubmit={handle2FADisable} className="space-y-4">
                            <input
                                type="password"
                                required
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                                >
                                    Confirm & Disable
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDisableModal(false)}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
