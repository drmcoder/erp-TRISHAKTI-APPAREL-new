# Work Assignment System API Documentation

## Overview
This document provides comprehensive API documentation for the Work Assignment System, including all endpoints, data structures, and integration patterns.

## Base Configuration
- **Base URL**: `${REACT_APP_API_BASE_URL}/v1/work-assignments`
- **Timeout**: 45 seconds
- **Retry Attempts**: 3
- **Retry Delay**: 2 seconds
- **Batch Size**: 50 items maximum

## Authentication
All API calls require authentication headers:
```typescript
headers: {
  'Authorization': 'Bearer ${token}',
  'Content-Type': 'application/json'
}
```

## Core Entities

### WorkBundle
```typescript
interface WorkBundle {
  id?: string;
  bundleNumber: string;
  orderNumber: string;
  garmentType: string;
  garmentSize: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  workItems: WorkItem[];
  totalPieces: number;
  completedPieces: number;
  remainingPieces: number;
  estimatedDuration: number;
  actualDuration?: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  assignmentHistory: WorkAssignment[];
}
```

### WorkItem
```typescript
interface WorkItem {
  id?: string;
  bundleId: string;
  bundleNumber: string;
  orderNumber: string;
  operation: string;
  machineType: string;
  targetQuantity: number;
  completedQuantity: number;
  targetRate?: number;
  complexity: number;
  requiredSkills: string[];
  estimatedDuration: number;
  actualDuration?: number;
  status: 'pending' | 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date;
  assignedOperator?: string;
  assignmentId?: string;
  qualityRequirement: number;
  specialInstructions?: string;
  materials: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### WorkAssignment
```typescript
interface WorkAssignment {
  id?: string;
  workItemId: string;
  operatorId: string;
  supervisorId: string;
  assignmentMethod: 'manual' | 'auto_assigned' | 'self_requested';
  assignedAt: Date;
  expectedStartTime?: Date;
  actualStartTime?: Date;
  expectedCompletionTime: Date;
  actualCompletionTime?: Date;
  status: 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
  aiRecommendation?: AIRecommendation;
  performanceMetrics?: ProductionMetrics;
}
```

## API Endpoints

### Work Bundles

#### GET /work-bundles
Retrieve work bundles with filtering and pagination.

**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority
- `garmentType`: Filter by garment type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')

**Response:**
```typescript
{
  data: WorkBundle[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

#### POST /work-bundles
Create a new work bundle.

**Request Body:**
```typescript
{
  bundleNumber: string,
  orderNumber: string,
  garmentType: string,
  garmentSize: string,
  quantity: number,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  deadline: Date,
  workItems: Omit<WorkItem, 'id' | 'bundleId'>[]
}
```

#### PUT /work-bundles/:id
Update an existing work bundle.

#### DELETE /work-bundles/:id
Delete a work bundle (soft delete).

### Work Items

#### GET /work-items
Retrieve work items with filtering.

**Query Parameters:**
- `status`: Filter by status
- `operation`: Filter by operation type
- `machineType`: Filter by machine type
- `assignedOperator`: Filter by assigned operator
- `available`: 'true' to get only unassigned items

#### POST /work-items
Create a new work item.

#### PUT /work-items/:id
Update a work item.

#### GET /work-items/:id/compatible-operators
Get operators compatible with a work item.

**Response:**
```typescript
{
  operators: OperatorSummary[],
  recommendations: AIRecommendation[]
}
```

### Work Assignments

#### POST /assignments
Create a new work assignment.

**Request Body:**
```typescript
{
  workItemId: string,
  operatorId: string,
  supervisorId: string,
  assignmentMethod: 'manual' | 'auto_assigned' | 'self_requested',
  expectedStartTime?: Date,
  notes?: string
}
```

#### PUT /assignments/:id/start
Start a work assignment.

#### PUT /assignments/:id/pause
Pause a work assignment.

#### PUT /assignments/:id/complete
Complete a work assignment.

**Request Body:**
```typescript
{
  actualQuantity: number,
  qualityGrade: 'excellent' | 'good' | 'acceptable' | 'poor',
  defects?: QualityDefect[],
  notes?: string,
  photoUrls?: string[]
}
```

#### GET /assignments/operator/:operatorId
Get assignments for a specific operator.

### AI Recommendations

#### POST /recommendations/get-recommendations
Get AI recommendations for work assignment.

**Request Body:**
```typescript
{
  workItemId: string,
  requiredSkills: string[],
  machineType: string,
  complexity: number,
  urgency: 'low' | 'medium' | 'high' | 'urgent',
  estimatedDuration: number,
  qualityRequirement: number,
  maxRecommendations?: number
}
```

**Response:**
```typescript
{
  recommendations: AIRecommendation[]
}
```

#### POST /recommendations/feedback
Submit feedback on AI recommendation.

**Request Body:**
```typescript
{
  recommendationId: string,
  assignmentId: string,
  actualOutcome: {
    efficiency: number,
    quality: number,
    completionTime: number
  },
  operatorFeedback?: string
}
```

### Assignment Request Queue

#### POST /queue/enqueue
Add assignment request to queue.

**Request Body:**
```typescript
{
  workItemId: string,
  operatorId: string,
  requestedBy: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  notes?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  queuePosition?: number,
  estimatedProcessingTime?: Date,
  error?: string
}
```

#### DELETE /queue/:requestId
Remove request from queue.

#### GET /queue/status/:requestId
Get queue status for a request.

#### GET /queue/stats
Get queue statistics.

### Production Tracking

#### POST /production/sessions/start
Start a production session.

**Request Body:**
```typescript
{
  workItemId: string,
  operatorId: string,
  targetQuantity: number
}
```

#### PUT /production/sessions/:sessionId/update-progress
Update session progress.

**Request Body:**
```typescript
{
  completedQuantity: number,
  defectiveQuantity?: number,
  reworkQuantity?: number,
  currentEfficiency?: number,
  notes?: string
}
```

#### POST /production/sessions/:sessionId/breaks/start
Start a break.

**Request Body:**
```typescript
{
  breakType: 'tea' | 'lunch' | 'afternoon',
  startTime: Date
}
```

#### PUT /production/breaks/:breakId/end
End a break.

#### GET /production/sessions/:sessionId/metrics
Get real-time production metrics.

### Quality Management

#### POST /quality/inspections
Submit a quality inspection.

**Request Body:**
```typescript
{
  workItemId: string,
  inspectorId: string,
  inspectionType: 'random' | 'scheduled' | 'quality_flag' | 'completion',
  overallGrade: 'excellent' | 'good' | 'acceptable' | 'poor' | 'failed',
  checklist: QualityChecklist,
  defects: QualityDefect[],
  notes?: string,
  photos?: string[]
}
```

#### GET /quality/issues
Get quality issues with filtering.

#### PUT /quality/issues/:issueId/resolve
Resolve a quality issue.

#### GET /quality/metrics/:operatorId
Get quality metrics for an operator.

### Analytics & Reporting

#### GET /analytics/operator-performance/:operatorId
Get operator performance analytics.

**Query Parameters:**
- `period`: 'day' | 'week' | 'month' | 'quarter'
- `startDate`: Start date for custom range
- `endDate`: End date for custom range

#### GET /analytics/work-item-efficiency
Get work item efficiency analytics.

#### GET /analytics/quality-trends
Get quality trend analytics.

#### POST /reports/generate
Generate custom reports.

**Request Body:**
```typescript
{
  reportType: 'production' | 'quality' | 'efficiency' | 'assignments',
  period: 'day' | 'week' | 'month' | 'quarter' | 'custom',
  startDate?: Date,
  endDate?: Date,
  filters?: {
    operatorIds?: string[],
    workItemIds?: string[],
    operations?: string[],
    machineTypes?: string[]
  },
  format: 'json' | 'csv' | 'pdf'
}
```

## Real-time WebSocket Events

### Connection
Connect to WebSocket at: `${REACT_APP_WS_URL}/work-assignments`

### Event Types

#### assignment_created
```typescript
{
  type: 'assignment_created',
  data: WorkAssignment
}
```

#### assignment_updated
```typescript
{
  type: 'assignment_updated',
  data: {
    assignmentId: string,
    updates: Partial<WorkAssignment>
  }
}
```

#### work_progress_updated
```typescript
{
  type: 'work_progress_updated',
  data: {
    workItemId: string,
    operatorId: string,
    progress: {
      completedQuantity: number,
      efficiency: number,
      quality: number,
      timestamp: Date
    }
  }
}
```

#### quality_issue_reported
```typescript
{
  type: 'quality_issue_reported',
  data: QualityIssue
}
```

#### break_started
```typescript
{
  type: 'break_started',
  data: {
    operatorId: string,
    breakType: string,
    startTime: Date
  }
}
```

## Error Handling

### Error Response Format
```typescript
{
  error: {
    code: string,
    message: string,
    details?: any,
    timestamp: Date,
    requestId: string
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource conflict (e.g., already assigned)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting
- **API Calls**: 1000 requests per hour per user
- **WebSocket Messages**: 100 messages per minute per connection
- **File Uploads**: 10MB per file, 100MB per hour

## Caching Strategy

### Client-side Caching (React Query)
```typescript
{
  assignments: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000 // 5 minutes
  },
  recommendations: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  },
  statistics: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000 // 15 minutes
  }
}
```

### Server-side Caching
- **Operator profiles**: 5 minutes
- **Work item details**: 2 minutes
- **AI recommendations**: 10 minutes
- **Quality metrics**: 1 minute

## Security

### API Security
- JWT token authentication
- Role-based access control (RBAC)
- Request signing for sensitive operations
- Input validation and sanitization
- SQL injection protection
- XSS protection

### Data Access Permissions

#### Operator
- View own assignments
- Update own work progress
- Request new assignments
- View own performance metrics

#### Supervisor
- View team assignments
- Assign work to operators
- Approve assignment requests
- View team performance metrics

#### Manager
- Bulk assign work
- Override business rules
- Access all analytics
- Export reports
- System configuration

#### Admin
- All permissions
- User management
- System configuration
- Data management

## Integration Examples

### React Query Integration
```typescript
// Get work assignments
const { data: assignments, isLoading } = useQuery({
  queryKey: ['assignments', operatorId],
  queryFn: () => workAssignmentService.getAssignments(operatorId),
  staleTime: 30 * 1000
});

// Create assignment
const createAssignmentMutation = useMutation({
  mutationFn: workAssignmentService.createAssignment,
  onSuccess: () => {
    queryClient.invalidateQueries(['assignments']);
    queryClient.invalidateQueries(['workItems']);
  }
});
```

### WebSocket Integration
```typescript
// Connect to WebSocket
const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/work-assignments`);

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  
  switch (type) {
    case 'assignment_created':
      queryClient.setQueryData(['assignments'], (old) => [...old, data]);
      break;
    case 'work_progress_updated':
      queryClient.invalidateQueries(['production', data.operatorId]);
      break;
  }
};
```

### Atomic Operations
```typescript
// Atomic work assignment
const result = await atomicOperationsService.atomicAssignWork({
  workItemId: 'work123',
  operatorId: 'op456',
  supervisorId: 'sup789',
  assignmentData: {
    assignmentMethod: 'manual',
    notes: 'High priority assignment'
  },
  timestamp: new Date()
});

if (result.success) {
  console.log('Assignment created:', result.assignmentId);
} else {
  console.error('Assignment failed:', result.error);
}
```

## Performance Optimization

### Best Practices
1. Use React Query for caching and background updates
2. Implement virtual scrolling for large lists
3. Debounce search inputs (300ms)
4. Throttle scroll events (100ms)
5. Use lazy loading for images and heavy components
6. Batch API requests when possible (max 50 items)
7. Implement proper error boundaries
8. Use Web Workers for heavy calculations

### Memory Management
- Maximum cached assignments: 1000
- Maximum history entries: 500
- Garbage collection threshold: 80% capacity
- Auto-cleanup stale data every 5 minutes

## Testing

### API Testing
All endpoints should be tested with:
- Valid request scenarios
- Invalid request scenarios
- Authentication/authorization testing
- Rate limiting testing
- Error handling verification
- Performance testing

### Integration Testing
- WebSocket event handling
- Real-time updates
- Atomic operations
- Cache invalidation
- Background sync

## Deployment Configuration

### Environment Variables
```bash
REACT_APP_API_BASE_URL=https://api.tsa-erp.com/v1/work-assignments
REACT_APP_WS_URL=wss://ws.tsa-erp.com/work-assignments
REACT_APP_ENABLE_REALTIME=true
REACT_APP_ENABLE_AI=true
REACT_APP_ENABLE_ANALYTICS=true
```

### Production Settings
- Enable request compression
- Configure CDN for static assets
- Set up monitoring and alerting
- Implement proper logging
- Configure backup strategies
- Set up health checks

This API documentation provides a comprehensive guide for integrating with the Work Assignment System. For additional support or questions, please refer to the development team or create an issue in the project repository.