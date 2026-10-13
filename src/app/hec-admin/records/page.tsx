"use client";
import { Fragment, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { QRCodeSVG } from "qrcode.react";
import { renderToString } from "react-dom/server";

interface RecordRow {
    id: number;
    application_id: string;
    cnic: string;
    reference_number: string;
    name: string;
    father_name: string;
    degree_title: string;
    university: string;
    isActive: boolean;
    isDeleted: boolean;
}

interface GroupedStudent {
    cnic: string;
    name: string;
    father_name: string;
    reference_number: string;
    // base application_id (first record)
    base_application_id: string;
    degrees: RecordRow[];
    // all ids in this group
    ids: number[];
    // overall active status: active if at least one is active
    anyActive: boolean;
}

export default function RecordsPage() {
    const [records, setRecords] = useState<RecordRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCnics, setSelectedCnics] = useState<Set<string>>(new Set());
    // expanded rows to show degrees
    const [expandedCnics, setExpandedCnics] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hec-records?list=active", { cache: "no-store" });
            if (res.status === 401) {
                window.location.href = "/hec-admin/login?expired=true";
                return;
            }
            const data = await res.json();
            if (data.success) {
                setRecords(data.records);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setSelectedCnics(new Set());
        }
    };

    // Group records by CNIC
    const groupRecords = (recs: RecordRow[]): GroupedStudent[] => {
        const map = new Map<string, RecordRow[]>();
        for (const r of recs) {
            const existing = map.get(r.cnic) || [];
            existing.push(r);
            map.set(r.cnic, existing);
        }
        return Array.from(map.entries()).map(([cnic, rows]) => ({
            cnic,
            name: rows[0].name,
            father_name: rows[0].father_name,
            reference_number: rows[0].reference_number,
            base_application_id: rows[0].application_id,
            degrees: rows,
            ids: rows.map((r) => r.id),
            anyActive: rows.some((r) => r.isActive),
        }));
    };

    const filtered = groupRecords(
        records.filter(
            (r) =>
                (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (r.cnic && r.cnic.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (r.application_id && r.application_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (r.reference_number && r.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    const allCnics = filtered.map((g) => g.cnic);
    const isAllSelected = allCnics.length > 0 && selectedCnics.size === allCnics.length;

    const toggleCnic = (cnic: string) => {
        const s = new Set(selectedCnics);
        if (s.has(cnic)) s.delete(cnic);
        else s.add(cnic);
        setSelectedCnics(s);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedCnics(new Set());
        else setSelectedCnics(new Set(allCnics));
    };

    const toggleExpand = (cnic: string) => {
        const s = new Set(expandedCnics);
        if (s.has(cnic)) s.delete(cnic);
        else s.add(cnic);
        setExpandedCnics(s);
    };

    const handleBulkDelete = async () => {
        if (selectedCnics.size === 0) return;
        // Collect all ids from selected groups
        const ids = filtered
            .filter((g) => selectedCnics.has(g.cnic))
            .flatMap((g) => g.ids);

        const confirm = await Swal.fire({
            title: `Move ${selectedCnics.size} student(s) to Trash?`,
            text: "All degrees of selected students will be moved to trash.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: `Yes, delete (${selectedCnics.size})`,
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch("/api/hec-records", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids }),
                });
                const data = await res.json();
                if (data.success) {
                    fetchRecords();
                    Swal.fire("Deleted!", `${selectedCnics.size} student(s) moved to trash.`, "success");
                } else {
                    Swal.fire("Error", data.message || "Failed.", "error");
                }
            } catch {
                Swal.fire("Error", "Server error.", "error");
            }
        }
    };

    const handleDeleteGroup = async (group: GroupedStudent) => {
        const confirm = await Swal.fire({
            title: "Move to Trash?",
            text: `All ${group.degrees.length} degree(s) of ${group.name} will be moved to trash.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete",
        });

        if (confirm.isConfirmed) {
            const res = await fetch("/api/hec-records", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: group.ids }),
            });
            const data = await res.json();
            if (data.success) {
                fetchRecords();
                Swal.fire("Deleted!", "Record(s) moved to trash.", "success");
            }
        }
    };

    const toggleGroupStatus = async (group: GroupedStudent) => {
        const newStatus = !group.anyActive;
        // Optimistic UI update
        setRecords((prev) =>
            prev.map((r) => (group.ids.includes(r.id) ? { ...r, isActive: newStatus } : r))
        );
        try {
            const res = await fetch("/api/hec-records", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: group.ids, isActive: newStatus }),
            });
            if (!res.ok) {
                fetchRecords();
            }
        } catch (error) {
            console.error("Failed to toggle group status", error);
            fetchRecords();
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        // Optimistic UI update
        setRecords((prev) =>
            prev.map((r) => (r.id === id ? { ...r, isActive: newStatus } : r))
        );
        try {
            const res = await fetch(`/api/hec-records/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: newStatus }),
            });
            if (!res.ok) {
                fetchRecords();
            }
        } catch (error) {
            console.error("Failed to toggle status", error);
            fetchRecords();
        }
    };

    const viewQRCode = (appId: string) => {
        const qrUrl = `https://hec.e-verify.pk/#/degree-verification/hec-verification-public?id=${appId}`;
        const qrSvgString = renderToString(
            <QRCodeSVG value={qrUrl} size={200} level="M" includeMargin={true} />
        );
        Swal.fire({
            title: "Scan QR Code",
            html: `<div style="display:flex;justify-content:center;margin-top:20px">${qrSvgString}</div><p style="margin-top:20px;font-size:12px;word-break:break-all">${qrUrl}</p>`,
            confirmButtonText: "Close",
        });
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">HEC Attestation Records</h1>
                    {selectedCnics.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Selected ({selectedCnics.size})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search by Name, CNIC, App ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:border-green-600 text-sm w-64 md:w-80 shadow-sm"
                    />
                    <a
                        href="/hec-admin/add-record"
                        className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 whitespace-nowrap text-sm shadow-sm"
                    >
                        + Add New
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="text-gray-500 py-8 text-center">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-3 py-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-3 py-3 w-8"></th>
                                <th className="px-3.5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">App ID</th>
                                <th className="px-3.5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CNIC</th>
                                <th className="px-3.5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref No</th>
                                <th className="px-3.5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-3.5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Degrees</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map((group) => {
                                const isExpanded = expandedCnics.has(group.cnic);
                                const isSelected = selectedCnics.has(group.cnic);
                                return (
                                    <Fragment key={group.cnic}>
                                        {/* ── STUDENT ROW ── */}
                                        <tr
                                            className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-green-50/50" : ""}`}
                                        >
                                            <td className="px-3 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleCnic(group.cnic)}
                                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            {/* Expand toggle */}
                                            <td className="px-3 py-3 text-center">
                                                {group.degrees.length > 1 && (
                                                    <button
                                                        onClick={() => toggleExpand(group.cnic)}
                                                        className="text-gray-400 hover:text-gray-700 text-lg leading-none font-bold"
                                                        title="Show degrees"
                                                    >
                                                        {isExpanded ? "▾" : "▸"}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-3.5 py-3.5 text-xs font-mono font-medium text-gray-900 break-words">
                                                {group.base_application_id}
                                            </td>
                                            <td className="px-3.5 py-3.5 text-xs font-semibold text-gray-900 whitespace-nowrap">
                                                {group.cnic}
                                            </td>
                                            <td className="px-3.5 py-3.5 text-xs text-gray-700 break-words">
                                                {group.reference_number}
                                            </td>
                                            <td className="px-3.5 py-3.5 text-xs font-medium text-gray-900 break-words">
                                                <div>{group.name}</div>
                                                {group.father_name && (
                                                    <div className="text-gray-400 text-[11px]">{group.father_name}</div>
                                                )}
                                            </td>
                                            <td className="px-3.5 py-3.5 text-xs text-gray-700">
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                                        {group.degrees.length} {group.degrees.length === 1 ? "Degree" : "Degrees"}
                                                    </span>
                                                    {group.degrees.length > 1 && (
                                                        <span className="text-gray-400 text-[11px]">(click ▸ to expand)</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroupStatus(group)}
                                                    title={group.anyActive ? "Click to Disable" : "Click to Activate"}
                                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-sm hover:opacity-85 active:scale-95 ${group.anyActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
                                                >
                                                    {group.anyActive ? "Active" : "Disabled"}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-right min-w-[160px]">
                                                <div className="inline-flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={`/DAS_approved_letter_${encodeURIComponent(group.base_application_id)}.pdf`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors"
                                                    >
                                                        PDF
                                                    </a>
                                                    <a
                                                        href={`/hec-admin/edit-record/${group.degrees[0].id}`}
                                                        className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold transition-colors"
                                                    >
                                                        Edit
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteGroup(group)}
                                                        className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── EXPANDED DEGREE ROWS ── */}
                                        {isExpanded &&
                                            group.degrees.map((deg, di) => (
                                                <tr key={deg.id} className="bg-blue-50/40 border-l-4 border-blue-300">
                                                    <td></td>
                                                    <td></td>
                                                    <td className="px-3.5 py-2.5 text-xs font-mono text-blue-700">
                                                        {deg.application_id}
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="px-3.5 py-2.5 text-xs text-gray-500 italic">
                                                        Degree #{di + 1}
                                                    </td>
                                                    <td className="px-3.5 py-2.5 text-xs text-gray-700 break-words" colSpan={1}>
                                                        <div className="font-medium">{deg.degree_title}</div>
                                                        <div className="text-gray-500 text-[11px]">{deg.university}</div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(deg.id, deg.isActive)}
                                                            title={deg.isActive ? "Click to Disable" : "Click to Activate"}
                                                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-sm hover:opacity-85 active:scale-95 ${deg.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
                                                        >
                                                            {deg.isActive ? "Active" : "Disabled"}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="inline-flex gap-1.5">
                                                            <a
                                                                href={`/DAS_approved_letter_${encodeURIComponent(deg.application_id)}.pdf`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                                                            >
                                                                PDF
                                                            </a>
                                                            <a
                                                                href={`/hec-admin/edit-record/${deg.id}`}
                                                                className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs transition-colors"
                                                            >
                                                                Edit
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </Fragment>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
