# 🔌 Garment ERP PWA - API Documentation

## 📋 Table of Contents
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Firebase Services API](#firebase-services-api)
- [Damage Reporting API](#damage-reporting-api)
- [Operator Wallet API](#operator-wallet-api)
- [Work Assignment API](#work-assignment-api)
- [Notification API](#notification-api)
- [Analytics API](#analytics-api)
- [Real-time APIs](#real-time-apis)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## 🎯 API Overview

The Garment ERP PWA uses **Firebase as the backend service**, providing a comprehensive set of APIs for managing the entire garment manufacturing workflow. All APIs are built on top of Firebase Firestore, Authentication, and Cloud Functions.

### **Base Architecture**
```
Frontend (React PWA) 
    ↓
Service Layer (JavaScript Classes)
    ↓  
Firebase SDK
    ↓
Firebase Backend Services
    ↓
Firestore Database
```

### **API Response Format**
All APIs return a standardized response format:

```javascript
// Success Response
{
  success: true,
  data: { /* response data */ },
  message: "Operation completed successfully"
}

// Error Response  
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE",
  details: { /* additional error details */ }
}
```

---

## 🔐 Authentication

### **Firebase Authentication API**

#### **Login**
```javascript
// src/services/firebase-services.js
class AuthService {
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get custom claims (role information)
      const token = await user.getIdToken(true);
      const tokenResult = await user.getIdTokenResult();
      
      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          role: tokenResult.claims.role,
          permissions: tokenResult.claims.permissions,
          displayName: user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
}
```

#### **Get Current User**
```javascript
const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve({
          success: true,
          data: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }
        });
      } else {
        resolve({
          success: false,
          error: "No user authenticated"
        });
      }
    });
  });
};
```

#### **Logout**
```javascript
const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 🔥 Firebase Services API

### **Work Items API**

#### **Get Assigned Work Items**
```javascript
// GET /workItems (filtered by operator)
const getAssignedWorkItems = async (operatorId) => {
  try {
    const q = query(
      collection(db, 'workItems'),
      where('operatorId', '==', operatorId),
      where('status', 'in', ['assigned', 'in_progress']),
      orderBy('assignedAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const workItems = [];

    snapshot.forEach(doc => {
      workItems.push({
        id: doc.id,
        ...doc.data(),
        assignedAt: doc.data().assignedAt?.toDate()
      });
    });

    return {
      success: true,
      data: workItems,
      count: workItems.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### **Create Work Item**
```javascript
// POST /workItems
const createWorkItem = async (workData) => {
  try {
    const workItem = {
      bundleNumber: workData.bundleNumber,
      articleNumber: workData.articleNumber,
      operation: workData.operation,
      pieces: workData.pieces,
      rate: workData.rate,
      totalValue: workData.pieces * workData.rate,
      status: 'pending',
      operatorId: null,
      assignedBy: workData.supervisorId,
      createdAt: serverTimestamp(),
      paymentStatus: 'PENDING',
      canWithdraw: false
    };

    const docRef = await addDoc(collection(db, 'workItems'), workItem);
    
    return {
      success: true,
      data: {
        id: docRef.id,
        ...workItem
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### **Complete Work Item**
```javascript
// PUT /workItems/:id/complete
const completeWorkItem = async (workItemId, completionData) => {
  try {
    // Check for unresolved damage reports
    const damageCheck = await checkBundleDamageStatus(workItemId);
    
    if (damageCheck.hasUnresolvedDamage) {
      return {
        success: false,
        error: "Cannot complete work - unresolved damage reports",
        code: "DAMAGE_PENDING",
        details: {
          pendingPieces: damageCheck.pendingPieces,
          damageReports: damageCheck.damageReports
        }
      };
    }

    const updateData = {
      status: 'completed',
      completedAt: serverTimestamp(),
      completedPieces: completionData.piecesCompleted,
      qualityScore: completionData.qualityScore,
      timeSpent: completionData.timeSpent,
      paymentStatus: 'RELEASED',
      canWithdraw: true
    };

    await updateDoc(doc(db, 'workItems', workItemId), updateData);

    // Create wage record
    await addDoc(collection(db, 'wageRecords'), {
      operatorId: completionData.operatorId,
      workItemId: workItemId,
      amount: completionData.piecesCompleted * completionData.rate,
      completedAt: serverTimestamp()
    });

    return {
      success: true,
      data: {
        workItemId,
        earnedAmount: completionData.piecesCompleted * completionData.rate,
        completionTime: new Date()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 🔧 Damage Reporting API

### **Submit Damage Report**
```javascript
// POST /damage-reports
const submitDamageReport = async (reportData) => {
  try {
    const batch = writeBatch(db);
    
    // 1. Create damage report
    const reportDocument = createDamageReportDocument({
      ...reportData,
      reportedAt: serverTimestamp(),
      status: 'reported_to_supervisor'
    });
    
    const reportRef = doc(collection(db, 'damage_reports'));
    batch.set(reportRef, reportDocument);
    
    // 2. Hold bundle payment
    const bundleRef = doc(db, 'workItems', reportData.bundleId);
    batch.update(bundleRef, {
      paymentStatus: 'HELD_FOR_DAMAGE',
      heldAmount: reportData.pieces * reportData.rate,
      canWithdraw: false,
      damageReportId: reportRef.id,
      paymentHeldAt: serverTimestamp()
    });
    
    // 3. Update operator wallet
    const walletRef = doc(db, 'operatorWallets', reportData.operatorId);
    batch.update(walletRef, {
      heldAmount: increment(reportData.pieces * reportData.rate),
      heldBundles: arrayUnion(reportData.bundleId)
    });
    
    await batch.commit();
    
    return {
      success: true,
      data: {
        reportId: reportRef.id,
        heldAmount: reportData.pieces * reportData.rate,
        message: "Damage reported and payment held pending resolution"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Get Damage Reports (Supervisor)**
```javascript
// GET /damage-reports/supervisor/:supervisorId
const getSupervisorDamageQueue = async (supervisorId, statusFilter) => {
  try {
    let q = query(
      collection(db, 'damage_reports'),
      where('supervisorId', '==', supervisorId),
      orderBy('reportedAt', 'desc'),
      limit(50)
    );

    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }

    const snapshot = await getDocs(q);
    const reports = [];

    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate()
      });
    });

    return {
      success: true,
      data: reports,
      count: reports.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};
```

### **Start Rework**
```javascript
// PUT /damage-reports/:reportId/rework/start
const startRework = async (reportId, supervisorData) => {
  try {
    await updateDoc(doc(db, 'damage_reports', reportId), {
      status: 'rework_in_progress',
      reworkStartedAt: serverTimestamp(),
      'reworkDetails.supervisorNotes': supervisorData.notes,
      'systemInfo.updatedAt': serverTimestamp()
    });

    return {
      success: true,
      data: {
        reportId,
        status: 'rework_in_progress',
        message: "Rework started successfully"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Complete Rework**
```javascript
// PUT /damage-reports/:reportId/rework/complete
const completeRework = async (reportId, completionData) => {
  try {
    const updateData = {
      status: 'rework_completed',
      reworkCompletedAt: serverTimestamp(),
      'reworkDetails.timeSpentMinutes': completionData.timeSpentMinutes,
      'reworkDetails.qualityCheckPassed': completionData.qualityCheckPassed,
      'reworkDetails.supervisorNotes': completionData.notes,
      'paymentImpact.supervisorCompensation': (completionData.timeSpentMinutes * 150) / 60, // Rs 150/hour
      'systemInfo.updatedAt': serverTimestamp()
    };

    await updateDoc(doc(db, 'damage_reports', reportId), updateData);

    return {
      success: true,
      data: {
        reportId,
        supervisorCompensation: (completionData.timeSpentMinutes * 150) / 60,
        message: "Rework completed successfully"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 💰 Operator Wallet API

### **Get Wallet Balance**
```javascript
// GET /wallet/:operatorId
const getWalletBalance = async (operatorId) => {
  try {
    const walletRef = doc(db, 'operatorWallets', operatorId);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      const walletData = walletSnap.data();
      return {
        success: true,
        data: {
          operatorId,
          availableAmount: walletData.availableAmount || 0,
          heldAmount: walletData.heldAmount || 0,
          totalEarned: walletData.totalEarned || 0,
          heldBundles: walletData.heldBundles || [],
          canWithdraw: (walletData.availableAmount || 0) > 0,
          lastUpdated: walletData.lastUpdated?.toDate()
        }
      };
    } else {
      // Initialize empty wallet
      return {
        success: true,
        data: {
          operatorId,
          availableAmount: 0,
          heldAmount: 0,
          totalEarned: 0,
          heldBundles: [],
          canWithdraw: false
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Get Wage History**
```javascript
// GET /wallet/:operatorId/history
const getWageHistory = async (operatorId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'wageRecords'),
      where('operatorId', '==', operatorId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const wageRecords = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      wageRecords.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        paymentDate: data.date
      });
    });

    // Group by date
    const groupedWages = {};
    wageRecords.forEach(record => {
      const date = record.paymentDate || 'Unknown';
      if (!groupedWages[date]) {
        groupedWages[date] = {
          date,
          records: [],
          totalAmount: 0
        };
      }
      groupedWages[date].records.push(record);
      groupedWages[date].totalAmount += record.amount || 0;
    });

    return {
      success: true,
      data: {
        wageRecords,
        groupedWages: Object.values(groupedWages),
        totalRecords: wageRecords.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};
```

### **Release Bundle Payment**
```javascript
// POST /wallet/release-payment
const releaseBundlePayment = async (bundleId, operatorId) => {
  try {
    const batch = writeBatch(db);
    
    // Get bundle data
    const bundleRef = doc(db, 'workItems', bundleId);
    const bundleSnap = await getDoc(bundleRef);
    
    if (!bundleSnap.exists()) {
      throw new Error('Bundle not found');
    }
    
    const bundleData = bundleSnap.data();
    
    if (bundleData.paymentStatus !== 'HELD_FOR_DAMAGE') {
      throw new Error('Bundle payment is not held');
    }

    // Release payment - Update bundle
    batch.update(bundleRef, {
      paymentStatus: 'RELEASED',
      paymentReleasedAt: serverTimestamp(),
      canWithdraw: true
    });

    // Update operator wallet
    const walletRef = doc(db, 'operatorWallets', operatorId);
    batch.update(walletRef, {
      availableAmount: increment(bundleData.heldAmount),
      heldAmount: increment(-bundleData.heldAmount),
      totalEarned: increment(bundleData.heldAmount),
      heldBundles: arrayRemove(bundleId)
    });

    // Create wage record
    const wageRecordRef = doc(collection(db, 'wageRecords'));
    batch.set(wageRecordRef, {
      operatorId,
      bundleId,
      amount: bundleData.heldAmount,
      workType: 'bundle_completion_with_damage',
      paymentType: 'released_after_damage',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });

    await batch.commit();

    return {
      success: true,
      data: {
        bundleId,
        releasedAmount: bundleData.heldAmount,
        operatorId,
        message: `Payment of Rs ${bundleData.heldAmount} released`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 📋 Work Assignment API

### **Assign Work to Operator**
```javascript
// POST /work-assignments
const assignWork = async (assignmentData) => {
  try {
    const batch = writeBatch(db);
    
    // Update work item with assignment
    const workItemRef = doc(db, 'workItems', assignmentData.workItemId);
    batch.update(workItemRef, {
      operatorId: assignmentData.operatorId,
      assignedBy: assignmentData.supervisorId,
      assignedAt: serverTimestamp(),
      status: 'assigned',
      estimatedCompletionTime: calculateEstimatedTime(assignmentData)
    });
    
    // Log assignment activity
    const activityRef = doc(collection(db, 'activity_logs'));
    batch.set(activityRef, {
      type: 'work_assignment',
      workItemId: assignmentData.workItemId,
      operatorId: assignmentData.operatorId,
      supervisorId: assignmentData.supervisorId,
      timestamp: serverTimestamp()
    });
    
    await batch.commit();
    
    return {
      success: true,
      data: {
        workItemId: assignmentData.workItemId,
        operatorId: assignmentData.operatorId,
        assignedAt: new Date(),
        message: "Work assigned successfully"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Self-Assign Work**
```javascript
// POST /work-assignments/self-assign
const selfAssignWork = async (operatorId, workItemId) => {
  try {
    // Validate self-assignment eligibility
    const eligibilityCheck = await validateSelfAssignment(operatorId, workItemId);
    
    if (!eligibilityCheck.eligible) {
      return {
        success: false,
        error: eligibilityCheck.reason,
        code: "SELF_ASSIGNMENT_NOT_ALLOWED"
      };
    }
    
    const batch = writeBatch(db);
    
    // Update work item
    const workItemRef = doc(db, 'workItems', workItemId);
    batch.update(workItemRef, {
      operatorId: operatorId,
      assignedAt: serverTimestamp(),
      status: 'self_assigned',
      selfAssignedAt: serverTimestamp()
    });
    
    // Update operator's self-assignment count
    const operatorRef = doc(db, 'users', operatorId);
    batch.update(operatorRef, {
      selfAssignedCount: increment(1),
      lastSelfAssignedAt: serverTimestamp()
    });
    
    await batch.commit();
    
    return {
      success: true,
      data: {
        workItemId,
        operatorId,
        message: "Work self-assigned successfully"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 🔔 Notification API

### **Create Notification**
```javascript
// POST /notifications
const createNotification = async (notificationData) => {
  try {
    const notification = {
      recipientId: notificationData.recipientId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority || 'normal',
      read: false,
      createdAt: serverTimestamp(),
      data: notificationData.data || {}
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);

    return {
      success: true,
      data: {
        notificationId: docRef.id,
        ...notification
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Get User Notifications**
```javascript
// GET /notifications/:userId
const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    if (unreadOnly) {
      q = query(q, where('read', '==', false));
    }

    const snapshot = await getDocs(q);
    const notifications = [];

    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    return {
      success: true,
      data: {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        totalCount: notifications.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};
```

---

## 📊 Analytics API

### **Get Production Analytics**
```javascript
// GET /analytics/production
const getProductionAnalytics = async (dateRange, filters = {}) => {
  try {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    let q = query(
      collection(db, 'workItems'),
      where('completedAt', '>=', startDate),
      where('completedAt', '<=', endDate),
      orderBy('completedAt', 'desc')
    );

    // Apply filters
    if (filters.operatorId) {
      q = query(q, where('operatorId', '==', filters.operatorId));
    }
    if (filters.operation) {
      q = query(q, where('operation', '==', filters.operation));
    }

    const snapshot = await getDocs(q);
    const workItems = [];

    snapshot.forEach(doc => {
      workItems.push({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate()
      });
    });

    // Calculate analytics
    const analytics = calculateProductionMetrics(workItems);

    return {
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        totalItems: workItems.length,
        totalPieces: analytics.totalPieces,
        totalEarnings: analytics.totalEarnings,
        averageQuality: analytics.averageQuality,
        averageEfficiency: analytics.averageEfficiency,
        operatorStats: analytics.operatorStats,
        dailyBreakdown: analytics.dailyBreakdown
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Get Damage Analytics**
```javascript
// GET /analytics/damage
const getDamageAnalytics = async (dateRange, filters = {}) => {
  try {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    let q = query(
      collection(db, 'damage_reports'),
      where('reportedAt', '>=', startDate),
      where('reportedAt', '<=', endDate),
      orderBy('reportedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const reports = [];

    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate()
      });
    });

    // Process analytics
    const analytics = processDamageAnalytics(reports);

    return {
      success: true,
      data: {
        totalReports: reports.length,
        reportsByCategory: analytics.reportsByCategory,
        reportsByOperator: analytics.reportsByOperator,
        averageResolutionTime: analytics.averageResolutionTime,
        operatorFaultRate: analytics.operatorFaultRate,
        totalReworkCost: analytics.totalReworkCost,
        mostCommonDamageTypes: analytics.mostCommonDamageTypes,
        trendData: analytics.trendData
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## 🔄 Real-time APIs

### **Real-time Work Updates**
```javascript
// WebSocket-like functionality using Firebase listeners
const subscribeToWorkUpdates = (operatorId, callback) => {
  const q = query(
    collection(db, 'workItems'),
    where('operatorId', '==', operatorId),
    orderBy('assignedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const workItems = [];
    snapshot.docChanges().forEach((change) => {
      const workItem = {
        id: change.doc.id,
        ...change.doc.data(),
        changeType: change.type // 'added', 'modified', 'removed'
      };
      workItems.push(workItem);
    });

    callback({
      success: true,
      data: workItems,
      timestamp: new Date()
    });
  }, (error) => {
    callback({
      success: false,
      error: error.message
    });
  });
};
```

### **Real-time Damage Report Updates**
```javascript
const subscribeToDamageReports = (supervisorId, callback) => {
  const q = query(
    collection(db, 'damage_reports'),
    where('supervisorId', '==', supervisorId),
    where('status', 'in', ['reported_to_supervisor', 'acknowledged', 'rework_in_progress']),
    orderBy('reportedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate()
      });
    });

    callback({
      success: true,
      data: reports,
      count: reports.length,
      timestamp: new Date()
    });
  });
};
```

### **Real-time Wallet Updates**
```javascript
const subscribeToWalletUpdates = (operatorId, callback) => {
  const walletRef = doc(db, 'operatorWallets', operatorId);

  return onSnapshot(walletRef, (doc) => {
    if (doc.exists()) {
      const walletData = doc.data();
      callback({
        success: true,
        data: {
          operatorId,
          availableAmount: walletData.availableAmount || 0,
          heldAmount: walletData.heldAmount || 0,
          totalEarned: walletData.totalEarned || 0,
          heldBundles: walletData.heldBundles || [],
          lastUpdated: walletData.lastUpdated?.toDate()
        }
      });
    } else {
      callback({
        success: true,
        data: {
          operatorId,
          availableAmount: 0,
          heldAmount: 0,
          totalEarned: 0,
          heldBundles: []
        }
      });
    }
  });
};
```

---

## ❌ Error Handling

### **Standard Error Codes**
```javascript
const ERROR_CODES = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'Invalid username or password',
  AUTH_USER_NOT_FOUND: 'User account not found',
  AUTH_INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this operation',
  
  // Work Management Errors
  WORK_ITEM_NOT_FOUND: 'Work item not found',
  WORK_ALREADY_ASSIGNED: 'Work item is already assigned',
  WORK_CANNOT_COMPLETE: 'Work cannot be completed in current state',
  
  // Damage Report Errors
  DAMAGE_INVALID_PIECES: 'Invalid piece numbers selected',
  DAMAGE_REPORT_NOT_FOUND: 'Damage report not found',
  DAMAGE_ALREADY_RESOLVED: 'Damage report already resolved',
  
  // Payment Errors
  PAYMENT_HELD: 'Payment is held due to unresolved damage',
  PAYMENT_INSUFFICIENT_BALANCE: 'Insufficient balance for withdrawal',
  PAYMENT_ALREADY_RELEASED: 'Payment already released',
  
  // System Errors
  DATABASE_CONNECTION_ERROR: 'Database connection failed',
  VALIDATION_ERROR: 'Data validation failed',
  PERMISSION_DENIED: 'Permission denied'
};
```

### **Error Response Examples**
```javascript
// Validation Error
{
  success: false,
  error: "Validation failed",
  code: "VALIDATION_ERROR",
  details: {
    fields: [
      { field: "pieces", message: "Pieces must be greater than 0" },
      { field: "operatorId", message: "Operator ID is required" }
    ]
  }
}

// Business Logic Error
{
  success: false,
  error: "Cannot complete work - unresolved damage reports",
  code: "DAMAGE_PENDING",
  details: {
    damageReports: ["DR_001", "DR_002"],
    pendingPieces: 5,
    heldAmount: 300
  }
}

// System Error
{
  success: false,
  error: "Database connection failed",
  code: "DATABASE_CONNECTION_ERROR",
  details: {
    retryAfter: 5000,
    maxRetries: 3
  }
}
```

---

## 🚦 Rate Limiting

Firebase automatically handles rate limiting, but here are the practical limits:

### **Firestore Limits**
- **Writes per second**: 500 per database
- **Reads per second**: No limit
- **Document size**: 1MB max
- **Collection queries**: 1MB result max

### **Authentication Limits**
- **Sign-in attempts**: 5 per IP per hour (failed attempts)
- **Password reset**: 5 per hour per email
- **Account enumeration**: Protected automatically

### **Custom Rate Limiting**
```javascript
// Client-side rate limiting for API calls
class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) { // 100 requests per minute
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

// Usage in API calls
const rateLimiter = new RateLimiter();

const makeAPICall = async (apiFunction, ...args) => {
  if (!rateLimiter.canMakeRequest()) {
    return {
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED"
    };
  }
  
  return await apiFunction(...args);
};
```

---

## 📡 API Usage Examples

### **Complete Work Flow Example**
```javascript
// 1. Login
const loginResult = await authService.login('operator1', 'password123');
if (!loginResult.success) {
  console.error('Login failed:', loginResult.error);
  return;
}

// 2. Get assigned work
const workResult = await getAssignedWorkItems(loginResult.data.uid);
if (workResult.success && workResult.data.length > 0) {
  const workItem = workResult.data[0];
  
  // 3. Complete work
  const completionResult = await completeWorkItem(workItem.id, {
    piecesCompleted: workItem.pieces,
    qualityScore: 95,
    timeSpent: 120,
    operatorId: loginResult.data.uid,
    rate: workItem.rate
  });
  
  if (completionResult.success) {
    console.log('Work completed! Earned:', completionResult.data.earnedAmount);
  } else {
    console.error('Completion failed:', completionResult.error);
  }
}
```

### **Damage Report Flow Example**
```javascript
// 1. Report damage
const damageResult = await submitDamageReport({
  bundleId: 'B001',
  operatorId: 'operator1',
  supervisorId: 'supervisor1',
  pieceNumbers: [5, 8],
  damageType: 'cutting_error',
  description: 'Fabric tore during cutting',
  urgency: 'normal',
  pieces: 20,
  rate: 15
});

if (damageResult.success) {
  console.log('Damage reported. Payment held:', damageResult.data.heldAmount);
  
  // 2. Supervisor handles rework
  const reworkStart = await startRework(damageResult.data.reportId, {
    supervisorId: 'supervisor1',
    notes: 'Starting repair work'
  });
  
  // 3. Complete rework
  const reworkComplete = await completeRework(damageResult.data.reportId, {
    timeSpentMinutes: 45,
    qualityCheckPassed: true,
    notes: 'Repaired cutting error, pieces look good'
  });
  
  // 4. Release payment
  const paymentRelease = await releaseBundlePayment('B001', 'operator1');
  
  if (paymentRelease.success) {
    console.log('Payment released:', paymentRelease.data.releasedAmount);
  }
}
```

---

## 📱 Week 7 UI/UX Enhancement APIs

### **PWA Service API**

#### **Install PWA**
```javascript
// Install PWA from browser
const installPWA = async () => {
  try {
    const result = await pwaService.showInstallPrompt();
    return {
      success: true,
      data: {
        outcome: result.outcome, // 'accepted' or 'dismissed'
        installed: result.outcome === 'accepted'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### **Service Worker Registration**
```javascript
// Register service worker for offline functionality
const registerServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      return {
        success: true,
        data: {
          registrationId: registration.id,
          scope: registration.scope,
          updateFound: !!registration.waiting
        }
      };
    }
    
    return {
      success: false,
      error: 'Service Worker not supported'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Notification Service API**

#### **Subscribe to Push Notifications**
```javascript
// POST /api/notifications/subscribe
const subscribeToPushNotifications = async (subscription) => {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        subscription,
        preferences: {
          assignments: true,
          quality: true,
          system: false,
          breaks: true
        }
      })
    });

    const result = await response.json();
    
    return {
      success: result.success,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### **Send In-App Notification**
```javascript
// POST /api/notifications/in-app
const sendInAppNotification = async (notificationData) => {
  try {
    const notification = await notificationService.sendNotification({
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority,
      userId: notificationData.userId,
      actionUrl: notificationData.actionUrl,
      actions: notificationData.actions
    });

    return {
      success: true,
      data: {
        notificationId: notification.id,
        delivered: true,
        timestamp: new Date()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### **Real-time Notification Stream**
```javascript
// GET /api/notifications/stream (Server-Sent Events)
const subscribeToNotificationStream = (userId, callback) => {
  const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);
  
  eventSource.onmessage = (event) => {
    try {
      const notification = JSON.parse(event.data);
      callback({
        success: true,
        data: notification
      });
    } catch (error) {
      callback({
        success: false,
        error: 'Failed to parse notification'
      });
    }
  };

  eventSource.onerror = (error) => {
    callback({
      success: false,
      error: 'Notification stream error'
    });
  };

  return () => eventSource.close();
};
```

### **Internationalization API**

#### **Get Translations**
```javascript
// GET /api/i18n/translations/:language
const getTranslations = async (language = 'en') => {
  try {
    const resources = await import(`../locales/${language}/index.js`);
    
    return {
      success: true,
      data: {
        language,
        resources: resources.default,
        rtl: language === 'ne' // Right-to-left for Nepali
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to load translations',
      fallback: 'en'
    };
  }
};
```

#### **Format Currency**
```javascript
// Format currency based on locale
const formatCurrency = (amount, language = 'en') => {
  try {
    const formatters = {
      en: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NPR',
        currencyDisplay: 'symbol'
      }),
      ne: new Intl.NumberFormat('ne-NP', {
        style: 'currency',
        currency: 'NPR',
        currencyDisplay: 'symbol'
      })
    };

    const formatter = formatters[language] || formatters.en;
    
    return {
      success: true,
      data: {
        formatted: formatter.format(amount),
        raw: amount,
        currency: 'NPR'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: `Rs. ${amount}`
    };
  }
};
```

### **Performance Analytics API**

#### **Get Performance Metrics**
```javascript
// GET /api/analytics/performance
const getPerformanceMetrics = async () => {
  try {
    // Collect performance metrics
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource');

    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      resourceCount: resources.length,
      cacheHits: resources.filter(r => r.transferSize === 0).length
    };

    return {
      success: true,
      data: {
        metrics,
        performance: {
          grade: calculatePerformanceGrade(metrics),
          recommendations: getPerformanceRecommendations(metrics)
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Offline Queue API**

#### **Queue Offline Action**
```javascript
// Queue action when offline
const queueOfflineAction = async (action) => {
  try {
    const queueItem = {
      id: generateId(),
      action: action.type,
      data: action.data,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3
    };

    // Store in IndexedDB for persistence
    await storeOfflineAction(queueItem);

    return {
      success: true,
      data: {
        queueId: queueItem.id,
        queued: true,
        willSync: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### **Process Offline Queue**
```javascript
// Process queued actions when back online
const processOfflineQueue = async () => {
  try {
    const queuedActions = await getOfflineQueue();
    const results = [];

    for (const action of queuedActions) {
      try {
        const result = await executeQueuedAction(action);
        if (result.success) {
          await removeFromQueue(action.id);
          results.push({ actionId: action.id, status: 'synced' });
        } else {
          action.retries++;
          if (action.retries >= action.maxRetries) {
            await removeFromQueue(action.id);
            results.push({ actionId: action.id, status: 'failed', error: result.error });
          } else {
            await updateQueueItem(action);
            results.push({ actionId: action.id, status: 'retry' });
          }
        }
      } catch (error) {
        results.push({ actionId: action.id, status: 'error', error: error.message });
      }
    }

    return {
      success: true,
      data: {
        processed: results.length,
        synced: results.filter(r => r.status === 'synced').length,
        failed: results.filter(r => r.status === 'failed').length,
        retries: results.filter(r => r.status === 'retry').length,
        results
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### **Touch Gesture API**

#### **Handle Swipe Gestures**
```javascript
// Handle swipe gestures for navigation
const handleSwipeGesture = (element, callbacks) => {
  let startX, startY, startTime;

  element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  });

  element.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;

    // Determine swipe direction and execute callback
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
      if (deltaX > 0) {
        callbacks.onSwipeRight?.(deltaX);
      } else {
        callbacks.onSwipeLeft?.(Math.abs(deltaX));
      }
    }

    // Reset values
    startX = startY = null;
  });
};
```

## 🔧 API Configuration and Settings

### **Environment Configuration**
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001/api/v1',
    firebase: {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY_DEV,
      projectId: 'tsa-erp-dev'
    },
    features: {
      notifications: true,
      offline: true,
      analytics: false
    }
  },
  production: {
    baseURL: 'https://api.tsa-erp.com/v1',
    firebase: {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      projectId: 'tsa-erp-production'
    },
    features: {
      notifications: true,
      offline: true,
      analytics: true
    }
  }
};
```

### **Cache Configuration**
```javascript
const CACHE_CONFIG = {
  strategies: {
    'static-resources': 'CacheFirst',
    'api-data': 'NetworkFirst',
    'user-data': 'StaleWhileRevalidate',
    'offline-fallback': 'CacheOnly'
  },
  ttl: {
    'static-resources': 86400000, // 24 hours
    'api-data': 300000, // 5 minutes
    'user-data': 600000, // 10 minutes
    'translations': 3600000 // 1 hour
  }
};
```

---

This API documentation provides comprehensive coverage of all the key APIs used in the Garment ERP PWA, focusing on the critical business workflows of work management, damage reporting, payment processing, and the enhanced Week 7 UI/UX features including PWA capabilities, notifications, internationalization, and mobile optimizations.