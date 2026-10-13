"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function EditRecordPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [record, setRecord] = useState<any>(null);
    const [degrees, setDegrees] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetch(`/api/hec-records/${id}`, { cache: "no-store" })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setRecord(data.record);
                        setDegrees(data.degrees && data.degrees.length > 0 ? data.degrees : [data.record]);
                    } else {
                        Swal.fire("Error", "Failed to load record data.", "error");
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire("Error", "Failed to load record data.", "error");
                })
                .finally(() => setFetching(false));
        }
    }, [id]);

    const addDegreeField = () => {
        setDegrees([
            ...degrees,
            {
                id: -(Date.now()), // negative temp ID to distinguish newly added degrees
                degree_title: "",
                university: "",
                enrollment_no: "",
                date_of_issuance: "",
                attested_by: "Muhammad Sulaiman",
                photo_url: null,
                pdf_url: null
            }
        ]);
    };

    const removeDegreeField = (degId: number) => {
        if (degrees.length > 1) {
            setDegrees(degrees.filter(d => d.id !== degId));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('name_on_degree', formData.get('name') as string);

        try {
            const res = await fetch(`/api/hec-records/${id}`, {
                method: "PUT",
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Student and all linked degree records updated successfully.",
                    confirmButtonColor: "#1bb55e"
                }).then(() => {
                    router.push("/hec-admin/records");
                });
            } else {
                Swal.fire("Error", data.message || "Failed to update record", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Server error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006D9A]"></div>
            </div>
        );
    }

    if (!record) {
        return <div className="text-center p-8 text-gray-500">Record not found.</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl overflow-hidden max-w-md w-full p-4 relative shadow-2xl">
                        <button 
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black font-bold p-1 text-lg"
                        >
                            ✕
                        </button>
                        <h3 className="font-bold text-gray-800 mb-3">Student Photo Preview</h3>
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                            <img src={previewImage} alt="Student" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Edit HEC Attestation Record</h1>
                    <p className="text-sm text-gray-500">
                        Editing candidate record and all {degrees.length} linked degree(s)
                    </p>
                </div>
                <button onClick={() => router.back()} className="text-sm font-semibold text-gray-600 hover:text-black transition">
                    &larr; Back to Records
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT COLUMN: Student Information */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="bg-[#009049] p-2 rounded-lg text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Student Information</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* 1. Application ID (Top Tracking ID) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Application ID (Base) *
                                        <span className="text-xs text-gray-400 font-normal ml-1.5">(System Tracking ID)</span>
                                    </label>
                                    <input 
                                        name="application_id" 
                                        type="text" 
                                        required 
                                        defaultValue={record.application_id ? record.application_id.split('-')[0] : ''} 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors" 
                                    />
                                </div>

                                {/* 2. Reference Number (Prints at Top of Certificate) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Reference Number *
                                        <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints at Top)</span>
                                    </label>
                                    <input 
                                        name="reference_number" 
                                        type="text" 
                                        required 
                                        defaultValue={record.reference_number} 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors font-mono" 
                                    />
                                </div>

                                {/* 3. Student Full Name */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Student Full Name *
                                        <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints in Middle Box)</span>
                                    </label>
                                    <input 
                                        name="name" 
                                        type="text" 
                                        required 
                                        defaultValue={record.name} 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors" 
                                        placeholder="e.g. Mubara Naz" 
                                    />
                                </div>

                                {/* 4. Father Name */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Father Name
                                        <span className="text-xs text-gray-400 font-normal ml-1.5">(Prints in Middle Box)</span>
                                    </label>
                                    <input 
                                        name="father_name" 
                                        type="text" 
                                        defaultValue={record.father_name} 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors" 
                                        placeholder="e.g. Saeed Ahmed" 
                                    />
                                </div>

                                {/* 5. CNIC / Passport */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        CNIC / Passport Number *
                                        <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints in Middle Box)</span>
                                    </label>
                                    <input 
                                        name="cnic" 
                                        type="text" 
                                        required 
                                        defaultValue={record.cnic} 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors" 
                                        placeholder="Without dashes" 
                                    />
                                </div>

                                {/* 6. Date of Birth */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Date of Birth
                                        <span className="text-xs text-gray-400 font-normal ml-1.5">(Middle Box)</span>
                                    </label>
                                    <input 
                                        name="date_of_birth" 
                                        type="text" 
                                        defaultValue={record.date_of_birth} 
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors" 
                                        placeholder="DD-MMM-YYYY (e.g. 1998-11-13)" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: All Degrees in One Place */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#009049] p-2 rounded-lg text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Degree Information ({degrees.length})
                                    </h2>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addDegreeField} 
                                    className="bg-[#009049] text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition flex items-center gap-1.5"
                                >
                                    <span>+</span> Add Another Degree
                                </button>
                            </div>
                            
                            <div className="space-y-5">
                                {degrees.map((deg, index) => (
                                    <div key={deg.id || index} className="bg-gray-50/80 p-5 rounded-xl border border-gray-200/90 shadow-sm relative space-y-4">
                                        {/* Hidden ID input for updating existing degrees */}
                                        <input type="hidden" name="degree_id[]" value={deg.id > 0 ? deg.id : ""} />

                                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                                <span className="bg-[#009049] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                                                    #{index + 1}
                                                </span>
                                                Degree Block
                                            </h3>
                                            {degrees.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeDegreeField(deg.id)} 
                                                    className="text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition"
                                                >
                                                    ✕ Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* 1. Degree Title */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Degree Title *
                                                    <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints at Bottom Line)</span>
                                                </label>
                                                <input 
                                                    name="degree_title[]" 
                                                    type="text" 
                                                    required 
                                                    defaultValue={deg.degree_title} 
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none" 
                                                    placeholder="e.g. Bachelor of Science in Chemistry" 
                                                />
                                            </div>

                                            {/* 2. University Name */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    University Name *
                                                    <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints at Bottom Line)</span>
                                                </label>
                                                <input 
                                                    name="university[]" 
                                                    type="text" 
                                                    required 
                                                    defaultValue={deg.university} 
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none" 
                                                    placeholder="e.g. University of Education, Lahore" 
                                                />
                                            </div>

                                            {/* 3. Enrollment / Roll No */}
                                            <div className="flex flex-col justify-between">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Enrollment / Roll No
                                                    <span className="text-xs text-emerald-600 font-medium ml-1.5">(Bottom Line)</span>
                                                </label>
                                                <input 
                                                    name="enrollment_no[]" 
                                                    type="text" 
                                                    defaultValue={deg.enrollment_no} 
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none" 
                                                    placeholder="e.g. 23-UE-12367" 
                                                />
                                            </div>

                                            {/* 4. Date of Issuance */}
                                            <div className="flex flex-col justify-between">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Date of Issuance
                                                    <span className="text-xs text-gray-400 font-normal ml-1.5">(Middle Box)</span>
                                                </label>
                                                <input 
                                                    name="date_of_issuance[]" 
                                                    type="text" 
                                                    defaultValue={deg.date_of_issuance} 
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none" 
                                                    placeholder="e.g. 2026-07-16" 
                                                />
                                            </div>

                                            {/* 5. Attested By */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Attested By *
                                                    <span className="text-xs text-gray-400 font-normal ml-1.5">(Officer Name)</span>
                                                </label>
                                                <input 
                                                    name="attested_by[]" 
                                                    type="text" 
                                                    required 
                                                    defaultValue={deg.attested_by || "Muhammad Sulaiman"} 
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none" 
                                                />
                                            </div>

                                            {/* 6. Student Photo */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Student Photo
                                                    </label>
                                                    {deg.photo_url && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setPreviewImage(deg.photo_url)} 
                                                            className="text-xs font-semibold text-[#009049] hover:underline"
                                                        >
                                                            View Current
                                                        </button>
                                                    )}
                                                </div>
                                                <input 
                                                    name="photo[]" 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                                                />
                                            </div>

                                            {/* 7. Degree PDF */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Degree PDF
                                                    </label>
                                                    {deg.pdf_url && (
                                                        <a 
                                                            href={deg.pdf_url} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="text-xs font-semibold text-blue-600 hover:underline"
                                                        >
                                                            View Current
                                                        </a>
                                                    )}
                                                </div>
                                                <input 
                                                    name="pdf[]" 
                                                    type="file" 
                                                    accept="application/pdf" 
                                                    className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex gap-4 border-t border-gray-100 pt-6">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-[#009049] text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? "Updating All Records..." : "Update All Records"}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => router.back()} 
                        className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
