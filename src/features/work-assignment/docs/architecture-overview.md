# Work Assignment System Architecture Overview

## System Architecture

The Work Assignment System follows a feature-based architecture with modern React patterns, implementing comprehensive business logic for production tracking and quality management in a TSA garment factory ERP system.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
├─────────────────────────────────────────────────────────────────┤
│ • React Components (UI/UX)                                     │
│ • Drag-and-Drop Interface (@dnd-kit)                           │
│ • Real-time Updates (React Query + WebSocket)                  │
│ • Form Validation & State Management                           │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                        │
├─────────────────────────────────────────────────────────────────┤
│ • Production Tracking Logic                                    │
│ • AI Recommendation Engine                                     │
│ • Quality Management Rules                                     │
│ • Break Compliance Engine                                      │
│ • Earnings Calculation Logic                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│ • Atomic Operations Service                                    │
│ • Assignment Request Queue                                     │
│ • Real-time Synchronization                                   │
│ • Caching Strategy (React Query)                              │
│ • WebSocket Management                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│ • Firebase Firestore (Primary DB)                             │
│ • Firebase Realtime Database (Live Updates)                   │
│ • Firebase Storage (File Uploads)                             │
│ • Distributed Locking System                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure (Feature-Based)

```
src/features/work-assignment/
├── components/                    # React Components
│   ├── assignment-kanban-board.tsx
│   ├── break-management-system.tsx
│   ├── bulk-assignment-interface.tsx
│   ├── operator-work-dashboard.tsx
│   ├── piece-counting-interface.tsx
│   ├── production-timer.tsx
│   ├── quality-management-system.tsx
│   ├── self-assignment-interface.tsx
│   └── work-completion-workflow.tsx
├── business/                      # Business Logic
│   └── production-tracking-logic.ts
├── services/                      # Service Layer
│   ├── ai-recommendation-engine.ts
│   ├── assignment-request-queue.ts
│   └── atomic-operations.ts
├── types/                         # Type Definitions
│   └── index.ts
├── config/                        # Configuration
│   └── work-assignment-config.ts
├── hooks/                         # Custom Hooks
│   └── use-work-assignment.ts
└── docs/                          # Documentation
    ├── api-documentation.md
    └── architecture-overview.md
```

## Core Components Architecture

### 1. Assignment Kanban Board
**Purpose**: Drag-and-drop interface for visual work assignment management
**Key Features**:
- Real-time column updates
- Batch operations support
- AI recommendation integration
- Conflict detection and resolution

```typescript
// Architecture Pattern: Container/Presenter with DnD Kit
const AssignmentKanbanBoard = () => {
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Real-time data synchronization
  const { data: workItems } = useQuery({
    queryKey: ['workItems'],
    queryFn: workAssignmentService.getWorkItems,
    refetchInterval: 30000 // 30-second real-time updates
  });

  // Atomic drag operations
  const handleDragEnd = async (event: DragEndEvent) => {
    // Atomic operation to prevent race conditions
    await atomicOperationsService.atomicAssignWork(operation);
  };
};
```

### 2. AI Recommendation Engine
**Purpose**: Machine learning-based work assignment optimization
**Architecture**: Scoring algorithm with weighted factors

```typescript
class AIRecommendationEngine {
  private readonly weights = {
    skillMatch: 0.25,      // 25% - Skill compatibility
    efficiency: 0.20,      // 20% - Historical efficiency
    quality: 0.20,         // 20% - Quality track record
    availability: 0.15,    // 15% - Current availability
    workload: 0.10,        // 10% - Current workload
    experience: 0.10       // 10% - Experience level
  };

  async getRecommendations(criteria: RecommendationCriteria): Promise<RecommendationResult[]> {
    // 1. Filter compatible operators
    // 2. Calculate weighted scores
    // 3. Apply business rules
    // 4. Return ranked recommendations
  }
}
```

### 3. Production Tracking Logic
**Purpose**: Comprehensive business rules for production monitoring
**Key Responsibilities**:
- Efficiency calculation
- Break compliance monitoring
- Quality assessment
- Earnings calculation

```typescript
class ProductionTrackingLogic {
  evaluateProduction(context: ProductionContext): ProductionEvaluation {
    return {
      metrics: this.calculateMetrics(context),
      actions: this.determineActions(context),
      compliance: this.checkCompliance(context),
      recommendations: this.generateRecommendations(context)
    };
  }
}
```

### 4. Atomic Operations Service
**Purpose**: Prevent race conditions in concurrent assignment operations
**Pattern**: Distributed locking with conflict resolution

```typescript
class AtomicOperationsService {
  async atomicAssignWork(operation: AtomicAssignmentOperation): Promise<AtomicOperationResult> {
    const lockId = `assign_${operation.workItemId}_${Date.now()}`;
    
    try {
      // 1. Acquire distributed lock
      const lockAcquired = await this.acquireDistributedLock(operation.workItemId, operation.operatorId, lockId);
      
      if (!lockAcquired.success) {
        return { success: false, error: 'Resource locked by another operation' };
      }

      // 2. Validate current state
      const validation = await this.validateAssignmentPossible(operation.workItemId, operation.operatorId);
      
      if (!validation.valid) {
        await this.releaseDistributedLock(operation.workItemId, lockId);
        return { success: false, error: validation.reason };
      }

      // 3. Execute atomic transaction
      const result = await this.executeAtomicAssignment(operation);

      // 4. Release lock
      await this.releaseDistributedLock(operation.workItemId, lockId);
      
      return result;

    } catch (error) {
      await this.releaseDistributedLock(operation.workItemId, lockId);
      throw error;
    }
  }
}
```

## Data Flow Architecture

### 1. Assignment Creation Flow
```
User Action → Component → Service Layer → Atomic Operations → Firebase → Real-time Updates
     ↓              ↓           ↓              ↓              ↓            ↓
[Drag & Drop] → [Kanban] → [Assignment] → [Lock & Validate] → [Commit] → [WebSocket]
```

### 2. Production Tracking Flow
```
Timer Events → Progress Updates → Business Logic → Metrics Calculation → UI Updates
     ↓               ↓                ↓                ↓                  ↓
[Every Second] → [Piece Count] → [Tracking Logic] → [Efficiency] → [Real-time UI]
```

### 3. Quality Management Flow
```
Inspection → Quality Rules → Issue Creation → Notification → Analytics
    ↓              ↓               ↓              ↓           ↓
[Checklist] → [Validation] → [Quality Issue] → [Alert] → [Trends]
```

## State Management Architecture

### React Query Integration
```typescript
// Optimistic updates with rollback
const assignWorkMutation = useMutation({
  mutationFn: atomicOperationsService.atomicAssignWork,
  
  // Optimistic update
  onMutate: async (newAssignment) => {
    await queryClient.cancelQueries(['workItems']);
    const previousWorkItems = queryClient.getQueryData(['workItems']);
    
    queryClient.setQueryData(['workItems'], old => 
      updateWorkItemOptimistically(old, newAssignment)
    );
    
    return { previousWorkItems };
  },
  
  // Rollback on error
  onError: (err, newAssignment, context) => {
    queryClient.setQueryData(['workItems'], context.previousWorkItems);
  },
  
  // Refetch on success
  onSettled: () => {
    queryClient.invalidateQueries(['workItems']);
    queryClient.invalidateQueries(['assignments']);
  }
});
```

### WebSocket Real-time Updates
```typescript
const useWorkAssignmentSubscription = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      switch (type) {
        case 'assignment_created':
          queryClient.setQueryData(['assignments'], old => [...old, data]);
          queryClient.invalidateQueries(['workItems']);
          break;
          
        case 'work_progress_updated':
          queryClient.setQueryData(['production', data.operatorId], data);
          break;
      }
    };
    
    return () => ws.close();
  }, [queryClient]);
};
```

## Performance Architecture

### Caching Strategy
```typescript
const cacheConfig = {
  // Short-lived: Real-time data
  assignments: { staleTime: 30000, gcTime: 300000 },
  
  // Medium-lived: Computational data
  recommendations: { staleTime: 120000, gcTime: 600000 },
  
  // Long-lived: Static data
  operators: { staleTime: 300000, gcTime: 900000 }
};
```

### Virtual Scrolling
```typescript
// For large lists (>100 items)
const VirtualizedWorkItemList = () => {
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      <WorkItemCard workItem={workItems[index]} />
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          rowCount={workItems.length}
          rowHeight={120}
          rowRenderer={rowRenderer}
          width={width}
        />
      )}
    </AutoSizer>
  );
};
```

### Debouncing & Throttling
```typescript
// Search debouncing
const useSearchDebounce = (searchTerm: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedValue;
};

// Scroll throttling
const useScrollThrottle = (callback: () => void, delay: number = 100) => {
  const throttledCallback = useCallback(throttle(callback, delay), [callback, delay]);
  return throttledCallback;
};
```

## Security Architecture

### Role-Based Access Control (RBAC)
```typescript
const usePermissions = (userRole: string) => {
  const permissions = useMemo(() => {
    const rolePermissions = config.security.permissions[userRole] || [];
    const hasPermission = (permission: string) => 
      rolePermissions.includes(permission) || 
      rolePermissions.includes('all_permissions');
    
    return { hasPermission, permissions: rolePermissions };
  }, [userRole]);
  
  return permissions;
};
```

### Data Validation
```typescript
// Zod schema validation
const workAssignmentSchema = z.object({
  workItemId: z.string().min(1),
  operatorId: z.string().min(1),
  supervisorId: z.string().min(1),
  assignmentMethod: z.enum(['manual', 'auto_assigned', 'self_requested']),
  notes: z.string().optional()
});

// Usage in components
const validateAssignment = (data: unknown) => {
  const result = workAssignmentSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.data;
};
```

## Error Handling Architecture

### Error Boundary Implementation
```typescript
class WorkAssignmentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    logger.error('WorkAssignment Error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Global Error Handler
```typescript
const useGlobalErrorHandler = () => {
  const queryClient = useQueryClient();
  
  const handleError = useCallback((error: Error, context?: string) => {
    // Log error
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly notification
    toast.error(getErrorMessage(error));
    
    // Clear related cache on data errors
    if (error instanceof DataError) {
      queryClient.invalidateQueries([context]);
    }
    
    // Report to monitoring service
    errorReporting.captureException(error, { context });
  }, [queryClient]);
  
  return handleError;
};
```

## Testing Architecture

### Component Testing Strategy
```typescript
// Integration test example
describe('AssignmentKanbanBoard', () => {
  it('should handle drag and drop assignment', async () => {
    const mockWorkItems = createMockWorkItems();
    const mockOperators = createMockOperators();
    
    render(
      <QueryClientProvider client={testQueryClient}>
        <AssignmentKanbanBoard 
          workItems={mockWorkItems} 
          operators={mockOperators} 
        />
      </QueryClientProvider>
    );
    
    // Simulate drag and drop
    const workItem = screen.getByTestId('work-item-1');
    const operatorColumn = screen.getByTestId('operator-column-op1');
    
    await dragAndDrop(workItem, operatorColumn);
    
    // Verify assignment was created
    expect(mockAssignmentService.createAssignment).toHaveBeenCalledWith({
      workItemId: '1',
      operatorId: 'op1',
      assignmentMethod: 'manual'
    });
  });
});
```

### Business Logic Testing
```typescript
// Unit test for business logic
describe('ProductionTrackingLogic', () => {
  let trackingLogic: ProductionTrackingLogic;
  
  beforeEach(() => {
    trackingLogic = new ProductionTrackingLogic();
  });
  
  it('should calculate efficiency correctly', () => {
    const context = createProductionContext({
      targetRate: 10,
      actualRate: 8,
      workDuration: 3600000 // 1 hour
    });
    
    const result = trackingLogic.evaluateProduction(context);
    
    expect(result.metrics.efficiency).toBe(0.8); // 80%
    expect(result.actions).toContainEqual({
      type: 'alert',
      message: 'Efficiency below target',
      priority: 'medium'
    });
  });
});
```

## Deployment Architecture

### Build Optimization
```typescript
// Webpack bundle splitting
const optimization = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      },
      workAssignment: {
        test: /[\\/]features[\\/]work-assignment[\\/]/,
        name: 'work-assignment',
        chunks: 'all'
      }
    }
  }
};
```

### Environment Configuration
```typescript
const getEnvironmentConfig = () => ({
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API endpoints
  apiUrl: process.env.REACT_APP_API_BASE_URL,
  wsUrl: process.env.REACT_APP_WS_URL,
  
  // Feature toggles
  enableRealTime: process.env.REACT_APP_ENABLE_REALTIME !== 'false',
  enableAI: process.env.REACT_APP_ENABLE_AI !== 'false',
  
  // Performance settings
  enableOptimizations: process.env.NODE_ENV === 'production'
});
```

## Monitoring & Analytics Architecture

### Performance Monitoring
```typescript
// Performance tracking
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      analytics.track('component_render_time', {
        component: componentName,
        duration,
        timestamp: new Date()
      });
    };
  }, [componentName]);
};
```

### Error Tracking
```typescript
// Error boundary with Sentry integration
const errorHandler = {
  captureException: (error: Error, context: any) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        extra: context,
        tags: {
          feature: 'work-assignment',
          component: context.component
        }
      });
    } else {
      console.error('Error captured:', error, context);
    }
  }
};
```

This architecture provides a scalable, maintainable, and performant foundation for the Work Assignment System, following modern React patterns and enterprise-grade practices.