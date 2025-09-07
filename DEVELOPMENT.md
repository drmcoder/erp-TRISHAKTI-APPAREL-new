# 🚀 Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── app/                    # App-level configuration
│   ├── store/             # Global state management (Zustand)
│   ├── providers/         # Context providers
│   └── router/            # Routing configuration
├── shared/                # Shared utilities
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript types
│   └── constants/         # App constants
├── features/              # Feature-based modules
│   ├── auth/             # Authentication feature
│   ├── operators/        # Operator management
│   ├── production/       # Production tracking
│   ├── quality/          # Quality management
│   └── analytics/        # Analytics & reporting
├── infrastructure/        # External services
│   ├── firebase/         # Firebase integration
│   ├── api/              # API layer
│   └── monitoring/       # Error tracking
└── assets/               # Static assets
```

## 🛠 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |

## 🔥 Firebase Setup

### 1. Configure Environment
Copy `.env.example` to `.env.development` and update Firebase credentials.

### 2. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Initialize Test Data
```bash
node scripts/setup-initial-data.js
```

## 📦 Path Aliases

Use these aliases in imports:

```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/services/ApiService'
import { User } from '@/types/user'
```

## 🧪 Testing

### Running Tests
```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# UI mode
npm run test:ui
```

### Writing Tests
```typescript
import { render, screen } from '@/test/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## 🎨 Styling

### Tailwind CSS Classes
- Use utility classes for styling
- Custom colors are defined in `tailwind.config.js`
- Responsive design: `sm:`, `md:`, `lg:`, `xl:`

### Example
```jsx
<div className="bg-primary-500 text-white p-4 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold mb-2">Title</h1>
  <p className="text-sm opacity-90">Description</p>
</div>
```

## 🔄 State Management

### Zustand Store
```typescript
// stores/useAuthStore.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    // Implementation
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false })
  }
}))
```

### React Query
```typescript
// hooks/useOperators.ts
export const useOperators = () => {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => operatorService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## 🏗 Component Architecture

### Feature Components
```
features/operators/
├── components/
│   ├── OperatorList.tsx
│   ├── OperatorCard.tsx
│   └── OperatorForm.tsx
├── hooks/
│   └── useOperators.ts
├── services/
│   └── operatorService.ts
└── types/
    └── operator.types.ts
```

### Shared Components
```typescript
// shared/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation
}
```

## 🚦 Git Workflow

### Branch Naming
- `feature/feature-name`
- `hotfix/bug-description`
- `release/v1.0.0`

### Commit Messages
```
feat(auth): add JWT token validation
fix(payment): correct earnings calculation
docs(readme): update setup instructions
```

## 🔍 Debugging

### Development Tools
- React DevTools
- Redux DevTools (for Zustand)
- Firebase Emulator Suite
- Vite DevTools

### Console Debugging
```typescript
// Only in development
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Debug info:', data)
}
```

## ⚡ Performance Tips

### Bundle Optimization
- Code splitting with dynamic imports
- Tree shaking enabled by default
- Lazy load heavy components

### React Optimization
- Use `React.memo` for expensive components
- Use `useMemo` and `useCallback` appropriately
- Implement virtualization for long lists

## 🐛 Troubleshooting

### Common Issues

1. **Build fails**: Check TypeScript errors
2. **Tests fail**: Ensure proper mocks are set up
3. **Firebase connection issues**: Verify environment variables
4. **Linting errors**: Run `npm run lint:fix`

### Debug Mode
Set `VITE_DEBUG_MODE=true` in environment for detailed logging.

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/docs)
- [Vitest](https://vitest.dev/)