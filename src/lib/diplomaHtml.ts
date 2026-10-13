import fs from 'fs';
import path from 'path';

export function buildDiplomaHtml(student: {
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
}, cleanName: string): string {
    const filePath = path.join(process.cwd(), 'src/components/diploma.html');
    let diplomaHtml = fs.readFileSync(filePath, 'utf8');

    diplomaHtml = diplomaHtml.replace(/{{NAME}}/g, cleanName);
    diplomaHtml = diplomaHtml.replace(/{{FATHER_NAME}}/g, student.father_name);
    diplomaHtml = diplomaHtml.replace(/{{ROLL_NO}}/g, student.roll_no);
    diplomaHtml = diplomaHtml.replace(/{{PROGRAM}}/g, student.program || "");
    diplomaHtml = diplomaHtml.replace(/{{BOARD}}/g, student.board);
    diplomaHtml = diplomaHtml.replace(/{{GROUP}}/g, student.group);
    diplomaHtml = diplomaHtml.replace(/{{YEAR_SESSION}}/g, `${student.passing_year} - ${student.session}`);
    diplomaHtml = diplomaHtml.replace(/{{MARKS}}/g, `${student.obtained_marks}/${student.total_marks} (${student.percentage}%)`);
    diplomaHtml = diplomaHtml.replace(/{{APP_ID}}/g, student.application_id);

    return diplomaHtml;
}
