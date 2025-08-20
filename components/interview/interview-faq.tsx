"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Search, 
  HelpCircle, 
  Briefcase, 
  Users, 
  Code,
  MessageSquare
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
}

interface InterviewFAQProps {
  jobId?: string
  interviewType?: string
}

export default function InterviewFAQ({ jobId, interviewType }: InterviewFAQProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { value: "all", label: "All Questions", icon: HelpCircle },
    { value: "INTERVIEW", label: "Interview Process", icon: Users },
    { value: "TECHNICAL", label: "Technical Questions", icon: Code },
    { value: "CAREER", label: "Career Growth", icon: Briefcase },
    { value: "GENERAL", label: "General", icon: MessageSquare },
  ]

  useEffect(() => {
    fetchFAQs()
  }, [selectedCategory])

  useEffect(() => {
    filterFAQs()
  }, [faqs, searchTerm])

  const fetchFAQs = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      const response = await fetch(`/api/faqs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs)
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFAQs = () => {
    if (!searchTerm) {
      setFilteredFaqs(faqs)
      return
    }

    const filtered = faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredFaqs(filtered)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'INTERVIEW': return 'bg-blue-100 text-blue-800'
      case 'TECHNICAL': return 'bg-purple-100 text-purple-800'
      case 'CAREER': return 'bg-green-100 text-green-800'
      case 'GENERAL': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Interview Preparation - Frequently Asked Questions</span>
          </CardTitle>
          <CardDescription>
            Get answers to common questions about the interview process and what to expect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </Button>
              )
            })}
          </div>

          {/* FAQs */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No questions found</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index}`} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-start space-x-3 text-left">
                        <span className="font-medium">{faq.question}</span>
                      </div>
                      <Badge className={getCategoryColor(faq.category)} variant="secondary">
                        {faq.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Interview-Specific Tips */}
      {interviewType && (
        <Card>
          <CardHeader>
            <CardTitle>Tips for {interviewType} Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviewType === 'TECHNICAL' && (
                <>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm">Review fundamental concepts and practice coding problems</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm">Prepare to explain your thought process while solving problems</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm">Test your setup beforehand if it's a virtual interview</p>
                  </div>
                </>
              )}
              
              {interviewType === 'VIDEO' && (
                <>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">Test your camera, microphone, and internet connection</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">Choose a quiet, well-lit location with a professional background</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">Have a backup plan in case of technical difficulties</p>
                  </div>
                </>
              )}
              
              {interviewType === 'PHONE' && (
                <>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm">Find a quiet location with good phone reception</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm">Have your resume and notes ready for reference</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm">Speak clearly and don't be afraid to ask for clarification</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}