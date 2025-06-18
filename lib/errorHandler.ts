import { Alert } from 'react-native';
import { supabase } from './supabase';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: any;
  operationDuration?: number;
}

export interface AppError extends Error {
  code?: string;
  context?: ErrorContext;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
  private static isDev = __DEV__;

  static createError(
    message: string, 
    code?: string, 
    context?: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): AppError {
    const error = new Error(message) as AppError;
    error.code = code;
    error.context = context;
    error.severity = severity;
    return error;
  }

  static async handle(error: Error | AppError, context?: ErrorContext): Promise<void> {
    const appError = error as AppError;
    const errorContext = { ...appError.context, ...context };
    
    // Log to console in development
    if (this.isDev) {
      console.error(`🚨 [${errorContext.component || 'Unknown'}] ${appError.message}`, {
        code: appError.code,
        context: errorContext,
        stack: appError.stack
      });
    }

    // Log to database for analytics (only in production or if specifically enabled)
    if (!this.isDev || process.env.EXPO_PUBLIC_ENABLE_ERROR_LOGGING === 'true') {
      try {
        await this.logError(appError, errorContext);
      } catch (logError) {
        // Silently fail logging to prevent infinite loops
        if (this.isDev) {
          console.warn('Failed to log error to database:', logError);
        }
      }
    }

    // Show user-friendly alerts for critical errors
    if (appError.severity === 'critical' || appError.severity === 'high') {
      this.showUserAlert(appError, errorContext);
    }
  }

  private static async logError(error: AppError, context: ErrorContext): Promise<void> {
    try {
      await supabase.from('error_logs').insert({
        message: error.message,
        code: error.code,
        component: context.component,
        action: context.action,
        user_id: context.userId,
        metadata: {
          stack: error.stack,
          ...context.metadata
        },
        severity: error.severity || 'medium',
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      // Silently fail - don't throw to prevent infinite loops
    }
  }

  private static showUserAlert(error: AppError, context: ErrorContext): void {
    const title = this.getErrorTitle(error.code);
    const message = this.getErrorMessage(error.code, error.message);
    
    Alert.alert(title, message, [
      {
        text: 'OK',
        style: 'default'
      }
    ]);
  }

  private static getErrorTitle(code?: string): string {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Problemă de conectare';
      case 'AUTH_ERROR':
        return 'Problemă de autentificare';
      case 'PERMISSION_ERROR':
        return 'Acces restricționat';
      case 'VALIDATION_ERROR':
        return 'Date invalide';
      case 'UPLOAD_ERROR':
        return 'Eroare la încărcare';
      default:
        return 'A apărut o problemă';
    }
  }

  private static getErrorMessage(code?: string, originalMessage?: string): string {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Verifică conexiunea la internet și încearcă din nou.';
      case 'AUTH_ERROR':
        return 'Sesiunea ta a expirat. Te rog să te autentifici din nou.';
      case 'PERMISSION_ERROR':
        return 'Nu ai permisiunea să efectuezi această acțiune.';
      case 'VALIDATION_ERROR':
        return 'Te rog verifică datele introduse și încearcă din nou.';
      case 'UPLOAD_ERROR':
        return 'Nu s-a putut încărca fișierul. Încearcă din nou.';
      default:
        return originalMessage || 'Te rog încearcă din nou sau contactează suportul.';
    }
  }

  // Utility methods for common error types
  static networkError(message: string, context?: ErrorContext): AppError {
    return this.createError(message, 'NETWORK_ERROR', context, 'high');
  }

  static authError(message: string, context?: ErrorContext): AppError {
    return this.createError(message, 'AUTH_ERROR', context, 'high');
  }

  static validationError(message: string, context?: ErrorContext): AppError {
    return this.createError(message, 'VALIDATION_ERROR', context, 'medium');
  }

  static uploadError(message: string, context?: ErrorContext): AppError {
    return this.createError(message, 'UPLOAD_ERROR', context, 'high');
  }

  static criticalError(message: string, context?: ErrorContext): AppError {
    return this.createError(message, 'CRITICAL_ERROR', context, 'critical');
  }

  // Wrapper for async operations with error handling
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      await this.handle(error as Error, context);
      return fallback;
    }
  }

  // Performance monitoring
  static async measurePerformance<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: ErrorContext
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      // Log slow operations (> 5 seconds)
      if (duration > 5000) {
        console.warn(`⚠️ Slow operation detected: ${operationName} took ${duration}ms`);
        
        // Log to database for performance monitoring
        if (!this.isDev) {
          try {
            await supabase.from('performance_logs').insert({
              operation: operationName,
              duration,
              component: context?.component,
              user_id: context?.userId,
              metadata: context?.metadata,
              created_at: new Date().toISOString()
            });
          } catch {
            // Silently fail
          }
        }
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const appError = error as AppError;
      appError.context = { ...appError.context, ...context, operationDuration: duration };
      throw appError;
    }
  }
}

// Global error boundary for unhandled promise rejections
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(
      ErrorHandler.criticalError(
        `Unhandled promise rejection: ${event.reason}`,
        { component: 'Global', action: 'unhandledRejection' }
      )
    );
  });
}

export default ErrorHandler; 