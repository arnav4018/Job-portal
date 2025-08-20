import { z } from 'zod'

// Application schemas
export const applicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  resumeId: z.string().optional(),
  coverLetter: z.string().optional(),
})

export const applicationUpdateSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'HIRED', 'REJECTED', 'DROPPED_OUT']),
  notes: z.string().optional(),
  dropoutReason: z.string().optional(),
})

// Job schemas
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  responsibilities: z.string().min(1, 'Responsibilities are required'),
  skills: z.array(z.string()).optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  location: z.string().min(1, 'Location is required'),
  remote: z.boolean().default(false),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('INR'),
  companyId: z.string().min(1, 'Company ID is required'),
})

export const jobSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  skills: z.array(z.string()).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['createdAt', 'salary', 'views', 'matchScore']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Resume schemas
export const resumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  data: z.object({
    personalInfo: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Valid email is required'),
      phone: z.string().min(1, 'Phone is required'),
      location: z.string().optional(),
      website: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
    }),
    summary: z.string().optional(),
    experience: z.array(z.object({
      company: z.string().min(1, 'Company is required'),
      position: z.string().min(1, 'Position is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      current: z.boolean().default(false),
      description: z.string().optional(),
      achievements: z.array(z.string()).optional(),
    })).optional(),
    education: z.array(z.object({
      institution: z.string().min(1, 'Institution is required'),
      degree: z.string().min(1, 'Degree is required'),
      field: z.string().optional(),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      gpa: z.string().optional(),
    })).optional(),
    skills: z.array(z.object({
      name: z.string().min(1, 'Skill name is required'),
      level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
      category: z.string().optional(),
    })).optional(),
    projects: z.array(z.object({
      name: z.string().min(1, 'Project name is required'),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      url: z.string().url().optional(),
      github: z.string().url().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })).optional(),
    certifications: z.array(z.object({
      name: z.string().min(1, 'Certification name is required'),
      issuer: z.string().min(1, 'Issuer is required'),
      date: z.string().min(1, 'Date is required'),
      url: z.string().url().optional(),
    })).optional(),
  }),
  isDefault: z.boolean().default(false),
})

// Interview schemas
export const interviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  type: z.enum(['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL']),
  scheduledAt: z.string().datetime('Valid datetime is required'),
  duration: z.number().min(15).max(480).default(60),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export const interviewUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

// Referral schemas
export const referralSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  referredEmail: z.string().email('Valid email is required').optional(),
})

// Expert consulting schemas
export const expertProfileSchema = z.object({
  expertise: z.array(z.string()).min(1, 'At least one expertise area is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  experience: z.number().min(1, 'Experience is required'),
  ratePerMinute: z.number().min(0).optional(),
  freeMinutes: z.number().min(0).default(15),
  availability: z.object({
    timezone: z.string(),
    schedule: z.array(z.object({
      day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      startTime: z.string(),
      endTime: z.string(),
    })),
  }).optional(),
})

export const consultingSessionSchema = z.object({
  expertId: z.string().min(1, 'Expert ID is required'),
  duration: z.number().min(15).max(120),
  scheduledAt: z.string().datetime('Valid datetime is required'),
  notes: z.string().optional(),
})

// Quiz schemas
export const quizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['TECHNICAL', 'BEHAVIORAL', 'INDUSTRY_SPECIFIC']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    options: z.array(z.string()).min(2, 'At least 2 options required'),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    explanation: z.string().optional(),
  })).min(1, 'At least one question is required'),
  timeLimit: z.number().min(1).optional(),
})

export const quizAttemptSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.array(z.object({
    questionIndex: z.number(),
    answer: z.string(),
  })),
})

// Payment schemas
export const paymentSchema = z.object({
  type: z.enum(['JOB_FEATURE', 'SUBSCRIPTION', 'REFERRAL_PAYOUT']),
  amount: z.number().min(0),
  currency: z.string().default('INR'),
  planId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Company schemas
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  location: z.string().min(1, 'Location is required'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  industry: z.string().optional(),
})

// Profile schemas
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  experience: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  preferences: z.object({
    jobTypes: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])).optional(),
    locations: z.array(z.string()).optional(),
    remote: z.boolean().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
  }).optional(),
})