'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, DollarSign, Clock, CheckCircle, Calendar, Download } from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: Date
  metadata: string | null
}

interface Referral {
  id: string
  code: string
  reward: number | null
  paidAt: Date | null
  job: {
    id: string
    title: string
    company: {
      name: string
    }
  }
  referred: {
    name: string | null
    email: string
  } | null
}

interface EarningsStats {
  totalEarnings: number
  paidEarnings: number
  pendingEarnings: number
  successfulReferrals: number
}

interface EarningsContentProps {
  payments: Payment[]
  referrals: Referral[]
  stats: EarningsStats
}

export default function EarningsContent({ payments, referrals, stats }: EarningsContentProps) {
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/referrals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Referrals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
            <p className="text-muted-foreground">
              Track your referral earnings and payment history
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.successfulReferrals} successful referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.paidEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Successfully transferred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{stats.pendingEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successfulReferrals > 0 ? '100%' : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Hired referrals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Successful Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Successful Referrals</CardTitle>
            <CardDescription>
              Referrals that resulted in successful hires
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
                <p className="text-gray-500 mb-4">
                  Start referring candidates to earn rewards
                </p>
                <Link href="/referrals">
                  <Button>Create Referral</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{referral.job.title}</h3>
                        <p className="text-sm text-gray-600">{referral.job.company.name}</p>
                        {referral.referred && (
                          <p className="text-sm text-gray-500 mt-1">
                            Referred: {referral.referred.name || referral.referred.email}
                          </p>
                        )}
                        {referral.paidAt && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Paid on {new Date(referral.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ₹{referral.reward?.toLocaleString()}
                        </div>
                        <Badge className={referral.paidAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {referral.paidAt ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Your referral payout transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                <p className="text-gray-500">
                  Payments will appear here once your referrals are processed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            ₹{payment.amount.toLocaleString()}
                          </span>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {formatStatus(payment.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
          <CardDescription>
            How and when you receive your referral rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Payment Schedule</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payouts are processed monthly</li>
                <li>• Minimum payout amount: ₹500</li>
                <li>• Payments are made within 7 business days</li>
                <li>• You'll receive an email confirmation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reward Structure</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ₹1,000 per successful hire</li>
                <li>• Bonus rewards for multiple referrals</li>
                <li>• Special rates for high-demand roles</li>
                <li>• No limit on earnings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}