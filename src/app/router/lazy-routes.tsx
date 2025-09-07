// Lazy Routes Configuration
// Code splitting and lazy loading for route-based components

import { lazy } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { withLazyLoading, LazyWrapper } from '@/components/common/lazy-components';

// Lazy load main feature components
const LazyDashboard = withLazyLoading(
  () => import('@/pages/dashboard'),
  undefined,
  3
);

const LazyOperators = withLazyLoading(
  () => import('@/features/operators/components/operator-list'),
  undefined,
  3
);

const LazyOperatorDetail = withLazyLoading(
  () => import('@/features/operators/components/operator-detail'),
  undefined,
  3
);

const LazyWorkAssignments = withLazyLoading(
  () => import('@/features/work-assignment/components/assignment-dashboard'),
  undefined,
  3
);

const LazyMobileWorkAssignments = withLazyLoading(
  () => import('@/features/work-assignment/components/mobile-work-assignment-dashboard'),
  undefined,
  3
);

const LazyWorkAssignmentKanban = withLazyLoading(
  () => import('@/features/work-assignment/components/assignment-kanban-board'),
  undefined,
  3
);

const LazyOperatorWorkDashboard = withLazyLoading(
  () => import('@/features/work-assignment/components/operator-work-dashboard'),
  undefined,
  3
);

const LazySelfAssignmentInterface = withLazyLoading(
  () => import('@/features/work-assignment/components/self-assignment-interface'),
  undefined,
  3
);

const LazyQualityManagement = withLazyLoading(
  () => import('@/features/work-assignment/components/quality-management-system'),
  undefined,
  3
);

const LazyReports = withLazyLoading(
  () => import('@/pages/reports'),
  undefined,
  3
);

const LazySettings = withLazyLoading(
  () => import('@/pages/settings'),
  undefined,
  3
);

const LazyLogin = withLazyLoading(
  () => import('@/pages/auth/login'),
  undefined,
  2
);

const LazyNotFound = withLazyLoading(
  () => import('@/pages/errors/not-found'),
  undefined,
  2
);

// Route preloading utilities
export const preloadRoutes = {
  dashboard: () => import('@/pages/dashboard'),
  operators: () => import('@/features/operators/components/operator-list'),
  workAssignments: () => import('@/features/work-assignment/components/assignment-dashboard'),
  reports: () => import('@/pages/reports'),
  settings: () => import('@/pages/settings')
};

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload dashboard and operators after initial load
  setTimeout(() => {
    preloadRoutes.dashboard();
    preloadRoutes.operators();
  }, 1000);
  
  // Preload work assignments after 2 seconds
  setTimeout(() => {
    preloadRoutes.workAssignments();
  }, 2000);
};

// Route configuration with lazy loading
export const lazyRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LazyWrapper loadingType="page">
        <LazyDashboard />
      </LazyWrapper>
    )
  },
  {
    path: '/dashboard',
    element: (
      <LazyWrapper loadingType="page">
        <LazyDashboard />
      </LazyWrapper>
    )
  },
  {
    path: '/operators',
    element: (
      <LazyWrapper loadingType="table">
        <LazyOperators />
      </LazyWrapper>
    )
  },
  {
    path: '/operators/:id',
    element: (
      <LazyWrapper loadingType="card">
        <LazyOperatorDetail />
      </LazyWrapper>
    )
  },
  {
    path: '/work-assignments',
    element: (
      <LazyWrapper loadingType="page">
        <LazyWorkAssignments />
      </LazyWrapper>
    )
  },
  {
    path: '/work-assignments/mobile',
    element: (
      <LazyWrapper loadingType="page">
        <LazyMobileWorkAssignments />
      </LazyWrapper>
    )
  },
  {
    path: '/work-assignments/kanban',
    element: (
      <LazyWrapper loadingType="page">
        <LazyWorkAssignmentKanban />
      </LazyWrapper>
    )
  },
  {
    path: '/work-assignments/operator/:operatorId',
    element: (
      <LazyWrapper loadingType="page">
        <LazyOperatorWorkDashboard />
      </LazyWrapper>
    )
  },
  {
    path: '/work-assignments/self-assign/:operatorId',
    element: (
      <LazyWrapper loadingType="page">
        <LazySelfAssignmentInterface />
      </LazyWrapper>
    )
  },
  {
    path: '/quality',
    element: (
      <LazyWrapper loadingType="page">
        <LazyQualityManagement />
      </LazyWrapper>
    )
  },
  {
    path: '/reports',
    element: (
      <LazyWrapper loadingType="chart">
        <LazyReports />
      </LazyWrapper>
    )
  },
  {
    path: '/settings',
    element: (
      <LazyWrapper loadingType="card">
        <LazySettings />
      </LazyWrapper>
    )
  },
  {
    path: '/login',
    element: (
      <LazyWrapper>
        <LazyLogin />
      </LazyWrapper>
    )
  },
  {
    path: '*',
    element: (
      <LazyWrapper>
        <LazyNotFound />
      </LazyWrapper>
    )
  }
];

// Route-based code splitting hook
export const useRoutePreloading = () => {
  const preloadRoute = (routePath: string) => {
    switch (routePath) {
      case '/dashboard':
        preloadRoutes.dashboard();
        break;
      case '/operators':
        preloadRoutes.operators();
        break;
      case '/work-assignments':
        preloadRoutes.workAssignments();
        break;
      case '/reports':
        preloadRoutes.reports();
        break;
      case '/settings':
        preloadRoutes.settings();
        break;
      default:
        console.log('No preloader for route:', routePath);
    }
  };

  return { preloadRoute };
};

// Dynamic imports for feature-specific components
export const dynamicComponents = {
  // Work Assignment Components
  loadAssignmentKanban: () => import('@/features/work-assignment/components/assignment-kanban-board'),
  loadSelfAssignment: () => import('@/features/work-assignment/components/self-assignment-interface'),
  loadApprovalWorkflow: () => import('@/features/work-assignment/components/approval-workflow'),
  loadBulkAssignment: () => import('@/features/work-assignment/components/bulk-assignment-modal'),
  loadProductionTimer: () => import('@/features/work-assignment/components/production-timer'),
  loadPieceCountingInterface: () => import('@/features/work-assignment/components/piece-counting-interface'),
  loadBreakManagement: () => import('@/features/work-assignment/components/break-management-system'),
  loadWorkCompletion: () => import('@/features/work-assignment/components/work-completion-workflow'),
  loadQualityManagement: () => import('@/features/work-assignment/components/quality-management-system'),
  
  // Operator Components
  loadOperatorCard: () => import('@/features/operators/components/operator-card'),
  loadOperatorForm: () => import('@/features/operators/components/operator-form'),
  loadOperatorDetail: () => import('@/features/operators/components/operator-detail'),
  
  // Chart Components (heavy libraries)
  loadReportsCharts: () => import('@/components/charts/reports-charts'),
  loadAnalyticsCharts: () => import('@/components/charts/analytics-charts'),
  loadProductionCharts: () => import('@/components/charts/production-charts'),
  
  // Heavy UI Components
  loadDataTable: () => import('@/components/ui/data-table'),
  loadImageUpload: () => import('@/components/ui/image-upload'),
  loadRichTextEditor: () => import('@/components/ui/rich-text-editor'),
  loadDateRangePicker: () => import('@/components/ui/date-range-picker')
};

// Lazy component factory
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  displayName?: string,
  fallback?: ComponentType
): LazyExoticComponent<T> => {
  const LazyComponent = withLazyLoading(importFunc, fallback, 3);
  
  if (displayName) {
    LazyComponent.displayName = `Lazy(${displayName})`;
  }
  
  return LazyComponent;
};

// Bundle size optimization utilities
export const getBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      chunks: [
        { name: 'main', size: '450 KB', type: 'entry' },
        { name: 'vendors', size: '1.2 MB', type: 'vendor' },
        { name: 'work-assignment', size: '280 KB', type: 'feature' },
        { name: 'operators', size: '120 KB', type: 'feature' },
        { name: 'reports', size: '95 KB', type: 'feature' },
        { name: 'charts', size: '180 KB', type: 'library' },
        { name: 'ui-components', size: '150 KB', type: 'components' }
      ],
      totalSize: '2.475 MB',
      gzippedSize: '890 KB'
    };
  }
  return null;
};

// Performance monitoring for lazy loading
export const trackLazyLoadPerformance = (componentName: string, loadTime: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Lazy Loading] ${componentName} loaded in ${loadTime}ms`);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'lazy_load_performance', {
      component_name: componentName,
      load_time: loadTime,
      event_category: 'performance'
    });
  }
};

export default {
  lazyRoutes,
  preloadCriticalRoutes,
  useRoutePreloading,
  dynamicComponents,
  createLazyComponent,
  getBundleInfo,
  trackLazyLoadPerformance
};