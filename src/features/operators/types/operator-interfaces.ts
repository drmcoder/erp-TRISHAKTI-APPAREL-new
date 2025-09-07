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

// Constants are imported directly from @/types/operator-types to avoid re-export ambiguity