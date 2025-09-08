// Production Configuration - Integrated Sewing Template System
// Defines garment workflows, machine types, and operation mappings

export interface GarmentOperation {
  id: string;
  name: string;
  machineType: string;
  estimatedTime: number; // in minutes
  sequence: number;
  complexity: 'easy' | 'medium' | 'hard';
  skillRequired: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  qualityCheckpoint?: boolean;
  dependencies?: string[];
  rate: number; // payment per piece
}

export interface GarmentWorkflow {
  id: string;
  name: string;
  operations: string[]; // operation IDs in sequence
  estimatedTotalTime: number;
  complexity: 'easy' | 'medium' | 'hard';
  qualityCheckpoints: string[]; // operation IDs that require quality checks
  parallelOperations?: string[][]; // operations that can run in parallel
}

export interface MachineType {
  id: string;
  name: string;
  operations: string[]; // supported operation IDs
  avgSpeed: number; // pieces per hour
  efficiency: number; // percentage
  requiredSkills: string[];
  maintenanceInterval: number; // hours
}

// Core sewing operations library
export const SEWING_OPERATIONS: { [key: string]: GarmentOperation } = {
  // Cutting Operations
  'cut_main_body': {
    id: 'cut_main_body',
    name: 'Main Body Cutting',
    machineType: 'cutting_table',
    estimatedTime: 15,
    sequence: 1,
    complexity: 'medium',
    skillRequired: 'intermediate',
    qualityCheckpoint: true,
    rate: 0.75
  },
  'cut_sleeves': {
    id: 'cut_sleeves',
    name: 'Sleeve Cutting',
    machineType: 'cutting_table',
    estimatedTime: 10,
    sequence: 2,
    complexity: 'easy',
    skillRequired: 'beginner',
    dependencies: ['cut_main_body'],
    rate: 0.50
  },
  'cut_collar': {
    id: 'cut_collar',
    name: 'Collar Cutting',
    machineType: 'cutting_table',
    estimatedTime: 12,
    sequence: 3,
    complexity: 'hard',
    skillRequired: 'advanced',
    dependencies: ['cut_main_body'],
    rate: 0.60
  },

  // Sewing Operations
  'shoulder_join': {
    id: 'shoulder_join',
    name: 'Shoulder Seam',
    machineType: 'overlock',
    estimatedTime: 20,
    sequence: 4,
    complexity: 'medium',
    skillRequired: 'intermediate',
    dependencies: ['cut_main_body', 'cut_sleeves'],
    qualityCheckpoint: true,
    rate: 1.00
  },
  'side_seam': {
    id: 'side_seam',
    name: 'Side Seam',
    machineType: 'overlock',
    estimatedTime: 25,
    sequence: 5,
    complexity: 'medium',
    skillRequired: 'intermediate',
    dependencies: ['shoulder_join'],
    rate: 1.25
  },
  'sleeve_attachment': {
    id: 'sleeve_attachment',
    name: 'Sleeve Attachment',
    machineType: 'overlock',
    estimatedTime: 18,
    sequence: 6,
    complexity: 'medium',
    skillRequired: 'intermediate',
    dependencies: ['shoulder_join'],
    rate: 0.95
  },
  'collar_attachment': {
    id: 'collar_attachment',
    name: 'Collar Attachment',
    machineType: 'single_needle',
    estimatedTime: 30,
    sequence: 7,
    complexity: 'hard',
    skillRequired: 'advanced',
    dependencies: ['cut_collar', 'shoulder_join'],
    qualityCheckpoint: true,
    rate: 1.50
  },
  'buttonhole': {
    id: 'buttonhole',
    name: 'Button Hole Making',
    machineType: 'buttonhole',
    estimatedTime: 15,
    sequence: 8,
    complexity: 'hard',
    skillRequired: 'expert',
    dependencies: ['collar_attachment'],
    rate: 0.80
  },
  'hem_stitching': {
    id: 'hem_stitching',
    name: 'Hem Stitching',
    machineType: 'single_needle',
    estimatedTime: 12,
    sequence: 9,
    complexity: 'easy',
    skillRequired: 'beginner',
    dependencies: ['side_seam'],
    rate: 0.65
  },

  // Finishing Operations
  'button_attachment': {
    id: 'button_attachment',
    name: 'Button Attachment',
    machineType: 'manual',
    estimatedTime: 10,
    sequence: 10,
    complexity: 'easy',
    skillRequired: 'beginner',
    dependencies: ['buttonhole'],
    rate: 0.60
  },
  'final_pressing': {
    id: 'final_pressing',
    name: 'Final Pressing',
    machineType: 'press_machine',
    estimatedTime: 8,
    sequence: 11,
    complexity: 'medium',
    skillRequired: 'intermediate',
    dependencies: ['button_attachment', 'hem_stitching'],
    rate: 0.45
  },
  'quality_check': {
    id: 'quality_check',
    name: 'Final Quality Check',
    machineType: 'inspection_table',
    estimatedTime: 12,
    sequence: 12,
    complexity: 'medium',
    skillRequired: 'advanced',
    dependencies: ['final_pressing'],
    qualityCheckpoint: true,
    rate: 0.70
  },
  'packaging': {
    id: 'packaging',
    name: 'Packaging',
    machineType: 'manual',
    estimatedTime: 5,
    sequence: 13,
    complexity: 'easy',
    skillRequired: 'beginner',
    dependencies: ['quality_check'],
    rate: 0.30
  }
};

// Predefined garment workflows
export const GARMENT_WORKFLOWS: { [key: string]: GarmentWorkflow } = {
  't_shirt': {
    id: 't_shirt',
    name: 'T-Shirt Production',
    operations: [
      'cut_main_body', 'cut_sleeves', 
      'shoulder_join', 'side_seam', 'sleeve_attachment', 'hem_stitching',
      'final_pressing', 'quality_check', 'packaging'
    ],
    estimatedTotalTime: 125, // sum of all operation times
    complexity: 'easy',
    qualityCheckpoints: ['cut_main_body', 'shoulder_join', 'quality_check']
  },
  
  'polo_shirt': {
    id: 'polo_shirt',
    name: 'Polo Shirt Production',
    operations: [
      'cut_main_body', 'cut_sleeves', 'cut_collar',
      'shoulder_join', 'side_seam', 'sleeve_attachment', 'collar_attachment', 
      'buttonhole', 'hem_stitching', 'button_attachment',
      'final_pressing', 'quality_check', 'packaging'
    ],
    estimatedTotalTime: 185,
    complexity: 'hard',
    qualityCheckpoints: ['cut_main_body', 'shoulder_join', 'collar_attachment', 'quality_check'],
    parallelOperations: [
      ['cut_sleeves', 'cut_collar'], // can be done in parallel after main body cutting
      ['sleeve_attachment', 'collar_attachment'] // can be done in parallel after shoulder join
    ]
  },

  'formal_shirt': {
    id: 'formal_shirt',
    name: 'Formal Shirt Production', 
    operations: [
      'cut_main_body', 'cut_sleeves', 'cut_collar',
      'shoulder_join', 'side_seam', 'sleeve_attachment', 'collar_attachment',
      'buttonhole', 'hem_stitching', 'button_attachment',
      'final_pressing', 'quality_check', 'packaging'
    ],
    estimatedTotalTime: 200,
    complexity: 'hard',
    qualityCheckpoints: ['cut_main_body', 'shoulder_join', 'collar_attachment', 'quality_check'],
    parallelOperations: [
      ['cut_sleeves', 'cut_collar'],
      ['sleeve_attachment', 'collar_attachment']
    ]
  }
};

// Machine type definitions
export const MACHINE_TYPES: { [key: string]: MachineType } = {
  'cutting_table': {
    id: 'cutting_table',
    name: 'Cutting Table',
    operations: ['cut_main_body', 'cut_sleeves', 'cut_collar'],
    avgSpeed: 30, // pieces per hour
    efficiency: 90,
    requiredSkills: ['cutting-basic', 'pattern-reading'],
    maintenanceInterval: 40
  },
  
  'overlock': {
    id: 'overlock',
    name: 'Overlock Machine',
    operations: ['shoulder_join', 'side_seam', 'sleeve_attachment'],
    avgSpeed: 45,
    efficiency: 85,
    requiredSkills: ['overlock-basic', 'overlock-advanced'],
    maintenanceInterval: 8
  },
  
  'single_needle': {
    id: 'single_needle',
    name: 'Single Needle Machine',
    operations: ['collar_attachment', 'hem_stitching'],
    avgSpeed: 40,
    efficiency: 88,
    requiredSkills: ['single-needle-basic', 'precision-sewing'],
    maintenanceInterval: 12
  },
  
  'buttonhole': {
    id: 'buttonhole',
    name: 'Button Hole Machine',
    operations: ['buttonhole'],
    avgSpeed: 35,
    efficiency: 92,
    requiredSkills: ['buttonhole-expert', 'precision-cutting'],
    maintenanceInterval: 16
  },
  
  'press_machine': {
    id: 'press_machine',
    name: 'Pressing Machine',
    operations: ['final_pressing'],
    avgSpeed: 60,
    efficiency: 95,
    requiredSkills: ['pressing-basic', 'garment-finishing'],
    maintenanceInterval: 24
  },
  
  'inspection_table': {
    id: 'inspection_table',
    name: 'Quality Inspection Table',
    operations: ['quality_check'],
    avgSpeed: 50,
    efficiency: 98,
    requiredSkills: ['quality-inspection', 'defect-identification'],
    maintenanceInterval: 160
  },
  
  'manual': {
    id: 'manual',
    name: 'Manual Work Station',
    operations: ['button_attachment', 'packaging'],
    avgSpeed: 40,
    efficiency: 80,
    requiredSkills: ['manual-dexterity', 'attention-to-detail'],
    maintenanceInterval: 0
  }
};

// Skill level definitions
export const SKILL_LEVELS = {
  'beginner': {
    name: 'Beginner',
    experienceMonths: '0-6',
    canOperateMachines: ['manual', 'inspection_table'],
    maxComplexity: 'easy'
  },
  'intermediate': {
    name: 'Intermediate', 
    experienceMonths: '6-18',
    canOperateMachines: ['manual', 'inspection_table', 'cutting_table', 'press_machine'],
    maxComplexity: 'medium'
  },
  'advanced': {
    name: 'Advanced',
    experienceMonths: '18-36', 
    canOperateMachines: ['manual', 'inspection_table', 'cutting_table', 'press_machine', 'single_needle', 'overlock'],
    maxComplexity: 'hard'
  },
  'expert': {
    name: 'Expert',
    experienceMonths: '36+',
    canOperateMachines: Object.keys(MACHINE_TYPES),
    maxComplexity: 'hard'
  }
};

// Production templates for common garments
export const PRODUCTION_TEMPLATES = {
  't_shirt_basic': {
    name: 'Basic T-Shirt',
    workflow: 't_shirt',
    defaultQuantity: 100,
    estimatedProductionTime: '2-3 days',
    requiredOperators: 3,
    description: 'Standard cotton t-shirt production template'
  },
  
  'polo_premium': {
    name: 'Premium Polo Shirt',
    workflow: 'polo_shirt', 
    defaultQuantity: 50,
    estimatedProductionTime: '4-5 days',
    requiredOperators: 5,
    description: 'High-quality polo shirt with collar and buttons'
  },
  
  'formal_shirt_business': {
    name: 'Business Formal Shirt',
    workflow: 'formal_shirt',
    defaultQuantity: 25,
    estimatedProductionTime: '5-7 days', 
    requiredOperators: 6,
    description: 'Professional formal shirt with precise finishing'
  }
};

// Utility functions for production configuration
export const ProductionConfigUtils = {
  // Get operations for a specific garment type
  getGarmentOperations: (garmentType: string): GarmentOperation[] => {
    const workflow = GARMENT_WORKFLOWS[garmentType];
    if (!workflow) return [];
    
    return workflow.operations.map(opId => SEWING_OPERATIONS[opId]).filter(Boolean);
  },
  
  // Get next available operation based on dependencies
  getNextOperations: (garmentType: string, completedOperations: string[]): GarmentOperation[] => {
    const allOperations = ProductionConfigUtils.getGarmentOperations(garmentType);
    
    return allOperations.filter(op => {
      // Check if operation is already completed
      if (completedOperations.includes(op.id)) return false;
      
      // Check if all dependencies are completed
      if (op.dependencies) {
        return op.dependencies.every(dep => completedOperations.includes(dep));
      }
      
      return true;
    });
  },
  
  // Calculate total estimated time for garment
  calculateTotalTime: (garmentType: string): number => {
    const operations = ProductionConfigUtils.getGarmentOperations(garmentType);
    return operations.reduce((total, op) => total + op.estimatedTime, 0);
  },
  
  // Get machines required for a garment type
  getRequiredMachines: (garmentType: string): string[] => {
    const operations = ProductionConfigUtils.getGarmentOperations(garmentType);
    const machines = new Set<string>();
    
    operations.forEach(op => machines.add(op.machineType));
    return Array.from(machines);
  },
  
  // Validate if operator can perform operation
  canOperatorPerformOperation: (operatorSkillLevel: string, operationId: string): boolean => {
    const operation = SEWING_OPERATIONS[operationId];
    if (!operation) return false;
    
    const skillHierarchy = ['beginner', 'intermediate', 'advanced', 'expert'];
    const operatorLevel = skillHierarchy.indexOf(operatorSkillLevel);
    const requiredLevel = skillHierarchy.indexOf(operation.skillRequired);
    
    return operatorLevel >= requiredLevel;
  }
};