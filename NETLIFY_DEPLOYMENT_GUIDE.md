# 🚀 TSA ERP Netlify Deployment Guide

## Overview
This guide covers deploying the TSA Production ERP application to Netlify with a serverless Firestore backend.

## 🏗️ Architecture
- **Frontend**: React + Vite (deployed to Netlify)
- **Backend**: Serverless Firestore + Firebase Auth
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Firebase Realtime Database

## 📋 Prerequisites

1. **Firebase Project Setup**
   - Firebase project created
   - Firestore enabled
   - Authentication enabled
   - Security rules configured

2. **Netlify Account**
   - Netlify account created
   - Site created (optional)

3. **Environment Variables**
   - Firebase configuration
   - API keys and secrets

## 🔧 Environment Variables Setup

### Required Environment Variables
Set these in your Netlify dashboard under Site Settings > Environment Variables:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com

# Application Config
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://your-api-domain.com/v1
NODE_ENV=production
```

## 📦 Deployment Steps

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Build and Deploy**
   ```bash
   # Build the application
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod --dir=dist
   ```

### Method 2: Git Integration

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "🚀 Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect Repository in Netlify Dashboard**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

### Method 3: Manual Deployment

1. **Build Locally**
   ```bash
   ./scripts/build-production.sh
   ```

2. **Upload to Netlify**
   - Go to Netlify dashboard
   - Drag and drop the `dist` folder

## 🔐 Firebase Security Setup

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Configure Authentication
- Enable Email/Password authentication
- Set up custom claims for roles
- Configure authorized domains

### 3. Set up CORS
Add your Netlify domain to Firebase authorized domains:
- `https://your-app.netlify.app`
- `https://your-custom-domain.com`

## 🌐 Custom Domain (Optional)

1. **Add Domain in Netlify**
   - Site Settings > Domain management
   - Add custom domain

2. **Update Firebase Config**
   - Add domain to authorized domains
   - Update CORS settings

## 📊 Performance Optimizations

### 1. Build Optimizations
- Tree shaking enabled (Vite default)
- Code splitting configured
- Static assets cached

### 2. Firebase Optimizations
- Firestore indexes configured
- Security rules optimized
- Offline persistence enabled

### 3. Netlify Optimizations
- Asset optimization enabled
- Forms processing (if needed)
- Edge handlers (if needed)

## 🔧 Post-Deployment Setup

### 1. Test Application
- [ ] Authentication flow works
- [ ] Data loads from Firestore
- [ ] Real-time updates work
- [ ] All user roles function correctly

### 2. Monitor Performance
- Check Netlify analytics
- Monitor Firebase usage
- Set up error reporting

### 3. Set up Monitoring
```javascript
// Add to your app
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

## 🛠️ Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check environment variables
   - Verify Firebase project settings
   - Check CORS configuration

2. **Build Failures**
   - Verify all dependencies installed
   - Check TypeScript errors
   - Verify environment variables

3. **Authentication Issues**
   - Check authorized domains
   - Verify Firebase Auth configuration
   - Check security rules

### Debug Commands

```bash
# Check build locally
npm run build
npm run preview

# Test Firebase connection
firebase projects:list

# Check Netlify deployment
netlify status
netlify deploy --dir=dist
```

## 📈 Scaling Considerations

### Database
- Implement proper indexing
- Use subcollections for large datasets
- Consider Firebase Extensions

### Authentication
- Implement rate limiting
- Set up user management
- Consider Firebase Admin SDK for server operations

### Performance
- Implement lazy loading
- Use service workers
- Optimize bundle size

## 💰 Cost Optimization

### Firebase
- Monitor Firestore reads/writes
- Implement efficient queries
- Use Firebase pricing calculator

### Netlify
- Optimize build times
- Use appropriate plan
- Monitor bandwidth usage

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Firestore security rules tested
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] No sensitive data in client code
- [ ] Authentication properly implemented

## 📞 Support

For deployment issues:
1. Check Netlify deploy logs
2. Verify Firebase console
3. Test locally first
4. Check environment variables

## 🎉 Deployment Complete!

Your TSA ERP application should now be live and running on Netlify with a fully serverless Firestore backend!

### Next Steps:
1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan for scaling
4. Set up CI/CD pipeline