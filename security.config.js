/**
 * AutoVad React Native Security Configuration
 * 
 * This file contains comprehensive security settings and policies
 * for the React Native mobile application.
 */

module.exports = {
  // Application Security Settings
  app: {
    name: 'AutoVad Mobile',
    version: '1.0.0',
    platform: 'react-native',
    securityLevel: 'enterprise',
  },

  // Network Security Configuration
  network: {
    // Allowed origins for API calls
    allowedOrigins: [
      'https://autovad.vercel.app',
      'https://mktfybjfxzhvpmnepshq.supabase.co',
      'https://stream.mux.com',
      'https://commondatastorage.googleapis.com',
      'https://images.unsplash.com',
      'https://images.pexels.com',
      'https://api.mux.com',
    ],
    
    // Rate limiting settings
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      blockDuration: 15 * 60 * 1000, // 15 minutes
    },
    
    // Request size limits
    maxBodySize: 1024 * 1024, // 1MB
    maxQueryLength: 1000,
    maxPathLength: 100,
  },

  // File Upload Security
  fileUpload: {
    // Video upload limits
    video: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/avi'],
      maxDuration: 300, // 5 minutes
    },
    
    // Image upload limits
    image: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxDimensions: { width: 4096, height: 4096 },
    },
    
    // Malicious file patterns to block
    blockedPatterns: [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp|py|pl|sh|bash|ps1|psm1|psd1|vbe|wsf|wsh|msi|dll|sys|drv|bin|dat|log|tmp|temp|ini|cfg|conf|config|xml|json|txt|md|html|htm|css|js|ts|jsx|tsx|vue|svelte)$/i,
    ],
  },

  // Input Validation Rules
  validation: {
    // UUID validation
    uuid: {
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      message: 'Invalid UUID format',
    },
    
    // Email validation
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format',
    },
    
    // Phone number validation (Romanian)
    phone: {
      pattern: /^(\+40|0)[0-9]{9}$/,
      message: 'Invalid phone number format',
    },
    
    // Password requirements
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    },
  },

  // Authentication Security
  auth: {
    // Session management
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    
    // Login attempts
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    
    // Password policy
    passwordHistory: 3, // Remember last 3 passwords
    passwordExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Data Protection
  dataProtection: {
    // Sensitive data fields
    sensitiveFields: [
      'password',
      'token',
      'api_key',
      'secret',
      'private_key',
      'credit_card',
      'ssn',
      'passport',
    ],
    
    // Data encryption
    encryption: {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      iterations: 100000,
    },
    
    // Data retention
    retention: {
      userData: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      logs: 90 * 24 * 60 * 60 * 1000, // 90 days
      tempFiles: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // Error Handling and Logging
  logging: {
    // Log levels
    levels: ['error', 'warn', 'info', 'debug'],
    
    // Sensitive data masking
    maskPatterns: [
      /password["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /token["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /api_key["\s]*[:=]["\s]*[^"\s,}]+/gi,
      /secret["\s]*[:=]["\s]*[^"\s,}]+/gi,
    ],
    
    // Error reporting
    reportErrors: true,
    reportPerformance: true,
    reportSecurity: true,
  },

  // Device Security
  device: {
    // Emulator detection
    detectEmulator: true,
    blockEmulator: false, // Allow for development
    
    // Device fingerprinting
    fingerprint: {
      enabled: true,
      includePlatform: true,
      includeVersion: true,
      includeDeviceId: false, // Privacy concern
    },
    
    // Jailbreak/root detection
    detectJailbreak: true,
    blockJailbroken: false, // Allow for development
  },

  // API Security
  api: {
    // Request headers
    requiredHeaders: [
      'Content-Type',
      'Authorization',
      'X-Client-Info',
      'X-Platform',
      'X-App-Version',
    ],
    
    // Response headers
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
    
    // CORS settings
    cors: {
      allowedOrigins: ['https://autovad.vercel.app'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info'],
      credentials: false,
    },
  },

  // Monitoring and Alerting
  monitoring: {
    // Security events to monitor
    events: [
      'failed_login',
      'suspicious_activity',
      'rate_limit_exceeded',
      'invalid_input',
      'file_upload_violation',
      'authentication_bypass',
      'data_exfiltration',
    ],
    
    // Alert thresholds
    thresholds: {
      failedLogins: 5,
      suspiciousActivities: 3,
      rateLimitViolations: 10,
      securityErrors: 5,
    },
    
    // Alert channels
    alerts: {
      console: true,
      database: true,
      email: false, // Configure for production
      slack: false, // Configure for production
    },
  },

  // Compliance and Standards
  compliance: {
    // GDPR compliance
    gdpr: {
      enabled: true,
      dataMinimization: true,
      userConsent: true,
      dataPortability: true,
      rightToErasure: true,
    },
    
    // Security standards
    standards: [
      'OWASP Mobile Top 10',
      'OWASP ASVS',
      'NIST Cybersecurity Framework',
      'ISO 27001',
    ],
  },

  // Development and Testing
  development: {
    // Security testing
    testing: {
      penetrationTesting: true,
      vulnerabilityScanning: true,
      codeSecurityReview: true,
      dependencyScanning: true,
    },
    
    // Debug settings
    debug: {
      enabled: __DEV__,
      logSensitiveData: false,
      bypassSecurity: false,
    },
  },
}; 