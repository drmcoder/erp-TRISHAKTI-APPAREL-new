# 🏗️ Garment ERP PWA - Application Architecture

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Service Layer](#service-layer)
- [State Management](#state-management)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)

---

## 🎯 System Overview

The Garment ERP PWA is built using a **modern, scalable, and maintainable architecture** that supports real-time collaboration, offline functionality, and multi-role access control.

### **Core Architectural Principles:**
- **🔄 Centralized Logic**: All business logic centralized for consistency
- **🧩 Modular Design**: Loosely coupled, highly cohesive modules  
- **📱 Progressive Web App**: Offline-first, mobile-responsive design
- **🔐 Security First**: Role-based access control throughout
- **⚡ Performance Optimized**: Lazy loading, caching, and optimization
- **🌐 Real-time**: Live updates and collaborative features

---

## 🏛️ Architecture Patterns

### **1. Centralized Architecture Pattern**
```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Operator   │ │ Supervisor  │ │ Management/Admin    ││
│  │ Dashboard   │ │ Dashboard   │ │    Dashboard        ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │   Workflow  │ │   Payment   │ │    Quality          ││
│  │   Engine    │ │   System    │ │    Control          ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Firebase   │ │   Damage    │ │    Notification     ││
│  │  Services   │ │   Reports   │ │     Service         ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                          │
│            Firebase Firestore + Authentication          │
└─────────────────────────────────────────────────────────┘
```

### **2. Component Hierarchy Pattern**
```
App (Root)
├── CentralizedAppProvider (Global State)
├── ErrorBoundary (Error Handling)
├── AuthContext (Authentication)
└── Router
    ├── OperatorDashboard
    │   ├── WorkQueue
    │   ├── SelfAssignmentSystem
    │   ├── WorkCompletion
    │   └── DamageReportModal
    ├── SupervisorDashboard  
    │   ├── WorkAssignmentBoard
    │   ├── BundleFlowTracker
    │   └── EmergencyWorkInsertion
    └── AdminDashboard
        ├── UserManagement
        ├── WorkflowTemplates
        └── Analytics
```

---

## 💻 Technology Stack

### **Frontend Architecture**
```javascript
// Core Technologies
React 18.2.0           // UI Framework with Concurrent Features
PWA                    // Progressive Web App capabilities
Tailwind CSS 3.3.0    // Utility-first CSS framework
Context API            // State management
Service Workers        // Offline functionality
```

### **Backend & Services**
```javascript
// Firebase Ecosystem
Firebase 10.x          // Backend-as-a-Service
Firestore             // NoSQL Database
Firebase Auth         // Authentication & Authorization
Firebase Hosting     // Static web hosting
Firebase Functions   // Serverless functions (if needed)
```

### **Development & Build Tools**
```javascript
// Development Stack
Vite                  // Build tool and dev server
ESLint               // Code linting
Prettier             // Code formatting
Husky                // Git hooks
```

---

## 📁 Folder Structure

```
src/
├── components/              # React components by role
│   ├── admin/              # Admin-specific components
│   ├── supervisor/         # Supervisor components
│   ├── operator/           # Operator components  
│   ├── common/             # Shared components
│   └── ui/                 # Reusable UI components
│
├── core/                   # Core application logic
│   ├── business/           # Business logic engines
│   │   ├── WorkflowEngine.js
│   │   ├── PaymentEngine.js
│   │   └── QualityEngine.js
│   ├── components/         # Core reusable components
│   │   └── ui/            # Base UI components
│   └── constants/          # Centralized constants
│       └── index.js       # All app constants
│
├── services/              # External service integrations
│   ├── firebase-services.js
│   ├── DamageReportService.js
│   ├── OperatorWalletService.js
│   └── base/
│       └── BaseService.js
│
├── contexts/              # React Context providers
│   ├── AuthContext.jsx
│   ├── LanguageContext.jsx
│   ├── NotificationContext.jsx
│   └── CentralizedAppProvider.jsx
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.js
│   ├── useNotifications.js
│   └── useWorkflow.js
│
├── lib/                   # Utility libraries
│   ├── appUtils.js
│   ├── workflowManager.js
│   └── businessLogic.js
│
├── config/               # Configuration files
│   ├── firebase.js
│   ├── damageReportSchema.js
│   └── environment.js
│
├── constants/            # Legacy constants (being migrated)
│   ├── index.js
│   └── appConstants.js
│
└── utils/               # Utility functions
    ├── logger.js
    ├── performanceMonitor.js
    └── helpers.js
```

---

## 🔄 Data Flow Architecture

### **1. User Action Flow**
```
User Action → Component → Context/Hook → Service → Firebase → Database
     ↓           ↓          ↓           ↓         ↓         ↓
   Click      Handler    Business    API       Firestore  Update
            Function     Logic      Call      
                                      ↓
Real-time Listener ← Firebase ← Database Update
     ↓
Context Update → Component Re-render → UI Update
```

### **2. Workflow State Flow**
```javascript
// Example: Work Assignment Flow
OperatorDashboard
    ↓ (self-assigns work)
SelfAssignmentSystem → useWorkflow → WorkflowEngine
    ↓                                      ↓
WorkAssignmentService → Firebase Services → Firestore
    ↓                                      ↓
Real-time Update → NotificationContext → All Users
```

### **3. Damage Reporting Flow**
```javascript
DamageReportModal → DamageReportService → holdBundlePayment()
        ↓                    ↓                    ↓
   Bundle Payment         Firestore          OperatorWallet
      HELD              Update Bundle        Update Held Amount
        ↓                    ↓                    ↓
  Supervisor Gets     Real-time           Operator Sees
  Notification        Listeners           Payment Hold
```

---

## 🧩 Component Architecture

### **1. Component Design Principles**
```javascript
// Single Responsibility Principle
const WorkCompletion = ({ bundleId, onComplete }) => {
  // Only handles work completion logic
  const [completionData, setCompletionData] = useState({});
  const { completeWork } = useWorkflow();
  
  const handleSubmit = async () => {
    // Business logic delegated to service
    await completeWork(bundleId, completionData);
    onComplete();
  };
};
```

### **2. Composition over Inheritance**
```javascript
// Reusable UI components composed together
const OperatorDashboard = () => (
  <Dashboard>
    <Header user={user} notifications={notifications} />
    <WorkQueue items={workItems} onSelect={handleWorkSelect} />
    <DamageReportModal isOpen={showDamage} onSubmit={handleDamageReport} />
  </Dashboard>
);
```

### **3. Container-Presentation Pattern**
```javascript
// Container Component (Logic)
const WorkQueueContainer = () => {
  const [workItems, setWorkItems] = useState([]);
  const { assignedWork } = useWorkflow();
  
  return <WorkQueuePresentation items={workItems} onAction={handleAction} />;
};

// Presentation Component (UI Only)
const WorkQueuePresentation = ({ items, onAction }) => (
  <div className="work-queue">
    {items.map(item => <WorkCard key={item.id} item={item} onClick={onAction} />)}
  </div>
);
```

---

## 🔧 Service Layer Architecture

### **1. Base Service Pattern**
```javascript
// src/services/base/BaseService.js
class BaseService {
  constructor(collectionName) {
    this.collection = collectionName;
    this.cache = new Map();
  }

  async create(data) {
    // Standardized create logic with validation, caching, logging
  }
  
  async update(id, data) {
    // Standardized update logic with optimistic updates
  }
}
```

### **2. Specialized Services**
```javascript
// Domain-specific services extend BaseService
class DamageReportService extends BaseService {
  constructor() {
    super('damage_reports');
  }

  async submitDamageReport(reportData) {
    // 1. Validate report
    // 2. Hold bundle payment  
    // 3. Create damage report
    // 4. Send notifications
    // 5. Return result
  }
}
```

### **3. Service Composition**
```javascript
// Services work together for complex operations
const completeWorkWithDamage = async (workItem, damageData) => {
  const batch = writeBatch(db);
  
  // Multiple services coordinate transaction
  await workflowService.completeWork(batch, workItem);
  await damageReportService.createReport(batch, damageData);
  await walletService.holdPayment(batch, workItem.bundleId);
  
  await batch.commit();
};
```

---

## 🏪 State Management Architecture

### **1. Centralized State Pattern**
```javascript
// CentralizedAppProvider manages global state
const CentralizedAppProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    user: null,
    workItems: [],
    notifications: [],
    damageReports: [],
    walletBalance: null
  });

  const updateState = (updates) => {
    setGlobalState(prev => ({ ...prev, ...updates }));
  };

  return (
    <CentralizedContext.Provider value={{ globalState, updateState }}>
      {children}
    </CentralizedContext.Provider>
  );
};
```

### **2. Context Specialization**
```javascript
// Specialized contexts for different domains
AuthContext          // User authentication state
LanguageContext      // Internationalization 
NotificationContext  // Real-time notifications
WorkflowContext      // Work management state
```

### **3. State Synchronization**
```javascript
// Real-time state synchronization with Firebase
const useRealtimeSync = (userId) => {
  useEffect(() => {
    const unsubscribes = [
      // Sync work assignments
      onSnapshot(workQuery, (snapshot) => {
        updateGlobalState({ workItems: processSnapshot(snapshot) });
      }),
      
      // Sync notifications  
      onSnapshot(notificationQuery, (snapshot) => {
        updateGlobalState({ notifications: processSnapshot(snapshot) });
      })
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, [userId]);
};
```

---

## 🔐 Security Architecture

### **1. Authentication Flow**
```javascript
// Firebase Authentication + Custom Claims
User Login → Firebase Auth → Custom Claims → Role Assignment → Access Control
```

### **2. Authorization Levels**
```javascript
const ROLE_PERMISSIONS = {
  operator: ['view_own_work', 'complete_work', 'report_damage'],
  supervisor: ['assign_work', 'view_all_work', 'handle_damage'],
  admin: ['manage_users', 'system_config', 'view_analytics']
};
```

### **3. Route Protection**
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) return <LoginRedirect />;
  if (!hasPermission(user.role, requiredRole)) return <AccessDenied />;
  
  return children;
};
```

---

## ⚡ Performance Architecture

### **1. Lazy Loading Strategy**
```javascript
// Route-based code splitting
const OperatorDashboard = lazy(() => import('./components/operator/Dashboard'));
const SupervisorDashboard = lazy(() => import('./components/supervisor/Dashboard'));
```

### **2. Caching Strategy**
```javascript
// Multi-level caching
Browser Cache (PWA) → Memory Cache (React) → Firebase Local Cache
```

### **3. Optimization Techniques**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Expensive calculation caching
- **Virtual Scrolling**: Large list optimization  
- **Image Optimization**: Lazy loading and WebP format
- **Bundle Splitting**: Reduce initial load time

---

## 🔍 Monitoring & Analytics

### **1. Performance Monitoring**
```javascript
// src/utils/performanceMonitor.js
export const performanceMonitor = {
  trackPageLoad: (pageName) => { /* track metrics */ },
  trackUserAction: (action) => { /* track interactions */ },
  trackError: (error) => { /* error logging */ }
};
```

### **2. Error Boundaries**
```javascript
// Comprehensive error handling at component boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <OperatorDashboard />
</ErrorBoundary>
```

---

## 🚀 Deployment Architecture

### **1. Build Process**
```bash
npm run build → Vite Build → Static Assets → Firebase Hosting
```

### **2. Environment Configuration**
```javascript
// Different configs for dev/staging/production
const config = {
  development: { /* dev config */ },
  production: { /* prod config */ }
};
```

### **3. CI/CD Pipeline**
```
GitHub → Actions → Build & Test → Deploy → Health Check
```

---

## 🔧 Development Workflow

### **1. Feature Development**
```
Feature Branch → Local Development → Testing → PR → Code Review → Merge → Deploy
```

### **2. Code Standards**
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting  
- **Husky**: Pre-commit hooks
- **TypeScript**: Type safety (planned upgrade)

---

## 📱 Week 7 UI/UX Enhancement Architecture

### **1. Progressive Web App Architecture**
```javascript
// PWA Core Architecture
Application Shell
    ↓
Service Worker (Offline Strategy)
    ├── Cache-First: Static assets, App shell
    ├── Network-First: API calls, Dynamic data  
    ├── Stale-While-Revalidate: User preferences
    └── Cache-Only: Offline fallbacks

IndexedDB (Offline Storage)
    ├── Offline Action Queue
    ├── Cached API Responses
    └── User Data Sync
```

### **2. Mobile-First Responsive Architecture**
```javascript
// Responsive Design System
const RESPONSIVE_ARCHITECTURE = {
  breakpoints: {
    mobile: '320px-767px',    // Primary design target
    tablet: '768px-1023px',   // Secondary adaptation
    desktop: '1024px+'        // Enhancement layer
  },
  
  layouts: {
    mobile: 'Stack-based navigation, Full-screen modals',
    tablet: 'Split-view panels, Slide-over modals', 
    desktop: 'Multi-column layout, Inline modals'
  }
};
```

### **3. Touch-First Interaction Architecture**
```javascript
// Touch Interaction System
TouchManager
    ├── SwipeGestureHandler
    │   ├── Swipe Navigation (Sidebar toggle)
    │   ├── Card Actions (Delete, Archive)
    │   └── Pull-to-Refresh
    ├── LongPressHandler
    │   ├── Context Menus
    │   └── Multi-select Mode
    ├── PinchZoomHandler
    │   └── Image/Document Viewing
    └── HapticFeedback
        ├── Success Vibrations
        ├── Error Vibrations
        └── Navigation Feedback
```

### **4. Performance Optimization Architecture**
```javascript
// Code Splitting Strategy
Application
├── Core Bundle (Authentication, Layout)
├── Feature Bundles
│   ├── Operator Features (Lazy loaded)
│   ├── Supervisor Features (Lazy loaded)
│   └── Admin Features (Lazy loaded)
├── UI Component Library (Shared)
└── Utility Libraries (Shared)

// Lazy Loading Implementation
const OperatorDashboard = lazy(() => 
  import('./features/operator/Dashboard').then(module => ({
    default: module.Dashboard
  }))
);
```

### **5. Notification Architecture**
```javascript
// Multi-Channel Notification System
NotificationManager
├── In-App Notifications
│   ├── Toast Messages (Temporary)
│   ├── Notification Center (Persistent)
│   └── Badge Counters (Status)
├── Push Notifications  
│   ├── Service Worker Handler
│   ├── Background Sync
│   └── Action Buttons
├── Real-time Updates
│   ├── EventSource (Server-Sent Events)
│   ├── WebSocket Fallback
│   └── Firebase Real-time Listeners
└── Notification Preferences
    ├── Category Filters
    ├── Quiet Hours
    └── Priority Levels
```

### **6. Internationalization Architecture**
```javascript
// i18n System Architecture
LanguageManager
├── Resource Loading
│   ├── English (Primary)
│   ├── Nepali (Secondary)
│   └── Dynamic Loading
├── Formatting Services
│   ├── Currency (NPR)
│   ├── Numbers (Localized)
│   ├── Dates (Localized)
│   └── Relative Time
├── RTL Support
│   ├── Text Direction
│   ├── Layout Mirroring  
│   └── Icon Orientation
└── Context Integration
    ├── Component-level i18n
    ├── Service-level i18n
    └── Error Message i18n
```

### **7. Offline-First Architecture**
```javascript
// Offline Strategy Implementation  
OfflineManager
├── Connection Detection
│   ├── Online/Offline Events
│   ├── Network Quality Assessment
│   └── Reconnection Handling
├── Data Synchronization
│   ├── Conflict Resolution
│   ├── Optimistic Updates
│   └── Background Sync
├── Action Queue
│   ├── CRUD Operations Queue
│   ├── File Upload Queue
│   └── Priority-based Processing
└── Cache Management
    ├── API Response Caching
    ├── Asset Caching
    └── Cache Invalidation
```

### **8. Accessibility Architecture**
```javascript
// A11y Implementation Strategy
AccessibilityManager
├── Screen Reader Support
│   ├── ARIA Labels
│   ├── Live Regions
│   └── Semantic Markup
├── Keyboard Navigation
│   ├── Tab Order Management
│   ├── Focus Indicators
│   └── Keyboard Shortcuts
├── Color & Contrast
│   ├── High Contrast Mode
│   ├── Color-blind Support
│   └── Dark/Light Themes
└── Motor Accessibility
    ├── Large Touch Targets (44px min)
    ├── Gesture Alternatives
    └── Voice Control Ready
```

### **9. Component Architecture Enhancements**
```javascript
// Enhanced Component Patterns
UIComponentSystem
├── Base Components
│   ├── Responsive Layout Components
│   ├── Touch-Friendly Controls
│   └── Accessibility Wrappers
├── Composite Components
│   ├── Mobile-Optimized Forms
│   ├── Swipeable Cards
│   └── Pull-to-Refresh Lists
├── Smart Components
│   ├── Network-Aware Components  
│   ├── Language-Aware Components
│   └── Permission-Aware Components
└── HOCs (Higher-Order Components)
    ├── withResponsive()
    ├── withOffline()
    └── withA11y()
```

### **10. Service Worker Architecture**
```javascript
// Service Worker Implementation
ServiceWorkerManager
├── Install/Activate Lifecycle
│   ├── Cache Initialization
│   ├── Version Management
│   └── Migration Handling
├── Fetch Event Handling
│   ├── Route-based Strategies
│   ├── Request Interception
│   └── Response Transformation
├── Background Tasks
│   ├── Data Sync
│   ├── Push Notification Handling
│   └── Cache Maintenance
└── Update Management
    ├── Version Detection
    ├── Update Prompts
    └── Graceful Reloads
```

### **11. Performance Monitoring Architecture**
```javascript
// Performance Tracking System
PerformanceMonitor
├── Core Web Vitals
│   ├── Largest Contentful Paint (LCP)
│   ├── First Input Delay (FID)
│   └── Cumulative Layout Shift (CLS)
├── Custom Metrics
│   ├── Time to Interactive
│   ├── Route Change Performance
│   └── API Response Times  
├── User Experience Metrics
│   ├── Task Completion Rates
│   ├── Error Rates
│   └── User Satisfaction Scores
└── Real-User Monitoring
    ├── Device Performance
    ├── Network Conditions
    └── Geographic Performance
```

### **12. Security Architecture Enhancements**
```javascript
// Enhanced Security Implementation
SecurityManager
├── Content Security Policy
│   ├── Script Source Restrictions
│   ├── Style Source Controls
│   └── Image Source Validation
├── Data Protection
│   ├── Local Storage Encryption
│   ├── Sensitive Data Handling
│   └── PII Protection
├── Network Security
│   ├── HTTPS Enforcement
│   ├── Certificate Pinning
│   └── Request Validation
└── Runtime Security
    ├── XSS Protection
    ├── CSRF Prevention
    └── Input Sanitization
```

## 🔄 Enhanced Data Flow Architecture

### **1. Offline-First Data Flow**
```
User Action → Optimistic Update → UI Update
     ↓              ↓               ↓
Queue Action → Cache Update → Background Sync
     ↓              ↓               ↓
Network Available → API Call → Server Update
     ↓              ↓               ↓
Success Response → Cache Sync → Conflict Resolution
```

### **2. Real-time Notification Flow**
```
Server Event → Push Service → Service Worker → Background Process
     ↓              ↓              ↓               ↓
EventSource → Notification → Display Logic → User Action
     ↓              ↓              ↓               ↓
State Update → Component → UI Update → Interaction
```

### **3. Responsive Layout Flow**
```
Viewport Change → Media Query → Layout Calculation → Component Update
     ↓               ↓               ↓                ↓
Breakpoint → Layout Manager → Style Update → Re-render
     ↓               ↓               ↓                ↓
Touch Events → Gesture Handler → Action Trigger → State Change
```

## 🚀 Deployment Architecture Enhancements

### **1. PWA Deployment Pipeline**
```bash
# Enhanced Build Process
npm run build:pwa
    ├── Vite Build (ES Modules, Tree Shaking)
    ├── Service Worker Generation
    ├── Manifest Generation
    ├── Icon Generation (Multiple Sizes)
    ├── Performance Auditing
    └── Security Scanning

# Progressive Deployment
Staging → A/B Testing → Gradual Rollout → Full Deployment
```

### **2. Performance Budgets**
```javascript
const PERFORMANCE_BUDGETS = {
  'bundle-size': '250kb', // Main bundle
  'cache-size': '10MB',   // Total cache size
  'load-time': '3s',      // Time to interactive
  'memory-usage': '50MB', // Runtime memory
};
```

### **3. Monitoring & Analytics Integration**
```javascript
// Enhanced Monitoring
MonitoringStack
├── Performance Analytics (Core Web Vitals)
├── User Behavior Analytics (Interaction Tracking)
├── Error Monitoring (Real-time Error Reporting)
├── Business Metrics (Conversion Tracking)
└── Infrastructure Monitoring (Uptime, Response Times)
```

---

This enhanced architecture supports modern web standards, mobile-first design, progressive web app capabilities, and comprehensive user experience optimization while maintaining the core business logic and security requirements of the garment ERP system. The Week 7 enhancements provide a foundation for scalable, accessible, and performant mobile experiences.