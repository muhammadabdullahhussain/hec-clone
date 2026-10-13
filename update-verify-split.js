const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// We need to replace the entire VerifyPage function content.
// Since it's easier to just overwrite the whole file, let's do that.

const newContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function VerifyPage({ searchParams }: { searchParams: { code?: string } }) {
    const code = searchParams.code;

    if (!code) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md border-t-4 border-red-500">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Request</h2>
                    <p className="text-gray-700 font-medium">Please scan a valid QR code.</p>
                </div>
            </div>
        );
    }

    const student = await prisma.student.findUnique({
        where: { secure_hash: code }
    });

    if (!student) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md border-t-4 border-red-500">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Record Not Found</h2>
                    <p className="text-gray-700 font-medium">This QR code does not exist in the official IBCC database.</p>
                </div>
            </div>
        );
    }

    const isDiploma = student.program && student.program.startsWith("Diploma");
    const cleanName = student.name.replace(/\\*/g, '');

    let mobileHtml = "";
    let desktopHtml = "";

    if (isDiploma) {
        // EXACT CODE for MOBILE (from attest.ibcc.educat.pk zip)
        mobileHtml = \`<html> 
<head>
<style>

/* Added to perfectly mimic the missing viewport meta tag zoom behavior of the live site on mobile screens */
@media (max-width: 767px) {
    html {
        width: 980px !important;
        transform: scale(calc(100vw / 980)) !important;
        transform-origin: top center !important;
        background-color: #202124 !important; /* Chrome dark background */
    }
    body {
        min-height: 100vh;
        background-color: #f7f7f7 !important;
    }
}

body {
    background: #f7f7f7;
    margin: 0;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    color: #212529;
}

h1 {
    text-align: center;
    font-size: 40px;
    font-weight: 500;
    margin-bottom: -25px;
}

p {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
}

td {
    font-size: 16px;
    font-weight: bold;
    color: #212529 !important;
    padding-right: 85px;
    padding-bottom: 10px;
    padding-top: 8px;
}

table {
    border-collapse: collapse;
    display: flex;
    justify-content: center;
    align-items: center;
}

h2 {
    text-align: center;
    font-size: 2rem;
    font-weight: 500;
    color: green;
}

tr:nth-child(even) {
    background-color: #D6EEEE !important;
}

@media (min-width: 768px) {
    body { zoom: 2.4; }
    td { padding-right:30px !important; }
}

@media (min-width: 1024px) {
    body { zoom: 1; }
    td { padding-right:85px !important; }
}

</style>
</head>

<body>

<h1>
<a href="#" title="Inter Board Committee of Chairmen - IBCC" rel="home">
<img width="200" height="200" src="/Final.png" alt="Inter Board Committee of Chairmen">
</a>
</h1>

<h1>Welcome to IBCC Portal for Digital Verification</h1><table><h2>This Certificate is attested by IBCC to {{NAME}} </h2><tr><td></td><td>Student Name:</td><td>{{NAME}} </td><td></td></tr><tr><td></td><td>Father Name:</td><td>{{FATHER_NAME}} </td><td></td></tr><tr><td></td><td>Roll No:</td><td>{{ROLL_NO}}</td><td></td></tr><tr><td></td><td>Certificate/Program:</td><td>{{PROGRAM}} </td><td></td></tr><tr><td></td><td>Board:</td><td>{{BOARD}} </td><td></td></tr><tr><td></td><td>Group:</td><td>{{GROUP}} </td><td></td></tr><tr><td></td><td>Passing Year-Session:</td><td>{{YEAR_SESSION}}</td><td></td></tr><tr><td></td><td>Marks:</td><td>{{MARKS}}</td><td></td></tr><tr><td></td><td>Reference No:</td><td>{{APP_ID}}</td><td></td></tr></table><p>Note - Please compare the certificate data from the above data stored in IBCC database. Provide your email address and get verification reply from info@ibcc.edu.pk</p><p style='text-align:center;color:green;font-weight:bold;'>
        For More Information visit IBCC Office, IBCC Website, or Contact IBCC UAN 051-111-114-222
        </p>
</body>
</html>\`;

        // EXACT CODE for DESKTOP (from gray_sardine zip)
        desktopHtml = \`<html> 
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
        body {
            background: #f7f7f7;
            margin: 0;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
            font-size: 1rem;
            line-height: 1.5;
            color: #000;
            -webkit-font-smoothing: auto !important;
            -moz-osx-font-smoothing: auto !important;
        }

        h1 {
            text-align: center;
            font-size: 40px;
            font-weight: 500;
            margin-bottom: -25px;
            color: #000;
        }

        p {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 16px;
            color: #000;
        }

        td {
            font-size: 16px;
            font-weight: bold;
            color: #000 !important;
            padding-right: 85px !important;
            padding-bottom: 10px !important;
            padding-top: 8px !important;
            line-height: 1.1 !important;
        }

        /* Let the table auto-layout naturally, but we will force its width via phantom content */

        table {
            border-collapse: collapse;
            display: table;
            margin: 0 auto;
        }

        h2 {
            text-align: center;
            font-size: 2rem;
            font-weight: 500;
            color: green;
        }

        tr:nth-child(even) {
            background-color: #D6EEEE !important;
        }

        @media (min-width: 768px) {
            body { zoom: 2.4; }
            td { padding-right:30px !important; }
        }

        @media (min-width: 1024px) {
            body { zoom: 1; }
            td { padding-right:85px !important; }
        }

        </style>
        </head>

        <body>

<h1 style="margin-top: 0px; margin-bottom: -40px;">
        <a href="#" title="Inter Board Committee of Chairmen - IBCC" rel="home">
        <img width="200" height="200" src="/Final.png" alt="Inter Board Committee of Chairmen">
        </a>
        </h1>

        <h1>Welcome to IBCC Portal for Digital Verification</h1><table><h2>This Certificate is attested by IBCC to {{NAME}} </h2><tr><td></td><td>Student Name:</td><td>{{NAME}} </td><td></td></tr><tr><td></td><td>Father Name:</td><td>{{FATHER_NAME}} </td><td></td></tr><tr><td></td><td>Roll No:</td><td>{{ROLL_NO}}</td><td></td></tr><tr><td></td><td>Certificate/Program:</td><td><div style="display:grid;align-items:center;"><div style="grid-area:1/1;visibility:hidden;white-space:nowrap;pointer-events:none;">{{PROGRAM}}</div><div style="grid-area:1/1;">{{PROGRAM}} </div></div></td><td></td></tr><tr><td></td><td>Board:</td><td><div style="display:grid;align-items:center;"><div style="grid-area:1/1;visibility:hidden;white-space:nowrap;pointer-events:none;">{{BOARD}}</div><div style="grid-area:1/1;">{{BOARD}} </div></div></td><td></td></tr><tr><td></td><td>Group:</td><td>{{GROUP}} </td><td></td></tr><tr><td></td><td>Passing Year-Session:</td><td>{{YEAR_SESSION}}</td><td></td></tr><tr><td></td><td>Marks:</td><td>{{MARKS}}</td><td></td></tr><tr><td></td><td>Reference No:</td><td>{{APP_ID}}</td><td></td></tr></table><p>Note - Please compare the certificate data from the above data stored in IBCC database. Provide your email address and get verification reply from info@ibcc.edu.pk</p><p style='text-align:center;color:green;font-weight:bold;'>
                For More Information visit IBCC Office, IBCC Website, or Contact IBCC UAN 051-111-114-222
                </p>
        </body>
        </html>\`;
    } else {
        mobileHtml = \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Inter Board Committee of Chairman | Admin Panel | Login</title>

    <!-- Bootstrap 4 -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <style>
        body {
            background: #F7F7F7;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #212529;
            margin: 0;
            padding: 0;
        }

        [v-cloak] {
            display: none;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            text-align: left;
            padding: 8px;
        }

        tr:nth-child(even) {
            background-color: #D6EEEE;
        }

        .DM-Dialog-Box {
            background: red;
            color: white;
            font-family: "Georgia";
            position: fixed;
            width: 40%;
            height: 30%;
            left: 30%;
            top: 35%;
            z-index: 2;
            border-radius: 5px 18px 10px;
            text-align: center;
            padding: 5% 3%;
            font-size: 100%;
        }
    </style>
</head>

<body style="background:#F7F7F7;">

    <div id="print_page">
        <h1 style="text-align:center">
            <a href="search.php" title="Inter Boards Coordination Commission - IBCC" rel="home">
                <img width="200" height="200" src="./apps/attestation/assets/images/logo.jpg" alt="Inter Boards Coordination Commission">
            </a>
        </h1>

        <h1 style="text-align:center;">Welcome to IBCC Portal for Digital Verification</h1>

                    <h2 style="text-align:center;color:green;">This Certificate is attested by IBCC to {{NAME}}.</h2>
            
            <div class="row">
                <div class="col-lg-3 col-md-2"></div>
                <div class="col-lg-6 col-md-8">
                    <p style="text-align:center">
                        <table>
                            <tbody>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Student Name</b></td>
                                    <td><b>{{NAME}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Father Name</b></td>
                                    <td><b>{{FATHER_NAME}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Roll No</b></td>
                                    <td><b>{{ROLL_NO}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Certificate/Program</b></td>
                                    <td><b>{{PROGRAM}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Board</b></td>
                                    <td><b>{{BOARD}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Group</b></td>
                                    <td><b>{{GROUP}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Passing Year - Session</b></td>
                                    <td><b>{{YEAR_SESSION}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Marks</b></td>
                                    <td><b>{{MARKS}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                                <tr>
                                    <td width="20%"></td>
                                    <td><b>Application ID.</b></td>
                                    <td><b>{{APP_ID}}</b></td>
                                    <td width="20%"></td>
                                </tr>
                            </tbody>
                        </table>
                    </p>
                </div>
                <div class="col-lg-3 col-md-2"></div>
            </div>
            </div>

    <div class="row">
        <div class="col-lg-3 col-md-2"></div>
        <div class="col-lg-6 col-md-8">
            <p>Note - Please compare the certificate data from the above mention data stored in IBCC database, provide your email address and get the verification reply from info@ibcc.edu.pk.</p>
        </div>
        <div class="col-lg-3 col-md-2"></div>
    </div>

    <p style="text-align:center;color:green;font-weight:bold;">For More Information, You can visit IBCC Office, IBCC Website or Contact IBCC UAN Number 051- 111 114 222</p>

</body>
</html>\`;
        desktopHtml = mobileHtml; // Inter/Matric are the same on both
    }

    const replaceVars = (html: string) => {
        let res = html;
        res = res.replace(/{{NAME}}/g, cleanName);
        res = res.replace(/{{FATHER_NAME}}/g, student.father_name);
        res = res.replace(/{{ROLL_NO}}/g, student.roll_no);
        res = res.replace(/{{PROGRAM}}/g, student.program || "");
        res = res.replace(/{{BOARD}}/g, student.board);
        res = res.replace(/{{GROUP}}/g, student.group);
        res = res.replace(/{{YEAR_SESSION}}/g, \`\${student.passing_year} - \${student.session}\`);
        res = res.replace(/{{MARKS}}/g, \`\${student.obtained_marks}/\${student.total_marks} (\${student.percentage}%)\`);
        res = res.replace(/{{APP_ID}}/g, student.application_id);
        return res;
    };

    mobileHtml = replaceVars(mobileHtml);
    desktopHtml = replaceVars(desktopHtml);

    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <div className="block md:hidden h-full w-full bg-[#202124]">
                <iframe
                    srcDoc={mobileHtml}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="IBCC Verification Mobile"
                />
            </div>
            <div className="hidden md:block h-full w-full">
                <iframe
                    srcDoc={desktopHtml}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="IBCC Verification Desktop"
                />
            </div>
        </div>
    );
}
`;

fs.writeFileSync(pagePath, newContent);
console.log("Successfully rewrote page.tsx with split views.");
