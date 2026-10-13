"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

export default function StickerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const stickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/students/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.student) {
                    setStudent(data.student);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'print-sticker-css';
        style.textContent = '@media print { @page { margin: 8mm; size: A4 portrait; } body * { visibility: hidden; } .print-zone, .print-zone * { visibility: visible; } .print-zone { position: fixed; top: 0; left: 0; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 6mm; padding: 0; } }';
        document.head.appendChild(style);
        return () => { const el = document.getElementById('print-sticker-css'); if (el) el.remove(); };
    }, []);

    const handleDownloadSticker = async () => {
        if (!stickerRef.current) return;
        try {
            const canvas = await html2canvas(stickerRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: false,
            });
            const link = document.createElement("a");
            link.download = `Sticker_${student?.name || "Student"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (e) {
            alert("Download failed. Please try again.");
            console.error(e);
        }
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;
        const svgEl = svg as unknown as SVGSVGElement;
        const w = svgEl.viewBox?.baseVal?.width || svgEl.width?.baseVal?.value || 256;
        const h = svgEl.viewBox?.baseVal?.height || svgEl.height?.baseVal?.value || 256;
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const canvas = document.createElement("canvas");
        canvas.width = w * 4;
        canvas.height = h * 4;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const a = document.createElement("a");
            a.download = `QR_${student?.name || "Student"}.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
        };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleTestLink = () => {
        if (student?.secure_hash) {
            window.open(`/verify.php?code=${student.secure_hash}`, "_blank");
        }
    };

    if (loading) return <div className="p-8 text-center font-bold text-gray-500">Loading Sticker Data...</div>;
    if (!student) return <div className="p-8 text-center text-red-600 font-bold">Error: Student not found.</div>;

    const isDiploma = student.program?.toLowerCase().includes("diploma");
    // All programs verify via /verify route — single source of truth
    const qrUrl = `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || ""}/verify.php?code=${student.secure_hash}`;
    
    // Sticker label — must match physical sticker exactly
    const prog = student.program || "";
    const shortProgram = prog.toLowerCase().includes("diploma")
        ? "Diploma"
        : prog.toLowerCase().includes("hssc") || prog.toLowerCase().includes("intermediate")
        ? "HSSC/Inter"
        : prog.toLowerCase().includes("ssc") || prog.toLowerCase().includes("matric")
        ? "SSC/Matric"
        : prog; // fallback: show as-is

    // ID shown on sticker — enforce Application ID everywhere for consistency
    const stickerID = student.application_id;

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Header (Desktop + Mobile) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            QR Security Sticker
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Generate and export official verification stickers</p>
                    </div>
                    <button onClick={() => router.push('/ibcc-admin/records')} className="mt-4 sm:mt-0 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm">
                        &larr; Back to Dashboard
                    </button>
                </div>

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                    
                    {/* Left Column: Info & Actions (Takes up 5 columns on desktop) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
                        
                        {/* Student Info Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Student Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Name</p>
                                    <p className="text-gray-900 font-bold text-lg">{student.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Roll No</p>
                                        <p className="text-gray-900 font-semibold">{student.roll_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Program</p>
                                        <p className="text-gray-900 font-semibold">{student.program}</p>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-3 rounded border border-green-100">
                                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Application ID</p>
                                    <p className="text-green-800 font-bold text-xl">{student.application_id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Export Options</h3>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleDownloadSticker} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    Download Sticker (PNG)
                                </button>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button onClick={handleDownloadQR} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-sm">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                        QR Only
                                    </button>
                                    <button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                        Print Label
                                    </button>
                                </div>
                                
                                <button onClick={handleTestLink} className="w-full mt-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    Test Live Verification Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Sticker Preview (Takes up 7 columns on desktop) */}
                    <div className="lg:col-span-7 flex flex-col print:block">
                        {/* Editor-like Toolbar */}
                        <div className="bg-gray-200 rounded-t-xl p-3 border border-gray-300 border-b-0 flex items-center gap-2 print:hidden">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span className="text-xs text-gray-500 font-bold ml-2 tracking-wide uppercase">Live Preview Canvas</span>
                        </div>
                        
                        {/* Dark Canvas Area - hidden on print */}
                        <div className="bg-gray-800 flex-1 rounded-b-xl flex items-center justify-center p-8 sm:p-12 border border-gray-900 shadow-inner min-h-[450px] print:hidden">
                            
                            {/* Actual Sticker Box for screen preview */}
                            <div 
                                className="sticker-container bg-white w-[280px] flex flex-col items-center"
                                style={{ padding: '30px 10px 40px 10px' }}
                            >
                                <div className="w-full flex justify-center" style={{ marginBottom: '12px' }}>
                                    <QRCodeSVG 
                                        value={qrUrl} 
                                        size={185} 
                                        level="M" 
                                        includeMargin={false} 
                                    />
                                </div>
                                <div className="w-full text-center" style={{ fontFamily: 'Courier New, Courier, monospace', lineHeight: '1.1' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '0', letterSpacing: '0.02em' }}>INTER BOARDS COORDINATION</p>
                                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '0', letterSpacing: '0.02em' }}>COMMISSION (IBCC)</p>
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', margin: '0', letterSpacing: '0.05em' }}>{stickerID}</p>
                                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '0', letterSpacing: '0.03em' }}>{shortProgram}</p>
                                </div>
                            </div>
                        </div>

                        {/* Print-only sticker (top-left, no centering) */}
                        <div className="print-zone hidden print:flex">
                            <div 
                                ref={stickerRef}
                                className="bg-white flex flex-col items-center"
                                style={{ width: '62mm', padding: '8mm 2mm 10mm 2mm' }}
                            >
                                <div style={{ marginBottom: '3mm' }}>
                                    <QRCodeSVG 
                                        id="qr-code-svg"
                                        value={qrUrl} 
                                        size={180}
                                        level="M" 
                                        includeMargin={false}
                                    />
                                </div>
                                <div style={{ fontFamily: 'Courier New, Courier, monospace', lineHeight: '1.1', textAlign: 'center', width: '100%' }}>
                                    <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000', margin: '0' }}>INTER BOARDS COORDINATION</p>
                                    <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000', margin: '0' }}>COMMISSION (IBCC)</p>
                                    <p style={{ fontSize: '14pt', fontWeight: 'bold', color: '#000', margin: '0' }}>{stickerID}</p>
                                    <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000', margin: '0' }}>{shortProgram}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-3 print:hidden font-medium">
                            This preview shows exactly how the final generated PNG will look.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
