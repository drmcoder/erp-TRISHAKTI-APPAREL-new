// Operator Types and Interfaces based on documentation
import { Timestamp } from 'firebase/firestore';

// Operator status in real-time database
export interface OperatorStatus {
  status: 'working' | 'break' | 'offline' | 'idle';
  currentWork: string | null;
  lastActivity: number;
  machineStatus: 'running' | 'stopped' | 'maintenance';
  location?: string;
  sessionId?: string;
}

// Operator profile data in Firestore
export interface Operator {
  id?: string;
  username: string;
  name: string;
  employeeId: string;
  role: 'operator';
  
  // Personal Information
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  
  // Work Profile
  machineTypes: string[]; // Compatible machine types
  primaryMachine: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  specializations: string[]; // e.g., ['stitching', 'finishing', 'quality_check']
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  
  // Performance Metrics
  averageEfficiency: number; // 0-2.0 (200% max)
  qualityScore: number; // 0-1.0 (100% max)
  completedBundles: number;
  totalPieces: number;
  totalEarnings: number;
  
  // Status and Availability
  isActive: boolean;
  availabilityStatus: 'available' | 'busy' | 'on_break' | 'offline';
  currentAssignments: string[]; // Bundle IDs currently assigned
  maxConcurrentWork: number; // Default 3 for self-assignment
  
  // Avatar and Profile
  avatar?: {
    type: 'emoji' | 'photo' | 'initials';
    value: string; // emoji, photo URL, or initials
    backgroundColor?: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  hiredDate: Date;
  
  // Statistics (calculated fields)
  stats?: {
    dailyAverage: number;
    weeklyAverage: number;
    monthlyAverage: number;
    bestEfficiency: number;
    recentQualityTrend: 'improving' | 'declining' | 'stable';
  };
}

// Operator list view (simplified for tables/lists)
export interface OperatorSummary {
  id: string;
  name: string;
  username: string;
  employeeId: string;
  primaryMachine: string;
  machineTypes: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  currentStatus: string;
  efficiency: number;
  qualityScore: number;
  currentWork?: string;
  avatar?: Operator['avatar'];
}

// Operator creation/update forms
export interface CreateOperatorData {
  username: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  primaryMachine: string;
  machineTypes: string[];
  skillLevel: Operator['skillLevel'];
  shift: Operator['shift'];
  maxConcurrentWork?: number;
  avatar?: Operator['avatar'];
  hiredDate: Date;
}

export interface UpdateOperatorData extends Partial<CreateOperatorData> {
  isActive?: boolean;
  specializations?: string[];
  emergencyContact?: Operator['emergencyContact'];
  address?: string;
}

// Operator work assignment data
export interface OperatorWorkAssignment {
  operatorId: string;
  bundleId: string;
  workItemId: string;
  assignedAt: Timestamp;
  assignmentMethod: 'supervisor_assigned' | 'self_assigned';
  status: 'assigned' | 'in_progress' | 'completed' | 'on_hold';
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  efficiency?: number;
  qualityScore?: number;
}

// Operator activity log
export interface OperatorActivity {
  id?: string;
  operatorId: string;
  activityType: 'login' | 'logout' | 'work_start' | 'work_complete' | 'break_start' | 'break_end' | 'status_change';
  description: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

// Operator statistics aggregated data
export interface OperatorStatistics {
  operatorId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  // Production metrics
  bundlesCompleted: number;
  totalPieces: number;
  totalHours: number;
  averageEfficiency: number;
  bestEfficiency: number;
  
  // Quality metrics  
  qualityScore: number;
  defectRate: number;
  reworkCount: number;
  
  // Financial metrics
  totalEarnings: number;
  bonusEarned: number;
  penaltiesDeducted: number;
  
  // Attendance metrics
  daysWorked: number;
  hoursWorked: number;
  breakTime: number;
  overtimeHours: number;
  
  // Machine utilization
  machineUptime: number;
  machineEfficiency: number;
}

// Machine compatibility definition
export interface MachineCompatibility {
  machineType: string;
  displayName: string;
  nepaliName: string;
  category: 'stitching' | 'finishing' | 'cutting' | 'pressing' | 'manual';
  skillRequired: Operator['skillLevel'];
  compatibleWith: string[]; // Other machine types this can work with
}

// Available machine types (as per BUSINESS_LOGIC_ALGORITHMS.md)
export const MACHINE_TYPES: MachineCompatibility[] = [
  {
    machineType: 'overlock',
    displayName: 'Overlock',
    nepaliName: 'ओभरलक',
    category: 'stitching',
    skillRequired: 'intermediate',
    compatibleWith: ['overlock', 'OVERLOCK']
  },
  {
    machineType: 'flatlock',
    displayName: 'Flatlock', 
    nepaliName: 'फ्ल्यालक',
    category: 'stitching',
    skillRequired: 'intermediate',
    compatibleWith: ['flatlock', 'FLATLOCK']
  },
  {
    machineType: 'singleNeedle',
    displayName: 'Single Needle',
    nepaliName: 'एकल सुई',
    category: 'stitching', 
    skillRequired: 'beginner',
    compatibleWith: ['singleNeedle', 'single_needle', 'Single Needle']
  },
  {
    machineType: 'buttonhole',
    displayName: 'Buttonhole',
    nepaliName: 'बटनहोल',
    category: 'finishing',
    skillRequired: 'advanced',
    compatibleWith: ['buttonhole', 'Buttonhole', 'BUTTONHOLE']
  },
  {
    machineType: 'buttonAttach',
    displayName: 'Button Attach',
    nepaliName: 'बटन जोड्ने',
    category: 'finishing',
    skillRequired: 'intermediate',
    compatibleWith: ['buttonAttach', 'button_attach']
  },
  {
    machineType: 'iron',
    displayName: 'Iron/Press',
    nepaliName: 'इस्त्री प्रेस',
    category: 'pressing',
    skillRequired: 'beginner',
    compatibleWith: ['iron', 'pressing']
  },
  {
    machineType: 'cutting',
    displayName: 'Cutting Machine',
    nepaliName: 'काट्ने मेसिन',
    category: 'cutting',
    skillRequired: 'advanced',
    compatibleWith: ['cutting']
  },
  {
    machineType: 'embroidery',
    displayName: 'Embroidery Machine',
    nepaliName: 'कसिदाकारी मेसिन',
    category: 'finishing',
    skillRequired: 'expert',
    compatibleWith: ['embroidery']
  },
  {
    machineType: 'manual',
    displayName: 'Manual Work',
    nepaliName: 'हस्तकला काम',
    category: 'manual',
    skillRequired: 'beginner',
    compatibleWith: ['manual']
  }
];

// Skill level definitions
export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', nepaliLabel: 'शुरुवाती', experienceMonths: 0 },
  { value: 'intermediate', label: 'Intermediate', nepaliLabel: 'मध्यम', experienceMonths: 6 },
  { value: 'advanced', label: 'Advanced', nepaliLabel: 'उन्नत', experienceMonths: 18 },
  { value: 'expert', label: 'Expert', nepaliLabel: 'विशेषज्ञ', experienceMonths: 36 }
];

// Shift definitions  
export const SHIFT_TYPES = [
  { value: 'morning', label: 'Morning (6 AM - 2 PM)', nepaliLabel: 'बिहानको पाली' },
  { value: 'afternoon', label: 'Afternoon (2 PM - 10 PM)', nepaliLabel: 'दिउँसको पाली' },
  { value: 'night', label: 'Night (10 PM - 6 AM)', nepaliLabel: 'रातको पाली' },
  { value: 'flexible', label: 'Flexible Hours', nepaliLabel: 'लचिलो समय' }
];

// Status display configurations
export const STATUS_CONFIG = {
  working: { color: 'green', label: 'Working', nepaliLabel: 'काम गर्दै', icon: '⚡' },
  break: { color: 'yellow', label: 'On Break', nepaliLabel: 'विश्राममा', icon: '☕' },
  offline: { color: 'gray', label: 'Offline', nepaliLabel: 'अफलाइन', icon: '⭕' },
  idle: { color: 'blue', label: 'Available', nepaliLabel: 'उपलब्ध', icon: '✅' }
};

// Form validation schemas
export interface OperatorValidationRules {
  username: { required: true; minLength: 3; pattern: RegExp };
  name: { required: true; minLength: 2; maxLength: 50 };
  employeeId: { required: true; unique: true; pattern: RegExp };
  email: { pattern: RegExp };
  phone: { pattern: RegExp };
  primaryMachine: { required: true };
  machineTypes: { required: true; minItems: 1 };
  skillLevel: { required: true };
  shift: { required: true };
}