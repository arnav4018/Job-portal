'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Upload, User, FileText, Award, MapPin, Calendar, DollarSign, Briefcase, Star, Shield } from 'lucide-react'

// Comprehensive candidate profile schema
const candidateProfileSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),

  // Government IDs & Verification
  aadharNumber: z.string().min(12, 'Valid Aadhar number required'),
  panNumber: z.string().min(10, 'Valid PAN number required'),
  uanNumber: z.string().optional(), // EPFO UAN

  // Professional Details
  currentDesignation: z.string().min(1, 'Current designation is required'),
  currentCompany: z.string().min(1, 'Current company is required'),
  totalExperience: z.number().min(0, 'Experience cannot be negative'),
  currentCTC: z.number().min(0, 'Current CTC must be positive'),
  expectedCTC: z.number().min(0, 'Expected CTC must be positive'),

  // Notice Period & Availability
  noticePeriod: z.number().min(0, 'Notice period cannot be negative'),
  lastWorkingDay: z.string().optional(),
  willingToRelocate: z.boolean(),
  preferredLocations: z.array(z.string()),

  // Team Structure
  numberOfReportees: z.number().min(0, 'Number of reportees cannot be negative'),
  reportingTo: z.string().optional(),

  // Career Growth
  lastHikePercentage: z.number().min(0, 'Hike percentage cannot be negative').optional(),
  lastHikeDate: z.string().optional(),

  // Education
  highestDegree: z.string().min(1, 'Highest degree is required'),
  university: z.string().min(1, 'University is required'),
  graduationYear: z.number().min(1950).max(2030),

  // Skills & Achievements
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
  certifications: z.array(z.string()),

  // Social & Professional Links
  linkedinProfile: z.string().url('Valid LinkedIn URL required').optional(),
  githubProfile: z.string().url('Valid GitHub URL required').optional(),
  portfolioWebsite: z.string().url('Valid website URL required').optional(),

  // Preferences
  jobType: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),

  // Document Uploads
  resumeUploaded: z.boolean(),
  salarySlipUploaded: z.boolean(),
  incrementLetterUploaded: z.boolean(),

  // Buyout & Special Conditions
  buyoutAmount: z.number().min(0).optional(),
  hasBuyoutClause: z.boolean(),
})

type CandidateProfileData = z.infer<typeof candidateProfileSchema>

export default function CandidateProfileForm() {
  const [profileCompleteness, setProfileCompleteness] = useState(25)
  const [atsScore, setAtsScore] = useState(0)
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null)
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [uanVerified, setUanVerified] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CandidateProfileData>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      willingToRelocate: false,
      hasBuyoutClause: false,
      resumeUploaded: false,
      salarySlipUploaded: false,
      incrementLetterUploaded: false,
      jobType: 'full-time',
      workMode: 'hybrid',
      skills: [],
      achievements: [],
      certifications: [],
      preferredLocations: [],
    }
  })

  const watchedValues = watch()

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'currentDesignation',
      'currentCompany', 'totalExperience', 'currentCTC', 'expectedCTC',
      'highestDegree', 'university', 'graduationYear'
    ]

    const optionalFields = [
      'aadharNumber', 'panNumber', 'uanNumber', 'linkedinProfile',
      'resumeUploaded', 'salarySlipUploaded'
    ]

    let completed = 0
    let total = requiredFields.length + optionalFields.length

    requiredFields.forEach(field => {
      if (watchedValues[field as keyof CandidateProfileData]) completed++
    })

    optionalFields.forEach(field => {
      if (watchedValues[field as keyof CandidateProfileData]) completed++
    })

    const percentage = Math.round((completed / total) * 100)
    setProfileCompleteness(percentage)
    return percentage
  }

  // Mock ATS Score calculation
  const calculateATSScore = async () => {
    // Mock ATS scoring logic
    const baseScore = 60
    const skillsBonus = watchedValues.skills?.length * 2 || 0
    const experienceBonus = Math.min(watchedValues.totalExperience * 5, 20)
    const educationBonus = watchedValues.highestDegree ? 10 : 0
    const linkedinBonus = linkedinConnected ? 5 : 0

    const score = Math.min(baseScore + skillsBonus + experienceBonus + educationBonus + linkedinBonus, 100)
    setAtsScore(score)
    return score
  }

  // Mock UAN verification
  const verifyUAN = async () => {
    if (watchedValues.uanNumber && watchedValues.uanNumber.length >= 12) {
      // Mock API call to EPFO
      setTimeout(() => {
        setUanVerified(true)
        alert('UAN verified successfully!')
      }, 2000)
    }
  }

  // LinkedIn OAuth simulation
  const connectLinkedIn = () => {
    // Mock LinkedIn OAuth
    setLinkedinConnected(true)
    setValue('linkedinProfile', 'https://linkedin.com/in/johndoe')
    alert('LinkedIn connected successfully!')
  }

  const onSubmit = async (data: CandidateProfileData) => {
    try {
      console.log('Candidate profile data:', data)

      // Calculate final scores
      await calculateATSScore()

      // Here you would integrate with:
      // - Resume parsing APIs
      // - ATS scoring systems
      // - Document verification services
      // - LinkedIn API
      // - EPFO UAN verification

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Profile Completeness */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidate Profile</h1>
            <p className="text-sm text-gray-600">Complete your profile for better visibility</p>
          </div>
        </div>

        {/* Profile Completeness & ATS Score */}
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
                <span className="text-sm font-medium">ATS Score</span>
                <Badge variant={atsScore > 80 ? "default" : atsScore > 60 ? "secondary" : "destructive"}>
                  {atsScore}/100
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="skills">Skills & Achievements</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <Input
                      {...register('firstName')}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <Input
                      {...register('lastName')}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      {...register('email')}
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <Input
                      {...register('phone')}
                      placeholder="+91 9876543210"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Government IDs */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Government ID Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Aadhar Number *</label>
                      <Input
                        {...register('aadharNumber')}
                        placeholder="1234 5678 9012"
                        maxLength={12}
                      />
                      {errors.aadharNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.aadharNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">PAN Number *</label>
                      <Input
                        {...register('panNumber')}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.panNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.panNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">UAN (EPFO)</label>
                      <div className="flex space-x-2">
                        <Input
                          {...register('uanNumber')}
                          placeholder="123456789012"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={verifyUAN}
                          disabled={!watchedValues.uanNumber}
                        >
                          {uanVerified ? '✓' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Highest Degree *</label>
                    <Select onValueChange={(value) => setValue('highestDegree', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                        <SelectItem value="master">Master's</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">University *</label>
                    <Input
                      {...register('university')}
                      placeholder="e.g., IIT Delhi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Graduation Year *</label>
                    <Input
                      type="number"
                      {...register('graduationYear', { valueAsNumber: true })}
                      placeholder="2020"
                      min={1950}
                      max={2030}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Details Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Designation *</label>
                    <Input
                      {...register('currentDesignation')}
                      placeholder="e.g., Senior Software Engineer"
                    />
                    {errors.currentDesignation && (
                      <p className="text-red-500 text-sm mt-1">{errors.currentDesignation.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Company *</label>
                    <Input
                      {...register('currentCompany')}
                      placeholder="e.g., TechCorp Solutions"
                    />
                    {errors.currentCompany && (
                      <p className="text-red-500 text-sm mt-1">{errors.currentCompany.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Experience (Years) *</label>
                    <Input
                      type="number"
                      {...register('totalExperience', { valueAsNumber: true })}
                      placeholder="5"
                      min={0}
                      step={0.5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Reportees</label>
                    <Input
                      type="number"
                      {...register('numberOfReportees', { valueAsNumber: true })}
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reporting To</label>
                    <Input
                      {...register('reportingTo')}
                      placeholder="e.g., Engineering Manager"
                    />
                  </div>
                </div>

                {/* Salary Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Compensation Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current CTC (₹) *</label>
                      <Input
                        type="number"
                        {...register('currentCTC', { valueAsNumber: true })}
                        placeholder="1200000"
                      />
                      {errors.currentCTC && (
                        <p className="text-red-500 text-sm mt-1">{errors.currentCTC.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Expected CTC (₹) *</label>
                      <Input
                        type="number"
                        {...register('expectedCTC', { valueAsNumber: true })}
                        placeholder="1500000"
                      />
                      {errors.expectedCTC && (
                        <p className="text-red-500 text-sm mt-1">{errors.expectedCTC.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Hike (%)</label>
                      <Input
                        type="number"
                        {...register('lastHikePercentage', { valueAsNumber: true })}
                        placeholder="15"
                        min={0}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Last Hike Date</label>
                      <Input
                        type="date"
                        {...register('lastHikeDate')}
                      />
                    </div>
                  </div>
                </div>

                {/* Notice Period & Availability */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Availability & Notice Period
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Notice Period (Days) *</label>
                      <Input
                        type="number"
                        {...register('noticePeriod', { valueAsNumber: true })}
                        placeholder="30"
                        min={0}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Last Working Day</label>
                      <Input
                        type="date"
                        {...register('lastWorkingDay')}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('willingToRelocate')}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Willing to Relocate</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('hasBuyoutClause')}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Has Buyout Clause</span>
                    </div>

                    {watchedValues.hasBuyoutClause && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Buyout Amount (₹)</label>
                        <Input
                          type="number"
                          {...register('buyoutAmount', { valueAsNumber: true })}
                          placeholder="200000"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferred Locations */}
                {watchedValues.willingToRelocate && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Locations</label>
                    <Input
                      placeholder="e.g., Bangalore, Mumbai, Delhi (comma separated)"
                      onChange={(e) => {
                        const locations = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        setValue('preferredLocations', locations)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Document Uploads</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Upload with ATS Score */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload Resume (PDF/DOC)
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setValue('resumeUploaded', true)
                              calculateATSScore()
                            }
                          }}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload your latest resume for ATS scoring
                      </p>
                    </div>
                  </div>

                  {watchedValues.resumeUploaded && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Resume uploaded successfully</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={calculateATSScore}
                        >
                          Calculate ATS Score
                        </Button>
                      </div>
                      {atsScore > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">ATS Score:</span>
                            <Badge variant={atsScore > 80 ? "default" : atsScore > 60 ? "secondary" : "destructive"}>
                              {atsScore}/100
                            </Badge>
                          </div>
                          <Progress value={atsScore} className="mt-2 h-2" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Other Document Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Salary Slip</h4>
                    <div className="space-y-2">
                      <label className="cursor-pointer block">
                        <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            Upload Latest Salary Slip
                          </span>
                        </div>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setValue('salarySlipUploaded', true)
                            }
                          }}
                        />
                      </label>
                      {watchedValues.salarySlipUploaded && (
                        <div className="text-sm text-green-600">✓ Uploaded</div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Increment Letter</h4>
                    <div className="space-y-2">
                      <label className="cursor-pointer block">
                        <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            Upload Increment Letter
                          </span>
                        </div>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setValue('incrementLetterUploaded', true)
                            }
                          }}
                        />
                      </label>
                      {watchedValues.incrementLetterUploaded && (
                        <div className="text-sm text-green-600">✓ Uploaded</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume Watermark Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Resume Watermark</h4>
                  <p className="text-sm text-blue-800">
                    Your resume will be watermarked with Hirely branding when shared with employers.
                    This helps protect your document and track applications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills & Achievements Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Skills & Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Technical Skills</label>
                  <Input
                    placeholder="e.g., React, Node.js, Python, AWS (comma separated)"
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      setValue('skills', skills)
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add relevant skills to improve your profile visibility
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Certifications</label>
                  <Textarea
                    placeholder="List your professional certifications..."
                    rows={3}
                    onChange={(e) => {
                      const certs = e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                      setValue('certifications', certs)
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Key Achievements</label>
                  <Textarea
                    placeholder="Describe your key professional achievements..."
                    rows={4}
                    onChange={(e) => {
                      const achievements = e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                      setValue('achievements', achievements)
                    }}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className="font-medium">Professional Links</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                      <div className="flex space-x-2">
                        <Input
                          {...register('linkedinProfile')}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={connectLinkedIn}
                          disabled={linkedinConnected}
                        >
                          {linkedinConnected ? '✓ Connected' : 'Connect'}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">GitHub Profile</label>
                      <Input
                        {...register('githubProfile')}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Portfolio Website</label>
                    <Input
                      {...register('portfolioWebsite')}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Job Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Job Type</label>
                    <Select onValueChange={(value) => setValue('jobType', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Work Mode</label>
                    <Select onValueChange={(value) => setValue('workMode', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Smart Filters Available */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-3">Smart Job Filters Available</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">High-paying Jobs</Badge>
                    <Badge variant="secondary">Early Joiners Preferred</Badge>
                    <Badge variant="secondary">Local Opportunities</Badge>
                    <Badge variant="secondary">Remote First</Badge>
                    <Badge variant="secondary">Best Fit Matches</Badge>
                    <Badge variant="secondary">Quick Hiring</Badge>
                  </div>
                  <p className="text-sm text-purple-800 mt-2">
                    These filters will help you find the most relevant job opportunities based on your profile.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-6">
          <div className="text-sm text-gray-600">
            Higher profile completion = Better visibility to recruiters
          </div>
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={calculateProfileCompleteness}>
              Refresh Score
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}