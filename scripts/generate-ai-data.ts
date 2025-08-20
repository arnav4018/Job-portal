#!/usr/bin/env tsx

/**
 * AI-Powered Demo Data Generator
 * Generates realistic job portal data for client presentations
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// AI-generated realistic data sets
const aiGeneratedData = {
  techSkills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins',
    'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'GraphQL', 'REST APIs',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'Prototyping'
  ],

  jobTitles: [
    'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Data Scientist', 'Machine Learning Engineer', 'AI Research Scientist', 'Data Analyst',
    'DevOps Engineer', 'Cloud Architect', 'Site Reliability Engineer', 'Platform Engineer',
    'Mobile App Developer', 'iOS Developer', 'Android Developer', 'React Native Developer',
    'UI/UX Designer', 'Product Designer', 'Visual Designer', 'UX Researcher',
    'Product Manager', 'Technical Product Manager', 'Engineering Manager', 'Team Lead',
    'QA Engineer', 'Test Automation Engineer', 'Security Engineer', 'Blockchain Developer'
  ],

  companyNames: [
    'TechCorp Solutions', 'InnovateLabs', 'DataDriven Inc', 'CloudScale Systems',
    'NextGen Robotics', 'AI Dynamics', 'QuantumSoft', 'CyberSecure Pro',
    'FinTech Innovations', 'HealthTech Solutions', 'EduTech Platform', 'GreenTech Ventures',
    'SmartCity Systems', 'IoT Solutions Ltd', 'Blockchain Ventures', 'AR/VR Studios'
  ],

  industries: [
    'Technology', 'Fintech', 'Healthcare', 'Education', 'E-commerce',
    'Gaming', 'Cybersecurity', 'Artificial Intelligence', 'Blockchain',
    'IoT', 'Robotics', 'Clean Energy', 'Transportation', 'Media'
  ],

  locations: [
    'Bangalore, India', 'Mumbai, India', 'Hyderabad, India', 'Pune, India',
    'Chennai, India', 'Delhi, India', 'Gurgaon, India', 'Noida, India',
    'Kolkata, India', 'Ahmedabad, India', 'Kochi, India', 'Jaipur, India'
  ],

  candidateNames: [
    'Priya Sharma', 'Rahul Patel', 'Anita Desai', 'Vikram Singh', 'Sneha Reddy',
    'Arjun Gupta', 'Kavya Nair', 'Rohit Agarwal', 'Pooja Joshi', 'Amit Kumar',
    'Divya Iyer', 'Karthik Rao', 'Neha Bansal', 'Sanjay Mehta', 'Ritu Verma',
    'Arun Krishnan', 'Swati Pandey', 'Manish Tiwari', 'Shreya Ghosh', 'Varun Malhotra'
  ],

  recruiterNames: [
    'Sarah Johnson', 'Michael Chen', 'Priya Kapoor', 'David Wilson', 'Lisa Anderson',
    'Rajesh Gupta', 'Emily Davis', 'Arjun Sharma', 'Jessica Brown', 'Kiran Patel'
  ],

  expertNames: [
    'Dr. Rajesh Kumar', 'Meera Agarwal', 'Prof. Suresh Nair', 'Ananya Krishnan',
    'Vikash Sharma', 'Deepika Rao', 'Sandeep Joshi', 'Priyanka Gupta'
  ]
}

function generateRealisticBio(role: string, skills: string[], experience: number): string {
  const templates = {
    CANDIDATE: [
      `Passionate ${role.toLowerCase()} with ${experience} years of experience in ${skills.slice(0, 3).join(', ')}. Love building scalable applications and learning new technologies.`,
      `Experienced professional specializing in ${skills[0]} and ${skills[1]}. ${experience}+ years of hands-on experience in software development.`,
      `Results-driven developer with expertise in ${skills.slice(0, 2).join(' and ')}. Proven track record of delivering high-quality solutions.`
    ],
    RECRUITER: [
      `Senior Technical Recruiter with ${experience} years of experience in tech hiring. Specialized in finding top talent for ${skills[0]} and ${skills[1]} roles.`,
      `Experienced talent acquisition specialist focusing on technical roles. ${experience}+ years of building high-performing engineering teams.`
    ],
    EXPERT: [
      `Industry expert with ${experience} years of experience in ${skills[0]} and ${skills[1]}. Passionate about mentoring and career development.`,
      `Senior consultant specializing in ${skills.slice(0, 2).join(' and ')}. Helping professionals advance their careers in tech.`
    ]
  }
  
  const roleTemplates = templates[role as keyof typeof templates] || templates.CANDIDATE
  return roleTemplates[Math.floor(Math.random() * roleTemplates.length)]
}

function generateJobDescription(title: string, skills: string[]): {
  description: string
  requirements: string
  responsibilities: string
} {
  return {
    description: `We are looking for a talented ${title} to join our growing team. You will work on exciting projects using cutting-edge technologies including ${skills.slice(0, 3).join(', ')}. This is an excellent opportunity to grow your career in a dynamic environment.`,
    requirements: `Bachelor's degree in Computer Science or related field. 3+ years of experience with ${skills[0]} and ${skills[1]}. Strong problem-solving skills and ability to work in a fast-paced environment.`,
    responsibilities: `Develop and maintain applications using ${skills[0]}, collaborate with cross-functional teams, participate in code reviews, mentor junior developers, and contribute to technical decisions.`
  }
}

async function generateAIData() {
  console.log('🤖 Generating AI-powered realistic demo data...')

  // Generate additional companies
  for (let i = 0; i < 10; i++) {
    const companyName = aiGeneratedData.companyNames[i % aiGeneratedData.companyNames.length]
    const industry = aiGeneratedData.industries[Math.floor(Math.random() * aiGeneratedData.industries.length)]
    const location = aiGeneratedData.locations[Math.floor(Math.random() * aiGeneratedData.locations.length)]
    
    const recruiterName = aiGeneratedData.recruiterNames[i % aiGeneratedData.recruiterNames.length]
    const recruiterEmail = `${recruiterName.toLowerCase().replace(' ', '.')}@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`
    
    // Create recruiter
    const recruiter = await prisma.user.create({
      data: {
        email: recruiterEmail,
        name: recruiterName,
        role: 'RECRUITER',
        status: 'ACTIVE',
        image: `https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=${recruiterName.split(' ').map(n => n[0]).join('')}`,
        profile: {
          create: {
            firstName: recruiterName.split(' ')[0],
            lastName: recruiterName.split(' ').slice(1).join(' '),
            bio: generateRealisticBio('RECRUITER', ['Technical Hiring', 'Talent Acquisition'], Math.floor(Math.random() * 8) + 3),
            location,
            experience: Math.floor(Math.random() * 8) + 3
          }
        }
      }
    })

    // Create company
    const company = await prisma.company.create({
      data: {
        userId: recruiter.id,
        name: companyName,
        description: `${industry} company focused on innovation and growth. We build cutting-edge solutions for modern businesses.`,
        website: `https://${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        location,
        size: ['11-50', '51-200', '201-500', '501-1000'][Math.floor(Math.random() * 4)],
        industry,
        verified: Math.random() > 0.2,
        logo: `https://via.placeholder.com/200x200/${['4F46E5', '059669', 'DC2626', '7C3AED', 'EA580C'][Math.floor(Math.random() * 5)]}/FFFFFF?text=${companyName.substring(0, 2)}`
      }
    })

    // Create 2-3 jobs per company
    for (let j = 0; j < Math.floor(Math.random() * 2) + 2; j++) {
      const jobTitle = aiGeneratedData.jobTitles[Math.floor(Math.random() * aiGeneratedData.jobTitles.length)]
      const relevantSkills = aiGeneratedData.techSkills
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 4)
      
      const jobDetails = generateJobDescription(jobTitle, relevantSkills)
      const experienceLevels = ['ENTRY', 'MID', 'SENIOR', 'LEAD']
      const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']
      
      await prisma.job.create({
        data: {
          title: jobTitle,
          description: jobDetails.description,
          requirements: jobDetails.requirements,
          responsibilities: jobDetails.responsibilities,
          skills: JSON.stringify(relevantSkills),
          type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
          status: Math.random() > 0.1 ? 'PUBLISHED' : 'DRAFT',
          experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
          location,
          remote: Math.random() > 0.4,
          salaryMin: Math.floor(Math.random() * 500000) + 500000,
          salaryMax: Math.floor(Math.random() * 1000000) + 1000000,
          currency: 'INR',
          featured: Math.random() > 0.7,
          featuredUntil: Math.random() > 0.5 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
          views: Math.floor(Math.random() * 1000) + 50,
          companyId: company.id,
          recruiterId: recruiter.id,
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        }
      })
    }
  }

  console.log('✅ AI-generated data created successfully!')
}

async function main() {
  await generateAIData()
}

main()
  .catch((e) => {
    console.error('❌ AI data generation failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })