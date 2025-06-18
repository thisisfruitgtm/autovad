import { ErrorHandler } from '../../lib/errorHandler';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('createError', () => {
    it('should create an error with proper properties', () => {
      const error = ErrorHandler.createError(
        'Test error',
        'TEST_CODE',
        { component: 'TestComponent' },
        'high'
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.context?.component).toBe('TestComponent');
      expect(error.severity).toBe('high');
    });

    it('should set default severity to medium', () => {
      const error = ErrorHandler.createError('Test error');
      expect(error.severity).toBe('medium');
    });
  });

  describe('handle', () => {
    it('should log errors in development mode', async () => {
      const error = ErrorHandler.createError('Test error', 'TEST_CODE');
      
      await ErrorHandler.handle(error, { component: 'TestComponent' });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('🚨 [TestComponent] Test error'),
        expect.objectContaining({
          code: 'TEST_CODE',
          context: expect.objectContaining({
            component: 'TestComponent'
          })
        })
      );
    });

    it('should show alert for critical errors', async () => {
      const error = ErrorHandler.criticalError('Critical test error');
      
      await ErrorHandler.handle(error);

      expect(Alert.alert).toHaveBeenCalledWith(
        'A apărut o problemă',
        'Critical test error',
        expect.arrayContaining([
          expect.objectContaining({ text: 'OK' })
        ])
      );
    });

    it('should show alert for high severity errors', async () => {
      const error = ErrorHandler.networkError('Network test error');
      
      await ErrorHandler.handle(error);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Problemă de conectare',
        'Verifică conexiunea la internet și încearcă din nou.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'OK' })
        ])
      );
    });

    it('should not show alert for low severity errors', async () => {
      const error = ErrorHandler.createError('Low severity error', 'TEST', {}, 'low');
      
      await ErrorHandler.handle(error);

      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should create network error with correct properties', () => {
      const error = ErrorHandler.networkError('Network failed');
      
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.severity).toBe('high');
      expect(error.message).toBe('Network failed');
    });

    it('should create auth error with correct properties', () => {
      const error = ErrorHandler.authError('Auth failed');
      
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.severity).toBe('high');
      expect(error.message).toBe('Auth failed');
    });

    it('should create validation error with correct properties', () => {
      const error = ErrorHandler.validationError('Validation failed');
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.severity).toBe('medium');
      expect(error.message).toBe('Validation failed');
    });

    it('should create upload error with correct properties', () => {
      const error = ErrorHandler.uploadError('Upload failed');
      
      expect(error.code).toBe('UPLOAD_ERROR');
      expect(error.severity).toBe('high');
      expect(error.message).toBe('Upload failed');
    });
  });

  describe('withErrorHandling', () => {
    it('should return result when operation succeeds', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await ErrorHandler.withErrorHandling(
        operation,
        { component: 'TestComponent' }
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle errors and return fallback', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const result = await ErrorHandler.withErrorHandling(
        operation,
        { component: 'TestComponent' },
        'fallback'
      );

      expect(result).toBe('fallback');
      expect(console.error).toHaveBeenCalled();
    });

    it('should return undefined when no fallback provided', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const result = await ErrorHandler.withErrorHandling(
        operation,
        { component: 'TestComponent' }
      );

      expect(result).toBeUndefined();
    });
  });

  describe('measurePerformance', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return result for fast operations', async () => {
      const operation = jest.fn().mockResolvedValue('result');
      
      const promise = ErrorHandler.measurePerformance(
        operation,
        'testOperation',
        { component: 'TestComponent' }
      );

      // Advance time by 1 second
      jest.advanceTimersByTime(1000);
      
      const result = await promise;

      expect(result).toBe('result');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn about slow operations', async () => {
      const operation = jest.fn().mockImplementation(async () => {
        // Simulate slow operation
        await new Promise(resolve => setTimeout(resolve, 6000));
        return 'result';
      });
      
      const promise = ErrorHandler.measurePerformance(
        operation,
        'slowOperation',
        { component: 'TestComponent' }
      );

      // Advance time by 6 seconds
      jest.advanceTimersByTime(6000);
      
      const result = await promise;

      expect(result).toBe('result');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Slow operation detected: slowOperation took')
      );
    });

    it('should add operation duration to error context when operation fails', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      try {
        const promise = ErrorHandler.measurePerformance(
          operation,
          'failingOperation',
          { component: 'TestComponent' }
        );

        // Advance time by 2 seconds
        jest.advanceTimersByTime(2000);
        
        await promise;
      } catch (error: any) {
        expect(error.context?.operationDuration).toBeGreaterThan(0);
        expect(error.context?.component).toBe('TestComponent');
      }
    });
  });
}); 