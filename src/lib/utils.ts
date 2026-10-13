import crypto from 'crypto';

/**
 * Generates a long, un-guessable secure hash for the QR Code URL.
 */
export function generateSecureHash() {
    // Generates something like: 3007rmEQ3DqfP...
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomBytes(8).toString('hex');
}

/**
 * Generates the Application ID with specific prefixes and exactly 9 digits zero-padding.
 * Example: 'MC' + 1 -> 'MC000000001'
 */
export function generateApplicationId(programPrefix: string, latestIdNumber: number) {
    const nextId = latestIdNumber + 1;
    // padStart ensures the number is always 9 digits long
    const paddedNumber = String(nextId).padStart(9, '0');
    return `${programPrefix}${paddedNumber}`;
}

/**
 * Automatically calculates percentage and formats it to 2 decimal places.
 */
export function calculatePercentage(obtained: number, total: number) {
    if (total === 0) return '0.00';
    return ((obtained / total) * 100).toFixed(2);
}
