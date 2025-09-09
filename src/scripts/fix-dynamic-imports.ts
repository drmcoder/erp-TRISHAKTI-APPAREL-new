// Script to fix all dynamic import errors
import fs from 'fs';
import path from 'path';

interface ImportInfo {
  componentName: string;
  filePath: string;
  exists: boolean;
  hasDefaultExport: boolean;
  hasNamedExport: boolean;
  exportName?: string;
  issue?: string;
}

// List of all dynamic imports from App.tsx
const dynamicImports: Array<{componentName: string, importPath: string}> = [
  { componentName: 'OperatorDashboard', importPath: './components/operator/OperatorDashboard' },
  { componentName: 'SupervisorDashboard', importPath: './components/supervisor/SupervisorDashboard' },
  { componentName: 'AssignmentDashboard', importPath: './features/work-assignment/components/assignment-dashboard' },
  { componentName: 'BundleLifecycleManager', importPath: './features/bundles/components/bundle-lifecycle-manager' },
  { componentName: 'ProductionDashboard', importPath: './features/analytics/components/production-dashboard' },
  { componentName: 'QualityManagementDashboard', importPath: './features/quality/components/quality-management-dashboard' },
  { componentName: 'EarningsDashboard', importPath: './features/earnings/components/earnings-dashboard' },
  { componentName: 'OperatorManagementDashboard', importPath: './features/operators/components/operator-management-dashboard' },
  { componentName: 'SelfAssignmentInterface', importPath: './features/work-assignment/components/self-assignment-interface' },
  { componentName: 'ProductionTimer', importPath: './features/work-assignment/components/production-timer' },
  { componentName: 'WorkflowSequencer', importPath: './features/workflow/components/workflow-sequencer' },
  { componentName: 'MobileFriendlyLayout', importPath: './components/layout/mobile-friendly-layout' },
  { componentName: 'MobileTest', importPath: './components/mobile/mobile-test' },
  { componentName: 'LiveProductionDashboard', importPath: './components/dashboard/live-production-dashboard' },
  { componentName: 'CuttingDropletManager', importPath: './components/management/CuttingDropletManager' },
  { componentName: 'ProductionLotManager', importPath: './components/management/ProductionLotManager' },
  { componentName: 'ProcessPricingManager', importPath: './components/management/ProcessPricingManager' },
  { componentName: 'EnhancedOperatorDashboard', importPath: './components/operator/EnhancedOperatorDashboard' },
  { componentName: 'OperatorPieceTracker', importPath: './components/operator/OperatorPieceTracker' },
  { componentName: 'BundleAssignmentManager', importPath: './components/supervisor/BundleAssignmentManager' },
  { componentName: 'SewingTemplateManager', importPath: './features/sewing-templates/components/sewing-template-manager' },
  { componentName: 'BundleAssignmentDashboard', importPath: './features/bundles/components/bundle-assignment-dashboard' },
  { componentName: 'OperatorWorkDashboard', importPath: './features/bundles/components/operator-work-dashboard' },
  { componentName: 'OperatorSelfAssignment', importPath: './features/bundles/components/operator-self-assignment' },
  { componentName: 'SupervisorPartsDashboard', importPath: './features/bundles/components/supervisor-parts-dashboard' },
  { componentName: 'MultiStrategyAssignmentDashboard', importPath: './features/work-assignment/components/multi-strategy-assignment-dashboard' },
  { componentName: 'BundleBatchTrackingDashboard', importPath: './features/analytics/components/bundle-batch-tracking-dashboard' },
  { componentName: 'DragDropAssignmentDashboard', importPath: './features/work-assignment/components/drag-drop-assignment-dashboard' },
  { componentName: 'SupervisorOperatorBuckets', importPath: './features/work-assignment/components/supervisor-operator-buckets' },
  { componentName: 'SmartWorkAssignmentDashboard', importPath: './features/work-assignment/components/smart-work-assignment-dashboard' },
  { componentName: 'OperatorProfileAssignment', importPath: './features/operators/components/operator-profile-assignment' },
  { componentName: 'SequentialWorkflowAssignment', importPath: './features/work-assignment/components/sequential-workflow-assignment' },
  { componentName: 'LoginAnalyticsDashboard', importPath: './components/admin/LoginAnalyticsDashboard' },
  { componentName: 'TrustedDeviceManager', importPath: './components/admin/TrustedDeviceManager' },
  { componentName: 'WorkflowNotificationDemo', importPath: './components/examples/WorkflowNotificationDemo' }
];

function checkFileExists(importPath: string): string | null {
  const srcPath = path.join(process.cwd(), 'src');
  const relativePath = importPath.replace('./', '');
  
  // Try with different extensions
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  
  for (const ext of extensions) {
    const fullPath = path.join(srcPath, relativePath + ext);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}

function analyzeExports(filePath: string): {hasDefault: boolean, hasNamed: boolean, namedExports: string[]} {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasDefault = /export\s+default\s+/.test(content) || /export\s*{\s*\w+\s+as\s+default\s*}/.test(content);
    const namedExportMatches = content.match(/export\s+(?:const|function|class)\s+(\w+)/g) || [];
    const namedExports = namedExportMatches.map(match => {
      const nameMatch = match.match(/export\s+(?:const|function|class)\s+(\w+)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(name => name);
    
    return {
      hasDefault,
      hasNamed: namedExports.length > 0,
      namedExports
    };
  } catch (error) {
    return { hasDefault: false, hasNamed: false, namedExports: [] };
  }
}

function generateFixedImports(): string {
  const results: ImportInfo[] = [];
  
  console.log('🔍 Analyzing dynamic imports...');
  
  dynamicImports.forEach(({ componentName, importPath }) => {
    const filePath = checkFileExists(importPath);
    const exists = filePath !== null;
    
    let hasDefaultExport = false;
    let hasNamedExport = false;
    let exportName = '';
    let issue = '';
    
    if (exists && filePath) {
      const exports = analyzeExports(filePath);
      hasDefaultExport = exports.hasDefault;
      hasNamedExport = exports.hasNamed;
      
      if (exports.namedExports.includes(componentName)) {
        exportName = componentName;
      } else if (exports.namedExports.length > 0) {
        exportName = exports.namedExports[0];
        issue = `Component name mismatch. Expected: ${componentName}, Found: ${exports.namedExports.join(', ')}`;
      } else if (!hasDefaultExport && !hasNamedExport) {
        issue = 'No exports found';
      }
    } else {
      issue = 'File not found';
    }
    
    results.push({
      componentName,
      filePath: filePath || importPath,
      exists,
      hasDefaultExport,
      hasNamedExport,
      exportName,
      issue
    });
  });
  
  // Generate fixed import statements
  let fixedImports = '';
  
  results.forEach(result => {
    if (!result.exists) {
      fixedImports += `// ❌ MISSING: ${result.componentName} - ${result.issue}\n`;
      fixedImports += `// const ${result.componentName} = lazy(() => import('${result.filePath}'));\n\n`;
    } else if (result.hasDefaultExport) {
      fixedImports += `const ${result.componentName} = lazy(() => import('${result.filePath}'));\n`;
    } else if (result.hasNamedExport && result.exportName) {
      fixedImports += `const ${result.componentName} = lazy(() => import('${result.filePath}').then(m => ({ default: m.${result.exportName} })));\n`;
    } else {
      fixedImports += `// ⚠️ ISSUE: ${result.componentName} - ${result.issue}\n`;
      fixedImports += `// const ${result.componentName} = lazy(() => import('${result.filePath}'));\n\n`;
    }
  });
  
  return fixedImports;
}

console.log('🚀 Fixing Dynamic Imports for TSA ERP...');
console.log('=====================================');

const fixedImports = generateFixedImports();

console.log('\n📝 Fixed Import Statements:');
console.log('===========================');
console.log(fixedImports);

export default generateFixedImports;