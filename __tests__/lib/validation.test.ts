import { Validator } from '../../lib/validation';

// Mock the ErrorHandler to avoid Supabase dependencies in tests
jest.mock('../../lib/errorHandler', () => ({
  ErrorHandler: {
    handle: jest.fn(),
    validationError: jest.fn((message, context) => ({ message, context })),
  },
}));

describe('Validator', () => {
  describe('validate', () => {
    it('should pass validation for valid data', () => {
      const data = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const schema = {
        name: { required: true, minLength: 2 },
        age: { required: true, min: 18, max: 100 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      };

      const result = Validator.validate(data, schema);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should fail validation for invalid data', () => {
      const data = {
        name: 'J',
        age: 15,
        email: 'invalid-email'
      };

      const schema = {
        name: { required: true, minLength: 2 },
        age: { required: true, min: 18, max: 100 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      };

      const result = Validator.validate(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('cel puțin 2 caractere');
      expect(result.errors.age).toContain('cel puțin 18');
      expect(result.errors.email).toContain('format invalid');
    });

    it('should handle required field validation', () => {
      const data = {
        name: '',
        age: null,
        email: undefined
      };

      const schema = {
        name: { required: true },
        age: { required: true },
        email: { required: true }
      };

      const result = Validator.validate(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('obligatoriu');
      expect(result.errors.age).toContain('obligatoriu');
      expect(result.errors.email).toContain('obligatoriu');
    });

    it('should skip validation for optional empty fields', () => {
      const data = {
        name: 'John Doe',
        phone: '' // optional field
      };

      const schema = {
        name: { required: true },
        phone: { required: false, minLength: 10 }
      };

      const result = Validator.validate(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors.phone).toBeUndefined();
    });

    it('should handle custom validation', () => {
      const data = {
        password: 'weak',
        confirmPassword: 'different'
      };

      const schema = {
                 password: { 
           required: true,
           custom: (value: any) => {
             if (value.length < 8) return 'Parola trebuie să aibă cel puțin 8 caractere';
             return null;
           }
         },
         confirmPassword: {
           required: true,
           custom: (value: any, data: any) => {
             if (value !== data?.password) return 'Parolele nu se potrivesc';
             return null;
           }
         }
      };

      const result = Validator.validate(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('8 caractere');
      expect(result.errors.confirmPassword).toContain('nu se potrivesc');
    });
  });

  describe('carFormSchema', () => {
    it('should validate a complete car form', () => {
      const validCarData = {
        make: 'BMW',
        model: 'X5',
        year: '2023',
        price: '50000',
        mileage: '15000',
        color: 'Black',
        fuelType: 'Diesel',
        transmission: 'Automatic',
        bodyType: 'SUV',
        description: 'Beautiful BMW X5 in excellent condition with low mileage.',
        location: 'Bucharest'
      };

      const result = Validator.validate(validCarData, Validator.carFormSchema);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject invalid car data', () => {
      const invalidCarData = {
        make: 'B', // too short
        model: '', // required
        year: '1800', // too old
        price: '50', // too low
        mileage: '-100', // negative
        color: '', // required
        fuelType: 'InvalidFuel', // invalid type
        transmission: 'InvalidTransmission', // invalid type
        bodyType: 'InvalidBody', // invalid type
        description: 'Short', // too short
        location: 'B' // too short
      };

      const result = Validator.validate(invalidCarData, Validator.carFormSchema);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(5);
    });
  });

  describe('authFormSchema', () => {
         it('should validate a complete auth form', () => {
       const validAuthData = {
         email: 'test@example.com',
         password: 'SecurePass123',
         confirmPassword: 'SecurePass123',
         fullName: 'John Doe',
         phone: '+40123456789'
       };

       const result = Validator.validate(validAuthData, Validator.authFormSchema);

       if (!result.isValid) {
         console.log('Validation errors:', result.errors);
       }

       expect(result.isValid).toBe(true);
       expect(Object.keys(result.errors)).toHaveLength(0);
     });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        const data = { email, password: 'validpass', confirmPassword: 'validpass', fullName: 'John Doe' };
        const result = Validator.validate(data, Validator.authFormSchema);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBeDefined();
      });
    });

    it('should handle password confirmation mismatch', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
        fullName: 'John Doe'
      };

      const result = Validator.validate(data, Validator.authFormSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toContain('nu se potrivesc');
    });
  });

  describe('helper methods', () => {
    describe('validateEmail', () => {
      it('should validate correct email formats', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'test+tag@example.org'
        ];

        validEmails.forEach(email => {
          expect(Validator.validateEmail(email)).toBe(true);
        });
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'test@',
          'test.example.com'
        ];

        invalidEmails.forEach(email => {
          expect(Validator.validateEmail(email)).toBe(false);
        });
      });
    });

    describe('validatePhone', () => {
             it('should validate Romanian phone numbers', () => {
         const validPhones = [
           '+40123456789',
           '0123456789',
           '+40 123 456 789' // with spaces
         ];

         validPhones.forEach(phone => {
           const isValid = Validator.validatePhone(phone);
           if (!isValid) {
             console.log(`Phone validation failed for: "${phone}"`);
           }
           expect(isValid).toBe(true);
         });
       });

      it('should reject invalid phone numbers', () => {
        const invalidPhones = [
          '123456789', // too short
          '+4012345678901', // too long
          '+1234567890', // wrong country code
          'abc123456789' // contains letters
        ];

        invalidPhones.forEach(phone => {
          expect(Validator.validatePhone(phone)).toBe(false);
        });
      });
    });

    describe('validatePassword', () => {
      it('should validate strong passwords', () => {
        const strongPasswords = [
          'SecurePass123',
          'MyPassword1',
          'Complex123Pass'
        ];

        strongPasswords.forEach(password => {
          const result = Validator.validatePassword(password);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      it('should reject weak passwords', () => {
        const weakPasswords = [
          'short', // too short
          'nouppercase123', // no uppercase
          'NOLOWERCASE123', // no lowercase
          'NoNumbers', // no numbers
          'a'.repeat(130) // too long
        ];

        weakPasswords.forEach(password => {
          const result = Validator.validatePassword(password);
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        });
      });
    });

    describe('sanitizeInput', () => {
      it('should remove dangerous characters', () => {
        const input = '  <script>alert("xss")</script>  ';
        const sanitized = Validator.sanitizeInput(input);
        
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
        expect(sanitized.trim()).toBe('scriptalert(xss)/script');
      });

      it('should normalize whitespace', () => {
        const input = '  multiple   spaces   here  ';
        const sanitized = Validator.sanitizeInput(input);
        
        expect(sanitized).toBe('multiple spaces here');
      });
    });

    describe('validateFileUpload', () => {
      it('should accept valid files', () => {
        const validFile = {
          size: 5 * 1024 * 1024, // 5MB
          type: 'image/jpeg',
          name: 'photo.jpg'
        };

        const result = Validator.validateFileUpload(validFile);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject files that are too large', () => {
        const largeFile = {
          size: 15 * 1024 * 1024, // 15MB
          type: 'image/jpeg',
          name: 'large.jpg'
        };

        const result = Validator.validateFileUpload(largeFile);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('prea mare');
      });

      it('should reject invalid file types', () => {
        const invalidFile = {
          size: 1 * 1024 * 1024,
          type: 'application/pdf',
          name: 'document.pdf'
        };

        const result = Validator.validateFileUpload(invalidFile);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('nu este permis');
      });

      it('should reject invalid file extensions', () => {
        const invalidFile = {
          size: 1 * 1024 * 1024,
          type: 'image/jpeg',
          name: 'photo.exe'
        };

        const result = Validator.validateFileUpload(invalidFile);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('nu este permisă');
      });
    });
  });
}); 