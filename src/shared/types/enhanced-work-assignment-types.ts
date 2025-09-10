// Enhanced Work Assignment Types
export interface WorkAssignmentDetails {
  id: string;
  operationName: string;
  operationNameNepali: string;
  bundleNumber: string;
  batchNumber: string;
  
  // Timing Details
  timePerPiece: number; // in minutes
  totalPieces: number;
  estimatedTotalTime: number; // in minutes
  
  // Pricing Details
  pricePerPiece: number;
  totalEarnings: number;
  
  // Previous Work History
  lastOperator?: {
    id: string;
    name: string;
    completedAt: Date;
    qualityScore: number; // 0-10
    efficiency: number; // percentage
    notes?: string;
  };
  
  // Work Requirements
  machineType: 'overlock' | 'singleNeedle' | 'flatlock' | 'buttonhole' | 'cutting' | 'manual';
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  requiredSkills: string[];
  
  // Priority & Scheduling
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate: Date;
  createdAt: Date;
  
  // Status
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'on_hold';
  assignedTo?: string;
  assignedAt?: Date;
  
  // Quality & Complexity
  complexityRating: 1 | 2 | 3 | 4 | 5; // 1 = simple, 5 = very complex
  qualityRequirement: 'standard' | 'high' | 'premium';
  
  // Additional Context
  articleType: string;
  size: string;
  color: string;
  customerInfo?: {
    name: string;
    orderNumber: string;
    specialRequirements?: string;
  };
}

export interface OperatorWorkHistory {
  operatorId: string;
  operatorName: string;
  operationId: string;
  operationName: string;
  completedAt: Date;
  timeTaken: number; // actual time in minutes
  qualityScore: number; // 0-10
  efficiency: number; // percentage compared to standard
  defectCount: number;
  notes?: string;
}

export interface WorkAssignmentRecommendation {
  operatorId: string;
  operatorName: string;
  matchScore: number; // 0-100
  reasons: string[];
  estimatedCompletion: Date;
  riskFactors: string[];
  previousPerformance?: {
    averageQuality: number;
    averageEfficiency: number;
    timesDoneThisOperation: number;
  };
}