import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/applications/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
    notification: {
      create: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: jest.fn(),
}))

jest.mock('@/lib/utils', () => ({
  calculateSkillMatch: jest.fn(() => 85),
}))

describe('/api/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/applications', () => {
    it('should return applications for authenticated candidate', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'CANDIDATE' },
      }
      
      const mockApplications = [
        {
          id: 'app1',
          jobId: 'job1',
          candidateId: 'user1',
          status: 'APPLIED',
          appliedAt: new Date(),
          job: {
            title: 'Software Engineer',
            company: { name: 'TechCorp', logo: null },
          },
          candidate: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          resume: { id: 'resume1', title: 'My Resume' },
          interviews: [],
          hireTracking: null,
        },
      ]

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications)
      ;(prisma.application.count as jest.Mock).mockResolvedValue(1)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/applications?page=1&limit=10',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.applications).toHaveLength(1)
      expect(data.applications[0].id).toBe('app1')
      expect(data.pagination.total).toBe(1)
    })

    it('should return 401 for unauthenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/applications',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST /api/applications', () => {
    it('should create application for valid job', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'CANDIDATE', name: 'John Doe', email: 'john@example.com' },
      }

      const mockJob = {
        id: 'job1',
        title: 'Software Engineer',
        status: 'PUBLISHED',
        skills: JSON.stringify(['JavaScript', 'React']),
        recruiterId: 'recruiter1',
        company: { name: 'TechCorp' },
        recruiter: { name: 'Jane Recruiter', email: 'jane@techcorp.com' },
      }

      const mockCandidate = {
        id: 'user1',
        name: 'John Doe',
        profile: {
          skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
        },
      }

      const mockApplication = {
        id: 'app1',
        jobId: 'job1',
        candidateId: 'user1',
        status: 'APPLIED',
        matchScore: 85,
        job: mockJob,
        candidate: mockCandidate,
        resume: null,
      }

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.job.findUnique as jest.Mock).mockResolvedValue(mockJob)
      ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCandidate)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          application: {
            create: jest.fn().mockResolvedValue(mockApplication),
          },
          notification: {
            create: jest.fn(),
          },
        })
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          jobId: 'job1',
          resumeId: 'resume1',
          coverLetter: 'I am interested in this position.',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('app1')
      expect(data.matchScore).toBe(85)
    })

    it('should return 400 for duplicate application', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'CANDIDATE' },
      }

      const mockJob = {
        id: 'job1',
        status: 'PUBLISHED',
        company: { name: 'TechCorp' },
      }

      const existingApplication = {
        id: 'app1',
        jobId: 'job1',
        candidateId: 'user1',
      }

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.job.findUnique as jest.Mock).mockResolvedValue(mockJob)
      ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(existingApplication)

      const { req } = createMocks({
        method: 'POST',
        body: {
          jobId: 'job1',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('You have already applied to this job')
    })

    it('should return 401 for non-candidate user', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'RECRUITER' },
      }

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const { req } = createMocks({
        method: 'POST',
        body: {
          jobId: 'job1',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})