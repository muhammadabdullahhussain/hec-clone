"use client";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export default function PrintQRPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [printFormat, setPrintFormat] = useState('full');

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetch(`/api/students?page=${page}&limit=50&search=${searchTerm}`)
                .then(res => {
                    if (res.status === 401) {
                        window.location.href = '/ibcc-admin/login?expired=true';
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (data && data.students) {
                        setStudents(data.students);
                        setPagination(data.pagination);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [page, searchTerm]);

    const toggleStudent = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === students.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(students.map(s => s.id)));
        }
    };

    const getShortProgram = (prog: string) => {
        const p = (prog || '').toLowerCase();
        if (p.includes('diploma')) return 'Diploma';
        if (p.includes('hssc') || p.includes('intermediate')) return 'HSSC / Inter';
        if (p.includes('ssc') || p.includes('matric')) return 'SSC / Matric';
        return prog;
    };

    const generatePDF = async () => {
        const BASE_URL = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "");

        const selectedStudents = students.filter(s => selectedIds.has(s.id));
        if (selectedStudents.length === 0) return alert("Please select at least one student.");

        setGenerating(true);
        setError("");

        try {
            // A4 Math Engine Settings
            const doc = new jsPDF({ format: "a4", unit: "mm" });
            const pageW = 210;
            const pageH = 297;
            const cols = 3;
            const rows = 3;
            const marginX = 10;
            const marginY = 15;
            const cellW = (pageW - (marginX * 2)) / cols; // ~63.3mm
            const cellH = (pageH - (marginY * 2)) / rows; // ~89mm
            const qrSize = 38; // mm

            let currentIndex = 0;

            for (let i = 0; i < selectedStudents.length; i++) {
                setProgress(`Generating QR ${i + 1} of ${selectedStudents.length}...`);
                const student = selectedStudents[i];
                
                // Pagination logic (9 per page)
                if (i > 0 && i % 9 === 0) {
                    doc.addPage();
                    currentIndex = 0;
                }

                const col = currentIndex % cols;
                const row = Math.floor(currentIndex / cols);
                
                const startX = marginX + (col * cellW);
                const startY = marginY + (row * cellH);

                // Borders removed as per client request for cleaner printing

                // Generate QR Code URI with Level L and Solid White background
                const qrUrl = `${BASE_URL}/verify.php?code=${student.secure_hash}`;
                // Using scale: 16 to generate a high-resolution PNG (approx 750x750px)
                // This prevents blurry interpolation when jsPDF resizes it for printing.
                const qrDataUri = await QRCode.toDataURL(qrUrl, {
                    errorCorrectionLevel: 'M',
                    margin: 3,
                    scale: 16,
                    color: { dark: '#000000', light: '#FFFFFF' }
                });

                if (printFormat === 'full') {
                    // Center QR in Cell (Move up slightly to make room for text)
                    const qrX = startX + ((cellW - qrSize) / 2);
                    const qrY = startY + 2;
                    doc.addImage(qrDataUri, "PNG", qrX, qrY, qrSize, qrSize);

                    // Text Formatting
                    const textCenterX = startX + (cellW / 2);
                    
                    // Line 1: IBCC Name
                    doc.setFont("courier", "bold");
                    doc.setFontSize(6.5);
                    doc.text("INTER BOARDS COORDINATION", textCenterX, qrY + qrSize + 3, { align: "center" });
                    doc.text("COMMISSION (IBCC)", textCenterX, qrY + qrSize + 5.5, { align: "center" });
                    
                    // Line 2: Serial ID (Bold and larger)
                    doc.setFont("courier", "bold");
                    doc.setFontSize(9);
                    doc.text(student.application_id, textCenterX, qrY + qrSize + 9.5, { align: "center" });
                    
                    // Line 3: Program (short label)
                    doc.setFont("courier", "bold");
                    doc.setFontSize(7);
                    doc.text(getShortProgram(student.program), textCenterX, qrY + qrSize + 13.5, { align: "center" });
                } else {
                    // QR Only: center perfectly in the cell
                    const qrX = startX + ((cellW - qrSize) / 2);
                    const qrY = startY + ((cellH - qrSize) / 2);
                    doc.addImage(qrDataUri, "PNG", qrX, qrY, qrSize, qrSize);
                }

                currentIndex++;
                
                // Small delay to prevent browser freeze on huge batches
                if (i % 10 === 0) await new Promise(r => setTimeout(r, 10));
            }

            setProgress("Saving PDF...");
            doc.save("IBCC_QR_Codes.pdf");

        } catch (err) {
            console.error(err);
            setError("Failed to generate PDF. Check console for details.");
        }

        setGenerating(false);
        setProgress("");
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Print QR Codes</h1>
            
            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
            
            {generating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl text-center w-[90%] max-w-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-800">{progress}</h2>
                        <p className="text-gray-500 mt-2">Please do not close this tab.</p>
                    </div>
                </div>
            )}

            <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <input 
                    type="text" 
                    placeholder="Search App ID, Name, Roll No..." 
                    className="flex-1 border border-gray-300 rounded p-3 md:p-2 focus:outline-none focus:border-green-600 text-black font-medium"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={printFormat}
                        onChange={(e) => setPrintFormat(e.target.value)}
                        className="px-4 py-3 md:py-2 bg-white border border-gray-300 rounded text-gray-800 font-medium focus:outline-none focus:border-green-600"
                    >
                        <option value="full">QR + Details</option>
                        <option value="qr_only">QR Code Only</option>
                    </select>
                    <button 
                        onClick={toggleSelectAll}
                        className="px-4 py-3 md:py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-bold transition whitespace-nowrap text-center"
                    >
                        {selectedIds.size === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                    <button 
                        onClick={generatePDF}
                        disabled={selectedIds.size === 0 || generating}
                        className="px-4 py-3 md:py-2 bg-green-700 hover:bg-green-800 text-white rounded font-bold disabled:opacity-50 transition whitespace-nowrap text-center"
                    >
                        Generate PDF ({selectedIds.size})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
                <table className="min-w-full text-sm md:text-base">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No students found.</td></tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.has(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.application_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.program}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 font-medium"
                    >
                        Previous Page
                    </button>
                    <span className="text-gray-600 font-medium">Page {page} of {pagination.totalPages}</span>
                    <button 
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50 font-medium"
                    >
                        Next Page
                    </button>
                </div>
            )}
        </div>
    );
}
