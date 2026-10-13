"use client";
import { useState, useEffect } from "react";

export default function TrashPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const fetchTrash = () => {
        setLoading(true);
        fetch("/api/trash", { cache: "no-store" })
            .then(res => {
                if(res.status === 401) {
                    window.location.href = '/hec-admin/login?expired=true';
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.records) {
                    setRecords(data.records);
                }
                setLoading(false);
                setSelectedIds(new Set()); // Reset selections
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    // --- Selection Logic ---
    const toggleRecord = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === records.length && records.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(records.map(r => r.id)));
        }
    };

    // --- Action Logic ---
    const handleRestoreSingle = async (id: number) => {
        try {
            await fetch('/api/trash/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] })
            });
            fetchTrash();
        } catch(e) {
            alert("Error restoring record.");
        }
    };

    const handlePermanentDeleteSingle = async (id: number) => {
        if (!confirm("Delete this record permanently? This cannot be undone!")) return;
        try {
            await fetch('/api/trash/permanent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] })
            });
            fetchTrash();
        } catch(e) {
            alert("Error deleting record.");
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.size === 0) return;
        try {
            await fetch('/api/trash/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            fetchTrash();
        } catch(e) {
            alert("Error restoring records.");
        }
    };

    const handleBulkPermanentDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Permanently delete ${selectedIds.size} records? This cannot be undone!`)) return;
        
        try {
            await fetch('/api/trash/permanent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            fetchTrash();
        } catch(e) {
            alert("Error deleting records.");
        }
    };

        return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Trash Bin</h1>
                    <p className="text-gray-500 text-sm">Records deleted from the main system end up here.</p>
                </div>
                <div className="mt-4 md:mt-0 text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Total Items: <span className="font-bold text-gray-900">{records.length}</span>
                </div>
            </div>

            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={toggleSelectAll}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all border border-gray-200"
                    >
                        {selectedIds.size === records.length && records.length > 0 ? "Deselect All" : "Select All"}
                    </button>
                    <button 
                        onClick={handleBulkRestore}
                        disabled={selectedIds.size === 0}
                        className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#006D9A] border border-blue-200 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Restore ({selectedIds.size})
                    </button>
                    <button 
                        onClick={handleBulkPermanentDelete}
                        disabled={selectedIds.size === 0}
                        className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete Forever ({selectedIds.size})
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left"><input type="checkbox" checked={selectedIds.size === records.length && records.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded text-[#006D9A] focus:ring-[#006D9A] cursor-pointer" /></th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">App ID</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">CNIC</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Candidate</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs hidden md:table-cell">Degree</th>
                            <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-bold"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#006D9A] border-t-transparent mx-auto"></div></td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No items in the trash.</td></tr>
                        ) : (
                            records.map(r => (
                                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(r.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleRecord(r.id)} className="w-4 h-4 rounded text-[#006D9A] focus:ring-[#006D9A] cursor-pointer" />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{r.application_id}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.cnic}</td>
                                    <td className="px-6 py-4 text-gray-900 font-semibold">{r.name}</td>
                                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{r.degree_title}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleRestoreSingle(r.id)} className="text-[#006D9A] hover:text-blue-800 font-semibold text-sm">Restore</button>
                                        <button onClick={() => handlePermanentDeleteSingle(r.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

