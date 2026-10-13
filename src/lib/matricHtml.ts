import fs from 'fs';
import path from 'path';

export function buildMatricHtml(student: {
    father_name: string;
    roll_no: string;
    program: string | null;
    board: string;
    group: string;
    passing_year: string | number;
    session: string;
    obtained_marks: string | number;
    total_marks: string | number;
    percentage: string | number;
    application_id: string;
    doc_type?: string | null;
}, cleanName: string): string {
    const filePath = path.join(process.cwd(), 'src/components/matric.html');
    let html = fs.readFileSync(filePath, 'utf8');

    const program = student.program || '';
    const p = program.toLowerCase();
    // Use saved doc_type from DB; fallback to program-based detection
    const docType = student.doc_type || (p.includes('matric') || p.startsWith('ssc') ? 'Marksheet' : 'Certificate');

    html = html.replace(/{{DOC_TYPE}}/g, docType);
    html = html.replace(/{{NAME}}/g, cleanName);
    html = html.replace(/{{FATHER_NAME}}/g, student.father_name);
    html = html.replace(/{{ROLL_NO}}/g, student.roll_no);
    html = html.replace(/{{PROGRAM}}/g, program);
    html = html.replace(/{{BOARD}}/g, student.board);
    html = html.replace(/{{GROUP}}/g, student.group);
    html = html.replace(/{{YEAR_SESSION}}/g, `${student.passing_year} - ${student.session}`);
    html = html.replace(/{{MARKS}}/g, `${student.obtained_marks}/${student.total_marks} (${student.percentage}%)`);
    html = html.replace(/{{APP_ID}}/g, student.application_id);

    return html;
}

export function isDiplomaProgram(program: string | null | undefined): boolean {
    return (program || '').toLowerCase().includes('diploma');
}
