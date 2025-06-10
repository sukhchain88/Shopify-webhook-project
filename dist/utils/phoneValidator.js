export function validateAndFormatPhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return null;
    }
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
        cleaned = cleaned.replace(/\+/g, '');
    }
    if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 7) {
        console.warn(`⚠️ Phone number too short: ${phone} -> ${cleaned}`);
        return null;
    }
    if (digitsOnly.length > 15) {
        console.warn(`⚠️ Phone number too long: ${phone} -> ${cleaned}`);
        return null;
    }
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
        cleaned = `+1${cleaned}`;
    }
    else if (cleaned.length === 11 && cleaned.startsWith('1') && !cleaned.startsWith('+')) {
        cleaned = `+${cleaned}`;
    }
    else if (!cleaned.startsWith('+') && cleaned.length >= 7) {
        cleaned = `+${cleaned}`;
    }
    console.log(`📞 Phone formatted: ${phone} -> ${cleaned}`);
    return cleaned;
}
export function isValidShopifyPhone(phone) {
    const formatted = validateAndFormatPhone(phone);
    return formatted !== null;
}
export const SHOPIFY_PHONE_EXAMPLES = [
    '+1234567890',
    '+12345678901',
    '+447123456789',
    '+33123456789',
    '+49123456789',
    '+91123456789',
];
export function testPhoneFormatting() {
    const testCases = [
        '+1234567890',
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890',
        '123 456 7890',
        '+1 (123) 456-7890',
        '01234567890',
        '12345',
        '123456789012345678',
        null,
        undefined,
        ''
    ];
    console.log('📞 Phone Number Formatting Tests:');
    testCases.forEach(test => {
        const result = validateAndFormatPhone(test);
        console.log(`  ${test || 'null/undefined'} -> ${result || 'INVALID'}`);
    });
}
