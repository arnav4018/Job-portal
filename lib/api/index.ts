// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

// Generic API client
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add authentication header if token exists
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Specific API endpoints mapping to your existing backend
export const API_ENDPOINTS = {
  // Jobs
  jobs: {
    list: '/jobs',
    create: '/jobs',
    update: (id: string) => `/jobs/${id}`,
    delete: (id: string) => `/jobs/${id}`,
    search: '/jobs/search',
  },
  
  // Candidates  
  candidates: {
    list: '/candidates',
    create: '/candidates',
    update: (id: string) => `/candidates/${id}`,
    profile: (id: string) => `/candidates/${id}/profile`,
    resume: (id: string) => `/candidates/${id}/resume`,
  },
  
  // Applications
  applications: {
    list: '/applications',
    create: '/applications',
    update: (id: string) => `/applications/${id}`,
    byJob: (jobId: string) => `/jobs/${jobId}/applications`,
    byCandidate: (candidateId: string) => `/candidates/${candidateId}/applications`,
  },
  
  // Interviews
  interviews: {
    list: '/interviews',
    create: '/interviews',
    update: (id: string) => `/interviews/${id}`,
    schedule: '/interviews/schedule',
    notifications: '/interviews/notifications',
  },
  
  // Company
  company: {
    profile: '/company/profile',
    update: '/company/profile',
    offices: '/company/offices',
  },
  
  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    hiring: '/analytics/hiring',
    candidates: '/analytics/candidates',
    performance: '/analytics/performance',
  },
  
  // Referrals
  referrals: {
    list: '/referrals',
    create: '/referrals',
    quality: '/referrals/quality',
    rewards: '/referrals/rewards',
  },
  
  // Credits
  credits: {
    balance: '/credits/balance',
    transactions: '/credits/transactions',
    purchase: '/credits/purchase',
  },
  
  // AI Features
  ai: {
    matching: '/ai/matching',
    screening: '/ai/screening',
    jobGeneration: '/ai/job-generation',
    skillAssessment: '/ai/skill-assessment',
  },
  
  // Communication
  communication: {
    conversations: '/communication/conversations',
    messages: '/communication/messages',
    whatsapp: '/communication/whatsapp',
  },
}

// API Service Classes
export class JobsAPI {
  static async getJobs(filters?: any) {
    return apiClient.get(API_ENDPOINTS.jobs.list + (filters ? `?${new URLSearchParams(filters)}` : ''))
  }

  static async createJob(jobData: any) {
    return apiClient.post(API_ENDPOINTS.jobs.create, jobData)
  }

  static async updateJob(id: string, jobData: any) {
    return apiClient.put(API_ENDPOINTS.jobs.update(id), jobData)
  }

  static async searchJobs(query: string, filters?: any) {
    return apiClient.post(API_ENDPOINTS.jobs.search, { query, filters })
  }
}

export class CandidatesAPI {
  static async getCandidates(filters?: any) {
    return apiClient.get(API_ENDPOINTS.candidates.list + (filters ? `?${new URLSearchParams(filters)}` : ''))
  }

  static async createCandidate(candidateData: any) {
    return apiClient.post(API_ENDPOINTS.candidates.create, candidateData)
  }

  static async updateProfile(id: string, profileData: any) {
    return apiClient.put(API_ENDPOINTS.candidates.profile(id), profileData)
  }

  static async uploadResume(id: string, resumeData: any) {
    return apiClient.post(API_ENDPOINTS.candidates.resume(id), resumeData)
  }
}

export class InterviewsAPI {
  static async getInterviews(filters?: any) {
    return apiClient.get(API_ENDPOINTS.interviews.list + (filters ? `?${new URLSearchParams(filters)}` : ''))
  }

  static async scheduleInterview(interviewData: any) {
    return apiClient.post(API_ENDPOINTS.interviews.schedule, interviewData)
  }

  static async sendNotifications(interviewId: string, methods: string[]) {
    return apiClient.post(API_ENDPOINTS.interviews.notifications, { interviewId, methods })
  }
}

export class AnalyticsAPI {
  static async getDashboardData(timeRange?: string, department?: string) {
    const params = new URLSearchParams()
    if (timeRange) params.append('timeRange', timeRange)
    if (department) params.append('department', department)
    
    return apiClient.get(API_ENDPOINTS.analytics.dashboard + `?${params}`)
  }

  static async getHiringMetrics(timeRange?: string) {
    return apiClient.get(API_ENDPOINTS.analytics.hiring + (timeRange ? `?timeRange=${timeRange}` : ''))
  }
}

export class ReferralsAPI {
  static async getReferrals(filters?: any) {
    return apiClient.get(API_ENDPOINTS.referrals.list + (filters ? `?${new URLSearchParams(filters)}` : ''))
  }

  static async createReferral(referralData: any) {
    return apiClient.post(API_ENDPOINTS.referrals.create, referralData)
  }

  static async getQualityMetrics() {
    return apiClient.get(API_ENDPOINTS.referrals.quality)
  }
}

export class CreditsAPI {
  static async getBalance() {
    return apiClient.get(API_ENDPOINTS.credits.balance)
  }

  static async getTransactions(limit?: number) {
    return apiClient.get(API_ENDPOINTS.credits.transactions + (limit ? `?limit=${limit}` : ''))
  }

  static async purchaseCredits(amount: number, plan: string) {
    return apiClient.post(API_ENDPOINTS.credits.purchase, { amount, plan })
  }
}

// Export all APIs
export {
  JobsAPI as Jobs,
  CandidatesAPI as Candidates,
  InterviewsAPI as Interviews,
  AnalyticsAPI as Analytics,
  ReferralsAPI as Referrals,
  CreditsAPI as Credits,
}
