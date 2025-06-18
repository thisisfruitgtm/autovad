import { ErrorHandler } from './errorHandler';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any, data?: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export class Validator {
  static validate(data: { [key: string]: any }, schema: ValidationSchema): ValidationResult {
    const errors: { [key: string]: string } = {};
    
    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const error = this.validateField(value, rule, field, data);
      
      if (error) {
        errors[field] = error;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private static validateField(value: any, rule: ValidationRule, fieldName: string, data?: any): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${fieldName} este obligatoriu`;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${fieldName} trebuie să aibă cel puțin ${rule.minLength} caractere`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `${fieldName} nu poate avea mai mult de ${rule.maxLength} caractere`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return `${fieldName} are un format invalid`;
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = typeof value === 'number' ? value : Number(value);
      
      if (rule.min !== undefined && numValue < rule.min) {
        return `${fieldName} trebuie să fie cel puțin ${rule.min}`;
      }

      if (rule.max !== undefined && numValue > rule.max) {
        return `${fieldName} nu poate fi mai mare de ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value, data);
    }

    return null;
  }

  // Predefined validation schemas
  static carFormSchema: ValidationSchema = {
    make: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    model: {
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    year: {
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
      custom: (value) => {
        const year = Number(value);
        if (isNaN(year)) return 'Anul trebuie să fie un număr valid';
        return null;
      }
    },
    price: {
      required: true,
      min: 100,
      max: 10000000,
      custom: (value) => {
        const price = Number(value);
        if (isNaN(price)) return 'Prețul trebuie să fie un număr valid';
        return null;
      }
    },
    mileage: {
      required: true,
      min: 0,
      max: 1000000,
      custom: (value) => {
        const mileage = Number(value);
        if (isNaN(mileage)) return 'Kilometrajul trebuie să fie un număr valid';
        return null;
      }
    },
    color: {
      required: true,
      minLength: 2,
      maxLength: 30,
    },
    fuelType: {
      required: true,
      custom: (value) => {
        const validTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
        if (!validTypes.includes(value)) {
          return 'Tipul de combustibil nu este valid';
        }
        return null;
      }
    },
    transmission: {
      required: true,
      custom: (value) => {
        const validTypes = ['Manual', 'Automatic'];
        if (!validTypes.includes(value)) {
          return 'Tipul de transmisie nu este valid';
        }
        return null;
      }
    },
    bodyType: {
      required: true,
      custom: (value) => {
        const validTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Truck'];
        if (!validTypes.includes(value)) {
          return 'Tipul de caroserie nu este valid';
        }
        return null;
      }
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    location: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  };

  static authFormSchema: ValidationSchema = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value) => {
        if (typeof value !== 'string') return 'Email-ul trebuie să fie text';
        if (!value.includes('@')) return 'Email-ul trebuie să conțină @';
        return null;
      }
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 128,
      custom: (value) => {
        if (typeof value !== 'string') return 'Parola trebuie să fie text';
        if (value.length < 6) return 'Parola trebuie să aibă cel puțin 6 caractere';
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value, data) => {
        if (value !== data?.password) {
          return 'Parolele nu se potrivesc';
        }
        return null;
      }
    },
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/,
    },
    phone: {
      required: false,
      pattern: /^(\+40|0)[0-9]{9}$/,
      custom: (value) => {
        if (!value) return null; // Optional field
        if (typeof value !== 'string') return 'Numărul de telefon trebuie să fie text';
        const cleanPhone = value.replace(/\s/g, '');
        if (!/^(\+40|0)[0-9]{9}$/.test(cleanPhone)) {
          return 'Numărul de telefon nu este valid (ex: +40123456789 sau 0123456789)';
        }
        return null;
      }
    }
  };

  // Helper methods for common validations
  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^(\+40|0)[0-9]{9}$/.test(cleanPhone);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Parola trebuie să aibă cel puțin 6 caractere');
    }
    
    if (password.length > 128) {
      errors.push('Parola nu poate avea mai mult de 128 caractere');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Parola trebuie să conțină cel puțin o literă mică');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Parola trebuie să conțină cel puțin o literă mare');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Parola trebuie să conțină cel puțin o cifră');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeInput(input: string): string {
    // Remove potentially dangerous characters and trim whitespace
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  static validateFileUpload(
    file: { size: number; type?: string; name?: string },
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): { isValid: boolean; error?: string } {
    const {
      maxSize = 70 * 1024 * 1024, // 70MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov']
    } = options;

    // Check file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        isValid: false,
        error: `Fișierul este prea mare. Dimensiunea maximă permisă este ${sizeMB}MB`
      };
    }

    // Check file type
    if (file.type && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipul de fișier nu este permis'
      };
    }

    // Check file extension
    if (file.name) {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(extension)) {
        return {
          isValid: false,
          error: `Extensia fișierului nu este permisă. Extensii permise: ${allowedExtensions.join(', ')}`
        };
      }
    }

    return { isValid: true };
  }

  // Form validation with error handling integration
  static async validateFormWithErrorHandling(
    data: { [key: string]: any },
    schema: ValidationSchema,
    context: { component: string; action: string; userId?: string }
  ): Promise<ValidationResult> {
    try {
      const result = this.validate(data, schema);
      
      if (!result.isValid) {
        // Log validation errors for analytics
        await ErrorHandler.handle(
          ErrorHandler.validationError(
            `Form validation failed: ${Object.keys(result.errors).join(', ')}`,
            { ...context, metadata: { errors: result.errors, data } }
          )
        );
      }
      
      return result;
    } catch (error) {
      await ErrorHandler.handle(
        error as Error,
        { ...context, action: 'validateForm' }
      );
      
      return {
        isValid: false,
        errors: { general: 'A apărut o eroare la validarea formularului' }
      };
    }
  }
}

export default Validator; 