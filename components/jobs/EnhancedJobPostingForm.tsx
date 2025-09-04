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
import { Calendar, MapPin, Users, Clock, DollarSign, Star, Briefcase } from 'lucide-react'

// Schema for job posting form
const jobPostingSchema = z.object({
    // Basic Job Info
    title: z.string().min(1, 'Job title is required'),
    department: z.string().min(1, 'Department is required'),
    location: z.string().min(1, 'Location is required'),
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    workMode: z.enum(['remote', 'hybrid', 'onsite']),

    // Job Details
    description: z.string().min(50, 'Description must be at least 50 characters'),
    requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
    responsibilities: z.string().min(20, 'Responsibilities must be at least 20 characters'),

    // Compensation & Benefits
    salaryMin: z.number().min(0, 'Minimum salary must be positive'),
    salaryMax: z.number().min(0, 'Maximum salary must be positive'),
    currency: z.string().default('INR'),

    // Team Structure
    numberOfReportees: z.number().min(0, 'Number of reportees cannot be negative'),
    reportingTo: z.string().min(1, 'Reporting manager is required'),
    teamSize: z.number().min(1, 'Team size must be at least 1'),

    // Work Schedule (auto-fetched from company profile)
    workingDays: z.number().min(1).max(7),
    workingHours: z.string(),
    leavesPerYear: z.number().min(0),

    // Travel & Other Requirements
    travelRequired: z.boolean(),
    travelPercentage: z.number().min(0).max(100).optional(),

    // Skills & Experience
    requiredSkills: z.array(z.string()),
    preferredSkills: z.array(z.string()),
    experienceMin: z.number().min(0),
    experienceMax: z.number().min(0),

    // Application Settings
    applicationDeadline: z.string(),
    urgentHiring: z.boolean(),

    // AI Features
    enableAIScreening: z.boolean(),
    enableAutoScheduling: z.boolean(),
    enableAIInterview: z.boolean(),
})

type JobPostingFormData = z.infer<typeof jobPostingSchema>
interface CompanyProfile {
    name: string
    location: string
    businessDetails: string
    products: string[]
    turnover: number
    teamSize: number
    erp: string
    leavesPerYear: number
    workingDays: number
    workingHours: string
    travelRequired: boolean
}

export default function EnhancedJobPostingForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
    const [aiGeneratedContent, setAiGeneratedContent] = useState('')
    const [hiringCredits, setHiringCredits] = useState(100)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<JobPostingFormData>({
        resolver: zodResolver(jobPostingSchema),
        defaultValues: {
            currency: 'INR',
            workingDays: companyProfile?.workingDays || 5,
            workingHours: companyProfile?.workingHours || '9:00 AM - 6:00 PM',
            leavesPerYear: companyProfile?.leavesPerYear || 21,
            travelRequired: companyProfile?.travelRequired || false,
            enableAIScreening: true,
            enableAutoScheduling: true,
            enableAIInterview: false,
        }
    })

    const watchedValues = watch()

    // Mock company profile data (would be fetched from API)
    const mockCompanyProfile: CompanyProfile = {
        name: 'TechCorp Solutions',
        location: 'Bangalore, India',
        businessDetails: 'Software Development & IT Services',
        products: ['Web Applications', 'Mobile Apps', 'Cloud Solutions'],
        turnover: 50000000,
        teamSize: 250,
        erp: 'SAP',
        leavesPerYear: 21,
        workingDays: 5,
        workingHours: '9:00 AM - 6:00 PM',
        travelRequired: false
    }

    // AI-powered job description generator
    const generateAIJobDescription = async () => {
        // Mock AI generation - would integrate with actual AI service
        const aiContent = `
We are seeking a talented ${watchedValues.title} to join our dynamic team at ${mockCompanyProfile.name}. 

Key Responsibilities:
• Lead and mentor a team of ${watchedValues.numberOfReportees} professionals
• Drive innovation in ${mockCompanyProfile.products.join(', ')}
• Collaborate with cross-functional teams to deliver exceptional results
• Report directly to ${watchedValues.reportingTo}

What We Offer:
• Competitive salary package (₹${watchedValues.salaryMin?.toLocaleString()} - ₹${watchedValues.salaryMax?.toLocaleString()})
• ${watchedValues.leavesPerYear} days annual leave
• ${watchedValues.workingDays} days working week
• ${watchedValues.workMode} work arrangement
• Growth opportunities in a ${mockCompanyProfile.teamSize}+ member organization
    `
        setAiGeneratedContent(aiContent)
    }

    const onSubmit = async (data: JobPostingFormData) => {
        try {
            // Deduct hiring credits
            setHiringCredits(prev => Math.max(0, prev - 10))

            // Submit job posting
            console.log('Job posting data:', data)

            // Here you would integrate with:
            // - ATS systems
            // - LinkedIn API for posting
            // - AI screening services
            // - Interview scheduling systems

            alert('Job posted successfully!')
        } catch (error) {
            console.error('Error posting job:', error)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header with Hirely branding */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hirely</h1>
                        <p className="text-sm text-gray-600">Hire • Refer • Apply</p>
                    </div>
                </div>

                {/* Hiring Credits Wallet */}
                <Card className="w-48">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Hiring Credits</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {hiringCredits}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Company Profile Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>Company Profile</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Company</p>
                            <p className="font-medium">{mockCompanyProfile.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Team Size</p>
                            <p className="font-medium">{mockCompanyProfile.teamSize} employees</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Working Days</p>
                            <p className="font-medium">{mockCompanyProfile.workingDays} days/week</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Job Details</TabsTrigger>
                        <TabsTrigger value="team">Team & Structure</TabsTrigger>
                        <TabsTrigger value="ai-features">AI Features</TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Job Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Job Title *</label>
                                        <Input
                                            {...register('title')}
                                            placeholder="e.g., Senior Software Engineer"
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Department *</label>
                                        <Input
                                            {...register('department')}
                                            placeholder="e.g., Engineering"
                                        />
                                        {errors.department && (
                                            <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Job Type *</label>
                                        <Select onValueChange={(value) => setValue('jobType', value as any)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select job type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full-time">Full Time</SelectItem>
                                                <SelectItem value="part-time">Part Time</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                                <SelectItem value="internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Work Mode *</label>
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

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Location *</label>
                                        <Input
                                            {...register('location')}
                                            placeholder="e.g., Bangalore, India"
                                            defaultValue={mockCompanyProfile.location}
                                        />
                                    </div>
                                </div>

                                {/* Salary Range */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Min Salary (₹) *</label>
                                        <Input
                                            type="number"
                                            {...register('salaryMin', { valueAsNumber: true })}
                                            placeholder="500000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Max Salary (₹) *</label>
                                        <Input
                                            type="number"
                                            {...register('salaryMax', { valueAsNumber: true })}
                                            placeholder="1200000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Experience (Years)</label>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="number"
                                                {...register('experienceMin', { valueAsNumber: true })}
                                                placeholder="Min"
                                            />
                                            <Input
                                                type="number"
                                                {...register('experienceMax', { valueAsNumber: true })}
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* Job Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Job Description</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateAIJobDescription}
                                        className="flex items-center space-x-2"
                                    >
                                        <Star className="w-4 h-4" />
                                        <span>AI Generate</span>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {aiGeneratedContent && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h4 className="font-medium text-blue-900 mb-2">AI Generated Content</h4>
                                        <pre className="text-sm text-blue-800 whitespace-pre-wrap">{aiGeneratedContent}</pre>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setValue('description', aiGeneratedContent)}
                                        >
                                            Use This Content
                                        </Button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Job Description *</label>
                                    <Textarea
                                        {...register('description')}
                                        rows={6}
                                        placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Requirements *</label>
                                    <Textarea
                                        {...register('requirements')}
                                        rows={4}
                                        placeholder="List the required qualifications, skills, and experience..."
                                    />
                                    {errors.requirements && (
                                        <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Key Responsibilities *</label>
                                    <Textarea
                                        {...register('responsibilities')}
                                        rows={4}
                                        placeholder="Outline the main responsibilities and day-to-day tasks..."
                                    />
                                    {errors.responsibilities && (
                                        <p className="text-red-500 text-sm mt-1">{errors.responsibilities.message}</p>
                                    )}
                                </div>

                                {/* Work Schedule (Auto-fetched from company profile) */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3">Work Schedule (From Company Profile)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Working Days/Week</label>
                                            <Input
                                                type="number"
                                                {...register('workingDays', { valueAsNumber: true })}
                                                defaultValue={mockCompanyProfile.workingDays}
                                                min={1}
                                                max={7}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Working Hours</label>
                                            <Input
                                                {...register('workingHours')}
                                                defaultValue={mockCompanyProfile.workingHours}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Annual Leaves</label>
                                            <Input
                                                type="number"
                                                {...register('leavesPerYear', { valueAsNumber: true })}
                                                defaultValue={mockCompanyProfile.leavesPerYear}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Travel Requirements */}
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            {...register('travelRequired')}
                                            className="rounded"
                                        />
                                        <span className="text-sm font-medium">Travel Required</span>
                                    </label>
                                    {watchedValues.travelRequired && (
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium mb-2">Travel Percentage (%)</label>
                                            <Input
                                                type="number"
                                                {...register('travelPercentage', { valueAsNumber: true })}
                                                placeholder="e.g., 25"
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Team & Structure Tab */}
                    <TabsContent value="team" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="w-5 h-5" />
                                    <span>Team Structure</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Number of Reportees</label>
                                        <Input
                                            type="number"
                                            {...register('numberOfReportees', { valueAsNumber: true })}
                                            placeholder="0"
                                            min={0}
                                        />
                                        {errors.numberOfReportees && (
                                            <p className="text-red-500 text-sm mt-1">{errors.numberOfReportees.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Reporting To *</label>
                                        <Input
                                            {...register('reportingTo')}
                                            placeholder="e.g., Engineering Manager"
                                        />
                                        {errors.reportingTo && (
                                            <p className="text-red-500 text-sm mt-1">{errors.reportingTo.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Team Size</label>
                                        <Input
                                            type="number"
                                            {...register('teamSize', { valueAsNumber: true })}
                                            placeholder="10"
                                            min={1}
                                        />
                                    </div>
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Required Skills</label>
                                        <Input
                                            placeholder="e.g., React, Node.js, TypeScript (comma separated)"
                                            onChange={(e) => {
                                                const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                                setValue('requiredSkills', skills)
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Preferred Skills</label>
                                        <Input
                                            placeholder="e.g., AWS, Docker, GraphQL (comma separated)"
                                            onChange={(e) => {
                                                const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                                setValue('preferredSkills', skills)
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Application Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Application Deadline</label>
                                        <Input
                                            type="date"
                                            {...register('applicationDeadline')}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-8">
                                        <input
                                            type="checkbox"
                                            {...register('urgentHiring')}
                                            className="rounded"
                                        />
                                        <span className="text-sm font-medium">Urgent Hiring</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Features Tab */}
                    <TabsContent value="ai-features" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Star className="w-5 h-5" />
                                    <span>AI-Powered Features</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* AI Feature Toggles */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-medium">AI-Powered Candidate Screening</h4>
                                            <p className="text-sm text-gray-600">Automatically screen candidates based on resume and profile matching</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            {...register('enableAIScreening')}
                                            className="rounded"
                                            defaultChecked
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-medium">Auto Interview Scheduling</h4>
                                            <p className="text-sm text-gray-600">Automatically schedule interviews with qualified candidates</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            {...register('enableAutoScheduling')}
                                            className="rounded"
                                            defaultChecked
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-medium">AI-Powered Interview</h4>
                                            <p className="text-sm text-gray-600">Conduct initial interviews using AI technology</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            {...register('enableAIInterview')}
                                            className="rounded"
                                        />
                                    </div>
                                </div>

                                {/* Smart Filters Preview */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-3">Smart Filters Available</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">High-paying Jobs</Badge>
                                        <Badge variant="secondary">Cost-effective Candidates</Badge>
                                        <Badge variant="secondary">Local Candidates</Badge>
                                        <Badge variant="secondary">Early Joiners</Badge>
                                        <Badge variant="secondary">Highly Skilled</Badge>
                                        <Badge variant="secondary">Best Fit</Badge>
                                    </div>
                                </div>

                                {/* Integration Options */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Integration Options</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-medium mb-2">LinkedIn Integration</h5>
                                            <p className="text-sm text-gray-600 mb-3">Post job directly to LinkedIn and sync candidate profiles</p>
                                            <Button variant="outline" size="sm">
                                                Connect LinkedIn
                                            </Button>
                                        </div>

                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-medium mb-2">ATS Integration</h5>
                                            <p className="text-sm text-gray-600 mb-3">Sync with your existing ATS system</p>
                                            <Button variant="outline" size="sm">
                                                Configure ATS
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slot Configuration */}
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium mb-3">Interview Time Slots</h4>
                                    <p className="text-sm text-gray-600 mb-3">Configure available time slots for candidate interviews</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Morning Slots</label>
                                            <Input placeholder="9:00 AM - 12:00 PM" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Afternoon Slots</label>
                                            <Input placeholder="1:00 PM - 5:00 PM" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Evening Slots</label>
                                            <Input placeholder="6:00 PM - 8:00 PM" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline">
                        Save as Draft
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? 'Posting Job...' : 'Post Job (10 Credits)'}
                    </Button>
                </div>
            </form>
        </div>
    )
}