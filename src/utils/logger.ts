// src\utils\logger.ts
export class Logger {
  static info(message: string, data?: any) {
    if (data) {
      console.log(`ℹ️ ${message}:`, data);
    } else {
      console.log(`ℹ️ ${message}`);
    }
  }

  static success(message: string, data?: any) {
    if (data) {
      console.log(`✅ ${message}:`, data);
    } else {
      console.log(`✅ ${message}`);
    }
  }

  static error(message: string, error?: any) {
    if (error?.response?.data) {
      console.error(`❌ ${message}:`, error.response.data);
    } else if (error instanceof Error) {
      console.error(`❌ ${message}:`, error.message);
    } else if (error) {
      console.error(`❌ ${message}:`, error);
    } else {
      console.error(`❌ ${message}`);
    }
  }

  static warn(message: string, data?: any) {
    if (data) {
      console.warn(`⚠️ ${message}:`, data);
    } else {
      console.warn(`⚠️ ${message}`);
    }
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV !== "production") {
      if (data) {
        console.debug(`🔍 ${message}:`, data);
      } else {
        console.debug(`🔍 ${message}`);
      }
    }
  }

  static table(message: string, data: any[]) {
    console.log(`📄 ${message}:`);
    console.table(data);
  }
} 