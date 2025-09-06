# TSA ERP Deployment Guide

## 🚀 Production Deployment Instructions

This comprehensive guide covers the complete deployment process for the TSA ERP Work Assignment System.

## 📋 Prerequisites

### Required Tools
- Node.js 20+ 
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Domain access (if using custom domain)

### Required Accounts
- Firebase project with Hosting, Firestore, and Authentication enabled
- GitHub repository (for CI/CD)
- Optional: Slack workspace (for notifications)

## 🛠 Environment Setup

### 1. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Hosting
# - Firestore
# - Authentication
# - Functions (optional)
# - Storage (optional)
```

### 2. Environment Variables

Copy and configure environment files:

```bash
# Copy staging environment
cp .env.staging .env.local

# Copy production environment  
cp .env.production .env.local

# Configure your actual values in .env.local
```

Required environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_API_BASE_URL`
- `SLACK_WEBHOOK_URL` (optional)

### 3. GitHub Secrets Setup

Configure the following secrets in your GitHub repository:

#### Firebase Secrets
- `FIREBASE_TOKEN`: Firebase CLI token (`firebase login:ci`)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID  
- `VITE_FIREBASE_APP_ID`: Firebase app ID

#### API Secrets
- `VITE_API_BASE_URL`: Production API base URL
- `VITE_STAGING_API_BASE_URL`: Staging API base URL

#### Optional Secrets
- `SLACK_WEBHOOK`: Slack webhook for notifications
- `SONAR_TOKEN`: SonarCloud token for code analysis
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI token

## 🚦 Deployment Process

### Manual Deployment

#### Staging Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Or with dry run first
npm run deploy:staging:dry-run
npm run deploy:staging
```

#### Production Deployment
```bash
# Deploy to production with backup
npm run deploy:production:backup

# Or standard production deployment
npm run deploy:production
```

### Automated Deployment (CI/CD)

The project includes automated deployment via GitHub Actions:

#### Staging (Automatic)
- Triggered on push to `develop` branch
- Runs full test suite
- Deploys to staging environment
- Sends notification to Slack

#### Production (Manual)
- Triggered on push to `main` branch
- Requires manual approval in GitHub
- Runs comprehensive testing
- Creates deployment backup
- Deploys to production
- Creates GitHub release

## 📊 Monitoring and Verification

### Post-Deployment Checklist

1. **Basic Functionality**
   - [ ] Application loads correctly
   - [ ] User authentication works
   - [ ] Real-time updates functional
   - [ ] PWA install prompt appears
   - [ ] Service worker registers

2. **Performance Verification**
   - [ ] Page load time < 2 seconds
   - [ ] Lighthouse score > 90
   - [ ] Bundle size < 500KB
   - [ ] Images optimized and cached

3. **Feature Testing**
   - [ ] Work assignment workflows
   - [ ] Notification system
   - [ ] Offline functionality
   - [ ] Mobile responsiveness
   - [ ] Internationalization

4. **Security Verification**
   - [ ] HTTPS enforced
   - [ ] Security headers present
   - [ ] Authentication secure
   - [ ] API endpoints protected

### Monitoring Tools

#### Built-in Monitoring
- Error boundary system captures runtime errors
- Performance monitoring tracks Core Web Vitals
- User analytics for adoption metrics
- Real-time notification system status

#### External Monitoring
- Firebase Analytics for user behavior
- Firebase Performance for app performance
- Firebase Crashlytics for error tracking
- Google Search Console for SEO

## 🔧 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite

# Run build locally to debug
npm run build
```

#### Firebase Deployment Issues
```bash
# Check Firebase login status
firebase login:list

# Re-authenticate if needed
firebase login --reauth

# Verify project selection
firebase use --add
```

#### Environment Variable Issues
```bash
# Verify environment file exists
ls -la .env*

# Check environment variables are loaded
npm run build 2>&1 | grep VITE_
```

### Performance Issues

#### Bundle Size Optimization
```bash
# Analyze bundle size
npm run analyze:bundle

# Check for large dependencies
npx vite-bundle-analyzer dist
```

#### Runtime Performance
```bash
# Run performance analysis
npm run analyze:complexity

# Check Lighthouse scores
npx lighthouse http://localhost:4173 --view
```

### Rollback Procedures

#### Automatic Rollback (CI/CD)
The deployment pipeline includes automatic rollback on failure.

#### Manual Rollback
```bash
# List Firebase hosting releases
firebase hosting:channel:list

# Deploy previous version
firebase hosting:channel:deploy --version=PREVIOUS_VERSION live

# Or use deployment script with backup
./scripts/deploy.sh production --rollback
```

## 🎯 Production Readiness Checklist

### Security
- [ ] All secrets properly configured
- [ ] Security headers implemented
- [ ] HTTPS enforced
- [ ] Authentication secure
- [ ] API rate limiting enabled

### Performance
- [ ] Bundle size optimized
- [ ] Images compressed and cached
- [ ] Service worker configured
- [ ] CDN configured (if applicable)
- [ ] Database indexes optimized

### Monitoring
- [ ] Error reporting configured
- [ ] Performance monitoring active
- [ ] User analytics enabled
- [ ] Uptime monitoring setup
- [ ] Alert notifications configured

### Documentation
- [ ] Deployment procedures documented
- [ ] API documentation current
- [ ] User manual updated
- [ ] Troubleshooting guide available
- [ ] Contact information provided

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- Monitor error rates and performance metrics
- Review user feedback and feature requests  
- Update dependencies monthly
- Backup configuration and data weekly
- Review and rotate secrets quarterly

### Emergency Contacts
- **Technical Lead**: [Contact Information]
- **DevOps**: [Contact Information]  
- **Product Owner**: [Contact Information]
- **Firebase Support**: Firebase Console > Support

### Documentation Links
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)
- [Project Architecture](./new%20documentation%20files/APP_ARCHITECTURE.md)

---

## 🎉 Post-Launch Activities

### Week 1: Monitoring Phase
- [ ] Monitor error rates hourly
- [ ] Check performance metrics daily
- [ ] Gather initial user feedback
- [ ] Address critical issues immediately

### Week 2-4: Optimization Phase  
- [ ] Analyze user behavior patterns
- [ ] Optimize based on real usage data
- [ ] Implement user-requested features
- [ ] Refine performance based on metrics

### Month 2+: Growth Phase
- [ ] Plan feature enhancements
- [ ] Scale infrastructure as needed
- [ ] Implement advanced analytics
- [ ] Prepare for mobile app development

Remember: Successful deployment is just the beginning. Continuous monitoring, user feedback, and iterative improvements are key to long-term success.

**�deploying! 🚀**