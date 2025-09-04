'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useProgressiveLoading, useLoadingState, useMultipleLoadingStates } from '@/hooks/use-progressive-loading'
import {
  LoadingSpinner,
  LoadingOverlay,
  ProgressiveLoader,
  ErrorState,
  SuccessState,
  LoadingButton,
  LoadingCard,
  LoadingList,
  LoadingTable,
  LoadingForm,
  LoadingDashboard,
  LoadingJobCard,
  LoadingProfile,
  LazyLoadWrapper
} from '@/components/ui/loading-states'
import {
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonForm,
  SkeletonDashboard,
  SkeletonJobCard,
  SkeletonProfile
} from '@/components/ui/skeleton-loaders'

export default function LoadingStatesDemo() {
  const [demoLoading, setDemoLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoadingState()
  const multipleLoading = useMultipleLoadingStates()

  // Progressive loading demo
  const progressiveLoading = useProgressiveLoading({
    stages: [
      {
        name: 'Authentication',
        loader: () => new Promise(resolve => setTimeout(() => resolve('auth-token'), 1000)),
        weight: 1
      },
      {
        name: 'User Profile',
        loader: () => new Promise(resolve => setTimeout(() => resolve({ name: 'John Doe' }), 1500)),
        weight: 2,
        dependencies: ['Authentication']
      },
      {
        name: 'Dashboard Data',
        loader: () => new Promise(resolve => setTimeout(() => resolve({ stats: [1, 2, 3] }), 2000)),
        weight: 2,
        dependencies: ['User Profile']
      },
      {
        name: 'Notifications',
        loader: () => new Promise(resolve => setTimeout(() => resolve([]), 800)),
        weight: 1,
        required: false
      }
    ],
    onStageComplete: (stage, data) => {
      console.log(`Stage ${stage} completed:`, data)
    },
    onComplete: (data) => {
      console.log('All stages completed:', data)
    }
  })

  const simulateError = () => {
    setShowError(true)
    setTimeout(() => setShowError(false), 3000)
  }

  const simulateSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const simulateLoading = async (duration = 2000) => {
    setDemoLoading(true)
    await new Promise(resolve => setTimeout(resolve, duration))
    setDemoLoading(false)
  }

  const simulateMultipleLoading = () => {
    ['profile', 'jobs', 'messages'].forEach((key, index) => {
      multipleLoading.setLoading(key, true)
      setTimeout(() => {
        if (Math.random() > 0.7) {
          multipleLoading.setError(key, `Failed to load ${key}`)
        } else {
          multipleLoading.setLoading(key, false)
        }
      }, (index + 1) * 1000)
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loading States Demo</h1>
          <p className="text-gray-600">Comprehensive loading and skeleton components showcase</p>
        </div>
        <Badge variant="secondary">Performance Optimized</Badge>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Loading</TabsTrigger>
          <TabsTrigger value="progressive">Progressive</TabsTrigger>
          <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          <TabsTrigger value="wrappers">Wrappers</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Loading States */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading Spinner */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Spinners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="default" />
                  <span className="text-sm">Default</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="lg" />
                  <span className="text-sm">Large</span>
                </div>
              </CardContent>
            </Card>

            {/* Loading Button */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LoadingButton
                  isLoading={isLoading}
                  loadingText="Loading..."
                  onClick={() => {
                    startLoading()
                    setTimeout(stopLoading, 2000)
                  }}
                >
                  Click to Load
                </LoadingButton>
                
                <LoadingButton
                  isLoading={demoLoading}
                  loadingText="Processing..."
                  onClick={() => simulateLoading()}
                  variant="outline"
                >
                  Process Data
                </LoadingButton>
              </CardContent>
            </Card>

            {/* Error and Success States */}
            <Card>
              <CardHeader>
                <CardTitle>State Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={simulateError} variant="destructive" size="sm">
                  Show Error
                </Button>
                <Button onClick={simulateSuccess} variant="default" size="sm">
                  Show Success
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Error State Demo */}
          {showError && (
            <ErrorState
              error="Failed to load user data. Please check your connection."
              onRetry={() => setShowError(false)}
              title="Loading Failed"
            />
          )}

          {/* Success State Demo */}
          {showSuccess && (
            <SuccessState
              message="Data loaded successfully!"
              description="All your information has been updated."
              onContinue={() => setShowSuccess(false)}
            />
          )}

          {/* Loading Overlay Demo */}
          <LoadingOverlay isLoading={demoLoading} message="Loading dashboard data...">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This content will be overlaid with a loading spinner when loading.</p>
                <Button onClick={() => simulateLoading(3000)} className="mt-4">
                  Simulate Loading Overlay
                </Button>
              </CardContent>
            </Card>
          </LoadingOverlay>
        </TabsContent>

        {/* Progressive Loading */}
        <TabsContent value="progressive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressive Loading Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={progressiveLoading.startLoading}
                  disabled={progressiveLoading.loadingState.isLoading}
                >
                  Start Progressive Loading
                </Button>
                
                <Button
                  onClick={progressiveLoading.cancelLoading}
                  variant="outline"
                  disabled={!progressiveLoading.loadingState.isLoading}
                >
                  Cancel Loading
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Completed Stages:</h4>
                  <div className="flex flex-wrap gap-2">
                    {progressiveLoading.completedStages.map(stage => (
                      <Badge key={stage} variant="default">{stage}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              {progressiveLoading.loadingState.isLoading && (
                <ProgressiveLoader
                  progress={progressiveLoading.loadingState.progress}
                  stage={progressiveLoading.loadingState.stage}
                  stages={['Authentication', 'User Profile', 'Dashboard Data', 'Notifications']}
                />
              )}

              {progressiveLoading.loadingState.error && (
                <ErrorState
                  error={progressiveLoading.loadingState.error}
                  onRetry={progressiveLoading.retryLoading}
                  title="Progressive Loading Failed"
                />
              )}

              {progressiveLoading.loadingState.data && !progressiveLoading.loadingState.isLoading && (
                <SuccessState
                  message="Progressive Loading Complete!"
                  description="All stages loaded successfully."
                />
              )}
            </div>
          </div>

          {/* Multiple Loading States */}
          <Card>
            <CardHeader>
              <CardTitle>Multiple Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={simulateMultipleLoading}>
                Simulate Multiple Operations
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['profile', 'jobs', 'messages'].map(key => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{key}</h4>
                      {multipleLoading.isLoading(key) && <LoadingSpinner size="sm" />}
                    </div>
                    
                    {multipleLoading.getError(key) && (
                      <p className="text-sm text-red-600">{multipleLoading.getError(key)}</p>
                    )}
                    
                    {!multipleLoading.isLoading(key) && !multipleLoading.getError(key) && (
                      <p className="text-sm text-green-600">Loaded successfully</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skeleton Components */}
        <TabsContent value="skeletons" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonCard hasHeader hasAvatar textLines={3} hasActions />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonForm fields={4} hasSubmitButton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Card Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonJobCard />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>List Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonList items={4} hasAvatar hasActions />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Table Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonTable rows={4} columns={3} hasHeader />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonDashboard />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonProfile />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loading Wrappers */}
        <TabsContent value="wrappers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingCard isLoading={demoLoading} hasHeader hasAvatar textLines={3}>
              <Card>
                <CardHeader>
                  <CardTitle>Actual Card Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This is the real content that shows when loading is complete.</p>
                  <Button onClick={() => simulateLoading()} className="mt-4">
                    Toggle Loading
                  </Button>
                </CardContent>
              </Card>
            </LoadingCard>

            <LoadingList isLoading={demoLoading} items={3} hasAvatar hasActions>
              <div className="space-y-4">
                <h3 className="font-medium">Actual List Content</h3>
                {['Item 1', 'Item 2', 'Item 3'].map(item => (
                  <div key={item} className="flex items-center justify-between p-3 border rounded">
                    <span>{item}</span>
                    <Button size="sm" variant="outline">Action</Button>
                  </div>
                ))}
              </div>
            </LoadingList>
          </div>

          <LoadingTable isLoading={demoLoading} rows={3} columns={4} hasHeader>
            <div className="space-y-4">
              <h3 className="font-medium">Actual Table Content</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Role</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">John Doe</td>
                    <td className="border p-2">john@example.com</td>
                    <td className="border p-2">Admin</td>
                    <td className="border p-2">Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </LoadingTable>
        </TabsContent>

        {/* Advanced Features */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lazy Loading with Intersection Observer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Scroll down to see lazy-loaded content:</p>
              
              {Array.from({ length: 5 }).map((_, i) => (
                <LazyLoadWrapper
                  key={i}
                  skeleton={<SkeletonCard hasHeader textLines={2} />}
                  threshold={0.1}
                  rootMargin="50px"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Lazy Loaded Card {i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This content was loaded when it came into view.</p>
                      <p>Timestamp: {new Date().toLocaleTimeString()}</p>
                    </CardContent>
                  </Card>
                </LazyLoadWrapper>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Skeleton Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600">Performance Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">300ms</div>
                  <div className="text-sm text-gray-600">Avg Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-gray-600">Layout Shifts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}