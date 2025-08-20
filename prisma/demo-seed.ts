import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Demo data for AI-powered job portal presentation
const demoData = {
  companies: [
    {
      name: 'TechCorp Solutions',
      description: 'Leading AI and machine learning company specializing in enterprise solutions',
      website: 'https://techcorp.com',
      location: 'Bangalore, India',
      size: '201-500',
      industry: 'Technology',
      logo: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=TC'
    },
    {
      name: 'InnovateLabs',
      description: 'Cutting-edge fintech startup revolutionizing digital payments',
      website: 'https://innovatelabs.com',
      location: 'Mumbai, India',
      size: '51-200',
      industry: 'Fintech',
      logo: 'https://via.placeholder.com/200x200/059669/FFFFFF?text=IL'
    },
    {
      name: 'DataDriven Inc',
      description: 'Data analytics and business intelligence solutions provider',
      website: 'https://datadriven.com',
      location: 'Hyderabad, India',
      size: '101-200',
      industry: 'Analytics',
      logo: 'https://via.placeholder.com/200x200/DC2626/FFFFFF?text=DD'
    },
    {
      name: 'CloudScale Systems',
      description: 'Cloud infrastructure and DevOps automation specialists',
      website: 'https://cloudscale.com',
      location: 'Pune, India',
      size: '51-100',
      industry: 'Cloud Computing',
      logo: 'https://via.placeholder.com/200x200/7C3AED/FFFFFF?text=CS'
    },
    {
      name: 'NextGen Robotics',
      description: 'Robotics and automation solutions for manufacturing',
      website: 'https://nextgenrobotics.com',
      location: 'Chennai, India',
      size: '101-200',
      industry: 'Robotics',
      logo: 'https://via.placeholder.com/200x200/EA580C/FFFFFF?text=NR'
    }
  ],
  
  users: [
    // Recruiters
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      role: 'RECRUITER',
      profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+91-9876543210',
        location: 'Bangalore, India',
        bio: 'Senior Technical Recruiter with 8+ years of experience in tech hiring',
        linkedin: 'https://linkedin.com/in/sarah-johnson',
        experience: 8
      }
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@innovatelabs.com',
      role: 'RECRUITER',
      profile: {
        firstName: 'Michael',
        lastName: 'Chen',
        phone: '+91-9876543211',
        location: 'Mumbai, India',
        bio: 'Fintech recruitment specialist focusing on blockchain and AI talent',
        linkedin: 'https://linkedin.com/in/michael-chen',
        experience: 6
      }
    }
  ]
}

async function main() {
  console.log('🎭 Creating AI-powered demo database for client presentation...')
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jobportal.com' },
    update: {},
    create: {
      email: 'admin@jobportal.com',
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      image: 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=AD',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System Administrator managing the job portal platform',
          location: 'Bangalore, India',
          phone: '+91-9999999999'
        }
      }
    }
  })

  // Create recruiters and companies
  const recruiters = []
  for (let i = 0; i < demoData.companies.length; i++) {
    const companyData = demoData.companies[i]
    const userData = demoData.users[i % demoData.users.length]
    
    const recruiter = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: 'RECRUITER',
        status: 'ACTIVE',
        image: `https://via.placeholder.com/150x150/10B981/FFFFFF?text=${userData.profile.firstName.charAt(0)}${userData.profile.lastName.charAt(0)}`,
        profile: {
          create: userData.profile
        }
      }
    })
    
    const company = await prisma.company.upsert({
      where: { userId: recruiter.id },
      update: {},
      create: {
        userId: recruiter.id,
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        location: companyData.location,
        size: companyData.size,
        industry: companyData.industry,
        logo: companyData.logo,
        verified: true
      }
    })
    
    recruiters.push({ recruiter, company })
  }
  
  // Create diverse candidate profiles
  const candidateProfiles = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      profile: {
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '+91-8765432109',
        location: 'Bangalore, India',
        bio: 'Full-stack developer with expertise in React, Node.js, and cloud technologies',
        linkedin: 'https://linkedin.com/in/priya-sharma',
        github: 'https://github.com/priya-sharma',
        experience: 4,
        skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker'])
      }
    },
    {
      name: 'Rahul Patel',
      email: 'rahul.patel@email.com',
      profile: {
        firstName: 'Rahul',
        lastName: 'Patel',
        phone: '+91-8765432108',
        location: 'Mumbai, India',
        bio: 'Data scientist passionate about machine learning and AI applications',
        linkedin: 'https://linkedin.com/in/rahul-patel',
        github: 'https://github.com/rahul-patel',
        experience: 3,
        skills: JSON.stringify(['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Scikit-learn'])
      }
    },
    {
      name: 'Anita Desai',
      email: 'anita.desai@email.com',
      profile: {
        firstName: 'Anita',
        lastName: 'Desai',
        phone: '+91-8765432107',
        location: 'Hyderabad, India',
        bio: 'DevOps engineer specializing in cloud infrastructure and automation',
        linkedin: 'https://linkedin.com/in/anita-desai',
        github: 'https://github.com/anita-desai',
        experience: 5,
        skills: JSON.stringify(['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Python'])
      }
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      profile: {
        firstName: 'Vikram',
        lastName: 'Singh',
        phone: '+91-8765432106',
        location: 'Pune, India',
        bio: 'Mobile app developer with expertise in React Native and Flutter',
        linkedin: 'https://linkedin.com/in/vikram-singh',
        github: 'https://github.com/vikram-singh',
        experience: 3,
        skills: JSON.stringify(['React Native', 'Flutter', 'JavaScript', 'Dart', 'Firebase', 'iOS'])
      }
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      profile: {
        firstName: 'Sneha',
        lastName: 'Reddy',
        phone: '+91-8765432105',
        location: 'Chennai, India',
        bio: 'UI/UX designer with a passion for creating intuitive user experiences',
        linkedin: 'https://linkedin.com/in/sneha-reddy',
        experience: 4,
        skills: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'HTML/CSS'])
      }
    }
  ]

  const candidates = []
  for (const candidateData of candidateProfiles) {
    const candidate = await prisma.user.create({
      data: {
        email: candidateData.email,
        name: candidateData.name,
        role: 'CANDIDATE',
        status: 'ACTIVE',
        image: `https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=${candidateData.profile.firstName.charAt(0)}${candidateData.profile.lastName.charAt(0)}`,
        profile: {
          create: candidateData.profile
        }
      },
      include: {
        profile: true
      }
    })
    candidates.push(candidate)
  }

  // Create diverse job postings
  const jobPostings = [
    {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
      requirements: 'Bachelor\'s degree in Computer Science or related field. 4+ years of experience in full-stack development. Proficiency in React, Node.js, and database technologies.',
      responsibilities: 'Develop and maintain web applications, collaborate with cross-functional teams, write clean and efficient code, participate in code reviews.',
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker']),
      type: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      location: 'Bangalore, India',
      remote: true,
      salaryMin: 1200000,
      salaryMax: 1800000,
      currency: 'INR',
      featured: true,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Data Scientist - AI/ML',
      description: 'Join our AI team to work on cutting-edge machine learning projects. You will develop predictive models and work with large datasets to drive business insights.',
      requirements: 'Master\'s degree in Data Science, Statistics, or related field. 3+ years of experience in machine learning. Strong programming skills in Python.',
      responsibilities: 'Develop ML models, analyze large datasets, collaborate with product teams, present findings to stakeholders.',
      skills: JSON.stringify(['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Scikit-learn']),
      type: 'FULL_TIME',
      experienceLevel: 'MID',
      location: 'Mumbai, India',
      remote: false,
      salaryMin: 1000000,
      salaryMax: 1500000,
      currency: 'INR',
      featured: true,
      featuredUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'DevOps Engineer',
      description: 'We need a skilled DevOps Engineer to help us scale our infrastructure and improve our deployment processes.',
      requirements: 'Bachelor\'s degree in Engineering. 3+ years of experience in DevOps. Experience with AWS, Kubernetes, and CI/CD pipelines.',
      responsibilities: 'Manage cloud infrastructure, automate deployment processes, monitor system performance, ensure security compliance.',
      skills: JSON.stringify(['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Python']),
      type: 'FULL_TIME',
      experienceLevel: 'MID',
      location: 'Hyderabad, India',
      remote: true,
      salaryMin: 900000,
      salaryMax: 1400000,
      currency: 'INR',
      featured: false
    },
    {
      title: 'Mobile App Developer',
      description: 'Looking for a talented Mobile App Developer to create amazing mobile experiences for our users.',
      requirements: '2+ years of experience in mobile app development. Proficiency in React Native or Flutter. Experience with mobile app deployment.',
      responsibilities: 'Develop mobile applications, optimize app performance, work with designers, maintain app store presence.',
      skills: JSON.stringify(['React Native', 'Flutter', 'JavaScript', 'Dart', 'Firebase', 'iOS']),
      type: 'FULL_TIME',
      experienceLevel: 'MID',
      location: 'Pune, India',
      remote: false,
      salaryMin: 800000,
      salaryMax: 1200000,
      currency: 'INR',
      featured: false
    },
    {
      title: 'UI/UX Designer',
      description: 'We are seeking a creative UI/UX Designer to help us create beautiful and intuitive user interfaces.',
      requirements: 'Bachelor\'s degree in Design or related field. 3+ years of experience in UI/UX design. Proficiency in design tools like Figma, Adobe XD.',
      responsibilities: 'Create user interface designs, conduct user research, collaborate with development teams, maintain design systems.',
      skills: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'HTML/CSS']),
      type: 'FULL_TIME',
      experienceLevel: 'MID',
      location: 'Chennai, India',
      remote: true,
      salaryMin: 700000,
      salaryMax: 1100000,
      currency: 'INR',
      featured: false
    }
  ]

  const jobs = []
  for (let i = 0; i < jobPostings.length; i++) {
    const jobData = jobPostings[i]
    const { recruiter, company } = recruiters[i % recruiters.length]
    
    const job = await prisma.job.create({
      data: {
        ...jobData,
        companyId: company.id,
        recruiterId: recruiter.id,
        status: 'PUBLISHED',
        views: Math.floor(Math.random() * 500) + 50
      }
    })
    jobs.push(job)
  }
  
  // Create applications with realistic data
  const applications: any[] = []
  for (const job of jobs) {
    // Each job gets 3-5 applications
    const numApplications = Math.floor(Math.random() * 3) + 3
    const jobSkills = JSON.parse(job.skills || '[]')
    
    for (let i = 0; i < numApplications; i++) {
      const candidate = candidates[Math.floor(Math.random() * candidates.length)]
      
      // Check if candidate already applied to this job
      const existingApp = applications.find(app => 
        app.jobId === job.id && app.candidateId === candidate.id
      )
      if (existingApp) continue
      
      // Calculate skill match score
      const candidateSkills = JSON.parse(candidate.profile?.skills || '[]')
      const matchingSkills = jobSkills.filter((skill: string) => 
        candidateSkills.some((cSkill: string) => 
          cSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(cSkill.toLowerCase())
        )
      )
      const matchScore = jobSkills.length > 0 ? 
        Math.round((matchingSkills.length / jobSkills.length) * 100) : 0
      
      // Random application status
      const statuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'HIRED', 'REJECTED']
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          status,
          matchScore,
          appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          coverLetter: `I am excited to apply for the ${job.title} position. My experience in ${candidateSkills.slice(0, 3).join(', ')} makes me a strong candidate for this role.`,
          notes: status === 'REJECTED' ? 'Skills not matching requirements' : 
                 status === 'HIRED' ? 'Excellent candidate, great cultural fit' : 
                 'Under review'
        }
      })
      applications.push(application)
    }
  }

  // Create interviews for some applications
  const interviewApplications = applications.filter(app => 
    ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'HIRED'].includes(app.status)
  )
  
  for (const app of interviewApplications.slice(0, 10)) {
    const interviewTypes = ['VIDEO', 'PHONE', 'IN_PERSON', 'TECHNICAL']
    const type = interviewTypes[Math.floor(Math.random() * interviewTypes.length)]
    
    await prisma.interview.create({
      data: {
        applicationId: app.id,
        candidateId: app.candidateId,
        type,
        status: app.status === 'INTERVIEW_COMPLETED' || app.status === 'HIRED' ? 'COMPLETED' : 'SCHEDULED',
        scheduledAt: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        duration: type === 'TECHNICAL' ? 90 : 60,
        location: type === 'VIDEO' ? 'https://meet.google.com/abc-defg-hij' : 
                 type === 'PHONE' ? '+91-9876543210' : 'Office Conference Room A',
        confirmationSent: true,
        reminderSent: Math.random() > 0.5,
        notes: 'Standard interview process',
        rating: app.status === 'HIRED' ? 5 : Math.floor(Math.random() * 3) + 3
      }
    })
  }
  
  // Create expert profiles
  const expertData = [
    {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@expert.com',
      expertise: ['Career Guidance', 'Technical Leadership', 'Software Architecture'],
      bio: 'Former CTO with 15+ years of experience in tech industry. Specialized in helping engineers advance their careers.',
      experience: 15,
      ratePerMinute: 50,
      freeMinutes: 15
    },
    {
      name: 'Meera Agarwal',
      email: 'meera.agarwal@expert.com',
      expertise: ['Data Science', 'Machine Learning', 'AI Strategy'],
      bio: 'Data Science leader with expertise in ML and AI. Helping professionals transition into data roles.',
      experience: 12,
      ratePerMinute: 45,
      freeMinutes: 20
    }
  ]

  for (const expert of expertData) {
    const expertUser = await prisma.user.create({
      data: {
        email: expert.email,
        name: expert.name,
        role: 'EXPERT',
        status: 'ACTIVE',
        image: `https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=${expert.name.split(' ').map(n => n[0]).join('')}`,
        profile: {
          create: {
            firstName: expert.name.split(' ')[0],
            lastName: expert.name.split(' ').slice(1).join(' '),
            bio: expert.bio,
            experience: expert.experience
          }
        },
        expertProfile: {
          create: {
            expertise: JSON.stringify(expert.expertise),
            bio: expert.bio,
            experience: expert.experience,
            ratePerMinute: expert.ratePerMinute,
            freeMinutes: expert.freeMinutes,
            rating: 4.8,
            totalSessions: Math.floor(Math.random() * 100) + 50,
            isVerified: true,
            isAvailable: true
          }
        }
      },
      include: {
        expertProfile: true
      }
    })

    // Create some consulting sessions
    for (let i = 0; i < 3; i++) {
      const candidate = candidates[Math.floor(Math.random() * candidates.length)]
      await prisma.consultingSession.create({
        data: {
          expertId: expertUser.expertProfile!.id,
          clientId: candidate.id,
          duration: 30,
          rate: expert.ratePerMinute,
          totalAmount: expert.ratePerMinute * 30,
          status: 'COMPLETED',
          scheduledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          endedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          notes: 'Great session, provided valuable career guidance',
          rating: Math.floor(Math.random() * 2) + 4,
          feedback: 'Very helpful session, got clear direction for my career path'
        }
      })
    }
  }
  
  // Create referrals
  for (let i = 0; i < 5; i++) {
    const referrer = candidates[Math.floor(Math.random() * candidates.length)]
    const job = jobs[Math.floor(Math.random() * jobs.length)]
    const referred = candidates[Math.floor(Math.random() * candidates.length)]
    
    if (referrer.id !== referred.id) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: referred.id,
          jobId: job.id,
          code: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: ['PENDING', 'APPLIED', 'INTERVIEW', 'HIRED'][Math.floor(Math.random() * 4)],
          reward: 1000,
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        }
      })
    }
  }

  // Create quiz attempts
  const quizzes = await prisma.quiz.findMany()
  for (const quiz of quizzes) {
    for (let i = 0; i < 10; i++) {
      const candidate = candidates[Math.floor(Math.random() * candidates.length)]
      const score = Math.floor(Math.random() * 40) + 60 // 60-100% scores
      
      await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          userId: candidate.id,
          answers: JSON.stringify([
            { questionIndex: 0, answer: 'let has block scope, var has function scope' },
            { questionIndex: 1, answer: 'push()' }
          ]),
          score,
          timeSpent: Math.floor(Math.random() * 20) + 10,
          completedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
        }
      })
    }
  }

  // Create notifications
  const notificationTypes = [
    'APPLICATION_STATUS',
    'NEW_MESSAGE',
    'JOB_ALERT',
    'REFERRAL_UPDATE',
    'INTERVIEW_SCHEDULED',
    'CONSULTING_BOOKED'
  ]

  for (const candidate of candidates.slice(0, 3)) {
    for (let i = 0; i < 5; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      await prisma.notification.create({
        data: {
          userId: candidate.id,
          type,
          title: `${type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`,
          message: `You have a new ${type.toLowerCase().replace('_', ' ')} update`,
          read: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      })
    }
  }

  console.log('✅ AI-powered demo database created successfully!')
  console.log(`📊 Created:`)
  console.log(`   - ${recruiters.length} companies with recruiters`)
  console.log(`   - ${candidates.length} candidate profiles`)
  console.log(`   - ${jobs.length} job postings`)
  console.log(`   - ${applications.length} applications`)
  console.log(`   - Expert profiles with consulting sessions`)
  console.log(`   - Referrals and quiz attempts`)
  console.log(`   - Realistic notifications and activity`)
}

main()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })