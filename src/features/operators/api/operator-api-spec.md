# Operator Management API Specification

## Overview
This document defines the REST API endpoints for the Operator Management system in the TSA ERP application. All endpoints follow RESTful conventions and return consistent response formats.

## Base URL
```
https://api.tsa-erp.com/v1/operators
```

## Authentication
All endpoints require authentication using Firebase JWT tokens:
```
Authorization: Bearer <firebase-jwt-token>
```

## Response Format
All responses follow this structure:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
  requestId: string;
}
```

## Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource conflict (e.g., duplicate employee ID)
- `INTERNAL_ERROR`: Server error

---

## Endpoints

### 1. List Operators
Get a paginated list of operators with optional filtering.

**GET** `/operators`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search by name, username, or employee ID
- `status` (string, optional): Filter by status (`idle`, `working`, `break`, `offline`)
- `machineType` (string, optional): Filter by machine type
- `skillLevel` (string, optional): Filter by skill level
- `shift` (string, optional): Filter by shift
- `sortBy` (string, optional): Sort field (`name`, `efficiency`, `quality`, `recent`)
- `sortOrder` (string, optional): Sort direction (`asc`, `desc`)

**Response:**
```typescript
{
  success: true,
  data: {
    operators: OperatorSummary[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    },
    statistics: {
      total: number,
      active: number,
      available: number,
      avgEfficiency: number
    }
  }
}
```

**Example:**
```bash
GET /operators?page=1&limit=10&status=working&sortBy=efficiency&sortOrder=desc
```

---

### 2. Get Operator by ID
Retrieve detailed information about a specific operator.

**GET** `/operators/{operatorId}`

**Path Parameters:**
- `operatorId` (string): The operator's unique identifier

**Response:**
```typescript
{
  success: true,
  data: Operator
}
```

---

### 3. Get Operator with Real-time Status
Retrieve operator with current real-time status information.

**GET** `/operators/{operatorId}/status`

**Response:**
```typescript
{
  success: true,
  data: {
    operator: Operator,
    realtimeStatus: OperatorStatus,
    currentAssignments: WorkAssignment[]
  }
}
```

---

### 4. Create Operator
Create a new operator in the system.

**POST** `/operators`

**Request Body:**
```typescript
{
  username: string,
  name: string,
  employeeId: string,
  email?: string,
  phone?: string,
  address?: string,
  primaryMachine: string,
  machineTypes: string[],
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  specializations?: string[],
  shift: 'morning' | 'afternoon' | 'night',
  maxConcurrentWork: number,
  hiredDate: string, // ISO date
  avatar?: {
    type: 'emoji' | 'photo' | 'initials',
    value: string,
    backgroundColor?: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    operator: Operator,
    businessValidation: {
      warnings: string[]
    }
  }
}
```

---

### 5. Update Operator
Update an existing operator's information.

**PUT** `/operators/{operatorId}`

**Request Body:** Same as create, but all fields optional except those being updated

**Response:**
```typescript
{
  success: true,
  data: {
    operator: Operator,
    businessValidation: {
      warnings: string[]
    }
  }
}
```

---

### 6. Update Operator Status
Update an operator's real-time status.

**PATCH** `/operators/{operatorId}/status`

**Request Body:**
```typescript
{
  status?: 'idle' | 'working' | 'break' | 'offline',
  machineStatus?: 'operational' | 'maintenance' | 'error',
  currentWork?: string,
  location?: string,
  notes?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    realtimeStatus: OperatorStatus,
    lastUpdated: string
  }
}
```

---

### 7. Assign Work to Operator
Assign a work item to an operator.

**POST** `/operators/{operatorId}/assignments`

**Request Body:**
```typescript
{
  bundleId: string,
  workItemId: string,
  assignmentMethod: 'supervisor_assigned' | 'self_assigned',
  estimatedCompletion?: string, // ISO date
  priority: 'low' | 'medium' | 'high' | 'urgent',
  notes?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    assignment: WorkAssignment,
    validation: {
      canAssign: boolean,
      warnings: string[]
    }
  }
}
```

---

### 8. Complete Work Assignment
Mark a work assignment as completed.

**POST** `/operators/{operatorId}/assignments/{assignmentId}/complete`

**Request Body:**
```typescript
{
  completedPieces: number,
  qualityScore: number, // 0-1
  efficiency: number, // 0-1
  timeSpent: number, // minutes
  notes?: string,
  issues?: string[]
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    completedAssignment: WorkAssignment,
    updatedStats: {
      efficiency: number,
      qualityScore: number,
      completedBundles: number,
      totalEarnings: number
    }
  }
}
```

---

### 9. Get Operator Performance
Retrieve performance analytics for an operator.

**GET** `/operators/{operatorId}/performance`

**Query Parameters:**
- `period` (string, optional): Time period (`week`, `month`, `quarter`, `year`)
- `startDate` (string, optional): Start date (ISO)
- `endDate` (string, optional): End date (ISO)

**Response:**
```typescript
{
  success: true,
  data: {
    metrics: {
      efficiency: {
        current: number,
        average: number,
        trend: 'improving' | 'declining' | 'stable'
      },
      quality: {
        current: number,
        average: number,
        trend: 'improving' | 'declining' | 'stable'
      },
      productivity: {
        bundlesCompleted: number,
        hoursWorked: number,
        avgBundlesPerHour: number
      }
    },
    recommendations: string[],
    promotionEligibility: {
      eligible: boolean,
      nextLevel: string,
      requirements: string[],
      blockers: string[]
    }
  }
}
```

---

### 10. Get Operators by Machine Type
Retrieve operators capable of working on a specific machine type.

**GET** `/operators/by-machine/{machineType}`

**Query Parameters:**
- `available` (boolean, optional): Only return available operators
- `skillLevel` (string, optional): Minimum skill level required

**Response:**
```typescript
{
  success: true,
  data: {
    operators: OperatorSummary[],
    machineInfo: {
      machineType: string,
      displayName: string,
      requiredSkillLevel: string
    }
  }
}
```

---

### 11. Get Available Operators
Get operators currently available for work assignment.

**GET** `/operators/available`

**Query Parameters:**
- `machineType` (string, optional): Filter by machine compatibility
- `skillLevel` (string, optional): Minimum skill level
- `shift` (string, optional): Current shift

**Response:**
```typescript
{
  success: true,
  data: {
    operators: OperatorSummary[],
    count: number
  }
}
```

---

### 12. Deactivate Operator
Deactivate an operator (soft delete).

**DELETE** `/operators/{operatorId}`

**Response:**
```typescript
{
  success: true,
  data: {
    operatorId: string,
    deactivatedAt: string
  }
}
```

---

### 13. Get Operator Activity Log
Retrieve activity log for an operator.

**GET** `/operators/{operatorId}/activity`

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `startDate` (string, optional): Start date filter
- `endDate` (string, optional): End date filter
- `activityType` (string, optional): Filter by activity type

**Response:**
```typescript
{
  success: true,
  data: {
    activities: ActivityLog[],
    pagination: PaginationInfo
  }
}
```

---

### 14. Update Operator Statistics
Bulk update operator performance statistics (internal use).

**PATCH** `/operators/{operatorId}/stats`

**Request Body:**
```typescript
{
  efficiency?: number,
  qualityScore?: number,
  completedPieces?: number,
  earnings?: number,
  hoursWorked?: number
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    updatedStats: OperatorStats
  }
}
```

---

## WebSocket Events

For real-time updates, the system also supports WebSocket connections:

### Connection
```
wss://api.tsa-erp.com/v1/operators/ws
```

### Events
- `operator:status_changed` - Operator status updated
- `operator:work_assigned` - New work assigned to operator
- `operator:work_completed` - Work assignment completed
- `operator:performance_updated` - Performance metrics updated

### Example Event
```typescript
{
  event: 'operator:status_changed',
  data: {
    operatorId: string,
    oldStatus: string,
    newStatus: string,
    timestamp: string
  }
}
```

---

## Rate Limiting
- 1000 requests per hour per API key
- 100 requests per minute for real-time status updates
- WebSocket connections limited to 10 per user

## Caching
- Operator lists cached for 5 minutes
- Individual operator data cached for 2 minutes
- Real-time status not cached

## Data Types Reference

### OperatorSummary
```typescript
interface OperatorSummary {
  id: string;
  username: string;
  name: string;
  employeeId: string;
  primaryMachine: string;
  machineTypes: string[];
  skillLevel: string;
  currentStatus: string;
  currentWork?: string;
  efficiency: number;
  qualityScore: number;
  completedBundles: number;
  shift: string;
  avatar?: AvatarConfig;
  lastSeen: string;
}
```

### Operator (extends OperatorSummary)
```typescript
interface Operator extends OperatorSummary {
  email?: string;
  phone?: string;
  address?: string;
  specializations: string[];
  maxConcurrentWork: number;
  averageEfficiency: number;
  totalWorkingDays: number;
  totalEarnings?: number;
  hiredDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  realtimeStatus?: OperatorStatus;
}
```

### OperatorStatus
```typescript
interface OperatorStatus {
  status: 'idle' | 'working' | 'break' | 'offline';
  machineStatus: 'operational' | 'maintenance' | 'error';
  currentWork?: string;
  currentWorkItems: number;
  location?: string;
  lastActivity: string;
  shiftStart?: string;
  notes?: string;
  updatedBy: string;
}
```