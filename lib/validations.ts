import { z } from 'zod'

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN']),
})

// Profile schemas
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  experience: z.number().min(0).max(50).optional(),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed'),
})

// Company schemas
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  size: z.string().optional(),
  industry: z.string().optional(),
})

// Job schemas
export const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
  responsibilities: z.string().min(20, 'Responsibilities must be at least 20 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  location: z.string().min(1, 'Location is required'),
  remote: z.boolean(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().default('INR'),
})

export const jobSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
})

// Application schemas
export const applicationSchema = z.object({
  jobId: z.string(),
  resumeId: z.string().optional(),
  coverLetter: z.string().max(1000, 'Cover letter must be less than 1000 characters').optional(),
})

// Resume schemas
export const resumePersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().min(1, 'Location is required'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
})

export const resumeExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(1, 'Description is required'),
})

export const resumeEducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  grade: z.string().optional(),
})

export const resumeProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const resumeSchema = z.object({
  title: z.string().min(1, 'Resume title is required'),
  personalInfo: resumePersonalInfoSchema,
  summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
  experience: z.array(resumeExperienceSchema),
  education: z.array(resumeEducationSchema),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  projects: z.array(resumeProjectSchema).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    url: z.string().optional(),
  })).optional(),
  languages: z.array(z.object({
    name: z.string(),
    proficiency: z.enum(['Basic', 'Intermediate', 'Advanced', 'Native']),
  })).optional(),
})

// Message schemas
export const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
})

// Referral schemas
export const referralSchema = z.object({
  jobId: z.string(),
  email: z.string().email('Invalid email address').optional(),
})

// Payment schemas
export const paymentSchema = z.object({
  planId: z.string(),
  type: z.enum(['JOB_FEATURE', 'SUBSCRIPTION']),
})