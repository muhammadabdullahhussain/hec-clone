import React from 'react';
import { buildMatricHtml } from '@/lib/matricHtml';

export default function VerifyDiploma({ student, cleanName }: { student: any, cleanName: string }) {
    const html = buildMatricHtml(student, cleanName);

    return (
        <div style={{ width: "100%", height: "100vh", overflow: "hidden", backgroundColor: "#f7f7f7", margin: 0, padding: 0 }}>
            <iframe
                srcDoc={html}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', margin: 0, padding: 0 }}
                title="IBCC Diploma Verification"
            />
        </div>
    );
}
