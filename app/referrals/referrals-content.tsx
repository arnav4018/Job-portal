'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Share2, 
  Copy, 
  Mail,
  Gift,
  TrendingUp,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { ReferralModal } from '@/components/referrals/referral-modal'

interface Referral {
  id: string
  code: string
  status: string
  reward: number | null
  createdAt: Date
  paidAt: Date | null
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

interface ReferralStats {
  total: number
  pending: number
  applied: number
  hired: number
  totalEarnings: number
}

interface ReferralsContentProps {
  referrals: Referral[]
  stats: ReferralStats
}

export default function ReferralsContent({ referrals, stats }: ReferralsContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
        <p className="text-muted-foreground">
          Refer talented candidates to job opportunities and earn rewards when they get hired.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Hires</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hired}</div>
            <p className="text-xs text-muted-foreground">
              Candidates hired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending + stats.applied}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Rewards earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            How Refer & Earn Works
          </CardTitle>
          <CardDescription>
            Earn rewards by referring qualified candidates to job opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Job</h3>
              <p className="text-sm text-muted-foreground">
                Find a job and create a referral link to share with candidates
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Candidate Applies</h3>
              <p className="text-sm text-muted-foreground">
                Your referred candidate applies to the job using your link
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Candidate Gets Hired</h3>
              <p className="text-sm text-muted-foreground">
                The company hires your referred candidate
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">4. Earn Reward</h3>
              <p className="text-sm text-muted-foreground">
                Receive ₹1,000 reward when the candidate is successfully hired
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create New Referral
            </Button>
            <LinkButton variant="outline" size="lg" href="/referrals/earnings">
              <DollarSign className="h-4 w-4 mr-2" />
              View Earnings
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Referrals</CardTitle>
              <CardDescription>
                Track your referrals and their status
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Referral
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-500 mb-4">
                Start referring candidates to earn rewards
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                Create Your First Referral
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{referral.job.title}</h3>
                        <Badge className={getStatusColor(referral.status)}>
                          {formatStatus(referral.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{referral.job.company.name}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Code: {referral.code}</span>
                        <span>Created: {new Date(referral.createdAt).toLocaleDateString()}</span>
                        {referral.referred && (
                          <span>Referred: {referral.referred.name || referral.referred.email}</span>
                        )}
                        {referral.status === 'HIRED' && referral.reward && (
                          <span className="text-green-600 font-medium">
                            Earned: ₹{referral.reward.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
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
              
              <div className="text-center pt-4">
                <Link href="/referrals/all">
                  <Button variant="outline">
                    View All Referrals
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ReferralModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}