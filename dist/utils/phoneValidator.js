"use strict";
/**
 * Phone Number Validation and Formatting Utility
 * Ensures phone numbers meet Shopify's validation requirements
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHOPIFY_PHONE_EXAMPLES = void 0;
exports.validateAndFormatPhone = validateAndFormatPhone;
exports.isValidShopifyPhone = isValidShopifyPhone;
exports.testPhoneFormatting = testPhoneFormatting;
/**
 * Validates and formats a phone number for Shopify API
 * @param phone - Raw phone number input
 * @returns Formatted phone number or null if invalid
 */
function validateAndFormatPhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return null;
    }
    // Remove all non-digit characters except + at the beginning
    let cleaned = phone.replace(/[^\d+]/g, '');
    // If it starts with +, keep it, otherwise remove any + in the middle
    if (!cleaned.startsWith('+')) {
        cleaned = cleaned.replace(/\+/g, '');
    }
    // Remove leading zeros if not preceded by country code
    if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }
    // Validate minimum length (at least 7 digits for local numbers)
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 7) {
        console.warn(`⚠️ Phone number too short: ${phone} -> ${cleaned}`);
        return null;
    }
    // Validate maximum length (15 digits is international standard)
    if (digitsOnly.length > 15) {
        console.warn(`⚠️ Phone number too long: ${phone} -> ${cleaned}`);
        return null;
    }
    // Format common patterns
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
        // US/Canada number without country code
        cleaned = `+1${cleaned}`;
    }
    else if (cleaned.length === 11 && cleaned.startsWith('1') && !cleaned.startsWith('+')) {
        // US/Canada number with 1 prefix
        cleaned = `+${cleaned}`;
    }
    else if (!cleaned.startsWith('+') && cleaned.length >= 7) {
        // Add + if missing for international format
        cleaned = `+${cleaned}`;
    }
    console.log(`📞 Phone formatted: ${phone} -> ${cleaned}`);
    return cleaned;
}
/**
 * Validates if a phone number is acceptable for Shopify
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
function isValidShopifyPhone(phone) {
    const formatted = validateAndFormatPhone(phone);
    return formatted !== null;
}
/**
 * Common phone number patterns that Shopify accepts
 */
exports.SHOPIFY_PHONE_EXAMPLES = [
    '+1234567890', // International format
    '+12345678901', // US/Canada with country code
    '+447123456789', // UK format
    '+33123456789', // France format
    '+49123456789', // Germany format
    '+91123456789', // India format
];
/**
 * Test phone number formatting
 */
function testPhoneFormatting() {
    const testCases = [
        '+1234567890',
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890',
        '123 456 7890',
        '+1 (123) 456-7890',
        '01234567890',
        '12345', // Too short
        '123456789012345678', // Too long
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
