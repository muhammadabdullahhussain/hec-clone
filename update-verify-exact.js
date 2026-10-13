const fs = require('fs');
const file = 'src/app/verify/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const elseIndex = content.indexOf('} else {');
const desktopHtmlIndex = content.indexOf('desktopHtml = mobileHtml; // Inter/Matric are the same on both', elseIndex);

if (elseIndex === -1 || desktopHtmlIndex === -1) {
    console.error("Could not find the bounds of the else block");
    process.exit(1);
}

const newHtml = `    } else {
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
            <a href="https://ibcc.edu.pk/" target="_blank" title="Inter Boards Coordination Commission - IBCC" rel="home">
                <img width="200" height="200" src="/Final.png" alt="Inter Boards Coordination Commission">
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
        `;

const before = content.substring(0, elseIndex);
const after = content.substring(desktopHtmlIndex);

fs.writeFileSync(file, before + newHtml + after, 'utf8');
console.log("File updated successfully.");
