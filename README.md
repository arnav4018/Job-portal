# JobPortal Pro - Production-Ready Job Portal

A comprehensive job portal web application built with Next.js 14, TypeScript, and modern web technologies. Features include job search, resume builder, AI skill matching, referral system, real-time messaging, and payment integration.

## 🚀 Features

### Core Features
- **Multi-role Authentication**: Candidate, Recruiter, and Admin dashboards
- **Advanced Job Search**: Full-text search with filters and sorting
- **Resume Builder**: Interactive resume builder with PDF export
- **AI Skill Matching**: Deterministic skill matching with compatibility scores
- **Real-time Messaging**: Chat between recruiters and candidates
- **Referral System**: Earn rewards by referring candidates
- **Payment Integration**: Razorpay/Stripe for job featuring and subscriptions
- **Admin Panel**: Complete admin dashboard with analytics and user management

### Technical Features
- **Next.js 14** with App Router and Server Components
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **NextAuth.js** for authentication (Google OAuth + Email Magic Links)
- **Tailwind CSS** + shadcn/ui for styling
- **S3/R2** for file storage
- **Pusher** for real-time features
- **Resend** for email notifications
- **Comprehensive API** with validation and error handling
- **Suspense Boundaries** for improved loading states
- **Metadata Configuration** for SEO optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Google OAuth + Email Magic Links)
- **File Storage**: AWS S3 / Cloudflare R2
- **Real-time**: Pusher
- **Email**: Resend
- **Payments**: Razorpay / Stripe
- **PDF Generation**: jsPDF + html2canvas

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- AWS S3 or Cloudflare R2 bucket
- Pusher account
- Resend account
- Razorpay or Stripe account (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd job-portal
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jobportal"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3 / Cloudflare R2
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="job-portal-files"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourjobportal.com"

# Real-time (Pusher)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="mt1"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
job-portal/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   │   ├── signup/route.ts    # User registration
│   │   │   └── [...nextauth]/route.ts # NextAuth configuration
│   │   ├── jobs/         # Job management
│   │   ├── applications/ # Application handling
│   │   ├── resumes/      # Resume management
│   │   └── dashboard/    # Dashboard APIs
│   ├── auth/              # Authentication pages
│   │   ├── signin/       # Sign in page with Suspense
│   │   ├── signup/       # Sign up page with Suspense
│   │   ├── signin-content.tsx # Sign in form component
│   │   └── signup-content.tsx # Sign up form component
│   ├── jobs/              # Job-related pages
│   ├── candidate/         # Candidate dashboard
│   ├── recruiter/         # Recruiter dashboard
│   ├── admin/             # Admin dashboard
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout with metadata
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── jobs/             # Job-related components
│   ├── forms/            # Form components
│   └── ui/loading-spinner.tsx # Loading states
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
    └── next-auth.d.ts    # NextAuth type extensions
```

## 🔐 Authentication

The app supports multiple authentication methods:

- **Google OAuth**: One-click sign-in with Google
- **Email Magic Links**: Passwordless authentication via email
- **Custom Signup API**: Dedicated `/api/auth/signup` endpoint for user registration
- **Role-based Access**: Automatic role assignment and protection
- **Suspense Boundaries**: Improved loading states for auth pages

### Authentication Flow
1. **Sign Up**: New users register via `/auth/signup` page
2. **Sign In**: Existing users sign in via `/auth/signin` page
3. **OAuth**: Google OAuth integration for seamless authentication
4. **Session Management**: Secure session handling with NextAuth.js

### Default Users (after seeding)

- **Admin**: admin@jobportal.com
- **Recruiter**: recruiter@techcorp.com  
- **Candidate**: candidate@example.com

## 💼 User Roles & Features

### Candidates
- Browse and search jobs
- Build and manage resumes
- Apply to jobs with one click
- View application status
- Chat with recruiters
- Generate referral links
- Track referral earnings

### Recruiters
- Post and manage jobs
- View and manage applications
- Search candidates by skills
- Feature jobs for better visibility
- Chat with candidates
- View skill match scores
- Access analytics dashboard

### Admins
- Manage all users and companies
- Approve/reject job postings
- View system analytics
- Manage payments and subscriptions
- Export reports
- Configure system settings

## 🎨 UI Components

Built with shadcn/ui components:
- Responsive design
- Dark/light mode support
- Accessible components
- Consistent design system
- Mobile-first approach
- Loading states with Suspense boundaries

## 📊 Database Schema

Key models:
- **User**: Authentication and basic info
- **Profile**: Extended user information
- **Company**: Recruiter company details
- **Job**: Job postings with full details
- **Application**: Job applications with status tracking
- **Resume**: Resume data and PDF storage
- **Message**: Real-time messaging
- **Referral**: Referral tracking and rewards
- **Payment**: Payment and subscription management
- **Audit**: Complete audit trail

## 🔍 Search & Filtering

Advanced job search features:
- Full-text search across titles and descriptions
- Location-based filtering
- Salary range filtering
- Job type and experience level filters
- Skills-based matching
- Remote work options
- Sorting by relevance, date, salary

## 🤖 AI Skill Matching

Deterministic skill matching algorithm:
- Calculates compatibility score (0-100%)
- Matches candidate skills with job requirements
- Ranks applications by match score
- Future-ready for ML/NLP integration

## 💰 Payment Integration

Flexible payment system:
- Support for Razorpay (India) and Stripe (Global)
- Feature flag to enable/disable payments
- Job featuring and premium subscriptions
- Referral payout tracking
- Admin payment management

## 📱 Real-time Features

Powered by Pusher:
- Real-time messaging between users
- Live application status updates
- Instant notifications
- Online presence indicators

## 📧 Email Notifications

Automated email system:
- Welcome emails for new users
- Job application confirmations
- Status update notifications
- Interview scheduling
- Referral notifications

## 🔒 Security Features

Production-ready security:
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Audit logging
- Secure file uploads
- API route protection

## 📈 Analytics & Reporting

Comprehensive analytics:
- Job posting performance
- Application conversion rates
- User engagement metrics
- Revenue tracking
- Export capabilities (CSV/PDF)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Deployment

Recommended providers:
- **Supabase**: PostgreSQL with built-in auth
- **Railway**: Simple PostgreSQL hosting
- **AWS RDS**: Enterprise-grade database
- **PlanetScale**: Serverless MySQL alternative

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user (NextAuth)
- `GET /api/auth/session` - Get current session

### Jobs
- `GET /api/jobs` - Search and list jobs
- `POST /api/jobs` - Create new job (Recruiter)
- `GET /api/jobs/[id]` - Get job details
- `PATCH /api/jobs/[id]` - Update job (Recruiter)
- `DELETE /api/jobs/[id]` - Delete job (Recruiter)

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications` - List user applications
- `PATCH /api/applications/[id]/status` - Update application status

### Dashboard APIs
- `GET /api/dashboard/candidate/applications` - Candidate applications
- `GET /api/dashboard/candidate/stats` - Candidate statistics
- `GET /api/dashboard/recruiter/jobs` - Recruiter jobs
- `GET /api/dashboard/admin/analytics` - Admin analytics

### Messaging
- `GET /api/conversations` - List conversations
- `POST /api/messages` - Send message
- `GET /api/messages/[conversationId]` - Get conversation messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## 🎯 Roadmap

Future enhancements:
- Mobile app (React Native)
- Advanced AI matching with ML
- Video interviews integration
- Blockchain-based verification
- Multi-language support
- Advanced analytics dashboard
- Integration with LinkedIn/GitHub APIs

---

Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.
