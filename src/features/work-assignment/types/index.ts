// Work Assignment System Types
// Following REBUILD_BLUEPRINT pattern for comprehensive type definitions

export interface WorkBundle {
  id?: string;
  bundleNumber: string;
  orderNumber: string;
  garmentType: string;
  garmentSize: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Work breakdown
  workItems: WorkItem[];
  totalPieces: number;
  completedPieces: number;
  remainingPieces: number;
  
  // Timeline
  createdDate: Date;
  targetStartDate: Date;
  targetCompletionDate: Date;
  actualStartDate?: Date;
  actualCompletionDate?: Date;
  
  // Status
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  isUrgent: boolean;
  
  // Assignment information
  assignedOperators: string[]; // operator IDs
  supervisorId: string;
  
  // Tracking
  estimatedHours: number;
  actualHours?: number;
  efficiency?: number;
  qualityScore?: number;
  
  // Metadata
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItem {
  id?: string;
  bundleId: string;
  workItemNumber: string;
  
  // Work details
  machineType: string;
  operation: string;
  operationCode: string;
  skillLevelRequired: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Quantities
  targetPieces: number;
  completedPieces: number;
  rejectedPieces: number;
  reworkPieces: number;
  
  // Assignment
  assignedOperatorId?: string;
  assignmentMethod: 'supervisor_assigned' | 'self_assigned' | 'auto_assigned';
  assignedDate?: Date;
  
  // Timeline
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  
  // Status
  status: 'pending' | 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled';
  
  // Quality
  qualityChecked: boolean;
  qualityScore?: number;
  qualityIssues?: QualityIssue[];
  
  // Earnings
  ratePerPiece: number;
  bonusRate?: number;
  totalEarnings?: number;
  
  // Tracking
  isBlocked: boolean;
  blockingReason?: string;
  dependencies: string[]; // other work item IDs
  
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkAssignment {
  id?: string;
  workItemId: string;
  operatorId: string;
  bundleId: string;
  
  // Assignment details
  assignmentMethod: 'supervisor_assigned' | 'self_assigned' | 'auto_assigned';
  assignedBy: string;
  assignedAt: Date;
  
  // Status
  status: 'pending' | 'accepted' | 'started' | 'paused' | 'completed' | 'cancelled';
  acceptedAt?: Date;
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Timeline
  estimatedStartTime: Date;
  estimatedCompletionTime: Date;
  actualStartTime?: Date;
  actualCompletionTime?: Date;
  
  // Progress tracking
  targetPieces: number;
  completedPieces: number;
  rejectedPieces: number;
  currentEfficiency?: number;
  
  // Work session tracking
  workSessions: WorkSession[];
  totalWorkingTime: number; // in minutes
  breakTime: number; // in minutes
  
  // Quality and earnings
  qualityScore?: number;
  earningsCalculated: boolean;
  totalEarnings?: number;
  
  // Notes and issues
  operatorNotes?: string;
  supervisorNotes?: string;
  issues: AssignmentIssue[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface WorkSession {
  id?: string;
  assignmentId: string;
  operatorId: string;
  
  // Session details
  startTime: Date;
  endTime?: Date;
  totalDuration?: number; // in minutes
  
  // Production
  piecesCompleted: number;
  efficiency: number;
  qualityIssues: number;
  
  // Status
  sessionType: 'work' | 'break' | 'meeting' | 'training' | 'maintenance';
  status: 'active' | 'paused' | 'completed';
  
  // Break tracking
  breaks: Break[];
  totalBreakTime: number;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Break {
  id?: string;
  sessionId: string;
  
  // Break details
  breakType: 'tea' | 'lunch' | 'personal' | 'maintenance' | 'meeting';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  
  // Status
  status: 'active' | 'completed';
  isPaid: boolean;
  
  // Notes
  reason?: string;
  approvedBy?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentIssue {
  id?: string;
  assignmentId: string;
  
  // Issue details
  issueType: 'quality' | 'machine' | 'material' | 'skill' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  
  // Status
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  
  // Resolution
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  
  // Impact
  impactOnProduction: boolean;
  delayedMinutes?: number;
  additionalCost?: number;
  
  // Attachments
  photos?: string[];
  documents?: string[];
  
  // Timeline
  reportedAt: Date;
  dueDate?: Date;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface QualityIssue {
  id?: string;
  workItemId: string;
  
  // Quality details
  issueType: 'stitching' | 'cutting' | 'measurement' | 'material' | 'finishing' | 'other';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  
  // Quantities affected
  affectedPieces: number;
  reworkRequired: boolean;
  scrapPieces: number;
  
  // Detection
  detectedBy: string;
  detectionStage: 'production' | 'quality_check' | 'final_inspection' | 'customer';
  detectedAt: Date;
  
  // Resolution
  correctionAction: string;
  preventiveAction?: string;
  reworkAssignedTo?: string;
  reworkCompletedAt?: Date;
  
  // Cost impact
  reworkCost?: number;
  materialCost?: number;
  laborCost?: number;
  
  // Photos and evidence
  photos: string[];
  
  // Status
  status: 'open' | 'rework_assigned' | 'rework_completed' | 'closed';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequest {
  id?: string;
  workItemId: string;
  operatorId: string;
  
  // Request details
  requestType: 'self_assignment' | 'reassignment' | 'additional_work';
  requestedAt: Date;
  reason?: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  
  // Approval workflow
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  
  // Auto-assignment eligibility
  skillMatches: boolean;
  machineAvailable: boolean;
  workloadAcceptable: boolean;
  timeSlotAvailable: boolean;
  
  // Priority scoring
  priorityScore: number;
  operatorEfficiency: number;
  workComplexity: number;
  
  // Expiry
  expiresAt: Date;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface WorkAssignmentSummary {
  id: string;
  bundleNumber: string;
  orderNumber: string;
  operatorName: string;
  operatorId: string;
  machineType: string;
  operation: string;
  status: string;
  priority: string;
  assignedDate: string;
  targetCompletion: string;
  progress: number;
  efficiency: number;
  qualityScore?: number;
  estimatedEarnings: number;
}

export interface AssignmentStatistics {
  totalAssignments: number;
  pendingAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  averageEfficiency: number;
  averageQuality: number;
  onTimeCompletion: number;
  totalEarnings: number;
}

export interface AssignmentFilters {
  search?: string;
  status?: string;
  priority?: string;
  operatorId?: string;
  machineType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  orderNumber?: string;
}

// Assignment creation and update types
export interface CreateWorkBundleData {
  bundleNumber: string;
  orderNumber: string;
  garmentType: string;
  garmentSize: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetStartDate: Date;
  targetCompletionDate: Date;
  supervisorId: string;
  estimatedHours: number;
  notes?: string;
}

export interface CreateWorkItemData {
  bundleId: string;
  machineType: string;
  operation: string;
  operationCode: string;
  skillLevelRequired: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetPieces: number;
  estimatedDuration: number;
  ratePerPiece: number;
  dependencies?: string[];
}

export interface AssignWorkData {
  workItemId: string;
  operatorId: string;
  assignmentMethod: 'supervisor_assigned' | 'self_assigned' | 'auto_assigned';
  estimatedStartTime: Date;
  estimatedCompletionTime: Date;
  notes?: string;
}

export interface CompleteWorkData {
  assignmentId: string;
  completedPieces: number;
  rejectedPieces: number;
  qualityScore: number;
  actualDuration: number;
  operatorNotes?: string;
  qualityIssues?: Omit<QualityIssue, 'id' | 'workItemId' | 'createdAt' | 'updatedAt'>[];
}

// Constants and configuration
export const ASSIGNMENT_STATUS = {
  pending: { label: 'Pending', color: 'gray', icon: '⏳' },
  assigned: { label: 'Assigned', color: 'blue', icon: '👤' },
  started: { label: 'Started', color: 'yellow', icon: '🚀' },
  paused: { label: 'Paused', color: 'orange', icon: '⏸️' },
  completed: { label: 'Completed', color: 'green', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'red', icon: '❌' }
} as const;

export const WORK_PRIORITIES = {
  low: { label: 'Low', color: 'gray', icon: '⬇️', urgencyScore: 1 },
  medium: { label: 'Medium', color: 'blue', icon: '➡️', urgencyScore: 2 },
  high: { label: 'High', color: 'yellow', icon: '⬆️', urgencyScore: 3 },
  urgent: { label: 'Urgent', color: 'red', icon: '🚨', urgencyScore: 4 }
} as const;

export const MACHINE_OPERATIONS = {
  cutting: [
    { code: 'CUT001', name: 'Main Cutting', estimatedMinutes: 15, skillRequired: 'intermediate' },
    { code: 'CUT002', name: 'Pocket Cutting', estimatedMinutes: 10, skillRequired: 'beginner' },
    { code: 'CUT003', name: 'Collar Cutting', estimatedMinutes: 20, skillRequired: 'advanced' }
  ],
  sewing: [
    { code: 'SEW001', name: 'Side Seam', estimatedMinutes: 25, skillRequired: 'intermediate' },
    { code: 'SEW002', name: 'Shoulder Seam', estimatedMinutes: 20, skillRequired: 'intermediate' },
    { code: 'SEW003', name: 'Collar Attachment', estimatedMinutes: 30, skillRequired: 'advanced' },
    { code: 'SEW004', name: 'Button Hole', estimatedMinutes: 15, skillRequired: 'expert' }
  ],
  finishing: [
    { code: 'FIN001', name: 'Button Attachment', estimatedMinutes: 10, skillRequired: 'beginner' },
    { code: 'FIN002', name: 'Final Pressing', estimatedMinutes: 8, skillRequired: 'intermediate' },
    { code: 'FIN003', name: 'Quality Check', estimatedMinutes: 12, skillRequired: 'advanced' }
  ],
  embroidery: [
    { code: 'EMB001', name: 'Logo Embroidery', estimatedMinutes: 35, skillRequired: 'advanced' },
    { code: 'EMB002', name: 'Decorative Embroidery', estimatedMinutes: 45, skillRequired: 'expert' }
  ]
} as const;

export const QUALITY_ISSUE_TYPES = [
  { value: 'stitching', label: 'Stitching Defect', severity: ['minor', 'major', 'critical'] },
  { value: 'cutting', label: 'Cutting Error', severity: ['minor', 'major', 'critical'] },
  { value: 'measurement', label: 'Size Issue', severity: ['minor', 'major'] },
  { value: 'material', label: 'Material Defect', severity: ['major', 'critical'] },
  { value: 'finishing', label: 'Finishing Issue', severity: ['minor', 'major'] },
  { value: 'other', label: 'Other Issue', severity: ['minor', 'major', 'critical'] }
] as const;

export const BREAK_TYPES = [
  { value: 'tea', label: 'Tea Break', duration: 15, isPaid: true },
  { value: 'lunch', label: 'Lunch Break', duration: 60, isPaid: false },
  { value: 'personal', label: 'Personal Break', duration: 10, isPaid: true },
  { value: 'maintenance', label: 'Machine Maintenance', duration: 30, isPaid: true },
  { value: 'meeting', label: 'Team Meeting', duration: 20, isPaid: true }
] as const;

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Export all types
export type {
  WorkBundle,
  WorkItem,
  WorkAssignment,
  WorkSession,
  Break,
  AssignmentIssue,
  QualityIssue,
  AssignmentRequest,
  WorkAssignmentSummary,
  AssignmentStatistics,
  AssignmentFilters,
  CreateWorkBundleData,
  CreateWorkItemData,
  AssignWorkData,
  CompleteWorkData,
  ServiceResponse,
  PaginatedResponse
};