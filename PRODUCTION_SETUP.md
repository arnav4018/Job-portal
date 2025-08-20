# 🚀 Job Portal - Production Deployment Guide

This guide will help you deploy the Job Portal application to production with all necessary configurations.

## 📋 Pre-Deployment Checklist

### 1. **Database Setup**
- [ ] Set up PostgreSQL database (recommended: Railway, Supabase, or Neon)
- [ ] Update `DATABASE_URL` in production environment
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed production database: `npm run db:seed`

### 2. **Authentication Setup**
- [ ] Generate secure `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set up Google OAuth credentials
- [ ] Configure production domain in `NEXTAUTH_URL`

### 3. **Email Configuration**
- [ ] Set up Resend account for transactional emails
- [ ] Configure SMTP backup (Gmail/SendGrid)
- [ ] Verify email templates are working

### 4. **File Storage Setup**
- [ ] Set up AWS S3 bucket or Cloudflare R2
- [ ] Configure CORS policy for file uploads
- [ ] Set up CDN for faster file delivery

### 5. **Payment Gateway Setup**
- [ ] Configure Razorpay for Indian payments
- [ ] Set up Stripe for international payments
- [ ] Test payment flows in sandbox mode

### 6. **Real-time Features**
- [ ] Set up Pusher account for real-time messaging
- [ ] Configure WebSocket connections

## 🔧 Environment Variables Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secure-secret-32-chars-minimum"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
RESEND_API_KEY="re_your_resend_api_key"
FROM_EMAIL="noreply@your-domain.com"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-production-bucket"

# Payments
RAZORPAY_KEY_ID="rzp_live_your_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
STRIPE_SECRET_KEY="sk_live_your_stripe_secret"

# Real-time
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
```

## 🌐 Deployment Platforms

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all production environment variables
   - Set `NODE_ENV=production`

3. **Database Setup**
   ```bash
   # Run migrations on production
   npx prisma migrate deploy
   
   # Generate Prisma client
   npx prisma generate
   ```

### Option 2: Railway

1. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

2. **Add PostgreSQL Database**
   - Add PostgreSQL plugin in Railway dashboard
   - Copy connection string to `DATABASE_URL`

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Configure build settings
   - Add environment variables

2. **Database Setup**
   - Create managed PostgreSQL database
   - Configure connection string

## 🔒 Security Configuration

### 1. **HTTPS Setup**
- Ensure SSL certificate is configured
- Redirect HTTP to HTTPS
- Set secure cookie flags

### 2. **CORS Configuration**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

### 3. **Rate Limiting**
- Configure rate limiting for API endpoints
- Set up DDoS protection
- Monitor for suspicious activity

## 📊 Monitoring & Analytics

### 1. **Error Tracking**
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs')
```

### 2. **Performance Monitoring**
- Set up Google Analytics
- Configure Core Web Vitals tracking
- Monitor API response times

### 3. **Database Monitoring**
- Set up database performance monitoring
- Configure backup schedules
- Monitor connection pool usage

## 🚀 Deployment Commands

### Build and Deploy
```bash
# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start production server
npm start
```

### Database Operations
```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed

# Reset database (if needed)
npx prisma migrate reset --force
```

## 🔧 Performance Optimization

### 1. **Caching Strategy**
- Enable Next.js static generation where possible
- Configure Redis for session storage
- Set up CDN for static assets

### 2. **Database Optimization**
- Add database indexes for frequently queried fields
- Configure connection pooling
- Set up read replicas for heavy read operations

### 3. **Image Optimization**
- Use Next.js Image component
- Configure image CDN
- Implement lazy loading

## 📱 Mobile Optimization

### 1. **PWA Configuration**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // your config
})
```

### 2. **Responsive Design**
- Test on multiple device sizes
- Optimize touch interactions
- Ensure fast loading on mobile networks

## 🧪 Testing in Production

### 1. **Health Checks**
```bash
# Test API health
curl https://your-domain.com/api/health

# Test database connection
npm run test:db
```

### 2. **Feature Testing**
- [ ] User registration and login
- [ ] Job posting and application
- [ ] Email notifications
- [ ] Payment processing
- [ ] File uploads
- [ ] Real-time messaging

## 📈 Scaling Considerations

### 1. **Horizontal Scaling**
- Configure load balancer
- Set up multiple application instances
- Implement session sharing

### 2. **Database Scaling**
- Configure read replicas
- Implement database sharding
- Set up connection pooling

### 3. **File Storage Scaling**
- Use CDN for file delivery
- Implement file compression
- Set up automatic backups

## 🔄 Maintenance

### 1. **Regular Updates**
- Keep dependencies updated
- Monitor security vulnerabilities
- Update Node.js version regularly

### 2. **Backup Strategy**
- Daily database backups
- File storage backups
- Configuration backups

### 3. **Monitoring**
- Set up uptime monitoring
- Configure alert notifications
- Monitor resource usage

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check connection string format
   - Verify network connectivity
   - Check firewall settings

2. **Email Delivery Issues**
   - Verify SMTP credentials
   - Check spam folder
   - Monitor email service status

3. **File Upload Issues**
   - Check S3 permissions
   - Verify CORS configuration
   - Monitor storage quotas

### Support Resources
- Check application logs
- Monitor error tracking (Sentry)
- Review database performance metrics
- Contact support for third-party services

---

## 🎯 Production Checklist

- [ ] Database configured and migrated
- [ ] All environment variables set
- [ ] SSL certificate configured
- [ ] Email service working
- [ ] Payment gateways tested
- [ ] File uploads working
- [ ] Real-time features enabled
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Performance optimized
- [ ] Security measures implemented
- [ ] Load testing completed

**🎉 Your Job Portal is now production-ready!**