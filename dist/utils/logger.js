"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// src\utils\logger.ts
class Logger {
    static info(message, data) {
        if (data) {
            console.log(`ℹ️ ${message}:`, data);
        }
        else {
            console.log(`ℹ️ ${message}`);
        }
    }
    static success(message, data) {
        if (data) {
            console.log(`✅ ${message}:`, data);
        }
        else {
            console.log(`✅ ${message}`);
        }
    }
    static error(message, error) {
        if (error?.response?.data) {
            console.error(`❌ ${message}:`, error.response.data);
        }
        else if (error instanceof Error) {
            console.error(`❌ ${message}:`, error.message);
        }
        else if (error) {
            console.error(`❌ ${message}:`, error);
        }
        else {
            console.error(`❌ ${message}`);
        }
    }
    static warn(message, data) {
        if (data) {
            console.warn(`⚠️ ${message}:`, data);
        }
        else {
            console.warn(`⚠️ ${message}`);
        }
    }
    static debug(message, data) {
        if (process.env.NODE_ENV !== "production") {
            if (data) {
                console.debug(`🔍 ${message}:`, data);
            }
            else {
                console.debug(`🔍 ${message}`);
            }
        }
    }
    static table(message, data) {
        console.log(`📄 ${message}:`);
        console.table(data);
    }
}
exports.Logger = Logger;
