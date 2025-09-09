// src/types/entities.ts
import { Timestamp } from 'firebase/firestore';

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy?: string;
  updatedBy?: string;
}

// User Management Types
export interface User extends BaseEntity {
  username: string;
  name: string;
  email?: string;
  role: 'operator' | 'supervisor' | 'management' | 'admin';
  permissions: string[];
  department?: string;
  machineType?: string;
  skills?: string[];
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  employeeId?: string;
  salary?: number;
  shiftPreference?: 'morning' | 'afternoon' | 'night';
}

// Operator specific interface
export interface Operator extends User {
  role: 'operator';
  efficiencyRating: number;
  qualityScore: number;
  specializations: string[];
  currentStation?: string;
  availabilityStatus: 'available' | 'busy' | 'break' | 'offline';
  lastActiveTime?: Timestamp | Date;
  totalPiecesCompleted: number;
  totalEarnings: number;
}

// Supervisor specific interface  
export interface Supervisor extends User {
  role: 'supervisor';
  teamMembers: string[]; // operator IDs
  responsibleLines: string[];
  supervisorLevel: 'junior' | 'senior' | 'lead';
  managedOperatorCount: number;
}

// Management specific interface
export interface Management extends User {
  role: 'management';
  accessLevel: 'manager' | 'senior_manager' | 'director';
  managedDepartments: string[];
  reportingTo?: string;
}

// Bundle Management Types
export interface Bundle extends BaseEntity {
  bundleNumber: string;
  articleNumber: string;
  customerPO: string;
  orderQuantity: number;
  deliveryDate: Date;
  style: string;
  color: string;
  sizes: BundleSize[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  totalPieces: number;
  completedPieces: number;
  remainingPieces: number;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  qualityGrade?: 'A' | 'B' | 'C';
  defectRate?: number;
}

export interface BundleSize {
  size: string;
  quantity: number;
  completed: number;
  rate: number;
  smv?: number; // Standard Minute Value - auto-calculated or user-edited
}

// Work Assignment Types
export interface WorkAssignment extends BaseEntity {
  workItemId: string;
  operatorId: string;
  supervisorId: string;
  assignedAt: Timestamp | Date;
  estimatedCompletionTime?: number; // minutes
  priority: 'low' | 'normal' | 'high' | 'urgent';
  instructions?: string;
  requiredSkills: string[];
  status: 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled';
  actualStartTime?: Timestamp | Date;
  completionTime?: Timestamp | Date;
}

// Work Item Types
export interface WorkItem extends BaseEntity {
  bundleNumber: string;
  bundleId: string;
  articleNumber: string;
  operation: string;
  operationCode: string;
  pieces: number;
  completedPieces: number;
  rate: number; // per piece
  totalValue: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTimeMinutes: number;
  actualTimeMinutes?: number;
  operatorId?: string;
  assignedBy?: string;
  assignedAt?: Timestamp | Date;
  startedAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  status: 'pending' | 'assigned' | 'self_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  paymentStatus: 'PENDING' | 'HELD_FOR_DAMAGE' | 'RELEASED' | 'PAID';
  canWithdraw: boolean;
  qualityScore?: number;
  defects?: WorkItemDefect[];
  reworkRequired?: boolean;
  reworkReason?: string;
}

export interface WorkItemDefect {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  pieces: number;
  reportedAt: Timestamp | Date;
  reportedBy: string;
  resolved: boolean;
  resolvedAt?: Timestamp | Date;
}

// Work Completion Types
export interface WorkCompletion extends BaseEntity {
  workItemId: string;
  operatorId: string;
  piecesCompleted: number;
  timeSpentMinutes: number;
  qualityScore: number;
  defectCount: number;
  reworkRequired: boolean;
  supervisorApproval?: boolean;
  approvedBy?: string;
  approvedAt?: Timestamp | Date;
  earnings: number;
  efficiency: number; // percentage
  notes?: string;
}

// Quality Issue Types
export interface QualityIssue extends BaseEntity {
  workItemId: string;
  bundleId: string;
  operatorId: string;
  reportedBy: string;
  issueType: 'measurement' | 'stitching' | 'cutting' | 'pressing' | 'finishing' | 'other';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  affectedPieces: number;
  pieceNumbers?: number[];
  images?: string[];
  status: 'reported' | 'acknowledged' | 'investigating' | 'rework_assigned' | 'resolved' | 'closed';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Timestamp | Date;
  preventiveActions?: string;
  reworkCost?: number;
}

// Production Statistics Types
export interface ProductionStats extends BaseEntity {
  date: string; // YYYY-MM-DD
  operatorId?: string;
  bundleId?: string;
  lineId?: string;
  totalPieces: number;
  completedPieces: number;
  defectivePieces: number;
  efficiency: number; // percentage
  qualityScore: number;
  earnings: number;
  hoursWorked: number;
  piecesPerHour: number;
  operations: OperationStat[];
  shiftType: 'morning' | 'afternoon' | 'night';
}

export interface OperationStat {
  operation: string;
  pieces: number;
  timeMinutes: number;
  rate: number;
  earnings: number;
  efficiency: number;
}

// Notification Types
export interface Notification extends BaseEntity {
  recipientId: string;
  recipientType: 'operator' | 'supervisor' | 'management' | 'admin' | 'all';
  type: 'info' | 'warning' | 'error' | 'success' | 'work_assignment' | 'quality_issue' | 'payment' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'work' | 'quality' | 'payment' | 'system' | 'general';
  read: boolean;
  readAt?: Timestamp | Date;
  actionRequired: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  expiresAt?: Timestamp | Date;
  channels: ('in_app' | 'email' | 'sms' | 'push')[];
}

// System Settings Types
export interface SystemSettings extends BaseEntity {
  category: 'general' | 'workflow' | 'quality' | 'payment' | 'notifications' | 'security';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isEditable: boolean;
  requiresRestart: boolean;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'enum';
  value: any;
  message: string;
}

// Operator Wallet Types
export interface OperatorWallet extends BaseEntity {
  operatorId: string;
  availableAmount: number;
  heldAmount: number;
  totalEarned: number;
  totalWithdrawn: number;
  heldBundles: string[]; // bundle IDs with held payments
  lastTransactionAt?: Timestamp | Date;
  withdrawalHistory: WalletTransaction[];
  earningsHistory: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'hold' | 'release' | 'adjustment';
  amount: number;
  description: string;
  relatedEntityId?: string; // workItem, bundle, etc.
  relatedEntityType?: string;
  timestamp: Timestamp | Date;
  processedBy?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  failureReason?: string;
}

// Damage Report Types
export interface DamageReport extends BaseEntity {
  bundleId: string;
  workItemId: string;
  operatorId: string;
  supervisorId: string;
  reportedBy: string;
  damageType: 'cutting_error' | 'stitching_defect' | 'measurement_error' | 'fabric_damage' | 'other';
  severity: 'minor' | 'major' | 'critical';
  affectedPieces: number;
  pieceNumbers: number[];
  description: string;
  images?: string[];
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  status: 'reported_to_supervisor' | 'acknowledged' | 'rework_in_progress' | 'rework_completed' | 'payment_released' | 'closed';
  estimatedCost: number;
  actualCost?: number;
  reworkDetails?: ReworkDetails;
  paymentImpact: PaymentImpact;
  timeline: DamageTimeline[];
}

export interface ReworkDetails {
  assignedTo?: string;
  startedAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  timeSpentMinutes?: number;
  qualityCheckPassed?: boolean;
  supervisorNotes?: string;
  beforeImages?: string[];
  afterImages?: string[];
}

export interface PaymentImpact {
  heldAmount: number;
  operatorLoss: number;
  supervisorCompensation: number;
  reworkCost: number;
  totalImpact: number;
}

export interface DamageTimeline {
  timestamp: Timestamp | Date;
  action: string;
  performedBy: string;
  details?: string;
}

// Audit Log Types
export interface AuditLog extends BaseEntity {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  performedBy: string;
  userRole: string;
  changes?: AuditChange[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  dataType: string;
}

// Line Status and Equipment Types
export interface LineStatus extends BaseEntity {
  lineId: string;
  lineName: string;
  status: 'active' | 'inactive' | 'maintenance' | 'setup';
  currentBundle?: string;
  assignedOperators: string[];
  targetEfficiency: number;
  actualEfficiency: number;
  targetPiecesPerHour: number;
  actualPiecesPerHour: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  issues?: string[];
}

// Configuration Types
export interface SizeConfig extends BaseEntity {
  articleNumber: string;
  sizes: string[];
  measurements: Record<string, number>;
  tolerances: Record<string, number>;
  isActive: boolean;
}

export interface MachineConfig extends BaseEntity {
  machineId: string;
  machineType: string;
  specifications: Record<string, any>;
  capabilities: string[];
  maintenanceSchedule: MaintenanceSchedule[];
  isActive: boolean;
}

export interface MaintenanceSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  description: string;
  lastPerformed?: Date;
  nextDue: Date;
  responsiblePerson?: string;
}

export interface ArticleTemplate extends BaseEntity {
  articleNumber: string;
  articleName: string;
  style: string;
  operations: TemplateOperation[];
  totalSAM: number; // Standard Allowed Minutes
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  estimatedPieces: number;
  qualityChecks: QualityCheckPoint[];
  isActive: boolean;
}

export interface TemplateOperation {
  sequence: number;
  operationCode: string;
  operationName: string;
  description: string;
  SAM: number;
  rate: number;
  machineType: string;
  skillRequired: string;
  qualityChecks: string[];
  dependencies?: string[];
}

export interface QualityCheckPoint {
  checkpoint: string;
  description: string;
  criteria: string[];
  tolerance: number;
  isRejectionPoint: boolean;
}

// Real-time Data Types
export interface RealtimeData {
  timestamp: Timestamp | Date;
  type: 'operator_status' | 'work_progress' | 'line_status' | 'quality_alert' | 'system_health';
  data: Record<string, any>;
  source: string;
}

export interface OperatorStatus {
  operatorId: string;
  status: 'active' | 'idle' | 'break' | 'offline';
  currentWorkItem?: string;
  location?: string;
  lastActivity: Timestamp | Date;
  productivity: number;
}

// Migration and System Types
export interface DataMigration extends BaseEntity {
  version: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  migratedRecords: number;
  failedRecords: number;
  errors?: MigrationError[];
}

export interface MigrationError {
  recordId: string;
  error: string;
  timestamp: Timestamp | Date;
}

export interface PerformanceMetric extends BaseEntity {
  metricType: 'api_response_time' | 'database_query_time' | 'page_load_time' | 'user_action_time';
  value: number;
  unit: 'ms' | 'seconds' | 'minutes';
  entityType?: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Note: All types are individually exported where they are defined above