"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface DegreeEntry {
    id: number;
    degree_title: string;
    university: string;
    enrollment_no: string;
    date_of_issuance: string;
    attested_by: string;
    photo: File | null;
    pdf: File | null;
}

export default function AddRecordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Student-level fields
    const [studentData, setStudentData] = useState({
        application_id: "",
        name: "",
        father_name: "",
        date_of_birth: "",
        cnic: "",
        reference_number: "",
    });

    // Dynamic degrees list — each has its own full set of fields
    const [degrees, setDegrees] = useState<DegreeEntry[]>([
        {
            id: 1,
            degree_title: "",
            university: "",
            enrollment_no: "",
            date_of_issuance: "",
            attested_by: "Muhammad Sulaiman",
            photo: null,
            pdf: null,
        },
    ]);

    const addDegree = () => {
        setDegrees([
            ...degrees,
            {
                id: Date.now(),
                degree_title: "",
                university: "",
                enrollment_no: "",
                date_of_issuance: "",
                attested_by: "Muhammad Sulaiman",
                photo: null,
                pdf: null,
            },
        ]);
    };

    const removeDegree = (id: number) => {
        if (degrees.length > 1) {
            setDegrees(degrees.filter((d) => d.id !== id));
        }
    };

    const updateDegree = (id: number, field: keyof DegreeEntry, value: any) => {
        setDegrees(degrees.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    };

    const handleStudentChange = (field: keyof typeof studentData, value: string) => {
        setStudentData({ ...studentData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        let successCount = 0;
        let lastError = "";

        try {
            for (let i = 0; i < degrees.length; i++) {
                const deg = degrees[i];
                const formData = new FormData();

                // Student fields
                formData.append("cnic", studentData.cnic);
                formData.append("reference_number", studentData.reference_number);
                // For subsequent degrees, append suffix to keep application_id unique
                const appId = i === 0 ? studentData.application_id : `${studentData.application_id}-${i + 1}`;
                formData.append("application_id", appId);
                formData.append("name", studentData.name);
                formData.append("name_on_degree", studentData.name);
                formData.append("father_name", studentData.father_name);
                formData.append("date_of_birth", studentData.date_of_birth);

                // Degree-specific fields
                formData.append("degree_title", deg.degree_title);
                formData.append("university", deg.university);
                formData.append("enrollment_no", deg.enrollment_no);
                formData.append("date_of_issuance", deg.date_of_issuance);
                formData.append("attested_by", deg.attested_by);

                if (deg.photo) formData.append("photo", deg.photo);
                if (deg.pdf) formData.append("pdf", deg.pdf);

                const res = await fetch("/api/hec-records", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                if (data.success) {
                    successCount++;
                } else {
                    lastError = data.message;
                }
            }

            if (successCount > 0) {
                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: `Successfully added ${successCount} degree record(s).`,
                    confirmButtonColor: "#1bb55e",
                }).then(() => {
                    window.location.href = "/hec-admin/records";
                });
            } else {
                Swal.fire("Error", lastError || "Failed to add records", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add New HEC Attestation Record(s)</h1>
                    <p className="text-sm text-gray-500">
                        Creating candidate record with {degrees.length} degree(s)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-semibold text-gray-600 hover:text-black transition"
                >
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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
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
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="e.g. 5076464"
                                        value={studentData.application_id}
                                        onChange={(e) => handleStudentChange("application_id", e.target.value)}
                                    />
                                </div>

                                {/* 2. Reference Number (Prints at Top of Certificate) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Reference Number *
                                        <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints at Top)</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors font-mono"
                                        placeholder="e.g. HEC/A&A/DAS/2026/5076464"
                                        value={studentData.reference_number}
                                        onChange={(e) => handleStudentChange("reference_number", e.target.value)}
                                    />
                                </div>

                                {/* 3. Student Full Name */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Student Full Name *
                                        <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints in Middle Box)</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="e.g. Mubara Naz"
                                        value={studentData.name}
                                        onChange={(e) => handleStudentChange("name", e.target.value)}
                                    />
                                </div>

                                {/* 4. Father Name */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Father Name
                                        <span className="text-xs text-gray-400 font-normal ml-1.5">(Prints in Middle Box)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="e.g. Saeed Ahmed"
                                        value={studentData.father_name}
                                        onChange={(e) => handleStudentChange("father_name", e.target.value)}
                                    />
                                </div>

                                {/* 5. CNIC / Passport */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        CNIC / Passport Number *
                                        <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints in Middle Box)</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="e.g. 3540139675680"
                                        value={studentData.cnic}
                                        onChange={(e) => handleStudentChange("cnic", e.target.value)}
                                    />
                                </div>

                                {/* 6. Date of Birth */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Date of Birth
                                        <span className="text-xs text-gray-400 font-normal ml-1.5">(Middle Box)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#009049] outline-none bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="DD-MMM-YYYY (e.g. 1998-11-13)"
                                        value={studentData.date_of_birth}
                                        onChange={(e) => handleStudentChange("date_of_birth", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Degree Information */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#009049] p-2 rounded-lg text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Degree Information ({degrees.length})
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addDegree}
                                    className="bg-[#009049] text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition flex items-center gap-1.5"
                                >
                                    <span>+</span> Add Another Degree
                                </button>
                            </div>

                            <div className="space-y-5">
                                {degrees.map((deg, index) => (
                                    <div key={deg.id} className="bg-gray-50/80 p-5 rounded-xl border border-gray-200/90 shadow-sm relative space-y-4">
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
                                                    onClick={() => removeDegree(deg.id)}
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
                                                    type="text"
                                                    required
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none"
                                                    placeholder="e.g. Bachelor of Science in Chemistry"
                                                    value={deg.degree_title}
                                                    onChange={(e) => updateDegree(deg.id, "degree_title", e.target.value)}
                                                />
                                            </div>

                                            {/* 2. University Name */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    University Name *
                                                    <span className="text-xs text-emerald-600 font-medium ml-1.5">(Prints at Bottom Line)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none"
                                                    placeholder="e.g. University of Education, Lahore"
                                                    value={deg.university}
                                                    onChange={(e) => updateDegree(deg.id, "university", e.target.value)}
                                                />
                                            </div>

                                            {/* 3. Enrollment / Roll No */}
                                            <div className="flex flex-col justify-between">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Enrollment / Roll No
                                                    <span className="text-xs text-emerald-600 font-medium ml-1.5">(Bottom Line)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none"
                                                    placeholder="e.g. 23-UE-12367"
                                                    value={deg.enrollment_no}
                                                    onChange={(e) => updateDegree(deg.id, "enrollment_no", e.target.value)}
                                                />
                                            </div>

                                            {/* 4. Date of Issuance */}
                                            <div className="flex flex-col justify-between">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Date of Issuance
                                                    <span className="text-xs text-gray-400 font-normal ml-1.5">(Middle Box)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none"
                                                    placeholder="e.g. 2026-07-16"
                                                    value={deg.date_of_issuance}
                                                    onChange={(e) => updateDegree(deg.id, "date_of_issuance", e.target.value)}
                                                />
                                            </div>

                                            {/* 5. Attested By */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Attested By *
                                                    <span className="text-xs text-gray-400 font-normal ml-1.5">(Officer Name)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#009049] outline-none"
                                                    value={deg.attested_by}
                                                    onChange={(e) => updateDegree(deg.id, "attested_by", e.target.value)}
                                                />
                                            </div>

                                            {/* 6. Student Photo */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Student Photo
                                                    </label>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                                    onChange={(e) => updateDegree(deg.id, "photo", e.target.files?.[0] ?? null)}
                                                />
                                            </div>

                                            {/* 7. Degree PDF */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Degree PDF
                                                    </label>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                                    onChange={(e) => updateDegree(deg.id, "pdf", e.target.files?.[0] ?? null)}
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
                        {loading ? "Processing & Saving..." : "Save Record(s)"}
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
