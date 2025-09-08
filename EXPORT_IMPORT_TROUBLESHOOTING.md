# Export/Import Error Troubleshooting Guide

## Common Export/Import Errors and Solutions

### 1. "The requested module does not provide an export named 'X'"

**Root Causes:**
- **Import path resolution failures** (path aliases failing to resolve)
- Forward reference issues (using interface before definition)
- Service worker aggressive caching
- Module cache corruption
- TypeScript compilation errors

**Solutions:**
```bash
# Step 1: Clear all caches and service worker
npm run start:clean
# Force refresh browser (Ctrl+Shift+R)

# Step 2: If still failing, check for import path issues
# Replace path aliases with relative imports temporarily:
# ❌ import { x } from '@/services/my-service';
# ✅ import { x } from '../services/my-service';

# Step 3: Check module compilation
npm run type-check
```

### 2. Forward Reference Issues

**Problem:** Interfaces used before they're defined
```typescript
// ❌ Bad: CuttingDroplet uses CuttingColorSize before it's defined
export interface CuttingDroplet {
  colorSizeData: CuttingColorSize[];  // Error!
}

export interface CuttingColorSize {
  color: string;
}
```

**Solution:** Define dependencies first
```typescript
// ✅ Good: Define CuttingColorSize first
export interface CuttingColorSize {
  color: string;
}

export interface CuttingDroplet {
  colorSizeData: CuttingColorSize[];  // Now works!
}
```

### 3. Circular Import Detection

**Check for circular imports:**
```bash
npm run check-circular
```

**Fix circular imports:**
- Extract shared interfaces/types to separate files
- Use dynamic imports for optional dependencies
- Refactor to use dependency injection

### 4. Module Resolution Issues

**Symptoms:**
- Imports work in IDE but fail at runtime
- Path alias issues (@/services/...)
- Case sensitivity problems

**Solutions:**
- Use consistent file naming (camelCase/kebab-case)
- Ensure Vite and TypeScript configs match
- Use explicit file extensions when possible

### 5. HMR (Hot Module Replacement) Problems

**When HMR breaks:**
```bash
# Force refresh with cleared cache
Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# Or restart dev server
npm run start:clean
```

## Prevention Strategies

### 1. Code Organization
- Keep interface definitions at the top of files
- Group related exports together
- Use index.ts files for clean re-exports

### 2. Development Workflow
```bash
# Before committing, run health check
npm run health-check

# This runs:
# - TypeScript type checking
# - Circular import detection
```

### 3. Import Best Practices
```typescript
// ✅ Explicit imports
import { specificFunction } from '@/services/specific-service';

// ❌ Avoid barrel imports that can cause cycles
import * as Services from '@/services';
```

## Available Scripts

```bash
# Development
npm run dev:clean          # Start with cleared cache
npm run start:clean        # Same as dev:clean

# Debugging
npm run type-check         # Check TypeScript errors
npm run check-circular     # Detect circular imports
npm run health-check       # Run both checks above

# Emergency fixes
rm -rf node_modules/.vite node_modules/.tmp  # Clear all caches
```

## Configuration Files Updated

### vite.config.ts
- Added explicit file extensions resolution
- Improved HMR configuration
- Better dependency optimization
- Force cache rebuild in development

### package.json
- Added cache clearing scripts
- Added circular import detection
- Added health check command

## Quick Emergency Fixes

1. **Module not found errors:**
   ```bash
   npm run start:clean
   ```

2. **Types not working:**
   ```bash
   npm run type-check
   ```

3. **Weird import behaviors:**
   ```bash
   npm run check-circular
   ```

4. **Nothing works:**
   ```bash
   # Nuclear option
   rm -rf node_modules/.vite node_modules/.tmp
   npm install
   npm start
   ```

## When to Use Each Fix

| Error Type | Quick Fix | Permanent Fix |
|------------|-----------|---------------|
| Module cache issues | `start:clean` | Fix code structure |
| Forward references | Restart server | Reorder interfaces |
| Circular imports | Clear cache | Refactor architecture |
| HMR broken | Browser refresh | Check config files |

Remember: **Quick fixes solve symptoms, permanent fixes solve root causes.**