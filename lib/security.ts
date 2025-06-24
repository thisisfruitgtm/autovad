import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

// Security constants for React Native
export const SECURITY_CONFIG = {
  MAX_QUERY_LENGTH: 1000,
  MAX_PATH_LENGTH: 100,
  MAX_BODY_SIZE: 1024 * 1024, // 1MB
  ALLOWED_ORIGINS: [
    'https://autovad.vercel.app', 
    'https://mktfybjfxzhvpmnepshq.supabase.co',
    'https://stream.mux.com',
    'https://commondatastorage.googleapis.com',
    'https://images.unsplash.com',
    'https://images.pexels.com',
    'https://api.mux.com'
  ],
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  // React Native specific
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB for videos
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB for images
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/avi'],
} as const;

// Input validation and sanitization for React Native
export class SecurityValidator {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>\"'&]/g, '')
      .substring(0, SECURITY_CONFIG.MAX_QUERY_LENGTH);
  }

  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static validateNumericId(id: string): boolean {
    return /^\d+$/.test(id) && parseInt(id) > 0;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validatePhoneNumber(phone: string): boolean {
    // Basic phone validation for Romanian numbers
    const phoneRegex = /^(\+40|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateFileUpload(file: any, type: 'image' | 'video'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }
    
    // Check file size
    const maxSize = type === 'image' ? SECURITY_CONFIG.MAX_IMAGE_SIZE : SECURITY_CONFIG.MAX_FILE_SIZE;
    if (file.size && file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size (${maxSize / (1024 * 1024)}MB)`);
    }
    
    // Check file type
    const allowedTypes = type === 'image' ? SECURITY_CONFIG.ALLOWED_IMAGE_TYPES : SECURITY_CONFIG.ALLOWED_VIDEO_TYPES;
    if (file.type && !allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file name for malicious patterns
    if (file.name) {
      const maliciousPatterns = /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp|py|pl|sh|bash|ps1|psm1|psd1|vbe|wsf|wsh|msi|dll|sys|drv|bin|dat|log|tmp|temp|ini|cfg|conf|config|xml|json|txt|md|html|htm|css|js|ts|jsx|tsx|vue|svelte|php|asp|aspx|jsp|py|pl|sh|bash|ps1|psm1|psd1|vbe|wsf|wsh|msi|dll|sys|drv|bin|dat|log|tmp|temp|ini|cfg|conf|config|xml|json|txt|md|html|htm|css|js|ts|jsx|tsx|vue|svelte)$/i;
      if (maliciousPatterns.test(file.name)) {
        errors.push('File name contains potentially malicious patterns');
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map((item: any) => this.sanitizeObject(item));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Rate limiting for React Native (in-memory)
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { 
        count: 1, 
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS 
      });
      return false;
    }
    
    if (record.count >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      return true;
    }
    
    record.count++;
    return false;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS;
    return Math.max(0, SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || 0;
  }
}

export const rateLimiter = new RateLimiter();

// Secure storage utilities (using AsyncStorage as fallback)
export class SecureStorage {
  static async store(key: string, value: string): Promise<void> {
    try {
      // For now, use console.log to simulate secure storage
      // In production, implement with expo-secure-store
      console.log(`Storing secure data for key: ${key}`);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw new Error('Failed to store secure data');
    }
  }

  static async retrieve(key: string): Promise<string | null> {
    try {
      // For now, return null to simulate secure storage
      // In production, implement with expo-secure-store
      console.log(`Retrieving secure data for key: ${key}`);
      return null;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      console.log(`Deleting secure data for key: ${key}`);
    } catch (error) {
      console.error('Error deleting secure data:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      const keys = ['auth_token', 'refresh_token', 'user_data', 'settings'];
      for (const key of keys) {
        await SecureStorage.delete(key);
      }
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }
}

// Cryptographic utilities
export class CryptoUtils {
  static async hashString(input: string): Promise<string> {
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        input
      );
      return digest;
    } catch (error) {
      console.error('Error hashing string:', error);
      throw new Error('Failed to hash string');
    }
  }

  static async generateRandomString(length: number = 32): Promise<string> {
    try {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error generating random string:', error);
      // Fallback to Math.random for React Native
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  }

  static async verifyHash(input: string, hash: string): Promise<boolean> {
    try {
      const inputHash = await this.hashString(input);
      return inputHash === hash;
    } catch (error) {
      console.error('Error verifying hash:', error);
      return false;
    }
  }
}

// Network security utilities
export class NetworkSecurity {
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return SECURITY_CONFIG.ALLOWED_ORIGINS.some(origin => 
        urlObj.origin === origin || urlObj.hostname.endsWith(origin.replace('https://', ''))
      );
    } catch {
      return false;
    }
  }

  static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const allowedHeaders = [
      'Content-Type', 'Authorization', 'Accept', 'User-Agent', 
      'X-Requested-With', 'X-Client-Info'
    ];
    
    for (const [key, value] of Object.entries(headers)) {
      if (allowedHeaders.includes(key) && typeof value === 'string') {
        sanitized[key] = SecurityValidator.sanitizeString(value);
      }
    }
    
    return sanitized;
  }

  static createSecureRequest(url: string, options: RequestInit = {}): RequestInit {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid URL: not in allowed origins');
    }
    
    return {
      ...options,
      headers: this.sanitizeHeaders(options.headers as Record<string, string> || {}),
      mode: 'cors' as RequestMode,
      credentials: 'omit' as RequestCredentials,
    };
  }
}

// Error handling for security
export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

// Security monitoring
export class SecurityMonitor {
  private static failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private static suspiciousActivities: string[] = [];

  static recordFailedAttempt(identifier: string, reason: string): void {
    const now = Date.now();
    const record = this.failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    
    record.count++;
    record.lastAttempt = now;
    
    this.failedAttempts.set(identifier, record);
    
    // Log suspicious activity
    if (record.count > 5) {
      this.suspiciousActivities.push(`${identifier}: ${reason} (${record.count} attempts)`);
      console.warn(`🚨 Suspicious activity detected: ${identifier} - ${reason}`);
    }
  }

  static isBlocked(identifier: string): boolean {
    const record = this.failedAttempts.get(identifier);
    if (!record) return false;
    
    // Block for 15 minutes after 10 failed attempts
    return record.count >= 10 && (Date.now() - record.lastAttempt) < 15 * 60 * 1000;
  }

  static getSuspiciousActivities(): string[] {
    return [...this.suspiciousActivities];
  }

  static clearSuspiciousActivities(): void {
    this.suspiciousActivities = [];
  }
}

// Device security utilities
export class DeviceSecurity {
  static getDeviceInfo(): Record<string, string> {
    return {
      platform: Platform.OS,
      version: Platform.Version?.toString() || 'unknown',
      isEmulator: (Platform.isTV || false).toString(),
      brand: 'unknown',
      model: 'unknown',
    };
  }

  static isEmulator(): boolean {
    return Platform.isTV || false;
  }

  static getSecureHeaders(): Record<string, string> {
    return {
      'X-Client-Info': 'Autovad-mobile-app',
      'X-Platform': Platform.OS,
      'X-App-Version': '1.0.0', // Replace with actual version
      'User-Agent': `Autovad/${Platform.OS}/1.0.0`,
    };
  }
}

// Main security class
export class SecurityManager {
  static async validateAndSanitizeInput(input: any, type: 'string' | 'email' | 'password' | 'url' | 'phone'): Promise<any> {
    if (typeof input === 'string') {
      const sanitized = SecurityValidator.sanitizeString(input);
      
      switch (type) {
        case 'email':
          if (!SecurityValidator.validateEmail(sanitized)) {
            throw new SecurityError('Invalid email format', 'INVALID_EMAIL');
          }
          break;
        case 'password':
          const passwordValidation = SecurityValidator.validatePassword(sanitized);
          if (!passwordValidation.valid) {
            throw new SecurityError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 'INVALID_PASSWORD');
          }
          break;
        case 'url':
          if (!SecurityValidator.validateUrl(sanitized)) {
            throw new SecurityError('Invalid URL format', 'INVALID_URL');
          }
          break;
        case 'phone':
          if (!SecurityValidator.validatePhoneNumber(sanitized)) {
            throw new SecurityError('Invalid phone number format', 'INVALID_PHONE');
          }
          break;
      }
      
      return sanitized;
    }
    
    return SecurityValidator.sanitizeObject(input);
  }

  static async createSecureRequest(url: string, options: RequestInit = {}): Promise<RequestInit> {
    // Check rate limiting
    const identifier = `request_${url}`;
    if (rateLimiter.isRateLimited(identifier)) {
      throw new SecurityError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }
    
    // Check if device is blocked
    if (SecurityMonitor.isBlocked(identifier)) {
      throw new SecurityError('Device temporarily blocked', 'DEVICE_BLOCKED', 403);
    }
    
    return NetworkSecurity.createSecureRequest(url, {
      ...options,
      headers: {
        ...DeviceSecurity.getSecureHeaders(),
        ...options.headers,
      },
    });
  }

  static async handleSecurityError(error: any): Promise<void> {
    if (error instanceof SecurityError) {
      SecurityMonitor.recordFailedAttempt('security_error', error.message);
      console.error(`🚨 Security Error: ${error.code} - ${error.message}`);
    }
  }
} 