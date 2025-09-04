'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { Building, MapPin, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function CompaniesPage() {
    // Mock company data for now
    const companies = [
        {
            id: '1',
            name: 'TechCorp Solutions',
            description: 'Leading technology company specializing in AI and machine learning solutions.',
            location: 'San Francisco, CA',
            employees: '1000-5000',
            openJobs: 12,
            logo: null
        },
        {
            id: '2',
            name: 'StartupXYZ',
            description: 'Fast-growing startup revolutionizing the fintech industry.',
            location: 'New York, NY',
            employees: '50-200',
            openJobs: 8,
            logo: null
        },
        {
            id: '3',
            name: 'BigTech Inc',
            description: 'Global technology leader with offices worldwide.',
            location: 'Seattle, WA',
            employees: '10000+',
            openJobs: 25,
            logo: null
        }
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Companies</h1>
                <p className="text-muted-foreground">
                    Discover companies that are hiring and learn about their culture and opportunities.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                    <Card key={company.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Building className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{company.name}</CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {company.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {company.description}
                            </CardDescription>

                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {company.employees} employees
                                </div>
                                <div className="font-medium text-primary">
                                    {company.openJobs} open jobs
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    View Profile
                                </Button>
                                <LinkButton size="sm" className="flex-1" href={`/jobs?company=${company.id}`}>
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Jobs
                                </LinkButton>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Are you an employer?</h3>
                        <p className="text-muted-foreground mb-4">
                            Join our platform to find talented candidates and grow your team.
                        </p>
                        <LinkButton href="/auth/signup?role=RECRUITER">
                            Post Jobs & Hire
                        </LinkButton>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}