// Sewing Template System Types
import { Timestamp } from 'firebase/firestore';

// Individual sewing operation/step
export interface SewingOperation {
  id: string;
  name: string;
  nameNepali: string;
  description?: string;
  
  // Machine and timing
  machineType: string; // From MACHINE_TYPES in operator-types.ts
  smvMinutes: number; // Standard Minute Value
  pricePerPiece: number; // Fixed price per piece (in Rupees)
  
  // Process flow - user selects during template entry
  processingType: 'parallel' | 'sequential';
  sequenceOrder: number;
  prerequisites: string[]; // Operation IDs that must complete before this (for sequential)
  
  // Quality requirements
  qualityCheckRequired: boolean;
  defectTolerance: number; // Percentage (0-100)
  
  // Additional metadata
  isOptional: boolean;
  notes?: string;
}

// Complete sewing template for a garment - NOT tied to specific article codes
export interface SewingTemplate {
  id?: string;
  
  // Template identification
  templateName: string;
  templateCode: string; // e.g., "TSHIRT_BASIC", "POLO_STANDARD"
  version: number;
  isActive: boolean;
  category: string; // e.g., "T-Shirt", "Polo", "Dress"
  
  // Sewing operations sequence
  operations: SewingOperation[];
  
  // Template metadata (calculated from operations)
  totalSmv: number; // Sum of all operation SMV
  totalPricePerPiece: number; // Sum of all operation prices
  complexityLevel: 'simple' | 'medium' | 'complex' | 'expert';
  
  // Template management
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Usage statistics
  timesUsed: number;
  
  // Notes and documentation
  notes?: string;
  setupInstructions?: string;
}

// Template creation/update forms
export interface CreateSewingTemplateData {
  templateName: string;
  templateCode: string;
  category: string;
  operations: Omit<SewingOperation, 'id'>[];
  notes?: string;
  setupInstructions?: string;
}

export interface UpdateSewingTemplateData extends Partial<CreateSewingTemplateData> {
  isActive?: boolean;
}

// Operation progress tracking for work assignments
export interface OperationProgress {
  operationId: string;
  operatorId?: string;
  machineType: string;
  
  // Status tracking
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'quality_check' | 'rework';
  assignedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Performance tracking
  piecesCompleted: number;
  piecesTarget: number;
  actualSmvMinutes?: number;
  actualCost?: number;
  efficiency?: number;
  
  // Quality tracking
  qualityCheck?: {
    passed: boolean;
    comments?: string;
    checkedBy: string;
    checkedAt: Timestamp;
  };
  
  // Issues and notes
  operatorNotes?: string;
  supervisorNotes?: string;
}

// Work assignment using sewing template (supervisor selects template during work creation)
export interface WorkAssignmentTemplate {
  id?: string;
  templateId: string;
  bundleId: string;
  totalPieces: number;
  
  // Operations progress tracking
  operationsProgress: OperationProgress[];
  
  // Machine-operator assignments (one operator per machine type)
  assignedOperators: {
    operationId: string;
    operatorId: string;
    machineType: string;
    assignedAt: Timestamp;
  }[];
  
  // Status and tracking
  status: 'draft' | 'assigned' | 'in_progress' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  supervisorId: string;
  
  // Progress summary
  totalOperations: number;
  completedOperations: number;
  progressPercentage: number;
}

// Machine-operator assignment (one operator per machine type)
export interface MachineOperatorAssignment {
  operatorId: string;
  operatorName: string;
  machineType: string;
  assignedAt: Timestamp;
  isActive: boolean;
  currentWorkload: number; // Number of active assignments
}

// Template filters for listing/searching
export interface SewingTemplateFilters {
  category?: string;
  isActive?: boolean;
  createdBy?: string;
  searchTerm?: string;
}

// Template categories
export const TEMPLATE_CATEGORIES = [
  'T-Shirt',
  'Polo Shirt', 
  'Dress',
  'Pants',
  'Shirt',
  'Other'
];

// Common sewing operations library updated for new structure
export const COMMON_OPERATIONS: Omit<SewingOperation, 'id' | 'sequenceOrder' | 'prerequisites'>[] = [
  {
    name: 'Shoulder Join',
    nameNepali: 'काँध जोड्ने',
    machineType: 'overlock',
    smvMinutes: 1,
    pricePerPiece: 2,
    processingType: 'sequential',
    qualityCheckRequired: true,
    defectTolerance: 5,
    isOptional: false
  },
  {
    name: 'Sleeve Attach',
    nameNepali: 'हात जोड्ने',
    machineType: 'overlock',
    smvMinutes: 2,
    pricePerPiece: 2,
    processingType: 'parallel',
    qualityCheckRequired: true,
    defectTolerance: 5,
    isOptional: false
  },
  {
    name: 'Side Seam',
    nameNepali: 'छेउको सिलाई',
    machineType: 'overlock',
    smvMinutes: 1.5,
    pricePerPiece: 1.5,
    processingType: 'sequential',
    qualityCheckRequired: true,
    defectTolerance: 5,
    isOptional: false
  },
  {
    name: 'Bottom Hem',
    nameNepali: 'तलको घेरा',
    machineType: 'flatlock',
    smvMinutes: 1,
    pricePerPiece: 1,
    processingType: 'sequential',
    qualityCheckRequired: false,
    defectTolerance: 10,
    isOptional: false
  },
  {
    name: 'Collar Making',
    nameNepali: 'कलर बनाउने',
    machineType: 'singleNeedle',
    smvMinutes: 3,
    pricePerPiece: 3,
    processingType: 'parallel',
    qualityCheckRequired: true,
    defectTolerance: 2,
    isOptional: true
  }
];

// Template complexity calculation based on SMV and operations
export const calculateTemplateComplexity = (operations: SewingOperation[]): SewingTemplate['complexityLevel'] => {
  const totalSmv = operations.reduce((sum, op) => sum + op.smvMinutes, 0);
  const parallelOps = operations.filter(op => op.processingType === 'parallel').length;
  
  if (totalSmv > 30 || operations.length > 10) {
    return 'expert';
  } else if (totalSmv > 20 || parallelOps > 3 || operations.length > 7) {
    return 'complex';
  } else if (totalSmv > 10 || operations.length > 4) {
    return 'medium';
  } else {
    return 'simple';
  }
};

// Template validation function
export const validateTemplate = (template: CreateSewingTemplateData): boolean => {
  if (!template.templateName.trim()) return false;
  if (!template.templateCode.trim()) return false;
  if (!template.category.trim()) return false;
  if (template.operations.length === 0) return false;
  
  // Operation validation
  return template.operations.every(op => 
    op.name.trim() && 
    op.smvMinutes > 0 && 
    op.pricePerPiece > 0 &&
    op.machineType.trim()
  );
};

// Check if sequential operations have proper prerequisites
export const validateSequentialFlow = (operations: SewingOperation[]): boolean => {
  const sequentialOps = operations.filter(op => op.processingType === 'sequential');
  
  for (const op of sequentialOps) {
    if (op.prerequisites.length === 0 && op.sequenceOrder > 1) {
      return false; // Sequential operations (except first) must have prerequisites
    }
  }
  
  return true;
};