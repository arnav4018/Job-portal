import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create system settings
  const systemSettings = [
    { key: 'ENABLE_PAYMENTS', value: 'false', type: 'boolean' },
    { key: 'PAYMENT_PROVIDER', value: 'razorpay', type: 'string' },
    { key: 'REFERRAL_REWARD', value: '1000', type: 'number' },
    { key: 'JOB_FEATURE_PRICE', value: '500', type: 'number' },
    { key: 'MAX_RESUMES_PER_USER', value: '5', type: 'number' },
    { key: 'SITE_NAME', value: 'JobPortal Pro', type: 'string' },
    { key: 'ADMIN_EMAIL', value: 'admin@jobportal.com', type: 'string' },
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  // Create payment plans
  const paymentPlans = [
    {
      name: 'Basic',
      description: 'Feature 1 job for 30 days',
      price: 500,
      duration: 30,
      features: JSON.stringify({ featuredJobs: 1, priority: 'normal' }),
    },
    {
      name: 'Pro',
      description: 'Feature 5 jobs for 30 days + priority support',
      price: 2000,
      duration: 30,
      features: JSON.stringify({ featuredJobs: 5, priority: 'high', support: true }),
    },
    {
      name: 'Enterprise',
      description: 'Unlimited featured jobs + premium features',
      price: 5000,
      duration: 30,
      features: JSON.stringify({ featuredJobs: -1, priority: 'highest', support: true, analytics: true }),
    },
  ]

  for (const plan of paymentPlans) {
    await prisma.paymentPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jobportal.com' },
    update: {},
    create: {
      email: 'admin@jobportal.com',
      name: 'Admin User',
      role: 'ADMIN',
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
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Recruiter',
          bio: 'Senior Technical Recruiter at TechCorp',
          linkedin: 'https://linkedin.com/in/johnrecruiter',
        },
      },
      company: {
        create: {
          name: 'TechCorp Solutions',
          description: 'Leading technology solutions provider',
          website: 'https://techcorp.com',
          location: 'Bangalore, India',
          size: '100-500',
          industry: 'Technology',
          verified: true,
        },
      },
    },
  })

  // Create sample candidate
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      email: 'candidate@example.com',
      name: 'Jane Developer',
      role: 'CANDIDATE',
      profile: {
        create: {
          firstName: 'Jane',
          lastName: 'Developer',
          bio: 'Full-stack developer with 3 years of experience',
          location: 'Mumbai, India',
          experience: 3,
          skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL']),
          linkedin: 'https://linkedin.com/in/janedeveloper',
          github: 'https://github.com/janedeveloper',
        },
      },
    },
  })

  // Get company for job creation
  const company = await prisma.company.findFirst({
    where: { userId: recruiter.id },
  })

  if (company) {
    // Create sample jobs
    const jobs = [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for a senior full-stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
        requirements: '5+ years of experience in React, Node.js, and PostgreSQL. Strong understanding of software development principles.',
        responsibilities: 'Lead development of web applications, mentor junior developers, collaborate with product team, ensure code quality.',
        skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS']),
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'SENIOR',
        location: 'Bangalore, India',
        remote: true,
        salaryMin: 1200000,
        salaryMax: 2000000,
        companyId: company.id,
        recruiterId: recruiter.id,
      },
      {
        title: 'Frontend Developer',
        description: 'Join our frontend team to build amazing user experiences with modern web technologies.',
        requirements: '2+ years of experience in React and modern JavaScript. Good understanding of responsive design.',
        responsibilities: 'Develop responsive web applications, collaborate with designers, optimize performance, write clean code.',
        skills: JSON.stringify(['React', 'JavaScript', 'CSS', 'HTML', 'Git']),
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'MID',
        location: 'Mumbai, India',
        remote: false,
        salaryMin: 800000,
        salaryMax: 1200000,
        companyId: company.id,
        recruiterId: recruiter.id,
      },
      {
        title: 'DevOps Engineer',
        description: 'Help us scale our infrastructure and improve deployment processes with modern DevOps practices.',
        requirements: '3+ years of experience with AWS, Docker, and Kubernetes. Strong Linux skills.',
        responsibilities: 'Manage cloud infrastructure, automate deployments, monitor system performance, ensure security.',
        skills: JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux']),
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'MID',
        location: 'Hyderabad, India',
        remote: true,
        salaryMin: 1000000,
        salaryMax: 1500000,
        companyId: company.id,
        recruiterId: recruiter.id,
        featured: true,
        featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    ]

    for (const jobData of jobs) {
      await prisma.job.create({
        data: jobData,
      })
    }
  }

  // Create sample resume for candidate
  const resumeData = {
    personalInfo: {
      firstName: 'Jane',
      lastName: 'Developer',
      email: 'candidate@example.com',
      phone: '+91 9876543210',
      location: 'Mumbai, India',
      linkedin: 'https://linkedin.com/in/janedeveloper',
      github: 'https://github.com/janedeveloper',
    },
    summary: 'Passionate full-stack developer with 3 years of experience building scalable web applications.',
    experience: [
      {
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        startDate: '2021-06',
        endDate: '2024-01',
        description: 'Developed and maintained web applications using React, Node.js, and PostgreSQL.',
      },
    ],
    education: [
      {
        institution: 'Mumbai University',
        degree: 'Bachelor of Engineering in Computer Science',
        startDate: '2017-06',
        endDate: '2021-05',
        grade: '8.5 CGPA',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Git'],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with React and Node.js',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        url: 'https://github.com/janedeveloper/ecommerce',
      },
    ],
  }

  await prisma.resume.create({
    data: {
      userId: candidate.id,
      title: 'Jane Developer - Full Stack Developer',
      data: JSON.stringify(resumeData),
      isDefault: true,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin: admin@jobportal.com')
  console.log('👨‍💼 Recruiter: recruiter@techcorp.com')
  console.log('👩‍💻 Candidate: candidate@example.com')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })