'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useOptimizedForm, useFormPerformanceMonitor } from '@/hooks/use-optimized-form'
import { 
  OptimizedInput, 
  OptimizedTextarea, 
  OptimizedSubmitButton,
  FormField,
  FormSection 
} from '@/components/ui/optimized-form'
import {
  validateEmail,
  validatePhone,
  validateAadhar,
  validatePAN,
  validateRequired,
  validateMinLength,
  FormValidationManager,
  ValidationResult
} from '@/lib/form-validation'
import { User, Shield, Briefcase, FileText, Star, AlertTriangle } from 'lucide-react'

// Enhanced schema with better validation
const optimizedCandidateSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),

  // Government IDs
  aadharNumber: z.string().min(12, 'Valid Aadhar number required').max(12, 'Aadhar number too long'),
  panNumber: z.string().min(10, 'Valid PAN number required').max(10, 'PAN number too long'),
  uanNumber: z.string().optional(),

  // Professional Details
  currentDesignation: z.string().min(1, 'Current designation is required'),
  currentCompany: z.string().min(1, 'Current company is required'),
  totalExperience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience seems too high'),
  currentCTC: z.number().min(0, 'Current CTC must be positive'),
  expectedCTC: z.number().min(0, 'Expected CTC must be positive'),

  // Additional fields
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  summary: z.string().min(50, 'Summary must be at least 50 characters').max(500, 'Summary too long'),
})

type OptimizedCandidateData = z.infer<typeof optimizedCandidateSchema>

export default function OptimizedCandidateForm() {
  const [validationManager] = useState(() => new FormValidationManager())
  const [fieldValidationStates, setFieldValidationStates] = useState<Record<string, {
    isValid?: boolean
    isLoading?: boolean
    error?: string
  }>>({})
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const { recordMetric, getAverageMetrics } = useFormPerformanceMonitor()

  const form = useOptimizedForm<OptimizedCandidateData>({
    resolver: zodResolver(optimizedCandidateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      aadharNumber: '',
      panNumber: '',
      uanNumber: '',
      currentDesignation: '',
      currentCompany: '',
      totalExperience: 0,
      currentCTC: 0,
      expectedCTC: 0,
      skills: [],
      summary: '',
    },
    // Optimization options
    debounceMs: 300,
    debounceFields: ['email', 'phone', 'aadharNumber', 'panNumber'],
    autoSave: true,
    autoSaveDelay: 2000,
    onAutoSave: handleAutoSave,
    enablePerformanceTracking: true,
    onPerformanceMetric: recordMetric,
    preventDoubleSubmit: true
  })

  const { register, handleSubmit, watch, setValue, trigger, formState } = form

  const watchedValues = watch()

  // Auto-save function
  async function handleAutoSave(data: OptimizedCandidateData) {
    setAutoSaveStatus('saving')
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Auto-saved:', data)
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    }
  }

  // Real-time field validation
  const validateField = useCallback(async (fieldName: keyof OptimizedCandidateData, value: any) => {
    setFieldValidationStates(prev => ({
      ...prev,
      [fieldName]: { isLoading: true }
    }))

    let result: ValidationResult = { isValid: true }

    try {
      switch (fieldName) {
        case 'email':
          result = validateEmail(value)
          break
        case 'phone':
          result = validatePhone(value)
          break
        case 'aadharNumber':
          result = validateAadhar(value)
          break
        case 'panNumber':
          result = validatePAN(value)
          break
        case 'firstName':
        case 'lastName':
          result = validateRequired(value, fieldName)
          if (result.isValid) {
            result = validateMinLength(value, 1, fieldName)
          }
          break
        case 'summary':
          result = validateMinLength(value, 50, 'Summary')
          break
        default:
          result = validateRequired(value, fieldName)
      }

      // Simulate async validation for certain fields
      if (['email', 'currentCompany'].includes(fieldName)) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

    } catch (error) {
      result = { isValid: false, error: 'Validation error occurred' }
    }

    setFieldValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        isLoading: false,
        error: result.error
      }
    }))

    validationManager.setValidationResult(fieldName, result)
    return result
  }, [validationManager])

  // Calculate profile completeness
  useEffect(() => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'currentDesignation',
      'currentCompany', 'totalExperience', 'currentCTC', 'expectedCTC'
    ]
    
    const optionalFields = ['aadharNumber', 'panNumber', 'uanNumber', 'summary']
    
    let completed = 0
    const total = requiredFields.length + optionalFields.length

    requiredFields.forEach(field => {
      if (watchedValues[field as keyof OptimizedCandidateData]) completed++
    })

    optionalFields.forEach(field => {
      if (watchedValues[field as keyof OptimizedCandidateData]) completed++
    })

    const percentage = Math.round((completed / total) * 100)
    setProfileCompleteness(percentage)
  }, [watchedValues])

  // Handle form submission
  const onSubmit = async (data: OptimizedCandidateData) => {
    try {
      console.log('Submitting optimized form:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    }
  }

  const averageMetrics = getAverageMetrics()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Performance Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Optimized Candidate Profile</h1>
            <p className="text-sm text-gray-600">Enhanced with real-time validation and performance tracking</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex space-x-4">
          <Card className="w-48">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Complete</span>
                  <span className="text-sm font-bold">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="w-48">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-save</span>
                <Badge variant={
                  autoSaveStatus === 'saved' ? 'default' :
                  autoSaveStatus === 'saving' ? 'secondary' :
                  autoSaveStatus === 'error' ? 'destructive' : 'outline'
                }>
                  {autoSaveStatus === 'saving' ? 'Saving...' :
                   autoSaveStatus === 'saved' ? 'Saved' :
                   autoSaveStatus === 'error' ? 'Error' : 'Ready'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {averageMetrics && (
            <Card className="w-48">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Performance</div>
                  <div className="text-xs text-gray-500">
                    Validation: {Math.round(averageMetrics.validation || 0)}ms
                  </div>
                  <div className="text-xs text-gray-500">
                    Render: {Math.round(averageMetrics.render || 0)}ms
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="skills">Skills & Summary</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormSection title="Basic Details" description="Enter your personal information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField error={fieldValidationStates.firstName?.error}>
                      <OptimizedInput
                        {...register('firstName')}
                        label="First Name"
                        placeholder="John"
                        required
                        isLoading={fieldValidationStates.firstName?.isLoading}
                        isValid={fieldValidationStates.firstName?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('firstName')
                          validateField('firstName', value)
                        }}
                      />
                    </FormField>

                    <FormField error={fieldValidationStates.lastName?.error}>
                      <OptimizedInput
                        {...register('lastName')}
                        label="Last Name"
                        placeholder="Doe"
                        required
                        isLoading={fieldValidationStates.lastName?.isLoading}
                        isValid={fieldValidationStates.lastName?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('lastName')
                          validateField('lastName', value)
                        }}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField error={fieldValidationStates.email?.error}>
                      <OptimizedInput
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="john.doe@example.com"
                        required
                        isLoading={fieldValidationStates.email?.isLoading}
                        isValid={fieldValidationStates.email?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('email')
                          validateField('email', value)
                        }}
                        helperText="We'll use this for important notifications"
                      />
                    </FormField>

                    <FormField error={fieldValidationStates.phone?.error}>
                      <OptimizedInput
                        {...register('phone')}
                        type="tel"
                        label="Phone Number"
                        placeholder="+91 9876543210"
                        required
                        isLoading={fieldValidationStates.phone?.isLoading}
                        isValid={fieldValidationStates.phone?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('phone')
                          validateField('phone', value)
                        }}
                      />
                    </FormField>
                  </div>
                </FormSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Identity Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormSection 
                  title="Government ID Verification" 
                  description="Provide your government-issued identification numbers"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField error={fieldValidationStates.aadharNumber?.error}>
                      <OptimizedInput
                        {...register('aadharNumber')}
                        label="Aadhar Number"
                        placeholder="1234 5678 9012"
                        maxLength={12}
                        required
                        isLoading={fieldValidationStates.aadharNumber?.isLoading}
                        isValid={fieldValidationStates.aadharNumber?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('aadharNumber')
                          validateField('aadharNumber', value)
                        }}
                      />
                    </FormField>

                    <FormField error={fieldValidationStates.panNumber?.error}>
                      <OptimizedInput
                        {...register('panNumber')}
                        label="PAN Number"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        required
                        style={{ textTransform: 'uppercase' }}
                        isLoading={fieldValidationStates.panNumber?.isLoading}
                        isValid={fieldValidationStates.panNumber?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('panNumber')
                          validateField('panNumber', value.toUpperCase())
                        }}
                      />
                    </FormField>

                    <FormField error={fieldValidationStates.uanNumber?.error}>
                      <OptimizedInput
                        {...register('uanNumber')}
                        label="UAN (Optional)"
                        placeholder="123456789012"
                        maxLength={12}
                        isLoading={fieldValidationStates.uanNumber?.isLoading}
                        isValid={fieldValidationStates.uanNumber?.isValid}
                        helperText="EPFO Universal Account Number"
                      />
                    </FormField>
                  </div>
                </FormSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormSection title="Current Role" description="Tell us about your current position">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField error={fieldValidationStates.currentDesignation?.error}>
                      <OptimizedInput
                        {...register('currentDesignation')}
                        label="Current Designation"
                        placeholder="Senior Software Engineer"
                        required
                        isLoading={fieldValidationStates.currentDesignation?.isLoading}
                        isValid={fieldValidationStates.currentDesignation?.isValid}
                      />
                    </FormField>

                    <FormField error={fieldValidationStates.currentCompany?.error}>
                      <OptimizedInput
                        {...register('currentCompany')}
                        label="Current Company"
                        placeholder="TechCorp Solutions"
                        required
                        isLoading={fieldValidationStates.currentCompany?.isLoading}
                        isValid={fieldValidationStates.currentCompany?.isValid}
                        onDebounceChange={(value) => {
                          form.trackFieldInteraction('currentCompany')
                          validateField('currentCompany', value)
                        }}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField error={formState.errors.totalExperience?.message}>
                      <OptimizedInput
                        {...register('totalExperience', { valueAsNumber: true })}
                        type="number"
                        label="Total Experience (Years)"
                        placeholder="5"
                        min={0}
                        max={50}
                        step={0.5}
                        required
                      />
                    </FormField>

                    <FormField error={formState.errors.currentCTC?.message}>
                      <OptimizedInput
                        {...register('currentCTC', { valueAsNumber: true })}
                        type="number"
                        label="Current CTC (₹)"
                        placeholder="1200000"
                        min={0}
                        required
                      />
                    </FormField>

                    <FormField error={formState.errors.expectedCTC?.message}>
                      <OptimizedInput
                        {...register('expectedCTC', { valueAsNumber: true })}
                        type="number"
                        label="Expected CTC (₹)"
                        placeholder="1500000"
                        min={0}
                        required
                      />
                    </FormField>
                  </div>
                </FormSection>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Skills & Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormSection title="Professional Summary" description="Describe your experience and skills">
                  <FormField error={fieldValidationStates.summary?.error}>
                    <OptimizedTextarea
                      {...register('summary')}
                      label="Professional Summary"
                      placeholder="Describe your experience, achievements, and career goals..."
                      rows={6}
                      maxLength={500}
                      showCharCount
                      required
                      isLoading={fieldValidationStates.summary?.isLoading}
                      isValid={fieldValidationStates.summary?.isValid}
                      onDebounceChange={(value) => {
                        form.trackFieldInteraction('summary')
                        validateField('summary', value)
                      }}
                      helperText="Minimum 50 characters required"
                    />
                  </FormField>
                </FormSection>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <OptimizedSubmitButton
            isLoading={form.customFormState.isSubmitting}
            hasSubmitted={form.customFormState.hasSubmitted}
            loadingText="Updating Profile..."
            successText="Profile Updated!"
            preventDoubleSubmit
            lastSubmissionTime={form.customFormState.lastSubmissionTime}
            className="px-8"
          >
            Update Profile
          </OptimizedSubmitButton>
        </div>
      </form>

      {/* Performance Debug Panel (Development only) */}
      {process.env.NODE_ENV === 'development' && averageMetrics && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Performance Metrics (Dev Only)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Validation Time</div>
                <div className="text-gray-600">{Math.round(averageMetrics.validation || 0)}ms avg</div>
              </div>
              <div>
                <div className="font-medium">Render Time</div>
                <div className="text-gray-600">{Math.round(averageMetrics.render || 0)}ms avg</div>
              </div>
              <div>
                <div className="font-medium">Form State</div>
                <div className="text-gray-600">
                  {Object.keys(fieldValidationStates).length} fields tracked
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}