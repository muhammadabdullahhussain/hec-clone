import crypto from 'crypto';
import QRCode from 'qrcode';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a random Base32 secret for TOTP (160 bits = 20 bytes = 32 Base32 chars)
 */
export function generateBase32Secret(length = 32): string {
    const bytes = crypto.randomBytes(length);
    let secret = '';
    for (let i = 0; i < length; i++) {
        secret += BASE32_CHARS[bytes[i] % 32];
    }
    return secret;
}

/**
 * Decode Base32 string into Buffer
 */
function base32ToBuffer(base32: string): Buffer {
    const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    let bits = '';
    for (let i = 0; i < cleanBase32.length; i++) {
        const val = BASE32_CHARS.indexOf(cleanBase32[i]);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return Buffer.from(bytes);
}

/**
 * Generate 6-digit TOTP code for a given timestamp
 */
export function generateTOTP(secretBase32: string, timeStepWindow: number = 30, forTime: number = Date.now()): string {
    const secretBuffer = base32ToBuffer(secretBase32);
    const counter = Math.floor(forTime / 1000 / timeStepWindow);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter), 0);

    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP code with +-1 window tolerance (90 seconds total validity)
 */
export function verifyTOTP(token: string, secretBase32: string, windowTolerance = 1): boolean {
    if (!token || !secretBase32 || token.length !== 6) return false;
    const now = Date.now();
    const timeStepWindow = 30;

    for (let i = -windowTolerance; i <= windowTolerance; i++) {
        const timeCheck = now + i * timeStepWindow * 1000;
        const validCode = generateTOTP(secretBase32, timeStepWindow, timeCheck);
        if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(validCode))) {
            return true;
        }
    }
    return false;
}

/**
 * Generate otpauth:// URI for authenticator apps
 */
export function getOTPAuthURI(accountName: string, secret: string, issuer: string = 'HEC Portal'): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate QR Code Data URL from otpauth URI
 */
export async function generateQRCodeDataURL(otpauthURI: string): Promise<string> {
    return QRCode.toDataURL(otpauthURI, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 256,
        color: {
            dark: '#0f172a',
            light: '#ffffff'
        }
    });
}

/**
 * Generate 5 Emergency Single-Use Backup Codes (Format: XXXX-XXXX)
 */
export function generateBackupCodes(count = 5): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
        const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
        codes.push(`${p1}-${p2}`);
    }
    return codes;
}

/**
 * Hash a backup code using SHA-256
 */
export function hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

/**
 * Verify and consume a single-use backup code
 */
export function verifyAndConsumeBackupCode(
    providedCode: string,
    storedCodesJson: string | null
): { valid: boolean; remainingCodes: string[] } {
    if (!storedCodesJson) return { valid: false, remainingCodes: [] };

    try {
        const storedList: string[] = JSON.parse(storedCodesJson);
        const providedHash = hashBackupCode(providedCode);

        const index = storedList.findIndex(hash => hash === providedHash);
        if (index === -1) {
            return { valid: false, remainingCodes: storedList };
        }

        // Consume the code
        const remaining = [...storedList];
        remaining.splice(index, 1);
        return { valid: true, remainingCodes: remaining };
    } catch {
        return { valid: false, remainingCodes: [] };
    }
}
