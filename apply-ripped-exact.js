const fs = require('fs');

const pageTsxPath = 'src/app/verify/page.tsx';
let content = fs.readFileSync(pageTsxPath, 'utf8');

const elseIndex = content.indexOf('} else {');
const desktopHtmlIndex = content.indexOf('desktopHtml = mobileHtml; // Inter/Matric are the same on both', elseIndex);

if (elseIndex === -1 || desktopHtmlIndex === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const templateString = `<!DOCTYPE html>
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

const before = content.substring(0, elseIndex);
const after = content.substring(desktopHtmlIndex);

const newHtml = `    } else {
        mobileHtml = \`${templateString}\`;
        `;

fs.writeFileSync(pageTsxPath, before + newHtml + after, 'utf8');

// Now update the replaceVars function to handle DOC_TYPE
let finalContent = fs.readFileSync(pageTsxPath, 'utf8');
const replaceVarsMatch = `    const replaceVars = (html: string) => {
        let res = html;
        res = res.replace(/{{NAME}}/g, cleanName);`;

const replaceVarsReplacement = `    const replaceVars = (html: string) => {
        let res = html;
        const docType = student.program === "HSSC / Intermediate" ? "Certificate" : "Marksheet";
        res = res.replace(/{{DOC_TYPE}}/g, docType);
        res = res.replace(/{{NAME}}/g, cleanName);`;

finalContent = finalContent.replace(replaceVarsMatch, replaceVarsReplacement);

fs.writeFileSync(pageTsxPath, finalContent, 'utf8');
console.log("Updated page.tsx with exactly ripped HTML");
