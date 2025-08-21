'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Copy, 
  Share2, 
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Referral {
  id: string
  code: string
  status: string
  reward: number | null
  createdAt: string
  paidAt: string | null
  job: {
    id: string
    title: string
    company: {
      name: string
      logo: string | null
    }
  }
  referred: {
    id: string
    name: string | null
    email: string
  } | null
}

export default function AllReferralsContent() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchReferrals()
  }, [page, statusFilter])

  const fetchReferrals = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
      })

      const response = await fetch(`/api/referrals?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
      toast({
        title: 'Error',
        description: 'Failed to load referrals. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'interview': return 'bg-purple-100 text-purple-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const copyReferralLink = (code: string, jobId: string) => {
    const link = `${window.location.origin}/jobs/${jobId}?ref=${code}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link copied!',
      description: 'Referral link has been copied to your clipboard.',
    })
  }

  const shareReferral = (code: string, jobId: string, jobTitle: string) => {
    const link = `${window.location.origin}/jobs/${jobId}?ref=${code}`
    const text = `Check out this amazing job opportunity: ${jobTitle}. Apply using my referral link: ${link}`
    
    if (navigator.share) {
      navigator.share({
        title: `Job Referral: ${jobTitle}`,
        text,
        url: link,
      })
    } else {
      copyReferralLink(code, jobId)
    }
  }

  const filteredReferrals = referrals.filter(referral =>
    referral.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referral.job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referral.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/referrals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">All Referrals</h1>
            <p className="text-muted-foreground">
              Complete history of your referrals and their status
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPLIED">Applied</SelectItem>
              <SelectItem value="INTERVIEW">Interview</SelectItem>
              <SelectItem value="HIRED">Hired</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Referrals History</CardTitle>
          <CardDescription>
            {filteredReferrals.length} referral{filteredReferrals.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start creating referrals to see them here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferrals.map((referral) => (
                <div key={referral.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{referral.job.title}</h3>
                        <Badge className={getStatusColor(referral.status)}>
                          {formatStatus(referral.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{referral.job.company.name}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <span className="font-medium mr-2">Code:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {referral.code}
                          </code>
                        </div>
                        
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </div>
                        
                        {referral.referred && (
                          <div className="flex items-center text-gray-500">
                            <span className="font-medium mr-2">Referred:</span>
                            {referral.referred.name || referral.referred.email}
                          </div>
                        )}
                        
                        {referral.status === 'HIRED' && referral.reward && (
                          <div className="flex items-center text-green-600 font-medium">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ₹{referral.reward.toLocaleString()}
                            {referral.paidAt && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Paid {new Date(referral.paidAt).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyReferralLink(referral.code, referral.job.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareReferral(referral.code, referral.job.id, referral.job.title)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}