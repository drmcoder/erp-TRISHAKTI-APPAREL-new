# TSA ERP Database Architecture

## Database Strategy: Firestore + Realtime Database

### **Firestore (Primary Database)**
**Use Case**: Structured data, complex queries, permanent records, offline capability

#### Collections:
```
📁 cuttingDroplets/
  📄 {dropletId}
    - lotNumber: string
    - articleNumber: string
    - garmentType: 'polo' | 'tshirt' | etc
    - colorSizeData: ColorSizeBreakdown[]
    - status: 'cutting' | 'ready_for_sewing'
    - createdAt: timestamp

📁 productionBundles/
  📄 {bundleId}
    - bundleNumber: string (LOT001-Blue-XL-1)
    - lotNumber: string
    - color: string
    - size: string
    - pieces: number
    - processSteps: BundleProcessStep[]
    - status: 'ready' | 'in_progress' | 'completed'
    - assignedOperators: string[]

📁 operatorWorkSessions/
  📄 {sessionId}
    - operatorId: string
    - bundleId: string
    - stepNumber: number
    - operation: string
    - completedPieces: number
    - totalEarning: number
    - workDate: timestamp
    - status: 'completed'

📁 productionLots/
  📄 {lotId}
    - lotNumber: string
    - articleNumber: string
    - processSteps: ProcessStep[]
    - colorSizeBreakdown: ColorSizeBreakdown[]
    - status: string
```

---

### **Realtime Database (Live Updates)**
**Use Case**: Real-time updates, live dashboards, temporary status, live metrics

#### Structure:
```json
{
  "live_production": {
    "operators": {
      "{operatorId}": {
        "operatorId": "op1",
        "operatorName": "Maya Patel",
        "status": "working",
        "currentBundle": "LOT001-Blue-XL-1",
        "currentOperation": "Collar Making",
        "machineType": "single_needle",
        "startTime": 1640995200000,
        "lastActivity": 1640995800000
      }
    },
    "bundles": {
      "{bundleId}": {
        "bundleNumber": "LOT001-Blue-XL-1",
        "status": "in_progress",
        "currentStep": 2,
        "readySteps": 1,
        "lastUpdated": 1640995800000
      }
    },
    "work_progress": {
      "{sessionId}": {
        "operatorId": "op1",
        "bundleId": "b1",
        "operation": "Collar Making",
        "assignedPieces": 30,
        "completedPieces": 15,
        "progressPercentage": 50,
        "startTime": 1640995200000,
        "lastUpdate": 1640995800000
      }
    }
  },
  
  "live_lots": {
    "{lotId}": {
      "lotNumber": "LOT001",
      "status": "in_progress",
      "totalPieces": 300,
      "completedSteps": 2,
      "totalSteps": 9,
      "progress": 22,
      "lastUpdated": 1640995800000
    }
  },

  "live_operator_earnings": {
    "{operatorId}": {
      "daily_total": {
        "pieces": 45,
        "earnings": 112.5,
        "lastUpdate": 1640995800000
      },
      "today": {
        "{workEntryId}": {
          "operation": "Collar Making",
          "pieces": 15,
          "earning": 37.5,
          "timestamp": 1640995200000
        }
      }
    }
  },

  "live_production_stats": {
    "totalLots": 5,
    "activeLots": 3,
    "completedLots": 2,
    "operatorsWorking": 4,
    "totalEarningsToday": 1250.75,
    "lastUpdated": 1640995800000
  }
}
```

---

## **Data Flow Architecture**

### 1. **Cutting Entry → Bundles**
```
Management Entry (Firestore) → Realtime Status (RT DB)
├── cuttingDroplets collection
└── live_production/cutting_droplets
```

### 2. **Bundle Assignment**
```
Assignment (Firestore) → Live Status (RT DB)
├── productionBundles collection  
└── live_production/bundles + operators
```

### 3. **Operator Work Tracking**
```
Completed Work (Firestore) → Live Updates (RT DB)
├── operatorWorkSessions collection
└── live_operator_earnings + work_progress
```

### 4. **Live Dashboards**
```
Real-time Subscriptions (RT DB only)
├── live_production/* 
├── live_operator_earnings/*
└── live_production_stats
```

---

## **Benefits of This Architecture**

### **Firestore Benefits:**
- ✅ Complex queries (date ranges, filtering, sorting)
- ✅ Offline capability for mobile operators
- ✅ ACID transactions for data consistency
- ✅ Permanent record keeping for payroll/audit
- ✅ Better for structured data and relations

### **Realtime Database Benefits:**
- ✅ Sub-second real-time updates
- ✅ Lower latency for live dashboards  
- ✅ Better for temporary status data
- ✅ Simpler structure for live metrics
- ✅ More cost-effective for frequent updates

---

## **Query Patterns**

### **Firestore Queries (Complex Data)**
```typescript
// Monthly wage calculation
query(
  collection(db, 'operatorWorkSessions'),
  where('operatorId', '==', 'op1'),
  where('workDate', '>=', startOfMonth),
  where('workDate', '<=', endOfMonth),
  where('status', '==', 'completed'),
  orderBy('workDate', 'desc')
)

// Bundle assignment filtering
query(
  collection(db, 'productionBundles'),
  where('status', '==', 'ready'),
  where('garmentType', '==', 'polo')
)
```

### **Realtime Database Subscriptions (Live Data)**
```typescript
// Live operator status
onValue(ref(rtdb, 'live_production/operators'), callback)

// Live production stats
onValue(ref(rtdb, 'live_production_stats'), callback)

// Operator daily earnings
onValue(ref(rtdb, `live_operator_earnings/${operatorId}/daily_total`), callback)
```

---

## **Security Rules**

### **Firestore Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Operators can read their own work sessions
    match /operatorWorkSessions/{sessionId} {
      allow read, write: if request.auth != null 
        && resource.data.operatorId == request.auth.uid;
    }
    
    // Supervisors can assign bundles
    match /productionBundles/{bundleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.token.role in ['supervisor', 'manager'];
    }
    
    // Management can create cutting droplets
    match /cuttingDroplets/{dropletId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.token.role == 'manager';
    }
  }
}
```

### **Realtime Database Rules**
```json
{
  "rules": {
    "live_production": {
      ".read": "auth != null",
      "operators": {
        "$operatorId": {
          ".write": "auth != null && (auth.uid == $operatorId || auth.token.role == 'supervisor')"
        }
      }
    },
    "live_operator_earnings": {
      "$operatorId": {
        ".read": "auth != null && (auth.uid == $operatorId || auth.token.role == 'supervisor')",
        ".write": "auth != null && auth.uid == $operatorId"
      }
    }
  }
}
```

This architecture provides the best of both databases - Firestore for reliable structured data and complex queries, Realtime Database for instant live updates and dashboards.