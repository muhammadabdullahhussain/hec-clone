"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    {
        href: '/hec-admin',
        label: 'Dashboard',
        exact: true,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
        )
    },
    {
        href: '/hec-admin/add-record',
        label: 'Add Record',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
        )
    },
    {
        href: '/hec-admin/records',
        label: 'Manage Records',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
        )
    },
    {
        href: '/hec-admin/trash',
        label: 'Trash Bin',
        isTrash: true,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
        )
    },
    {
        href: '/hec-admin/settings',
        label: 'Settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
            </svg>
        )
    }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/hec-admin/login';
    };

    if (pathname === '/hec-admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans">
            {/* Top Navigation Bar (Desktop & Mobile Header) */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Brand Logo & Title */}
                        <div className="flex items-center gap-3">
                            <Link href="/hec-admin" className="flex items-center gap-3 group">
                                <div className="p-1.5 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 shadow-sm group-hover:scale-105 transition-transform">
                                    <img src="/hec-logo.png" alt="HEC Emblem" className="w-9 h-9 sm:w-11 sm:h-11 object-contain" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">HEC e-Services</span>
                                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                            Admin
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 hidden sm:block font-medium">Attestation & Verification Console</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                            {navItems.map((item) => {
                                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                            isActive
                                                ? 'bg-[#009049] text-white shadow-sm shadow-emerald-500/20'
                                                : item.isTrash
                                                ? 'text-gray-600 hover:text-red-600 hover:bg-red-50/60'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                                        }`}
                                    >
                                        <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Top Right Quick Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href="/"
                                target="_blank"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200/80 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                </svg>
                                Public Search
                            </Link>

                            <button
                                onClick={handleLogout}
                                title="Sign out"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/60 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-12">
                {children}
            </main>

            {/* Mobile Bottom Navigation (Floating App-Bar) */}
            <div className="md:hidden fixed bottom-3 inset-x-3 z-50">
                <nav className="bg-white/95 backdrop-blur-lg border border-gray-200/80 rounded-2xl shadow-xl shadow-gray-900/10 px-2 py-2 flex items-center justify-around">
                    {navItems.map((item) => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                                    isActive
                                        ? 'text-[#009049] font-bold'
                                        : item.isTrash
                                        ? 'text-gray-400 hover:text-red-500'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50 text-[#009049]' : ''}`}>
                                    {item.icon}
                                </div>
                                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
