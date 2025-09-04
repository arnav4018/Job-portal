"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building, 
  Globe, 
  MapPin, 
  Users, 
  Upload,
  Check,
  AlertCircle,
  Camera,
  Save,
  Eye
} from "lucide-react"
// import { toast } from "sonner"

interface Company {
  id?: string
  name: string
  description: string
  website: string
  logo: string | null
  location: string
  size: string
  industry: string
  verified: boolean
  businessDetails: string | null
  products: string | null
  turnover: string | null
  teamSize: string | null
  erpSystem: string | null
  leavesPolicy: string | null
  workingDays: string | null
  travelRequired: string | null
  workTimings: string | null
  benefits: string | null
  culture: string | null
  officeImages: string[] | null
}

const companySizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Media",
  "Real Estate",
  "Other"
]

export function RecruiterCompanyContent() {
  const { data: session } = useSession()
  const [company, setCompany] = useState<Company>({
    name: "",
    description: "",
    website: "",
    logo: null,
    location: "",
    size: "",
    industry: "",
    verified: false,
    businessDetails: "",
    products: "",
    turnover: "",
    teamSize: "",
    erpSystem: "",
    leavesPolicy: "",
    workingDays: "",
    travelRequired: "",
    workTimings: "",
    benefits: "",
    culture: "",
    officeImages: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      const response = await fetch("/api/recruiter/company")
      if (response.ok) {
        const data = await response.json()
        if (data.company) {
          setCompany(data.company)
        }
      }
    } catch (error) {
      console.error("Failed to fetch company:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/recruiter/company", {
        method: company.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(company)
      })

      if (response.ok) {
        const data = await response.json()
        setCompany(data.company)
        console.log("Company profile updated successfully!")
      } else {
        console.error("Failed to update company profile")
      }
    } catch (error) {
      console.error("Failed to save company:", error)
      console.error("Failed to update company profile")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Company, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage your company information and branding
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {company.verified && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="details">Company Details</TabsTrigger>
          <TabsTrigger value="culture">Culture & Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential company information visible to job seekers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={company.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={company.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  value={company.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your company, mission, and what makes it unique..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={company.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={company.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Select
                  value={company.size}
                  onValueChange={(value) => handleInputChange("size", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Additional information about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessDetails">Business Details</Label>
                <Textarea
                  id="businessDetails"
                  value={company.businessDetails || ""}
                  onChange={(e) => handleInputChange("businessDetails", e.target.value)}
                  placeholder="Describe your business model, target market, key services..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="products">Products & Services</Label>
                <Textarea
                  id="products"
                  value={company.products || ""}
                  onChange={(e) => handleInputChange("products", e.target.value)}
                  placeholder="List your main products and services..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="turnover">Annual Turnover</Label>
                  <Input
                    id="turnover"
                    value={company.turnover || ""}
                    onChange={(e) => handleInputChange("turnover", e.target.value)}
                    placeholder="e.g., $1M - $5M"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    value={company.teamSize || ""}
                    onChange={(e) => handleInputChange("teamSize", e.target.value)}
                    placeholder="e.g., 50-100 employees"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="erpSystem">ERP/Systems Used</Label>
                <Input
                  id="erpSystem"
                  value={company.erpSystem || ""}
                  onChange={(e) => handleInputChange("erpSystem", e.target.value)}
                  placeholder="SAP, Oracle, Salesforce, etc."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="culture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Culture & Benefits</CardTitle>
              <CardDescription>
                Show candidates what it's like to work at your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="culture">Company Culture</Label>
                <Textarea
                  id="culture"
                  value={company.culture || ""}
                  onChange={(e) => handleInputChange("culture", e.target.value)}
                  placeholder="Describe your company culture, values, and work environment..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Employee Benefits</Label>
                <Textarea
                  id="benefits"
                  value={company.benefits || ""}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  placeholder="List employee benefits: health insurance, flexible hours, remote work, etc."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingDays">Working Days</Label>
                  <Input
                    id="workingDays"
                    value={company.workingDays || ""}
                    onChange={(e) => handleInputChange("workingDays", e.target.value)}
                    placeholder="e.g., Monday - Friday"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workTimings">Work Timings</Label>
                  <Input
                    id="workTimings"
                    value={company.workTimings || ""}
                    onChange={(e) => handleInputChange("workTimings", e.target.value)}
                    placeholder="e.g., 9 AM - 6 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leavesPolicy">Leaves Policy</Label>
                <Input
                  id="leavesPolicy"
                  value={company.leavesPolicy || ""}
                  onChange={(e) => handleInputChange("leavesPolicy", e.target.value)}
                  placeholder="Annual leave, sick leave policy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelRequired">Travel Requirements</Label>
                <Input
                  id="travelRequired"
                  value={company.travelRequired || ""}
                  onChange={(e) => handleInputChange("travelRequired", e.target.value)}
                  placeholder="None, Occasional, Frequent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Profile Completion
          </CardTitle>
          <CardDescription>
            Complete your profile to attract more candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{Math.round(getCompletionPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {getIncompleteFields().map((field) => (
              <div key={field} className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                {field} is missing
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function getCompletionPercentage(): number {
    const requiredFields = [
      company.name,
      company.description, 
      company.location,
      company.industry,
      company.size
    ]
    const optionalFields = [
      company.website,
      company.businessDetails,
      company.products,
      company.benefits,
      company.culture
    ]
    
    const requiredComplete = requiredFields.filter(field => field && field.trim()).length
    const optionalComplete = optionalFields.filter(field => field && field.trim()).length
    
    return ((requiredComplete * 15) + (optionalComplete * 5))
  }

  function getIncompleteFields(): string[] {
    const incomplete = []
    if (!company.name?.trim()) incomplete.push("Company name")
    if (!company.description?.trim()) incomplete.push("Company description")
    if (!company.location?.trim()) incomplete.push("Location")
    if (!company.industry?.trim()) incomplete.push("Industry")
    if (!company.size?.trim()) incomplete.push("Company size")
    return incomplete
  }
}
