const http = require('http');

const postData = JSON.stringify({
    application_id: 'QA_DIPLOMA_001',
    serial_number: 'STK_QA_001',
    name: 'QA Tester',
    father_name: 'QA Father',
    roll_no: 'DIP-999',
    program: 'Diploma / Diploma of Associate Engineer',
    group: 'Mechanical Technology',
    board: 'Punjab Technical Board Lahore',
    passing_year: '2023',
    session: 'Annual',
    obtained_marks: '2612',
    total_marks: '3450'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/students',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('POST Response:', res.statusCode);
        const parsed = JSON.parse(data);
        console.log('Response body:', parsed);
        
        if (parsed.student && parsed.student.secure_hash) {
            // Test GET verify page
            http.get("http://localhost:3000/verify?code=" + parsed.student.secure_hash, (vRes) => {
                let vData = '';
                vRes.on('data', (chunk) => vData += chunk);
                vRes.on('end', () => {
                    console.log('\\n--- Verify Page QA ---');
                    const hasProgram = vData.includes('Diploma / Diploma of Associate Engineer');
                    const hasBoard = vData.includes('Punjab Technical Board Lahore');
                    const hasGroup = vData.includes('Mechanical Technology');
                    console.log('Contains Program:', hasProgram);
                    console.log('Contains Board:', hasBoard);
                    console.log('Contains Group:', hasGroup);
                });
            });
        }
    });
});

req.on('error', (e) => console.error("Problem with request: " + e.message));
req.write(postData);
req.end();
