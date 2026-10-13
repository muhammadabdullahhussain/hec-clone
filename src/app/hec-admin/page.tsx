
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
    const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/stats", { cache: "no-store" })
            .then(res => {
                if(res.status === 401) {
                    window.location.href = '/hec-admin/login?expired=true';
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.success) {
                    setStats(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#006D9A] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Overview Dashboard</h1>
                    <p className="text-gray-500 text-sm">Monitor and manage HEC Degree Attestation Records.</p>
                </div>
                <div className="mt-4 md:mt-0 text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    System Status: <span className="text-green-600 font-bold ml-1">● Online</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Records Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-0 top-0 h-full w-2 bg-[#006D9A]"></div>
                    <div className="bg-blue-50 p-4 rounded-full mr-5 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-[#006D9A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                        <p className="text-4xl font-extrabold text-gray-900">{stats.total}</p>
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">Total Records</h3>
                    </div>
                </div>

                {/* Active Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-0 top-0 h-full w-2 bg-[#009049]"></div>
                    <div className="bg-green-50 p-4 rounded-full mr-5 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-[#009049]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <p className="text-4xl font-extrabold text-gray-900">{stats.active}</p>
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">Active Entries</h3>
                    </div>
                </div>

                {/* Deleted Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-0 top-0 h-full w-2 bg-red-500"></div>
                    <div className="bg-red-50 p-4 rounded-full mr-5 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </div>
                    <div>
                        <p className="text-4xl font-extrabold text-gray-900">{stats.deleted}</p>
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">In Trash Bin</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Quick Operations</h2>
                </div>
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-4">
                    <Link href="/hec-admin/add-record" className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#009049] to-[#007b3e] hover:from-[#007b3e] hover:to-[#006533] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add New Attestation Record
                    </Link>
                    <Link href="/hec-admin/records" className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 hover:border-[#006D9A] hover:text-[#006D9A] px-6 py-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                        Manage Existing Records
                    </Link>
                </div>
            </div>
        </div>
    );
}
