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
import { 
  Building2, 
  Users,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Upload,
  Plus,
  X,
  Edit,
  Save,
  Star,
  Award,
  Heart,
  Coffee,
  Gamepad2,
  Car,
  Home,
  Briefcase,
  GraduationCap,
  Shield,
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  Image as ImageIcon,
  FileText,
  Camera,
  Check,
  AlertCircle,
  Link,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react'

interface CompanyProfile {
  // Basic Company Information
  basicInfo: {
    companyName: string
    legalName: string
    logo?: string
    coverImage?: string
    tagline: string
    description: string
    website: string
    linkedinUrl?: string
    twitterUrl?: string
    facebookUrl?: string
    instagramUrl?: string
    youtubeUrl?: string
    foundedYear: number
    employeeCount: string
    industry: string
    companyType: string
    headquarters: string
  }
  
  // Contact Information
  contact: {
    email: string
    phone: string
    alternatePhone?: string
    fax?: string
    address: {
      street: string
      city: string
      state: string
      country: string
      pincode: string
    }
    gstNumber?: string
    panNumber?: string
    cinNumber?: string
  }
  
  // Business Details
  business: {
    revenue: string
    fundingStage: string
    totalFunding?: string
    investors: string[]
    businessModel: string
    targetMarket: string[]
    keyProducts: Array<{
      id: string
      name: string
      description: string
      category: string
      image?: string
      launchDate?: Date
    }>
    services: Array<{
      id: string
      name: string
      description: string
      category: string
    }>
    achievements: Array<{
      id: string
      title: string
      description: string
      date: Date
      category: string
    }>
  }
  
  // Company Culture
  culture: {
    mission: string
    vision: string
    values: string[]
    workEnvironment: string[]
    dresscode: string
    workingHours: string
    workingDays: string[]
    remotePolicy: string
    diversityStatement: string
    csr: string
  }
  
  // Benefits & Perks
  benefits: {
    healthAndWellness: string[]
    workLifeBalance: string[]
    financialBenefits: string[]
    professionalDevelopment: string[]
    officePerks: string[]
    additional: string[]
  }
  
  // Office Information
  offices: Array<{
    id: string
    name: string
    type: 'headquarters' | 'branch' | 'satellite' | 'remote_hub'
    address: {
      street: string
      city: string
      state: string
      country: string
      pincode: string
    }
    coordinates?: { lat: number; lng: number }
    employeeCount: number
    facilities: string[]
    images: Array<{
      id: string
      url: string
      caption: string
      category: string
    }>
    amenities: string[]
  }>
  
  // Team & Leadership
  team: {
    leadership: Array<{
      id: string
      name: string
      designation: string
      bio: string
      image?: string
      linkedinUrl?: string
      experience: number
      education: string[]
      achievements: string[]
    }>
    departments: Array<{
      id: string
      name: string
      headCount: number
      description: string
      openPositions: number
    }>
    diversity: {
      genderRatio: { male: number; female: number; other: number }
      ageDistribution: { '18-25': number; '26-35': number; '36-45': number; '45+': number }
      experienceLevel: { junior: number; mid: number; senior: number; lead: number }
    }
  }
  
  // Recognition & Awards
  recognition: {
    awards: Array<{
      id: string
      title: string
      issuedBy: string
      year: number
      category: string
      description?: string
    }>
    certifications: Array<{
      id: string
      name: string
      issuedBy: string
      validFrom: Date
      validUntil?: Date
      certificateUrl?: string
    }>
    rankings: Array<{
      id: string
      title: string
      rank: number
      year: number
      issuedBy: string
    }>
  }
}

const initialCompanyProfile: CompanyProfile = {
  basicInfo: {
    companyName: '',
    legalName: '',
    tagline: '',
    description: '',
    website: '',
    foundedYear: 2020,
    employeeCount: '',
    industry: '',
    companyType: '',
    headquarters: '',
  },
  contact: {
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
  },
  business: {
    revenue: '',
    fundingStage: '',
    investors: [],
    businessModel: '',
    targetMarket: [],
    keyProducts: [],
    services: [],
    achievements: [],
  },
  culture: {
    mission: '',
    vision: '',
    values: [],
    workEnvironment: [],
    dresscode: '',
    workingHours: '',
    workingDays: [],
    remotePolicy: '',
    diversityStatement: '',
    csr: '',
  },
  benefits: {
    healthAndWellness: [],
    workLifeBalance: [],
    financialBenefits: [],
    professionalDevelopment: [],
    officePerks: [],
    additional: [],
  },
  offices: [],
  team: {
    leadership: [],
    departments: [],
    diversity: {
      genderRatio: { male: 0, female: 0, other: 0 },
      ageDistribution: { '18-25': 0, '26-35': 0, '36-45': 0, '45+': 0 },
      experienceLevel: { junior: 0, mid: 0, senior: 0, lead: 0 },
    },
  },
  recognition: {
    awards: [],
    certifications: [],
    rankings: [],
  },
}

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
  'Energy & Utilities',
  'Consulting',
  'Transportation & Logistics',
  'Travel & Hospitality',
  'Agriculture',
]

const companyTypes = [
  'Public Limited Company',
  'Private Limited Company',
  'Partnership',
  'Sole Proprietorship',
  'Limited Liability Partnership',
  'Non-Profit Organization',
  'Government Organization',
  'Startup',
]

const employeeCountRanges = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+',
]

const benefitOptions = {
  healthAndWellness: [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    'Mental Health Support',
    'Wellness Programs',
    'Gym Membership',
    'Health Checkups',
    'Maternity/Paternity Leave',
  ],
  workLifeBalance: [
    'Flexible Working Hours',
    'Work from Home',
    'Hybrid Work Model',
    'Unlimited PTO',
    'Sabbatical Leave',
    'Personal Time Off',
    'Four-Day Work Week',
    'Compressed Work Schedule',
  ],
  financialBenefits: [
    'Performance Bonus',
    'Stock Options',
    'Employee Stock Purchase Plan',
    'Retirement Plans',
    'Life Insurance',
    'Provident Fund',
    'Gratuity',
    'Travel Allowance',
  ],
  professionalDevelopment: [
    'Learning & Development Budget',
    'Conference Attendance',
    'Online Course Subscriptions',
    'Mentorship Programs',
    'Career Coaching',
    'Internal Training Programs',
    'Skill Development Workshops',
    'Certification Reimbursement',
  ],
  officePerks: [
    'Free Meals',
    'Snacks & Beverages',
    'Game Room',
    'Nap Pods',
    'Pet-Friendly Office',
    'On-site Childcare',
    'Parking',
    'Transportation',
  ],
}

export default function CompanyProfileManager() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(initialCompanyProfile)
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  // Form states
  const [newProduct, setNewProduct] = useState({ name: '', description: '', category: '' })
  const [newOffice, setNewOffice] = useState({
    name: '',
    type: 'branch' as const,
    address: { street: '', city: '', state: '', country: '', pincode: '' },
    employeeCount: 0,
    facilities: [],
  })

  useEffect(() => {
    calculateCompletionPercentage()
  }, [companyProfile])

  const calculateCompletionPercentage = () => {
    let completedFields = 0
    let totalFields = 0

    // Basic Info (10 essential fields)
    totalFields += 10
    if (companyProfile.basicInfo.companyName) completedFields++
    if (companyProfile.basicInfo.description) completedFields++
    if (companyProfile.basicInfo.website) completedFields++
    if (companyProfile.basicInfo.industry) completedFields++
    if (companyProfile.basicInfo.companyType) completedFields++
    if (companyProfile.basicInfo.employeeCount) completedFields++
    if (companyProfile.basicInfo.foundedYear) completedFields++
    if (companyProfile.basicInfo.headquarters) completedFields++
    if (companyProfile.basicInfo.tagline) completedFields++
    if (companyProfile.basicInfo.logo) completedFields++

    // Contact Info (5 fields)
    totalFields += 5
    if (companyProfile.contact.email) completedFields++
    if (companyProfile.contact.phone) completedFields++
    if (companyProfile.contact.address.city) completedFields++
    if (companyProfile.contact.address.state) completedFields++
    if (companyProfile.contact.address.country) completedFields++

    // Culture & Business (8 fields)
    totalFields += 8
    if (companyProfile.culture.mission) completedFields++
    if (companyProfile.culture.vision) completedFields++
    if (companyProfile.culture.values.length > 0) completedFields++
    if (companyProfile.business.businessModel) completedFields++
    if (companyProfile.business.keyProducts.length > 0) completedFields++
    if (companyProfile.benefits.healthAndWellness.length > 0) completedFields++
    if (companyProfile.offices.length > 0) completedFields++
    if (companyProfile.team.leadership.length > 0) completedFields++

    const percentage = Math.round((completedFields / totalFields) * 100)
    setCompletionPercentage(Math.min(percentage, 100))
  }

  const updateProfile = (section: keyof CompanyProfile, data: any) => {
    setCompanyProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const addArrayItem = (section: keyof CompanyProfile, subsection: string, item: any) => {
    setCompanyProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: [...((prev[section] as any)[subsection] || []), { ...item, id: Date.now().toString() }]
      }
    }))
  }

  const removeArrayItem = (section: keyof CompanyProfile, subsection: string, id: string) => {
    setCompanyProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: (prev[section] as any)[subsection].filter((item: any) => item.id !== id)
      }
    }))
  }

  const toggleArrayItem = (section: keyof CompanyProfile, subsection: string, item: string) => {
    setCompanyProfile(prev => {
      const currentArray = (prev[section] as any)[subsection] || []
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i: string) => i !== item)
        : [...currentArray, item]
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: newArray
        }
      }
    })
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Company profile saved:', companyProfile)
    } catch (error) {
      console.error('Error saving company profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderBasicInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <Input
                value={companyProfile.basicInfo.companyName}
                onChange={(e) => updateProfile('basicInfo', { companyName: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Legal Name</label>
              <Input
                value={companyProfile.basicInfo.legalName}
                onChange={(e) => updateProfile('basicInfo', { legalName: e.target.value })}
                placeholder="Enter legal company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Tagline</label>
            <Input
              value={companyProfile.basicInfo.tagline}
              onChange={(e) => updateProfile('basicInfo', { tagline: e.target.value })}
              placeholder="e.g., 'Innovating the future of technology'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Description *</label>
            <Textarea
              value={companyProfile.basicInfo.description}
              onChange={(e) => updateProfile('basicInfo', { description: e.target.value })}
              placeholder="Describe what your company does, its mission, and key strengths..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website *</label>
              <Input
                value={companyProfile.basicInfo.website}
                onChange={(e) => updateProfile('basicInfo', { website: e.target.value })}
                placeholder="https://company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Founded Year</label>
              <Input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={companyProfile.basicInfo.foundedYear}
                onChange={(e) => updateProfile('basicInfo', { foundedYear: parseInt(e.target.value) || 2020 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Industry *</label>
              <Select onValueChange={(value) => updateProfile('basicInfo', { industry: value })}>
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
            <div>
              <label className="block text-sm font-medium mb-2">Company Type</label>
              <Select onValueChange={(value) => updateProfile('basicInfo', { companyType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  {companyTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee Count</label>
              <Select onValueChange={(value) => updateProfile('basicInfo', { employeeCount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee count" />
                </SelectTrigger>
                <SelectContent>
                  {employeeCountRanges.map((range) => (
                    <SelectItem key={range} value={range}>{range} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Headquarters Location</label>
              <Input
                value={companyProfile.basicInfo.headquarters}
                onChange={(e) => updateProfile('basicInfo', { headquarters: e.target.value })}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              {companyProfile.basicInfo.logo ? (
                <img
                  src={companyProfile.basicInfo.logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Company Logo</p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              {companyProfile.basicInfo.coverImage ? (
                <img
                  src={companyProfile.basicInfo.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Cover Image</p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Cover
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Social Media</h4>
            <div>
              <label className="block text-xs font-medium mb-1">LinkedIn</label>
              <Input
                value={companyProfile.basicInfo.linkedinUrl || ''}
                onChange={(e) => updateProfile('basicInfo', { linkedinUrl: e.target.value })}
                placeholder="LinkedIn company page URL"
                size={20}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Twitter</label>
              <Input
                value={companyProfile.basicInfo.twitterUrl || ''}
                onChange={(e) => updateProfile('basicInfo', { twitterUrl: e.target.value })}
                placeholder="Twitter profile URL"
                size={20}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCultureTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mission Statement</label>
            <Textarea
              value={companyProfile.culture.mission}
              onChange={(e) => updateProfile('culture', { mission: e.target.value })}
              placeholder="What is your company's mission?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vision Statement</label>
            <Textarea
              value={companyProfile.culture.vision}
              onChange={(e) => updateProfile('culture', { vision: e.target.value })}
              placeholder="What is your company's vision for the future?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Core Values</label>
            <div className="space-y-2">
              {companyProfile.culture.values.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input value={value} readOnly />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newValues = companyProfile.culture.values.filter((_, i) => i !== index)
                      updateProfile('culture', { values: newValues })
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a core value"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        updateProfile('culture', {
                          values: [...companyProfile.culture.values, target.value.trim()]
                        })
                        target.value = ''
                      }
                    }
                  }}
                />
                <Button size="sm" variant="outline">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Work Environment</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Collaborative',
                'Fast-paced',
                'Innovative',
                'Results-driven',
                'Flexible',
                'Inclusive',
                'Creative',
                'Supportive',
              ].map((env) => (
                <label key={env} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={companyProfile.culture.workEnvironment.includes(env)}
                    onChange={() => toggleArrayItem('culture', 'workEnvironment', env)}
                    className="rounded"
                  />
                  <span className="text-sm">{env}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dress Code</label>
            <Select onValueChange={(value) => updateProfile('culture', { dresscode: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select dress code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="business-casual">Business Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Working Hours</label>
              <Input
                value={companyProfile.culture.workingHours}
                onChange={(e) => updateProfile('culture', { workingHours: e.target.value })}
                placeholder="e.g., 9:00 AM - 6:00 PM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Working Days</label>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={companyProfile.culture.workingDays.includes(day)}
                      onChange={() => toggleArrayItem('culture', 'workingDays', day)}
                      className="rounded text-xs"
                    />
                    <span className="text-xs">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Remote Work Policy</label>
            <Select onValueChange={(value) => updateProfile('culture', { remotePolicy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select remote policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-remote">Fully Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid (2-3 days office)</SelectItem>
                <SelectItem value="office-first">Office First</SelectItem>
                <SelectItem value="no-remote">No Remote Work</SelectItem>
                <SelectItem value="flexible">Flexible Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Diversity & Inclusion Statement</label>
            <Textarea
              value={companyProfile.culture.diversityStatement}
              onChange={(e) => updateProfile('culture', { diversityStatement: e.target.value })}
              placeholder="Describe your commitment to diversity and inclusion..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderBenefitsTab = () => (
    <div className="space-y-6">
      {Object.entries(benefitOptions).map(([category, options]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {options.map((benefit) => (
                <label key={benefit} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(companyProfile.benefits as any)[category].includes(benefit)}
                    onChange={() => toggleArrayItem('benefits', category, benefit)}
                    className="rounded"
                  />
                  <span className="text-sm">{benefit}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderOfficesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Office Locations</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Office
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Office Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Office Name</label>
                  <Input
                    value={newOffice.name}
                    onChange={(e) => setNewOffice({ ...newOffice, name: e.target.value })}
                    placeholder="e.g., New York Office"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Office Type</label>
                  <Select onValueChange={(value: any) => setNewOffice({ ...newOffice, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="headquarters">Headquarters</SelectItem>
                      <SelectItem value="branch">Branch Office</SelectItem>
                      <SelectItem value="satellite">Satellite Office</SelectItem>
                      <SelectItem value="remote_hub">Remote Hub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    value={newOffice.address.city}
                    onChange={(e) => setNewOffice({
                      ...newOffice,
                      address: { ...newOffice.address, city: e.target.value }
                    })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Employee Count</label>
                  <Input
                    type="number"
                    value={newOffice.employeeCount}
                    onChange={(e) => setNewOffice({ ...newOffice, employeeCount: parseInt(e.target.value) || 0 })}
                    placeholder="Number of employees"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  if (newOffice.name && newOffice.address.city) {
                    addArrayItem('offices', '', newOffice)
                    setNewOffice({
                      name: '',
                      type: 'branch',
                      address: { street: '', city: '', state: '', country: '', pincode: '' },
                      employeeCount: 0,
                      facilities: [],
                    })
                  }
                }}
                className="w-full"
              >
                Add Office
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companyProfile.offices.map((office) => (
          <Card key={office.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{office.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{office.type.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">{office.address.city}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeArrayItem('offices', '', office.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{office.employeeCount} employees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{office.facilities.length || 0} facilities</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <Button size="sm" variant="outline" className="w-full">
                <Edit className="w-3 h-3 mr-2" />
                Edit Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {companyProfile.offices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="mx-auto h-12 w-12 mb-4" />
          <p>No office locations added yet</p>
          <p className="text-sm">Add your office locations to showcase your presence</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-sm text-gray-600">Manage your company information and showcase your culture</p>
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
        {/* Company Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Company Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                {companyProfile.basicInfo.logo ? (
                  <img
                    src={companyProfile.basicInfo.logo}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold">{companyProfile.basicInfo.companyName || 'Company Name'}</h3>
              <p className="text-sm text-gray-600">{companyProfile.basicInfo.industry}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{companyProfile.basicInfo.employeeCount} employees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Founded {companyProfile.basicInfo.foundedYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{companyProfile.basicInfo.headquarters}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="truncate">{companyProfile.basicInfo.website}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Offices</span>
                <Badge variant="outline">{companyProfile.offices.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Core Values</span>
                <Badge variant="outline">{companyProfile.culture.values.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Benefits</span>
                <Badge variant="outline">
                  {Object.values(companyProfile.benefits).reduce((acc, arr) => acc + arr.length, 0)}
                </Badge>
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
                    <TabsTrigger value="basic" className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="culture" className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className="hidden sm:inline">Culture</span>
                    </TabsTrigger>
                    <TabsTrigger value="benefits" className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span className="hidden sm:inline">Benefits</span>
                    </TabsTrigger>
                    <TabsTrigger value="offices" className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Offices</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="basic" className="mt-0">
                    {renderBasicInfoTab()}
                  </TabsContent>
                  
                  <TabsContent value="culture" className="mt-0">
                    {renderCultureTab()}
                  </TabsContent>
                  
                  <TabsContent value="benefits" className="mt-0">
                    {renderBenefitsTab()}
                  </TabsContent>
                  
                  <TabsContent value="offices" className="mt-0">
                    {renderOfficesTab()}
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
