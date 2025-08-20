# 🚀 Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
1. **Database**: Set up a PostgreSQL database (Railway, Supabase, or Neon)
2. **Environment Variables**: Prepare all required environment variables

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Optional)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# File Storage (Optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Payment (Optional)
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"

# Feature Flags (Optional)
ENABLE_PAYMENTS="true"
ENABLE_COMMISSIONS="true"
ENABLE_EXPERT_CONSULTING="true"
ENABLE_INTERVIEW_SCHEDULING="true"
ENABLE_QUIZ_SYSTEM="true"
```

### Deployment Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all required variables from above

3. **Database Setup**
   ```bash
   # Run migrations on your database
   npx prisma migrate deploy
   
   # Seed the database (optional)
   npx prisma db seed
   ```

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Or manually trigger deployment from dashboard

### Post-Deployment

1. **Verify Deployment**
   - Visit your deployed URL
   - Check that all features work correctly
   - Test authentication and database connections

2. **Set up Demo Data** (Optional)
   ```bash
   # Connect to your deployed database and run:
   npm run demo-seed
   ```

## Railway Deployment

### Database Setup
1. Create a new Railway project
2. Add PostgreSQL service
3. Note the connection string

### Application Deployment
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## Manual Deployment

### Build for Production
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup
1. Copy `.env.example` to `.env.production`
2. Fill in all required values
3. Ensure DATABASE_URL points to production database

## Troubleshooting

### Common Issues

1. **Build Fails with Husky Error**
   - This is fixed in the latest version
   - Husky is skipped in CI environments

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Ensure database is accessible from deployment platform
   - Check firewall settings

3. **Environment Variables Not Working**
   - Verify all required variables are set
   - Check for typos in variable names
   - Restart deployment after adding variables

4. **Prisma Issues**
   - Run `npx prisma generate` after deployment
   - Ensure migrations are applied with `npx prisma migrate deploy`

### Health Check
After deployment, visit `/api/health` to verify all systems are working.

## Performance Optimization

1. **Database Indexing**
   - Ensure proper indexes on search fields
   - Monitor query performance

2. **Caching**
   - Enable Vercel Edge Caching
   - Consider Redis for session storage

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor performance metrics
   - Set up uptime monitoring

## Security Checklist

- [ ] All environment variables are secure
- [ ] Database has proper access controls
- [ ] HTTPS is enforced
- [ ] Authentication is properly configured
- [ ] File uploads are secured
- [ ] Rate limiting is enabled
- [ ] Audit logging is active

## Scaling Considerations

1. **Database Scaling**
   - Consider read replicas for high traffic
   - Implement connection pooling
   - Monitor database performance

2. **Application Scaling**
   - Vercel automatically scales
   - Consider serverless functions for heavy operations
   - Implement caching strategies

3. **File Storage**
   - Use CDN for static assets
   - Implement proper file compression
   - Consider multiple storage regions