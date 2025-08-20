# 🛠 Job Portal - Development Setup Guide

This guide will help you set up the Job Portal application for local development.

## 🚀 Quick Start

### 1. **Clone and Install**

```bash
# Clone the repository
git clone <your-repo-url>
cd job-portal

# Install dependencies
npm install
```

### 2. **Database Setup**

```bash
# Generate Prisma client
npm run db:generate

# Push database schema (for SQLite development)
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 3. **Start Development Server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Basic Configuration

### Required for Basic Functionality

The application will run with the default SQLite configuration, but for full functionality, you'll need to configure these services:

#### **1. Google OAuth (for login)**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to `.env`:

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### **2. Email Service (for notifications)**

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Add to `.env`:

```bash
RESEND_API_KEY="re_your_api_key"
FROM_EMAIL="noreply@yourdomain.com"
```

#### **3. File Storage (for resume uploads)**

1. Create AWS S3 bucket or Cloudflare R2
2. Get access credentials
3. Add to `.env`:

```bash
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

## 🧪 Testing the Application

### Default Login Credentials

After seeding the database, you can use these accounts:

- **Admin**: admin@jobportal.com
- **Recruiter**: recruiter@techcorp.com

### Test Features

1. **User Registration**: Create new accounts
2. **Job Posting**: Post jobs as a recruiter
3. **Job Application**: Apply to jobs as a candidate
4. **Resume Builder**: Create and download resumes
5. **Admin Panel**: Manage users and jobs

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Create and run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing & Quality
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run lint             # Run linter
npm run type-check       # TypeScript type checking

# Health & Validation
npm run health-check     # Check API health
npm run validate-env     # Validate environment variables
```

## 📁 Project Structure

```
job-portal/
├── app/                 # Next.js 14 App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   └── (auth)/         # Auth pages
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── dashboard/     # Dashboard components
├── lib/               # Utility libraries
├── prisma/            # Database schema & migrations
├── scripts/           # Utility scripts
└── types/             # TypeScript types
```

## 🐛 Common Issues

### Database Issues

```bash
# Reset database
npm run db:migrate:reset

# Regenerate client
npm run db:generate
```

### Environment Issues

```bash
# Validate environment
npm run validate-env

# Generate template
npm run validate-env -- --template
```

### Build Issues

```bash
# Clean build cache
npm run clean
npm run build
```

## 🔄 Development Workflow

1. **Make Changes**: Edit code in your preferred editor
2. **Test Locally**: Use `npm run dev` for hot reload
3. **Run Tests**: `npm run test` before committing
4. **Check Types**: `npm run type-check` for TypeScript
5. **Lint Code**: `npm run lint:fix` to fix issues

## 📚 Key Features to Explore

### For Candidates

- User registration and profile setup
- Resume builder with PDF download
- Job search and application
- Interview scheduling
- Quiz system for interview prep
- Expert consulting booking

### For Recruiters

- Company profile setup
- Job posting and management
- Application review and filtering
- Interview scheduling
- Candidate communication
- Commission tracking

### For Admins

- User and job management
- Feature flag controls
- Analytics and reporting
- Data export functionality
- System monitoring

## 🆘 Getting Help

- Check the API health: `npm run health-check`
- Review logs in the terminal
- Check database with: `npm run db:studio`
- Validate environment: `npm run validate-env`

## 🚀 Ready for Production?

When you're ready to deploy:

1. Run the production setup: `npm run setup-production`
2. Follow the production checklist: `PRODUCTION_CHECKLIST.md`
3. Deploy using: `npm run deploy:production`

Happy coding! 🎉
