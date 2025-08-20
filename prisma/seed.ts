import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jobportal.com' },
    update: {},
    create: {
      email: 'admin@jobportal.com',
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System Administrator',
        },
      },
    },
  })

  // Create sample recruiter
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter@techcorp.com',
      name: 'John Recruiter',
      role: 'RECRUITER',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Recruiter',
          bio: 'Senior Technical Recruiter',
        },
      },
    },
  })

  // Create sample company
  const company = await prisma.company.upsert({
    where: { userId: recruiter.id },
    update: {},
    create: {
      userId: recruiter.id,
      name: 'TechCorp Solutions',
      description: 'Leading technology solutions provider',
      website: 'https://techcorp.com',
      location: 'Bangalore, India',
      size: '201-500',
      industry: 'Technology',
      verified: true,
    },
  })

  // Create email templates
  const emailTemplates = [
    {
      name: 'new-application',
      subject: 'New Application for {{jobTitle}}',
      body: `
        <h2>New Job Application</h2>
        <p>Hello {{recruiterName}},</p>
        <p>You have received a new application for the position <strong>{{jobTitle}}</strong>.</p>
        <p><strong>Candidate:</strong> {{candidateName}}</p>
        <p><strong>Match Score:</strong> {{matchScore}}%</p>
        <p><a href="{{applicationUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application</a></p>
        <p>Best regards,<br>Job Portal Team</p>
      `,
      type: 'NEW_APPLICATION',
    },
    {
      name: 'interview-confirmation',
      subject: 'Interview Confirmation - {{jobTitle}}',
      body: `
        <h2>Interview Scheduled</h2>
        <p>Hello {{candidateName}},</p>
        <p>Your interview for <strong>{{jobTitle}}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> {{interviewDate}}</p>
        <p><strong>Time:</strong> {{interviewTime}}</p>
        <p><strong>Type:</strong> {{interviewType}}</p>
        <p><strong>Meeting Details:</strong> {{meetingLink}}</p>
        <p>Please be prepared and join on time. Good luck!</p>
        <p>Best regards,<br>Job Portal Team</p>
      `,
      type: 'INTERVIEW_CONFIRMATION',
    },
  ]

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
  }

  // Create feature flags
  const featureFlags = [
    { key: 'payments_enabled', enabled: true, description: 'Enable payment system' },
    { key: 'commissions_enabled', enabled: true, description: 'Enable commission tracking' },
    { key: 'expert_consulting_enabled', enabled: true, description: 'Enable expert consulting' },
    { key: 'interview_scheduling_enabled', enabled: true, description: 'Enable interview scheduling' },
    { key: 'quiz_system_enabled', enabled: true, description: 'Enable quiz system' },
  ]

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    })
  }

  // Create sample quiz
  const sampleQuiz = {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    category: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    questions: JSON.stringify([
      {
        question: 'What is the difference between let and var in JavaScript?',
        options: [
          'No difference',
          'let has block scope, var has function scope',
          'var has block scope, let has function scope',
          'Both have global scope'
        ],
        correctAnswer: 'let has block scope, var has function scope',
        explanation: 'let declarations are block-scoped, while var declarations are function-scoped or globally-scoped.'
      },
      {
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()',
        explanation: 'The push() method adds one or more elements to the end of an array and returns the new length of the array.'
      }
    ]),
    timeLimit: 30,
    isActive: true,
  }

  // Check if quiz already exists
  const existingQuiz = await prisma.quiz.findFirst({
    where: { title: sampleQuiz.title }
  })
  
  if (!existingQuiz) {
    await prisma.quiz.create({
      data: sampleQuiz,
    })
  }

  // Create sample FAQs
  const sampleFAQs = [
    {
      question: 'What should I expect during a technical interview?',
      answer: 'Technical interviews typically include coding challenges, system design questions, and discussions about your past projects. Be prepared to write code, explain your thought process, and discuss trade-offs in your solutions.',
      category: 'TECHNICAL',
      order: 1,
    },
    {
      question: 'How should I prepare for a behavioral interview?',
      answer: 'Prepare specific examples using the STAR method (Situation, Task, Action, Result). Focus on leadership, teamwork, problem-solving, and conflict resolution experiences.',
      category: 'INTERVIEW',
      order: 2,
    },
  ]

  for (const faq of sampleFAQs) {
    const existingFAQ = await prisma.fAQ.findFirst({
      where: { question: faq.question }
    })
    
    if (!existingFAQ) {
      await prisma.fAQ.create({
        data: faq,
      })
    }
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })