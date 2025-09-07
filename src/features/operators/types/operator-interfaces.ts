// Explicit operator interfaces export
// This file serves as a workaround for module resolution issues

export interface CreateOperatorData {
  username: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  primaryMachine: string;
  machineTypes: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  maxConcurrentWork?: number;
  avatar?: {
    type: 'emoji' | 'photo' | 'initials' | 'unique';
    value?: string;
    photoUrl?: string;
  };
  hiredDate: Date;
}

export interface UpdateOperatorData extends Partial<CreateOperatorData> {
  isActive?: boolean;
  specializations?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  address?: string;
}

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
  maxConcurrentWork: number; // Max bundles operator can handle
  
  // Profile customization
  avatar?: {
    type: 'emoji' | 'photo' | 'initials' | 'unique';
    value?: string; // emoji or initials
    photoUrl?: string; // for photo type
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  hiredDate: Date;
}

export interface OperatorStatus {
  status: 'working' | 'break' | 'offline' | 'idle';
  currentWork: string | null;
  lastActivity: number;
  machineStatus: 'running' | 'stopped' | 'maintenance';
  location?: string;
  sessionId?: string;
}

export interface OperatorSummary {
  id: string;
  name: string;
  employeeId: string;
  primaryMachine: string;
  skillLevel: Operator['skillLevel'];
  isActive: boolean;
  availabilityStatus: Operator['availabilityStatus'];
  currentAssignments: number; // count
  averageEfficiency: number;
  qualityScore: number;
  avatar?: Operator['avatar'];
}

// Machine types and skill levels
export const MACHINE_TYPES = [
  {
    id: 'overlock',
    name: 'Overlock Machine',
    nameNepali: 'ओभरलक मेसिन',
    category: 'sewing',
    skillRequired: 'beginner',
    hourlyRate: 120
  },
  {
    id: 'single_needle',
    name: 'Single Needle',
    nameNepali: 'एकल सुई',
    category: 'sewing',
    skillRequired: 'intermediate',
    hourlyRate: 140
  },
  {
    id: 'buttonhole',
    name: 'Buttonhole Machine',
    nameNepali: 'बटनहोल मेसिन',
    category: 'finishing',
    skillRequired: 'advanced',
    hourlyRate: 160
  }
] as const;

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', labelNepali: 'नयाँ' },
  { value: 'intermediate', label: 'Intermediate', labelNepali: 'मध्यम' },
  { value: 'advanced', label: 'Advanced', labelNepali: 'उच्च' },
  { value: 'expert', label: 'Expert', labelNepali: 'विशेषज्ञ' }
] as const;

export const STATUS_CONFIG = {
  available: { color: 'green', label: 'Available', labelNepali: 'उपलब्ध' },
  busy: { color: 'yellow', label: 'Busy', labelNepali: 'व्यस्त' },
  on_break: { color: 'blue', label: 'On Break', labelNepali: 'विश्राममा' },
  offline: { color: 'gray', label: 'Offline', labelNepali: 'अफलाइन' }
} as const;