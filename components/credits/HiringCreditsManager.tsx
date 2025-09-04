'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Check, 
  X,
  Plus,
  History,
  Star,
  Zap,
  Gift
} from 'lucide-react'

interface CreditBalance {
  balance: number
  totalPurchased: number
  totalUsed: number
  expiresAt?: string
}

interface Transaction {
  id: string
  type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'EXPIRY'
  amount: number
  description: string
  createdAt: string
  metadata?: any
}

interface PricingTier {
  credits: number
  price: number
  pricePerCredit: number
  popular: boolean
  savings?: string
  features: string[]
}

const pricingTiers: PricingTier[] = [
  {
    credits: 10,
    price: 999,
    pricePerCredit: 99.9,
    popular: false,
    features: [
      '10 job postings',
      'Basic candidate matching',
      'Email support'
    ]
  },
  {
    credits: 25,
    price: 2199,
    pricePerCredit: 87.96,
    popular: true,
    savings: '12% off',
    features: [
      '25 job postings',
      'Advanced candidate matching',
      'Priority support',
      'Job posting optimization'
    ]
  },
  {
    credits: 50,
    price: 3999,
    pricePerCredit: 79.98,
    popular: false,
    savings: '20% off',
    features: [
      '50 job postings',
      'Premium candidate matching',
      'Dedicated account manager',
      'Custom hiring workflows',
      'Analytics dashboard'
    ]
  },
  {
    credits: 100,
    price: 6999,
    pricePerCredit: 69.99,
    popular: false,
    savings: '30% off',
    features: [
      '100 job postings',
      'Enterprise matching',
      '24/7 priority support',
      'Custom integrations',
      'Advanced analytics',
      'Bulk hiring tools'
    ]
  }
]

const creditUsageCosts = [
  { action: 'Post Job', credits: 1, description: 'Basic job posting for 30 days' },
  { action: 'Feature Job', credits: 3, description: 'Featured listing with priority placement' },
  { action: 'AI Job Generation', credits: 2, description: 'AI-powered job description creation' },
  { action: 'Premium Matching', credits: 5, description: 'Advanced AI candidate matching' },
  { action: 'Bulk Posting', credits: 8, description: 'Post up to 10 jobs simultaneously' },
  { action: 'Interview Scheduling', credits: 1, description: 'Automated interview slot management' },
]

export default function HiringCreditsManager() {
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)

  useEffect(() => {
    loadCreditsData()
  }, [])

  const loadCreditsData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/credits')
      const data = await response.json()
      setCreditBalance({
        balance: data.balance,
        totalPurchased: data.totalPurchased,
        totalUsed: data.totalUsed,
        expiresAt: data.expiresAt
      })
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Failed to load credits data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseCredits = async (tier: PricingTier) => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PURCHASE',
          amount: tier.credits,
          description: `Purchased ${tier.credits} credits`,
          paymentId: `payment_${Date.now()}` // In real implementation, this would come from payment gateway
        })
      })

      if (response.ok) {
        const result = await response.json()
        setShowPurchaseDialog(false)
        loadCreditsData() // Refresh data
        alert(result.message)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'USAGE':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'REFUND':
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'EXPIRY':
        return <X className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'text-green-600'
      case 'USAGE':
        return 'text-red-600'
      case 'REFUND':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading credits data...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hiring Credits</h1>
            <p className="text-sm text-gray-600">Manage your hiring credits and purchase history</p>
          </div>
        </div>

        <Button 
          onClick={() => setShowPurchaseDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Purchase Credits
        </Button>
      </div>

      {/* Credit Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{creditBalance?.balance || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{creditBalance?.totalPurchased || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{creditBalance?.totalUsed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expires</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {creditBalance?.expiresAt ? 
                new Date(creditBalance.expiresAt).toLocaleDateString() : 
                'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Credit validity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Guide</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
        </TabsList>

        {/* Usage Guide Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Guide</CardTitle>
              <CardDescription>
                Understand how credits are consumed for different actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creditUsageCosts.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.action}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {item.credits} {item.credits === 1 ? 'Credit' : 'Credits'}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Gift className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Free Credits</h4>
                    <p className="text-sm text-yellow-700">
                      New companies get 5 free credits to start with. Additional credits can be purchased 
                      based on your hiring needs.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Transaction History</span>
              </CardTitle>
              <CardDescription>
                View all your credit transactions and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your credit transactions will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className={`capitalize ${getTransactionColor(transaction.type)}`}>
                              {transaction.type.toLowerCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={`text-right font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'USAGE' || transaction.type === 'EXPIRY' ? '-' : '+'}
                          {transaction.amount}
                        </TableCell>
                        <TableCell className="text-right text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Plans Tab */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'ring-2 ring-blue-600' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {tier.credits}
                    </div>
                    <div className="text-sm text-gray-600">Credits</div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">₹{tier.price}</span>
                      {tier.savings && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          {tier.savings}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      ₹{tier.pricePerCredit}/credit
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedTier(tier)
                      setShowPurchaseDialog(true)
                    }}
                  >
                    Purchase Credits
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
            <DialogDescription>
              {selectedTier ? 
                `You're about to purchase ${selectedTier.credits} credits for ₹${selectedTier.price}` :
                'Select a credit package to purchase'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedTier && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Credits:</span>
                  <span>{selectedTier.credits}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">₹{selectedTier.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Per Credit:</span>
                  <span>₹{selectedTier.pricePerCredit}</span>
                </div>
                {selectedTier.savings && (
                  <div className="mt-2 text-center">
                    <Badge className="bg-green-100 text-green-800">
                      You save {selectedTier.savings}!
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPurchaseDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedTier && purchaseCredits(selectedTier)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
