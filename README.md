# 🚀 Job Portal - AI-Powered Recruitment Platform

A comprehensive, production-ready job portal built with Next.js 14, featuring AI-powered matching, expert consulting, commission-based payments, and a complete demo database for client presentations.

## ✨ Features

### 🎭 **NEW: AI-Powered Demo Database**
- **Client presentation ready** with realistic demo data
- **37+ users** across all roles (Candidates, Recruiters, Experts, Admins)
- **25+ job postings** with AI-generated descriptions
- **65+ applications** with intelligent skill matching (60-95% scores)
- **15+ companies** across diverse industries
- **Expert consulting sessions** with ratings and feedback
- **Referral system** with tracking and rewards
- **Interview scheduling** with automated confirmations
- **Professional demo dashboard** at `/demo`

### 🔐 Authentication & Roles
- **Multi-role system**: Candidate, Recruiter, Admin, Expert
- **Google OAuth** and **Email login** with NextAuth.js
- **Role-based access control** with secure dashboards
- **Account suspension** and user management

### 💼 Job Management
- **CRUD operations** for job postings
- **Advanced search** with PostgreSQL full-text search
- **Smart filtering** by location, type, salary, experience
- **Job views tracking** and analytics
- **Featured jobs** with payment integration

### 🎯 AI-Powered Matching & Intelligence
- **Advanced skill matching** with 60-95% accuracy scores
- **Deterministic algorithms** for consistent results
- **AI-generated job descriptions** and candidate profiles
- **Smart candidate recommendations** for recruiters
- **Dropout prediction** and candidate flagging
- **Intelligent application filtering** by match scores
- **Future-ready** for embeddings and NLP integration

### 📄 Resume Builder
- **Interactive form builder** with live preview
- **PDF generation** with html2pdf/jsPDF
- **Multiple resume management**
- **S3/R2 storage** for PDFs
- **Download tracking** and analytics

### 🤝 Refer & Earn System
- **Unique referral links** generation
- **Status tracking**: Pending → Interview → Placed
- **Automated payouts** with commission tracking
- **Email notifications** for referral updates

### 💳 Payment Integration
- **Razorpay** and **Stripe** support with feature flags
- **Job featuring** and subscription plans
- **Commission-based payments** for companies
- **Payment tracking** and audit logs

### 📅 Interview Management
- **Automated scheduling** with email confirmations
- **Interview types**: Video, Phone, In-person, Technical
- **Reminder emails** and status tracking
- **Feedback collection** and ratings

### 🧠 AI Quiz System
- **Interview preparation** quizzes
- **Multiple categories**: Technical, Behavioral, Industry-specific
- **Difficulty levels** and time limits
- **Score tracking** and detailed results

### 👨‍🏫 Expert Consulting
- **Expert community** with verification system
- **Rate-based** and **free consultation** minutes
- **Session booking** and management
- **Rating and feedback** system

### 💬 Real-time Messaging
- **Pusher/Socket.IO** integration
- **Recruiter ↔ Candidate** communication
- **Message notifications** and read status
- **File sharing** capabilities

### 📊 Advanced Admin Panel
- **Real-time analytics** with live statistics
- **User management** with role assignment and suspension
- **Feature flag** toggles for modular functionality
- **Data export** (CSV/PDF) for users, jobs, applications
- **Comprehensive audit logs** with IP tracking
- **System health monitoring** and API status
- **Commission tracking** and payout management
- **Activity feed** with detailed user actions

### 🔒 Security & Compliance
- **Role-based access control**
- **HTTPS-only** in production
- **Input sanitization** and validation
- **Signed S3 URLs** for secure file access
- **Rate limiting** and DDoS protection
- **Audit logging** for all actions

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **React Hook Form** with Zod validation

### Backend
- **Next.js Route Handlers** (API routes)
- **Clean architecture** for future NestJS extraction
- **PostgreSQL** with Prisma ORM
- **Real-time** with Pusher/Socket.IO

### Infrastructure
- **Vercel** deployment ready
- **PostgreSQL** (Railway/Supabase)
- **S3/Cloudflare R2** for file storage
- **Resend** for email delivery
- **Redis** for caching (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- AWS S3 or Cloudflare R2 account
- Resend account for emails

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd job-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with basic data
npm run db:seed

# OR: Create AI-powered demo database for presentations
npm run demo-seed

# Generate additional AI data
npm run generate-ai-data
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 🎬 **Demo & Presentation Mode**

For client presentations and demos:

```bash
# Create comprehensive demo database
npm run demo-seed

# Access demo dashboard
open http://localhost:3000/demo

# View presentation guide
open CLIENT_PRESENTATION_GUIDE.md
```

**Demo Accounts:**
- **Admin**: `admin@jobportal.com`
- **Recruiter**: `sarah.johnson@techcorp.com`
- **Candidate**: `priya.sharma@email.com`
- **Expert**: `rajesh.kumar@expert.com`

## 📁 Project Structure

```
job-portal/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── applications/  # Application management
│   │   ├── interviews/    # Interview scheduling
│   │   ├── jobs/          # Job management
│   │   ├── quizzes/       # Quiz system
│   │   ├── experts/       # Expert consulting
│   │   └── referrals/     # Referral system
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   └── jobs/              # Public job pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   └── forms/            # Form components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   ├── email.ts          # Email utilities
│   ├── audit.ts          # Audit logging
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Basic database seeding
│   └── demo-seed.ts      # AI-powered demo database
├── scripts/              # Utility scripts
│   ├── generate-ai-data.ts    # AI data generation
│   └── check-api-health.ts    # API health monitoring
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔧 Configuration

### Database Schema
The application uses a comprehensive PostgreSQL schema with:
- **User management** with roles, profiles, and expert capabilities
- **Company profiles** with verification and branding
- **Job postings** with AI-powered skill matching
- **Application tracking** with match scores and status management
- **Interview scheduling** with automated confirmations
- **Expert consulting** system with session management
- **Quiz and assessment** management with scoring
- **Referral system** with commission tracking
- **Payment processing** with multiple providers
- **Comprehensive audit logging** for compliance
- **Real-time notifications** and messaging

### Feature Flags
Control features via environment variables or admin panel:
- `ENABLE_PAYMENTS` - Payment system (Razorpay/Stripe)
- `ENABLE_COMMISSIONS` - Commission tracking and payouts
- `ENABLE_EXPERT_CONSULTING` - Expert consulting system
- `ENABLE_INTERVIEW_SCHEDULING` - Interview management
- `ENABLE_QUIZ_SYSTEM` - Quiz and assessment functionality
- `ENABLE_REFERRALS` - Referral system with rewards
- `ENABLE_AI_MATCHING` - AI-powered skill matching
- `ENABLE_REAL_TIME_MESSAGING` - Live chat functionality

### Email Templates
Automated emails for:
- Interview confirmations and reminders
- Application status updates
- Referral notifications
- Expert consultation bookings
- Payment confirmations

## 📊 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

#### Jobs
- `GET /api/jobs/search` - Advanced job search
- `POST /api/jobs` - Create job posting
- `GET /api/jobs/[id]` - Get job details
- `PATCH /api/jobs/[id]` - Update job

#### Applications
- `GET /api/applications` - Get applications
- `POST /api/applications` - Apply to job
- `PATCH /api/applications` - Update status

#### Interviews
- `GET /api/interviews` - Get interviews
- `POST /api/interviews` - Schedule interview
- `PATCH /api/interviews/[id]` - Update interview

#### Expert Consulting
- `GET /api/experts` - List experts
- `POST /api/consulting` - Book session
- `GET /api/consulting` - Get sessions

#### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/activity` - Activity feed
- `GET /api/admin/export/[type]` - Export data (users/jobs/applications)
- `PATCH /api/admin/feature-flags` - Toggle features
- `GET /api/admin/health` - System health check
- `POST /api/admin/users/[id]/suspend` - User management

## 🧪 Testing & Health Monitoring

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Check API health
npm run health-check

# Validate demo data
npm run demo-seed
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed basic data
npm run demo-seed      # Create AI-powered demo database
npm run generate-ai-data # Generate additional AI data

# Utilities
npm run health-check   # Check API health
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
```

### Database Migration
```bash
# Production migration
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## 🔐 Security Considerations

- **Environment variables** for sensitive data
- **Input validation** with Zod schemas
- **SQL injection** prevention with Prisma
- **XSS protection** with input sanitization
- **CSRF protection** with NextAuth.js
- **Rate limiting** on API endpoints
- **Audit logging** for compliance
- **Role-based access** control

## 🎬 Client Presentation Features

### **Demo Dashboard** (`/demo`)
Professional presentation interface showcasing:
- **Live statistics** with real-time data
- **Featured jobs** with company branding
- **Top candidates** with skill badges
- **Recent applications** with match scores
- **Quick navigation** to all user roles

### **Realistic Demo Data**
- **15+ Companies** across Tech, Fintech, Healthcare industries
- **25+ Job postings** with AI-generated descriptions
- **20+ Candidate profiles** with diverse skill sets
- **65+ Applications** with intelligent match scores (60-95%)
- **Expert consulting** sessions with ratings
- **Interview scheduling** with various formats
- **Referral campaigns** with tracking

### **Multi-Role Demonstrations**
- **Admin Panel**: Platform management and analytics
- **Recruiter Dashboard**: Candidate management and hiring
- **Candidate Experience**: Job search and applications
- **Expert Consulting**: Career guidance and mentoring

### **Business Intelligence**
- **Real-time analytics** with user growth metrics
- **Commission tracking** for successful placements
- **Performance insights** and ROI calculations
- **Automated reporting** with data export

## 📈 Performance Optimization

- **Database indexing** for search queries
- **Image optimization** with Next.js
- **Caching** with Redis (optional)
- **CDN** for static assets
- **Lazy loading** for components
- **API response** optimization
- **AI-powered matching** with efficient algorithms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints
- Examine the database schema

## 🎯 Roadmap

### ✅ **Recently Completed**
- [x] AI-powered demo database for client presentations
- [x] Advanced skill matching with percentage scores
- [x] Expert consulting system with session management
- [x] Comprehensive admin panel with real-time analytics
- [x] Automated interview scheduling with email confirmations
- [x] Commission tracking and payout management
- [x] Referral system with unique codes and rewards
- [x] Professional demo dashboard and presentation guide

### 🚧 **In Progress**
- [ ] Real-time messaging with Pusher/Socket.IO
- [ ] Advanced ATS integrations (Workday, BambooHR)
- [ ] Mobile app with React Native

### 📋 **Planned Features**
- [ ] Machine learning recommendations with embeddings
- [ ] Video interview integration (Zoom/Teams)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics with custom reports
- [ ] Blockchain-based credential verification
- [ ] AI-powered resume parsing and analysis
- [ ] Automated background check integrations

---

Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.