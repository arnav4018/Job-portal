'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  Upload,
  Plus,
  X,
  Edit,
  Save,
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  Globe,
  Github,
  Linkedin,
  FileText,
  Camera,
  Check,
  AlertCircle,
  Zap,
  Target,
  TrendingUp,
  Users,
  Code,
  Database,
  Palette,
  BookOpen
} from 'lucide-react'
import { format } from 'date-fns'

interface ProfileData {
  // Basic Information
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    alternatePhone?: string
    dateOfBirth?: Date
    gender?: string
    maritalStatus?: string
    nationality?: string
    profilePicture?: string
  }
  
  // Address Information
  address: {
    currentAddress: {
      street: string
      city: string
      state: string
      country: string
      pincode: string
    }
    permanentAddress: {
      street: string
      city: string
      state: string
      country: string
      pincode: string
    }
    sameAsCurrent: boolean
  }
  
  // Professional Information
  professional: {
    currentDesignation: string
    department: string
    industry: string
    totalExperience: number
    relevantExperience: number
    currentCTC: number
    expectedCTC: number
    noticePeriod: number
    negotiableNoticePeriod: boolean
    servingNoticePeriod: boolean
    lastWorkingDay?: Date
    reasonForChange: string
    willingToRelocate: boolean
    preferredLocations: string[]
    workMode: string
  }
  
  // Education
  education: Array<{
    id: string
    degree: string
    specialization: string
    institution: string
    university: string
    yearOfPassing: number
    percentage: number
    grade?: string
    type: 'full-time' | 'part-time' | 'correspondence' | 'online'
  }>
  
  // Work Experience
  experience: Array<{
    id: string
    company: string
    designation: string
    department: string
    employmentType: string
    startDate: Date
    endDate?: Date
    currentlyWorking: boolean
    ctc: number
    responsibilities: string
    achievements: string[]
    technologies: string[]
    teamSize?: number
    reportingTo: string
  }>
  
  // Skills
  skills: {
    technical: Array<{
      name: string
      level: number
      yearsOfExperience: number
      category: string
      certified: boolean
    }>
    soft: Array<{
      name: string
      level: number
    }>
    languages: Array<{
      name: string
      proficiency: string
    }>
  }
  
  // Certifications & Achievements
  certifications: Array<{
    id: string
    name: string
    issuingOrganization: string
    issueDate: Date
    expiryDate?: Date
    credentialId?: string
    credentialUrl?: string
  }>
  
  // Projects
  projects: Array<{
    id: string
    name: string
    description: string
    technologies: string[]
    role: string
    duration: number
    teamSize: number
    projectUrl?: string
    githubUrl?: string
    achievements: string[]
  }>
  
  // Social Links
  socialLinks: {
    linkedin?: string
    github?: string
    portfolio?: string
    website?: string
    behance?: string
    dribbble?: string
  }
  
  // Preferences
  preferences: {
    jobType: string[]
    industries: string[]
    companySizes: string[]
    workEnvironment: string[]
    benefits: string[]
  }
  
  // Additional Information
  additional: {
    summary: string
    hobbies: string[]
    volunteering: string[]
    publications: string[]
    patents: string[]
    awards: string[]
    references: Array<{
      name: string
      designation: string
      company: string
      phone: string
      email: string
      relationship: string
    }>
  }
}

const initialProfileData: ProfileData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
  },
  address: {
    currentAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    sameAsCurrent: true,
  },
  professional: {
    currentDesignation: '',
    department: '',
    industry: '',
    totalExperience: 0,
    relevantExperience: 0,
    currentCTC: 0,
    expectedCTC: 0,
    noticePeriod: 30,
    negotiableNoticePeriod: false,
    servingNoticePeriod: false,
    reasonForChange: '',
    willingToRelocate: false,
    preferredLocations: [],
    workMode: '',
  },
  education: [],
  experience: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
  },
  certifications: [],
  projects: [],
  socialLinks: {},
  preferences: {
    jobType: [],
    industries: [],
    companySizes: [],
    workEnvironment: [],
    benefits: [],
  },
  additional: {
    summary: '',
    hobbies: [],
    volunteering: [],
    publications: [],
    patents: [],
    awards: [],
    references: [],
  },
}

const skillCategories = [
  'Programming Languages',
  'Web Technologies',
  'Databases',
  'Cloud Platforms',
  'DevOps Tools',
  'Mobile Technologies',
  'Data Science & Analytics',
  'Design Tools',
  'Testing Tools',
  'Project Management',
]

const industries = [
  'Information Technology',
  'Banking & Financial Services',
  'Healthcare & Pharmaceuticals',
  'E-commerce & Retail',
  'Manufacturing',
  'Telecommunications',
  'Education',
  'Media & Entertainment',
  'Real Estate',
  'Automotive',
]

export default function EnhancedProfileForm() {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData)
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setSIsLoading] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null)

  // Form states
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 1 })
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: new Date(),
  })

  useEffect(() => {
    calculateCompletionPercentage()
  }, [profileData])

  const calculateCompletionPercentage = () => {
    let completedFields = 0
    let totalFields = 0

    // Personal Info (10 fields)
    const personalFields = Object.values(profileData.personalInfo)
    totalFields += 8
    completedFields += personalFields.filter(field => field && field.toString().trim()).length

    // Address Info (5 fields from current address)
    const addressFields = Object.values(profileData.address.currentAddress)
    totalFields += 5
    completedFields += addressFields.filter(field => field && field.toString().trim()).length

    // Professional Info (15 key fields)
    totalFields += 10
    if (profileData.professional.currentDesignation) completedFields++
    if (profileData.professional.industry) completedFields++
    if (profileData.professional.totalExperience > 0) completedFields++
    if (profileData.professional.currentCTC > 0) completedFields++
    if (profileData.professional.expectedCTC > 0) completedFields++
    if (profileData.professional.noticePeriod > 0) completedFields++
    if (profileData.professional.reasonForChange) completedFields++
    if (profileData.professional.workMode) completedFields++
    if (profileData.professional.preferredLocations.length > 0) completedFields++
    if (profileData.additional.summary) completedFields++

    // Experience, Education, Skills (bonus points)
    totalFields += 5
    if (profileData.experience.length > 0) completedFields++
    if (profileData.education.length > 0) completedFields++
    if (profileData.skills.technical.length > 0) completedFields++
    if (profileData.certifications.length > 0) completedFields++
    if (profileData.projects.length > 0) completedFields++

    const percentage = Math.round((completedFields / totalFields) * 100)
    setCompletionPercentage(Math.min(percentage, 100))
  }

  const updateProfileData = (section: keyof ProfileData, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const addArrayItem = (section: keyof ProfileData, subsection: string, item: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: [...((prev[section] as any)[subsection] || []), { ...item, id: Date.now().toString() }]
      }
    }))
  }

  const removeArrayItem = (section: keyof ProfileData, subsection: string, id: string) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: (prev[section] as any)[subsection].filter((item: any) => item.id !== id)
      }
    }))
  }

  const addSkill = () => {
    if (!newSkill.name || !newSkill.category) return

    const skill = {
      name: newSkill.name,
      level: newSkill.level,
      yearsOfExperience: 1,
      category: newSkill.category,
      certified: false,
    }

    addArrayItem('skills', 'technical', skill)
    setNewSkill({ name: '', category: '', level: 1 })
  }

  const addCertification = () => {
    if (!newCertification.name || !newCertification.issuingOrganization) return

    addArrayItem('certifications', '', newCertification)
    setNewCertification({
      name: '',
      issuingOrganization: '',
      issueDate: new Date(),
    })
  }

  const handleSave = async () => {
    try {
      setSIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Profile saved:', profileData)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSIsLoading(false)
    }
  }

  const renderPersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <Input
              value={profileData.personalInfo.firstName}
              onChange={(e) => updateProfileData('personalInfo', { firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <Input
              value={profileData.personalInfo.lastName}
              onChange={(e) => updateProfileData('personalInfo', { lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              value={profileData.personalInfo.email}
              onChange={(e) => updateProfileData('personalInfo', { email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <Input
              value={profileData.personalInfo.phone}
              onChange={(e) => updateProfileData('personalInfo', { phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Alternate Phone</label>
            <Input
              value={profileData.personalInfo.alternatePhone || ''}
              onChange={(e) => updateProfileData('personalInfo', { alternatePhone: e.target.value })}
              placeholder="Enter alternate phone number"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.personalInfo.profilePicture} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date of Birth</label>
            <Popover open={showDatePicker === 'dob'} onOpenChange={(open) => setShowDatePicker(open ? 'dob' : null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {profileData.personalInfo.dateOfBirth ? format(profileData.personalInfo.dateOfBirth, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={profileData.personalInfo.dateOfBirth}
                  onSelect={(date) => {
                    updateProfileData('personalInfo', { dateOfBirth: date })
                    setShowDatePicker(null)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <Select onValueChange={(value) => updateProfileData('personalInfo', { gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Marital Status</label>
            <Select onValueChange={(value) => updateProfileData('personalInfo', { maritalStatus: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Nationality</label>
            <Input
              value={profileData.personalInfo.nationality || ''}
              onChange={(e) => updateProfileData('personalInfo', { nationality: e.target.value })}
              placeholder="Enter nationality"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderProfessionalInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Designation *</label>
            <Input
              value={profileData.professional.currentDesignation}
              onChange={(e) => updateProfileData('professional', { currentDesignation: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <Input
              value={profileData.professional.department}
              onChange={(e) => updateProfileData('professional', { department: e.target.value })}
              placeholder="e.g., Engineering, Marketing"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Industry *</label>
            <Select onValueChange={(value) => updateProfileData('professional', { industry: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Total Experience (Years)</label>
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={profileData.professional.totalExperience}
                onChange={(e) => updateProfileData('professional', { totalExperience: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Relevant Experience (Years)</label>
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={profileData.professional.relevantExperience}
                onChange={(e) => updateProfileData('professional', { relevantExperience: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current CTC (₹ LPA)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={profileData.professional.currentCTC}
                onChange={(e) => updateProfileData('professional', { currentCTC: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expected CTC (₹ LPA)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={profileData.professional.expectedCTC}
                onChange={(e) => updateProfileData('professional', { expectedCTC: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Notice Period (Days)</label>
            <Select onValueChange={(value) => updateProfileData('professional', { noticePeriod: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Select notice period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Immediate</SelectItem>
                <SelectItem value="15">15 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="45">45 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="negotiableNoticePeriod"
              checked={profileData.professional.negotiableNoticePeriod}
              onChange={(e) => updateProfileData('professional', { negotiableNoticePeriod: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="negotiableNoticePeriod" className="text-sm font-medium">
              Notice period is negotiable
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="servingNoticePeriod"
              checked={profileData.professional.servingNoticePeriod}
              onChange={(e) => updateProfileData('professional', { servingNoticePeriod: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="servingNoticePeriod" className="text-sm font-medium">
              Currently serving notice period
            </label>
          </div>

          {profileData.professional.servingNoticePeriod && (
            <div>
              <label className="block text-sm font-medium mb-2">Last Working Day</label>
              <Popover open={showDatePicker === 'lastWorkingDay'} onOpenChange={(open) => setShowDatePicker(open ? 'lastWorkingDay' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {profileData.professional.lastWorkingDay ? format(profileData.professional.lastWorkingDay, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={profileData.professional.lastWorkingDay}
                    onSelect={(date) => {
                      updateProfileData('professional', { lastWorkingDay: date })
                      setShowDatePicker(null)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Reason for Job Change</label>
            <Textarea
              value={profileData.professional.reasonForChange}
              onChange={(e) => updateProfileData('professional', { reasonForChange: e.target.value })}
              placeholder="Brief reason for looking for a job change"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Work Mode</label>
            <Select onValueChange={(value) => updateProfileData('professional', { workMode: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Work from Office</SelectItem>
                <SelectItem value="remote">Work from Home</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="willingToRelocate"
              checked={profileData.professional.willingToRelocate}
              onChange={(e) => updateProfileData('professional', { willingToRelocate: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="willingToRelocate" className="text-sm font-medium">
              Willing to relocate
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Professional Summary</label>
        <Textarea
          value={profileData.additional.summary}
          onChange={(e) => updateProfileData('additional', { summary: e.target.value })}
          placeholder="Write a brief professional summary highlighting your key strengths, experience, and career objectives..."
          rows={4}
        />
      </div>
    </div>
  )

  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Technical Skills</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Technical Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Skill Name</label>
                <Input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g., React.js, Python, AWS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Proficiency Level (1-5)</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="range"
                    min="1"
                    max="5"
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="font-medium">{newSkill.level}/5</span>
                </div>
              </div>
              <Button onClick={addSkill} className="w-full">
                Add Skill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileData.skills.technical.map((skill, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{skill.name}</h4>
                <p className="text-sm text-gray-600">{skill.category}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeArrayItem('skills', 'technical', skill.name)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= skill.level ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600">({skill.level}/5)</span>
            </div>
            {skill.certified && (
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">
                <Award className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            )}
          </Card>
        ))}
      </div>

      {profileData.skills.technical.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Code className="mx-auto h-12 w-12 mb-4" />
          <p>No technical skills added yet</p>
          <p className="text-sm">Add your skills to showcase your expertise</p>
        </div>
      )}
    </div>
  )

  const renderCertificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certifications & Achievements</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Certification Name</label>
                <Input
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Issuing Organization</label>
                <Input
                  value={newCertification.issuingOrganization}
                  onChange={(e) => setNewCertification({ ...newCertification, issuingOrganization: e.target.value })}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <Button onClick={addCertification} className="w-full">
                Add Certification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {profileData.certifications.map((cert) => (
          <Card key={cert.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Award className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-gray-600">{cert.issuingOrganization}</p>
                  <p className="text-sm text-gray-500">
                    Issued: {format(cert.issueDate, 'MMM yyyy')}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeArrayItem('certifications', '', cert.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {profileData.certifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Award className="mx-auto h-12 w-12 mb-4" />
          <p>No certifications added yet</p>
          <p className="text-sm">Add your certifications to boost your profile</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Profile</h1>
            <p className="text-sm text-gray-600">Complete your professional profile to attract better opportunities</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-1">
            <Progress value={completionPercentage} className="w-24" />
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <p className="text-xs text-gray-500">Profile Completion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarImage src={profileData.personalInfo.profilePicture} />
                <AvatarFallback className="text-lg">
                  {profileData.personalInfo.firstName?.charAt(0)}
                  {profileData.personalInfo.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">
                {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
              </h3>
              <p className="text-sm text-gray-600">{profileData.professional.currentDesignation}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{profileData.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{profileData.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{profileData.professional.totalExperience} years experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>₹{profileData.professional.currentCTC} LPA current</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{profileData.professional.noticePeriod} days notice</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Technical Skills</span>
                <Badge variant="outline">{profileData.skills.technical.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Certifications</span>
                <Badge variant="outline">{profileData.certifications.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Projects</span>
                <Badge variant="outline">{profileData.projects.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="hidden sm:inline">Professional</span>
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center space-x-2">
                      <Code className="w-4 h-4" />
                      <span className="hidden sm:inline">Skills</span>
                    </TabsTrigger>
                    <TabsTrigger value="certifications" className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span className="hidden sm:inline">Certificates</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="personal" className="mt-0">
                    {renderPersonalInfoTab()}
                  </TabsContent>
                  
                  <TabsContent value="professional" className="mt-0">
                    {renderProfessionalInfoTab()}
                  </TabsContent>
                  
                  <TabsContent value="skills" className="mt-0">
                    {renderSkillsTab()}
                  </TabsContent>
                  
                  <TabsContent value="certifications" className="mt-0">
                    {renderCertificationsTab()}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
