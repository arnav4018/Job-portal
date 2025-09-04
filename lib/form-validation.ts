import { z } from 'zod'

// Real-time validation utilities
export interface ValidationResult {
  isValid: boolean
  error?: string
  suggestions?: string[]
}

export interface AsyncValidationResult extends ValidationResult {
  isLoading: boolean
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  aadhar: /^\d{4}\s?\d{4}\s?\d{4}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  uan: /^\d{12}$/,
  url: /^https?:\/\/.+/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
}

// Immediate validation functions
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!validationPatterns.email.test(email)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid email address',
      suggestions: ['example@domain.com']
    }
  }
  
  return { isValid: true }
}

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  const cleanPhone = phone.replace(/\s+/g, '')
  
  if (cleanPhone.length < 10) {
    return { 
      isValid: false, 
      error: 'Phone number must be at least 10 digits',
      suggestions: ['+91 9876543210', '9876543210']
    }
  }
  
  if (!validationPatterns.phone.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid phone number',
      suggestions: ['+91 9876543210']
    }
  }
  
  return { isValid: true }
}

export const validateAadhar = (aadhar: string): ValidationResult => {
  if (!aadhar) {
    return { isValid: false, error: 'Aadhar number is required' }
  }
  
  const cleanAadhar = aadhar.replace(/\s+/g, '')
  
  if (cleanAadhar.length !== 12) {
    return { 
      isValid: false, 
      error: 'Aadhar number must be 12 digits',
      suggestions: ['1234 5678 9012']
    }
  }
  
  if (!validationPatterns.aadhar.test(aadhar)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid Aadhar number',
      suggestions: ['1234 5678 9012']
    }
  }
  
  return { isValid: true }
}

export const validatePAN = (pan: string): ValidationResult => {
  if (!pan) {
    return { isValid: false, error: 'PAN number is required' }
  }
  
  const upperPAN = pan.toUpperCase()
  
  if (upperPAN.length !== 10) {
    return { 
      isValid: false, 
      error: 'PAN number must be 10 characters',
      suggestions: ['ABCDE1234F']
    }
  }
  
  if (!validationPatterns.pan.test(upperPAN)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid PAN number',
      suggestions: ['ABCDE1234F']
    }
  }
  
  return { isValid: true }
}

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Password must be at least 8 characters long'
    }
  }
  
  if (!validationPatterns.strongPassword.test(password)) {
    const suggestions = []
    if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters')
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters')
    if (!/\d/.test(password)) suggestions.push('Add numbers')
    if (!/[@$!%*?&]/.test(password)) suggestions.push('Add special characters')
    
    return { 
      isValid: false, 
      error: 'Password must contain uppercase, lowercase, numbers, and special characters',
      suggestions
    }
  }
  
  return { isValid: true }
}

export const validateURL = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true } // URL is optional in most cases
  }
  
  if (!validationPatterns.url.test(url)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid URL',
      suggestions: ['https://example.com']
    }
  }
  
  return { isValid: true }
}

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { 
      isValid: false, 
      error: `${fieldName} is required` 
    }
  }
  
  return { isValid: true }
}

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: true } // Let required validation handle empty values
  }
  
  if (value.length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${minLength} characters long` 
    }
  }
  
  return { isValid: true }
}

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: true }
  }
  
  if (value.length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be no more than ${maxLength} characters long` 
    }
  }
  
  return { isValid: true }
}

export const validateNumericRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult => {
  if (isNaN(value)) {
    return { 
      isValid: false, 
      error: `${fieldName} must be a valid number` 
    }
  }
  
  if (value < min || value > max) {
    return { 
      isValid: false, 
      error: `${fieldName} must be between ${min} and ${max}` 
    }
  }
  
  return { isValid: true }
}

// Async validation functions (for server-side checks)
export const validateEmailUnique = async (email: string): Promise<AsyncValidationResult> => {
  if (!email) {
    return { isValid: false, isLoading: false, error: 'Email is required' }
  }

  // First check format
  const formatResult = validateEmail(email)
  if (!formatResult.isValid) {
    return { ...formatResult, isLoading: false }
  }

  try {
    // Simulate API call to check email uniqueness
    const response = await fetch('/api/validate/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const result = await response.json()
    
    return {
      isValid: result.isUnique,
      isLoading: false,
      error: result.isUnique ? undefined : 'Email is already registered'
    }
  } catch (error) {
    return {
      isValid: false,
      isLoading: false,
      error: 'Unable to validate email. Please try again.'
    }
  }
}

export const validateCompanyExists = async (companyName: string): Promise<AsyncValidationResult> => {
  if (!companyName) {
    return { isValid: false, isLoading: false, error: 'Company name is required' }
  }

  try {
    // Simulate API call to validate company
    const response = await fetch('/api/validate/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName })
    })

    const result = await response.json()
    
    return {
      isValid: result.exists,
      isLoading: false,
      error: result.exists ? undefined : 'Company not found in our database',
      suggestions: result.suggestions || []
    }
  } catch (error) {
    return {
      isValid: true, // Don't block on validation errors
      isLoading: false
    }
  }
}

// Validation schema builders with immediate feedback
export const createValidationSchema = (fields: Record<string, any>) => {
  const schemaFields: Record<string, z.ZodType> = {}

  Object.entries(fields).forEach(([key, config]) => {
    let schema: z.ZodString = z.string()

    // Apply string validations first
    if (config.minLength) {
      schema = schema.min(config.minLength, `${config.label || key} must be at least ${config.minLength} characters`)
    }

    if (config.maxLength) {
      schema = schema.max(config.maxLength, `${config.label || key} must be no more than ${config.maxLength} characters`)
    }

    if (config.pattern) {
      schema = schema.regex(config.pattern, config.patternMessage || `Invalid ${config.label || key} format`)
    }

    if (config.type === 'email') {
      schema = schema.email('Please enter a valid email address')
    }

    if (config.type === 'url') {
      schema = schema.url('Please enter a valid URL')
    }

    // Handle required vs optional after all string validations
    let finalSchema: z.ZodType
    if (config.required) {
      finalSchema = schema.min(1, `${config.label || key} is required`)
    } else {
      finalSchema = schema.optional()
    }

    schemaFields[key] = finalSchema
  })

  return z.object(schemaFields)
}

// Form validation state manager
export class FormValidationManager {
  private validationResults: Map<string, ValidationResult> = new Map()
  private asyncValidationPromises: Map<string, Promise<AsyncValidationResult>> = new Map()

  setValidationResult(fieldName: string, result: ValidationResult) {
    this.validationResults.set(fieldName, result)
  }

  getValidationResult(fieldName: string): ValidationResult | undefined {
    return this.validationResults.get(fieldName)
  }

  isFieldValid(fieldName: string): boolean {
    const result = this.validationResults.get(fieldName)
    return result?.isValid ?? true
  }

  getAllErrors(): Record<string, string> {
    const errors: Record<string, string> = {}
    
    this.validationResults.forEach((result, fieldName) => {
      if (!result.isValid && result.error) {
        errors[fieldName] = result.error
      }
    })

    return errors
  }

  isFormValid(): boolean {
    return Array.from(this.validationResults.values()).every(result => result.isValid)
  }

  async validateFieldAsync(fieldName: string, validator: () => Promise<AsyncValidationResult>): Promise<AsyncValidationResult> {
    // Cancel existing validation for this field
    this.asyncValidationPromises.delete(fieldName)

    const promise = validator()
    this.asyncValidationPromises.set(fieldName, promise)

    try {
      const result = await promise
      
      // Only update if this is still the latest validation
      if (this.asyncValidationPromises.get(fieldName) === promise) {
        this.setValidationResult(fieldName, result)
        this.asyncValidationPromises.delete(fieldName)
      }

      return result
    } catch (error) {
      this.asyncValidationPromises.delete(fieldName)
      throw error
    }
  }

  clear() {
    this.validationResults.clear()
    this.asyncValidationPromises.clear()
  }
}