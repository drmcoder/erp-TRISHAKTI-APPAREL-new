// Bundle and Production Operation Types
export interface ProductionBundle {
  id: string;
  bundleNumber: string; // e.g., "Bundle-A1-M-001"
  
  // Article Information
  articleId: string;
  articleNumber: string; // e.g., "3233"
  articleStyle: string; // e.g., "Adult T-shirt"
  size: string; // e.g., "M"
  
  // Source Information
  rollId: string;
  rollNumber: string; // e.g., "Roll1"
  rollColor: string;
  
  // Template Information
  templateId: string;
  templateName: string;
  templateCode: string;
  
  // Bundle Status
  status: 'created' | 'in_production' | 'completed' | 'quality_check' | 'finished';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Operations (copied from sewing template)
  operations: BundleOperation[];
  
  // Tracking
  createdAt: Date;
  createdBy: string;
  completedAt?: Date;
  totalValue: number; // Sum of all operation prices
  totalSMV: number; // Sum of all operation SMV
  
  // Bundle Generation Metadata
  piecesPerBundle?: number; // Pieces per bundle (typically 1 for TSA workflow)
  sourceRollLayers?: number; // Number of layers in source roll
  sizeRatio?: number; // Size ratio used for generation
}

export interface BundleOperation {
  id: string;
  bundleId: string;
  
  // Operation Details (from sewing template)
  operationId: string; // Reference to template operation
  name: string; // e.g., "Sleeve Attach"
  nameNepali: string;
  description?: string;
  machineType: string; // e.g., "overlock", "singleNeedle"
  sequenceOrder: number; // 1, 2, 3...
  
  // Pricing & Time
  pricePerPiece: number; // Rs. 4.0
  smvMinutes: number; // 3.5 minutes
  
  // Assignment & Status
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'quality_failed' | 'rework' | 'parts_issue';
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  assignedAt?: Date;
  
  // Completion Tracking
  startedAt?: Date;
  completedAt?: Date;
  actualSMV?: number; // Actual time taken
  qualityStatus?: 'pass' | 'fail' | 'rework_needed';
  qualityNotes?: string;
  
  // Prerequisites (operation dependencies)
  prerequisites: string[]; // Operation IDs that must be completed first
  canStartAfter?: Date; // When this operation becomes available
  
  // Parts Replacement
  partsComplaint?: PartsComplaint;
  
  // Optional Operation Details
  isOptional: boolean;
  qualityCheckRequired: boolean;
  defectTolerance: number; // Percentage
  notes?: string;
}

// Parts Replacement System
export interface PartsComplaint {
  id: string;
  bundleId: string;
  operationId: string;
  bundleNumber: string;
  
  // Complaint Details
  reportedBy: string; // Operator ID
  reportedByName: string;
  reportedAt: Date;
  issueType: 'damaged' | 'missing' | 'defective' | 'wrong_size' | 'wrong_color' | 'other';
  damagedParts: string[]; // e.g., ["Front Panel", "Left Sleeve"]
  description: string;
  photos?: string[]; // Photo URLs of damaged parts
  
  // Status & Resolution
  status: 'reported' | 'acknowledged' | 'replacing' | 'replaced' | 'resolved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Supervisor Response
  acknowledgedBy?: string; // Supervisor ID
  acknowledgedByName?: string;
  acknowledgedAt?: Date;
  supervisorNotes?: string;
  estimatedReplacementTime?: number; // in minutes
  
  // Replacement Tracking
  replacementStartedAt?: Date;
  replacementCompletedAt?: Date;
  replacedParts: string[];
  replacementNotes?: string;
  
  // Resolution
  resolvedAt?: Date;
  resolution: 'parts_replaced' | 'approved_as_is' | 'bundle_scrapped' | 'rework_assigned';
  
  // Communication
  operatorNotified?: boolean;
  operatorNotifiedAt?: Date;
}

// Parts replacement request data
export interface PartsReplacementRequest {
  bundleId: string;
  operationId: string;
  issueType: PartsComplaint['issueType'];
  damagedParts: string[];
  description: string;
  photos?: File[];
  priority?: PartsComplaint['priority'];
}

export interface BundleCreationData {
  // Source WIP Entry
  wipEntryId: string;
  batchNumber: string;
  
  // Articles and Templates
  articles: {
    articleId: string;
    articleNumber: string;
    articleStyle: string;
    templateId: string;
    sizes: {
      size: string;
      quantity: number;
    }[];
  }[];
  
  // Fabric Rolls
  fabricRolls: {
    rollId: string;
    rollNumber: string;
    color: string;
    weight: number;
    layerCount: number;
  }[];
  
  // Generation Settings
  bundlePrefix?: string; // e.g., "BND"
  createdBy: string;
}

export interface BundleAssignmentData {
  operationId: string;
  operatorId: string;
  operatorName: string;
  assignedBy: string;
  estimatedDuration?: number; // minutes
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface OperatorEarnings {
  operatorId: string;
  operatorName: string;
  bundleId: string;
  bundleNumber: string;
  operationId: string;
  operationName: string;
  
  // Earnings Details
  baseRate: number; // Operation price per piece
  piecesCompleted: number; // Usually 1 for garment operations
  totalEarnings: number; // baseRate × piecesCompleted
  
  // Time Tracking
  smvAllocated: number; // Expected SMV
  actualTimeSpent: number; // Actual time in minutes
  efficiency: number; // (smvAllocated / actualTimeSpent) × 100
  
  // Quality & Bonus
  qualityRating: 'excellent' | 'good' | 'average' | 'poor';
  qualityBonus?: number;
  
  // Dates
  completedAt: Date;
  paymentStatus: 'pending' | 'processed' | 'paid';
}

// Bundle filtering and search types
export interface BundleFilters {
  status?: BundleOperation['status'][];
  articleNumber?: string;
  size?: string;
  rollNumber?: string;
  priority?: ProductionBundle['priority'][];
  assignedOperatorId?: string;
  machineType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Bundle statistics
export interface BundleStats {
  totalBundles: number;
  bundlesByStatus: Record<ProductionBundle['status'], number>;
  operationsByStatus: Record<BundleOperation['status'], number>;
  averageCompletionTime: number; // hours
  totalValue: number;
  operatorWorkload: {
    operatorId: string;
    operatorName: string;
    assignedOperations: number;
    completedOperations: number;
    pendingOperations: number;
    totalEarnings: number;
  }[];
}

// Types are already exported above, no default export needed