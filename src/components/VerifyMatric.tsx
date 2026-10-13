import React from 'react';

export default function VerifyMatric({ student, cleanName }: { student: any, cleanName: string }) {
    let mobileHtml = `<!DOCTYPE html>
<html lang="en"><head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Inter Board Committee of Chairman | Admin Panel | Login</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">

</head>

<body style="background:#F7F7F7;">
<div id="print_page">
<style>
[v-cloak] {display: none}
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

.DM-Dialog-Box
{
	background:red;
	color:white;
	font-family:"Georgia";
	position:fixed;
	width:40%;height:30%;
	left:30%;top:35%;
	z-index:2;border-radius:5px 18px 10px;
	text-align:center;padding:5% 3%;
	font-size:100%;
}
</style>
<h1 style="text-align:center">
    <a href="https://ibcc.edu.pk/" target="_blank" title="Inter Boards Coordination Commission - IBCC" rel="home">
        <img width="200" height="200" src="/Final.png" alt="Inter Boards Coordination Commission">
    </a>
</h1>

<h1 style="text-align:center;">Welcome to IBCC Portal for Digital Verification</h1>
<h2 style="text-align:center;color:green;">This {{DOC_TYPE}} is attested by IBCC to {{NAME}}.</h2><div class="row">
    <div class="col-lg-3"></div>
    <div class="col-lg-6">
<p style="text-align:center">
</p><table>
    <tbody>
        <tr>
            <td width="20%"></td><td><b>Student Name</b></td><td><b>{{NAME}}</b></td><td width="20%"></td>
        </tr>
		<tr>
            <td width="20%"></td><td><b>Father Name</b></td><td><b>{{FATHER_NAME}}</b></td><td width="20%"></td>
        </tr>
        <tr>
            <td width="20%"></td><td><b>Roll No</b></td><td><b>{{ROLL_NO}}</b></td><td width="20%"></td>
        </tr>
		<tr>
            <td width="20%"></td><td><b>Certificate/Program</b></td><td><b>{{PROGRAM}}</b></td><td width="20%"></td>
        </tr>
		<tr>
            <td width="20%"></td><td><b>Board</b></td><td><b>{{BOARD}}</b></td><td width="20%"></td>
        </tr>
		<tr>
            <td width="20%"></td><td><b>Group</b></td><td><b>{{GROUP}}</b></td><td width="20%"></td>
        </tr>
        <tr>
            <td width="20%"></td><td><b>Passing Year - Session</b></td><td><b>{{YEAR_SESSION}}</b></td><td width="20%"></td>
        </tr>
        <tr>
            <td width="20%"></td><td><b>Marks</b></td><td><b>{{MARKS}}</b></td><td width="20%"></td>
        </tr>
        <tr>
            <td width="20%"></td><td><b>Application ID.</b></td><td><b>{{APP_ID}}</b></td><td width="20%"></td>
        </tr>
    </tbody>
    
</table><p></p>
</div>
<div class="col-lg-3"></div>
</div>
</div>
<div class="row">
<div class="col-lg-3"></div>
<div class="col-lg-6">
    <p>Note - Please compare the certificate data from the above mention data stored in IBCC database, provide your email address and get the verification reply from info@ibcc.edu.pk.</p>
</div>
<div class="col-lg-3"></div>
</div>
<p style="text-align:center;color:green;font-weight:bold;">For More Information, You can visit IBCC Office, IBCC Website or Contact IBCC UAN Number 051- 111 114 222</p>  

</body></html>`;

    let desktopHtml = mobileHtml; // Inter/Matric are the same on both

    const replaceVars = (html: string) => {
        let res = html;
        const docType = student.program === "HSSC / Intermediate" ? "Certificate" : "Marksheet";
        res = res.replace(/{{DOC_TYPE}}/g, docType);
        res = res.replace(/{{NAME}}/g, cleanName);
        res = res.replace(/{{FATHER_NAME}}/g, student.father_name);
        res = res.replace(/{{ROLL_NO}}/g, student.roll_no);
        res = res.replace(/{{PROGRAM}}/g, student.program || "");
        res = res.replace(/{{BOARD}}/g, student.board);
        res = res.replace(/{{GROUP}}/g, student.group);
        res = res.replace(/{{YEAR_SESSION}}/g, `${student.passing_year} - ${student.session}`);
        res = res.replace(/{{MARKS}}/g, `${student.obtained_marks}/${student.total_marks} (${student.percentage}%)`);
        res = res.replace(/{{APP_ID}}/g, student.application_id);
        return res;
    };

    mobileHtml = replaceVars(mobileHtml);
    desktopHtml = replaceVars(desktopHtml);

    return (
        <div style={{ width: "100%", height: "100vh", overflow: "hidden", backgroundColor: "#f7f7f7" }}>
            {/* MOBILE WRAPPER */}
            <div className="block md:hidden w-full h-[100vh] overflow-hidden m-0 p-0" style={{ display: 'flex', justifyContent: 'center' }}>
                <iframe
                    srcDoc={mobileHtml}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block', margin: 0, padding: 0 }}
                    title="IBCC Verification Mobile"
                />
            </div>

            {/* DESKTOP WRAPPER */}
            <div className="hidden md:block h-full w-full" style={{ backgroundColor: "#f7f7f7" }}>
                <iframe
                    srcDoc={desktopHtml}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="IBCC Verification Desktop"
                />
            </div>
        </div>
    );
}
