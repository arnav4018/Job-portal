'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Building, MapPin, Users, Clock, Plane, Calendar } from 'lucide-react'

const companyProfileSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  size: z.string().optional(),
  industry: z.string().optional(),
  businessDetails: z.string().optional(),
  products: z.array(z.string()).optional(),
  turnover: z.number().positive().optional(),
  teamSize: z.number().positive().optional(),
  erpSystem: z.string().optional(),
  leavesPolicy: z.string().optional(),
  workingDays: z.number().min(1).max(7),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
  travelRequired: z.boolean(),
  culture: z.string().optional(),
})

type CompanyProfileData = z.infer<typeof companyProfileSchema>

export default function CompanyProfileForm() {
  const [products, setProducts] = useState<string[]>([])
  const [newProduct, setNewProduct] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CompanyProfileData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      workingDays: 5,
      workingHours: {
        start: '09:00',
        end: '18:00',
      },
      travelRequired: false,
      products: [],
    }
  })

  const watchedValues = watch()

  const addProduct = () => {
    if (newProduct.trim()) {
      const updatedProducts = [...products, newProduct.trim()]
      setProducts(updatedProducts)
      setValue('products', updatedProducts)
      setNewProduct('')
    }
  }

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts)
    setValue('products', updatedProducts)
  }

  const onSubmit = async (data: CompanyProfileData) => {
    try {
      console.log('Company profile data:', data)
      alert('Company profile updated successfully!')
    } catch (error) {
      console.error('Error updating company profile:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-600">Manage your company information and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter company name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your company..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="City, Country"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="size">Company Size</Label>
                <Select onValueChange={(value) => setValue('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                {...register('industry')}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessDetails">Business Nature</Label>
              <Textarea
                id="businessDetails"
                {...register('businessDetails')}
                placeholder="Describe your business nature and operations..."
                rows={3}
              />
            </div>

            {/* Products/Services */}
            <div>
              <Label>Products/Services</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="Add a product or service"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                />
                <Button type="button" onClick={addProduct} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {products.map((product, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {product}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeProduct(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="turnover">Annual Turnover (₹)</Label>
                <Input
                  id="turnover"
                  type="number"
                  {...register('turnover', { valueAsNumber: true })}
                  placeholder="e.g., 10000000"
                />
              </div>
              
              <div>
                <Label htmlFor="teamSize">Current Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  {...register('teamSize', { valueAsNumber: true })}
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="erpSystem">ERP System</Label>
              <Input
                id="erpSystem"
                {...register('erpSystem')}
                placeholder="e.g., SAP, Oracle, Custom"
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Environment */}
        <Card>
          <CardHeader>
            <CardTitle>Work Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="workingDays">Working Days per Week</Label>
              <Select onValueChange={(value) => setValue('workingDays', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select working days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('workingHours.start')}
                />
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('workingHours.end')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Travel Required
                </Label>
                <p className="text-sm text-gray-600">
                  Does this role require travel?
                </p>
              </div>
              <Switch
                checked={watchedValues.travelRequired}
                onCheckedChange={(checked) => setValue('travelRequired', checked)}
              />
            </div>

            <div>
              <Label htmlFor="leavesPolicy">Leave Policy</Label>
              <Textarea
                id="leavesPolicy"
                {...register('leavesPolicy')}
                placeholder="Describe your leave policy..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Culture */}
        <Card>
          <CardHeader>
            <CardTitle>Company Culture</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="culture">Company Culture</Label>
              <Textarea
                id="culture"
                {...register('culture')}
                placeholder="Describe your company culture, values, and work environment..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? 'Updating...' : 'Update Company Profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}