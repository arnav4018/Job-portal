import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Creating admin account...')

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@jobportal.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email: 'admin@jobportal.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        image: 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=AD',
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            bio: 'System Administrator managing the job portal platform',
            location: 'Bangalore, India',
            phone: '+91-9999999999',
            website: 'https://jobportal.com',
          }
        }
      },
      include: {
        profile: true,
      }
    })

    console.log('✅ Admin account created successfully!')
    console.log('📧 Email: admin@jobportal.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role: ADMIN')
    console.log('')
    console.log('You can now sign in with these credentials.')

    // Create a recruiter admin account too
    const recruiterAdmin = await prisma.user.upsert({
      where: { email: 'recruiter@jobportal.com' },
      update: {
        password: hashedPassword,
        role: 'RECRUITER',
        status: 'ACTIVE',
      },
      create: {
        email: 'recruiter@jobportal.com',
        name: 'Recruiter Admin',
        password: hashedPassword,
        role: 'RECRUITER',
        status: 'ACTIVE',
        image: 'https://via.placeholder.com/150x150/059669/FFFFFF?text=RA',
        profile: {
          create: {
            firstName: 'Recruiter',
            lastName: 'Admin',
            bio: 'Senior Recruiter managing talent acquisition',
            location: 'Mumbai, India',
            phone: '+91-8888888888',
            website: 'https://jobportal.com',
          }
        },
        company: {
          create: {
            name: 'JobPortal Recruiting',
            description: 'Official recruiting team for JobPortal platform',
            website: 'https://jobportal.com',
            location: 'Mumbai, India',
            size: '11-50',
            industry: 'Recruiting',
            verified: true,
          }
        }
      },
      include: {
        profile: true,
        company: true,
      }
    })

    console.log('✅ Recruiter admin account created successfully!')
    console.log('📧 Email: recruiter@jobportal.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role: RECRUITER')

  } catch (error) {
    console.error('❌ Error creating admin accounts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()