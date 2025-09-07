# Operator Management System

## Overview
The Operator Management System is a comprehensive module for managing garment factory operators, tracking their performance, assignments, and real-time status. Built following the REBUILD_BLUEPRINT architecture with modern React patterns.

## Architecture

```
src/features/operators/
├── components/           # React components
│   ├── operator-card.tsx     # Individual operator card
│   ├── operator-list.tsx     # Operators listing with filters
│   ├── operator-detail.tsx   # Detailed operator view
│   ├── operator-form.tsx     # Create/edit operator form
│   └── index.ts             # Component exports
├── hooks/               # React Query hooks
│   ├── use-operators.ts     # Data fetching hooks
│   └── index.ts            # Hook exports
├── services/            # Data layer
│   ├── operator-service.ts  # CRUD operations
│   └── index.ts            # Service exports
├── business/            # Business logic layer
│   └── operator-business-logic.ts # Rules & validations
├── types/              # TypeScript definitions
│   └── index.ts           # All operator types
├── utils/              # Utility functions
│   └── index.ts          # Helper functions
├── api/                # API documentation
│   └── operator-api-spec.md # Complete API spec
├── index.ts            # Feature exports
└── README.md           # This documentation
```

## Features

### ✅ Core Features
- **Operator CRUD Operations**: Full create, read, update, delete functionality
- **Real-time Status Tracking**: Live operator status updates
- **Avatar System**: Emoji, initials, and photo avatars
- **Performance Analytics**: Efficiency and quality tracking
- **Work Assignment**: Task assignment and completion tracking
- **Advanced Filtering**: Search, status, machine, skill level filters
- **Responsive UI**: Modern, mobile-friendly interface

### ✅ Business Logic
- **Validation Rules**: Comprehensive data validation
- **Work Assignment Rules**: Skill-based assignment validation
- **Performance Analysis**: Trend analysis and recommendations
- **Shift Management**: Shift assignment validation
- **Leave Management**: Leave request validation
- **Promotion Workflow**: Skill level progression rules
- **Training Recommendations**: Skill development suggestions

### ✅ Technical Features
- **TypeScript**: Full type safety
- **React Query**: Optimistic updates and caching
- **Zustand**: Global state management
- **Form Validation**: Zod schema validation
- **Error Boundaries**: Graceful error handling
- **Real-time Updates**: WebSocket integration
- **Performance Optimization**: Virtualization for large lists

## Quick Start

### 1. Installation
```bash
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers/zod
```

### 2. Setup
```typescript
// In your main app
import { OperatorList, OperatorDetail, OperatorForm } from '@/features/operators';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/operators" element={<OperatorList />} />
          <Route path="/operators/:id" element={<OperatorDetail />} />
          <Route path="/operators/new" element={<OperatorForm mode="create" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
```

### 3. Basic Usage

#### List Operators
```typescript
import { OperatorList } from '@/features/operators';

function OperatorsPage() {
  return (
    <OperatorList
      onCreateNew={() => navigate('/operators/new')}
      onViewOperator={(id) => navigate(`/operators/${id}`)}
      onEditOperator={(id) => navigate(`/operators/${id}/edit`)}
    />
  );
}
```

#### Create/Edit Operator
```typescript
import { OperatorForm, useCreateOperator } from '@/features/operators';

function CreateOperatorPage() {
  const { mutateAsync: createOperator, isPending } = useCreateOperator();

  const handleSubmit = async (data) => {
    await createOperator(data);
    navigate('/operators');
  };

  return (
    <OperatorForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/operators')}
      isLoading={isPending}
    />
  );
}
```

## Configuration

### Environment Variables
```env
REACT_APP_API_BASE_URL=https://api.tsa-erp.com/v1
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_PROJECT_ID=erp-for-tsa
REACT_APP_USE_MOCK_DATA=false
```

### Operator Configuration
```typescript
import { OPERATOR_CONFIG } from '@/config/operator-config';

// Access configuration
const apiConfig = OPERATOR_CONFIG.api;
const businessRules = OPERATOR_CONFIG.businessRules;
const uiConfig = OPERATOR_CONFIG.ui;
```

## API Usage

### Using Hooks
```typescript
import { 
  useOperators, 
  useOperator, 
  useCreateOperator,
  useUpdateOperator 
} from '@/features/operators';

function OperatorComponent() {
  // List operators
  const { data: operators, isLoading } = useOperators();

  // Get specific operator
  const { data: operator } = useOperator(operatorId);

  // Create operator
  const createOperator = useCreateOperator();

  // Update operator
  const updateOperator = useUpdateOperator();

  return (
    // Your component JSX
  );
}
```

### Using Services Directly
```typescript
import { operatorService } from '@/features/operators';

// Create operator
const result = await operatorService.createOperator(operatorData);

// Get operators summary
const operators = await operatorService.getOperatorsSummary();

// Update operator status
await operatorService.updateOperatorStatus(operatorId, status);
```

## Business Rules

### Operator Creation Rules
- Username must be unique and at least 3 characters
- Employee ID must follow format: TSA-XXXX
- Primary machine must be included in machine types
- Skill level must match machine requirements
- Email domain validation for TSA organization

### Work Assignment Rules
- Operator must be certified for machine type
- Skill level must meet work requirements
- Cannot exceed max concurrent work limit
- Operator must be available (idle or working status)

### Performance Evaluation
- Efficiency threshold: >70% acceptable, >90% excellent
- Quality threshold: >80% acceptable, >95% excellent
- Experience-based skill level recommendations
- Training recommendations based on performance

## Component Interface

### OperatorCard Props
```typescript
interface OperatorCardProps {
  operator: OperatorSummary;
  onView?: () => void;
  onEdit?: () => void;
  onStatusChange?: () => void;
  className?: string;
}
```

### OperatorList Props
```typescript
interface OperatorListProps {
  onCreateNew?: () => void;
  onViewOperator?: (operatorId: string) => void;
  onEditOperator?: (operatorId: string) => void;
}
```

### OperatorForm Props
```typescript
interface OperatorFormProps {
  initialData?: Partial<CreateOperatorData | UpdateOperatorData>;
  onSubmit: (data: CreateOperatorData | UpdateOperatorData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}
```

## State Management

### Global State (Zustand)
```typescript
import { useOperatorStore, operatorActions } from '@/app/state/operator-state';

// Access state
const operators = useOperatorStore(state => state.operators);
const filters = useOperatorStore(state => state.filters);

// Update state
operatorActions.setOperators(operatorList);
operatorActions.setFilters({ search: 'john' });
```

### Local State (React Query)
```typescript
// Automatic caching and synchronization
const { data, isLoading, error } = useOperators({
  refetchInterval: 60 * 1000, // Refresh every minute
});
```

## Validation

### Form Validation (Zod)
```typescript
import { operatorBusinessLogic } from '@/features/operators';

// Validate operator creation
const validation = operatorBusinessLogic.validateOperatorCreation(data);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Business Rule Validation
```typescript
// Work assignment validation
const canAssign = operatorBusinessLogic.validateWorkAssignment(operator, workItem);
if (!canAssign.canAssign) {
  console.error('Assignment blocked:', canAssign.reason);
}
```

## Error Handling

### Component Level
```typescript
import { ErrorBoundary } from '@/shared/components/error-boundary';

<ErrorBoundary>
  <OperatorList />
</ErrorBoundary>
```

### Service Level
```typescript
try {
  const result = await operatorService.createOperator(data);
  if (!result.success) {
    console.error('Service error:', result.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Performance Optimization

### Large Lists
- Virtualization enabled for lists >100 items
- Pagination with configurable limits
- Debounced search functionality
- Memoized filter computations

### Caching Strategy
- Operator lists: 5-minute stale time
- Individual operators: 2-minute stale time
- Real-time status: 30-second stale time
- Optimistic updates for mutations

## Testing

### Unit Tests
```typescript
// Test operator business logic
import { operatorBusinessLogic } from '@/features/operators';

describe('Operator Business Logic', () => {
  it('should validate operator creation', () => {
    const result = operatorBusinessLogic.validateOperatorCreation(validData);
    expect(result.isValid).toBe(true);
  });
});
```

### Component Tests
```typescript
// Test operator components
import { render, screen } from '@testing-library/react';
import { OperatorCard } from '@/features/operators';

test('renders operator card', () => {
  render(<OperatorCard operator={mockOperator} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## Migration Guide

### From Old System
1. Export existing operator data
2. Transform to new schema using migration scripts
3. Import to new Firebase project
4. Validate data integrity
5. Update component references

### Breaking Changes
- Avatar system changed from single image to multi-type
- Status tracking moved to real-time system
- Service layer restructured with new response format

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Start development server: `npm start`

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier configuration
- Write comprehensive JSDoc comments
- Include unit tests for business logic
- Follow REBUILD_BLUEPRINT patterns

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with description
5. Address review feedback

## Troubleshooting

### Common Issues
1. **Real-time updates not working**: Check Firebase configuration
2. **Form validation errors**: Verify Zod schema matches data structure
3. **Performance issues**: Enable virtualization for large lists
4. **State synchronization**: Check React Query cache configuration

### Debug Mode
```typescript
// Enable debug logs in development
localStorage.setItem('debug', 'operator:*');
```

## Support

For questions and support:
- Check API documentation: `/src/features/operators/api/operator-api-spec.md`
- Review business logic: `/src/features/operators/business/operator-business-logic.ts`
- See configuration: `/src/config/operator-config.ts`
- File issues in project repository