// Enhanced WIP Entry System with Template Integration
// Multi-step form with intelligent state management and real-time collaboration

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/Badge';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  LightBulbIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  BeakerIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// Simplified UI Components for immediate functionality
interface ProgressProps {
  value: number;
  className?: string;
}
const Progress: React.FC<ProgressProps> = ({ value, className }) => (
  <div className={`bg-gray-200 rounded-full h-2 ${className || ''}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => (
  <textarea 
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${className || ''}`}
    {...props} 
  />
);

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="sr-only"
    />
    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </label>
);

const Separator: React.FC<{ className?: string }> = ({ className }) => (
  <hr className={`border-gray-200 my-4 ${className || ''}`} />
);

// Enhanced Size Management
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const DEFAULT_SIZE_PATTERNS = {
  'standard': { S: 1, M: 2, L: 2, XL: 1 },
  'uniform': { S: 1, M: 1, L: 1, XL: 1 },
  'medium-heavy': { S: 0, M: 3, L: 4, XL: 1 },
  'large-focus': { S: 1, M: 1, L: 3, XL: 2 }
};

// Template Categories
const TEMPLATE_CATEGORIES = {
  SHIRTS: 'shirts',
  PANTS: 'pants',
  DRESSES: 'dresses',
  JACKETS: 'jackets',
  ACCESSORIES: 'accessories'
};

// Step Configuration
const FORM_STEPS = [
  { id: 'basic', label: 'Basic Info', icon: ClipboardDocumentListIcon },
  { id: 'fabric', label: 'Fabric Specs', icon: BeakerIcon },
  { id: 'articles', label: 'Articles', icon: DocumentDuplicateIcon },
  { id: 'template', label: 'Templates', icon: Cog6ToothIcon },
  { id: 'review', label: 'Review', icon: CheckCircleIcon }
];

// Smart Lot Number Generator
const generateSmartLotNumber = (fabricType: string, date: Date = new Date()) => {
  const fabricCode = fabricType.substring(0, 3).toUpperCase() || 'GEN';
  const dateCode = date.getFullYear().toString().slice(-2) + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
  const timeCode = Date.now().toString().slice(-4);
  return `${fabricCode}-${dateCode}-${timeCode}`;
};

// Enhanced Data Interfaces
interface Article {
  id: string;
  articleNumber: string;
  articleName: string;
  description?: string;
  category: string;
  sizeRatios: { [size: string]: number };
  totalQuantity: number;
  estimatedTime: number; // in minutes per piece
  complexity: 'low' | 'medium' | 'high';
  templateId?: string;
  operations: Operation[];
  qualityRequirements: QualityRequirement[];
}

interface Operation {
  id: string;
  name: string;
  sequence: number;
  machineType: string;
  estimatedMinutes: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  qualityCheckpoints: string[];
}

interface QualityRequirement {
  id: string;
  type: 'measurement' | 'visual' | 'functional';
  description: string;
  tolerance: string;
  critical: boolean;
}

interface SewingTemplate {
  id: string;
  name: string;
  category: string;
  operations: Operation[];
  estimatedTime: number;
  complexity: 'low' | 'medium' | 'high';
  sizeRatios: { [size: string]: number };
  qualityRequirements: QualityRequirement[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  rating: number;
}

interface FabricSpecification {
  layerCount: number;
  weight: number; // in GSM
  width: number; // in inches
  length: number; // in meters
  fabricType: string;
  color: string;
  composition: string; // e.g., 100% Cotton, 80% Cotton 20% Polyester
  finish: string; // e.g., Pre-shrunk, Mercerized
  stretch: boolean;
  washCare: string[];
  supplier: string;
  batchNumber: string;
  receivedDate: Date;
  inspectionStatus: 'pending' | 'passed' | 'failed';
  defects: FabricDefect[];
}

interface FabricDefect {
  id: string;
  type: 'hole' | 'stain' | 'color_variation' | 'texture_issue';
  severity: 'minor' | 'major' | 'critical';
  location: string;
  size: string;
  action: 'accept' | 'rework' | 'reject';
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  startDate?: Date;
  endDate?: Date;
}

interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  profitMargin: number;
  sellingPrice: number;
}

interface EnhancedWIPEntry {
  id?: string;
  lotNumber: string; // Smart generated lot number
  rollId: string;
  rollNumber: string;
  
  // Enhanced Fabric Specifications
  fabricSpec: FabricSpecification;
  
  // Multi-Article System with Templates
  articles: Article[];
  selectedTemplates: SewingTemplate[];
  
  // Advanced Production Information
  bundleCount: number;
  piecesPerBundle: number;
  totalPieces: number;
  
  // Workflow & Timeline
  workflow: WorkflowStep[];
  estimatedStartDate: Date;
  estimatedCompletionDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Cost & Pricing
  costBreakdown: CostBreakdown;
  
  // Quality & Compliance
  qualityLevel: 'basic' | 'standard' | 'premium' | 'luxury';
  complianceRequirements: string[];
  
  // Status & Tracking
  status: 'draft' | 'planning' | 'approved' | 'in_progress' | 'quality_check' | 'completed' | 'shipped';
  completionPercentage: number;
  
  // Collaboration & Notes
  assignedTeam: string[];
  notes: string;
  attachments: string[];
  collaborationNotes: CollaborationNote[];
  
  // Audit Trail
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  version: number;
}

interface CollaborationNote {
  id: string;
  userId: string;
  userName: string;
  message: string;
  type: 'comment' | 'suggestion' | 'approval' | 'concern';
  timestamp: Date;
  resolved: boolean;
}

interface EnhancedWIPEntryFormProps {
  onSave: (wipEntry: EnhancedWIPEntry) => void;
  onCancel: () => void;
  initialData?: EnhancedWIPEntry;
  mode: 'create' | 'edit' | 'copy' | 'template';
  availableTemplates?: SewingTemplate[];
  teamMembers?: { id: string; name: string; role: string; }[];
  onTemplateCreate?: (template: SewingTemplate) => void;
  onCollaborate?: (note: CollaborationNote) => void;
  realTimeUsers?: { id: string; name: string; color: string; cursor?: { x: number; y: number; } }[];
}

// Advanced Size Configuration Parser
class SizeConfigurationParser {
  static parseRatioString(input: string): { [size: string]: number } {
    const ratios: { [size: string]: number } = {};
    
    try {
      // Pattern 1: "1:2:2:1" (assumes S,M,L,XL order)
      if (/^\d+:\d+(:\d+)*$/.test(input.trim())) {
        const values = input.split(':').map(v => parseInt(v.trim()) || 0);
        const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
        values.forEach((value, index) => {
          if (defaultSizes[index] && value > 0) {
            ratios[defaultSizes[index]] = value;
          }
        });
      }
      
      // Pattern 2: "S:1,M:2,L:2,XL:1"
      else if (/^[A-Z0-9]+:\d+(,[A-Z0-9]+:\d+)*$/i.test(input.trim())) {
        input.split(',').forEach(pair => {
          const [size, ratio] = pair.split(':');
          if (size && ratio) {
            ratios[size.trim().toUpperCase()] = parseInt(ratio.trim()) || 0;
          }
        });
      }
      
      // Pattern 3: "S=1,M=2,L=2,XL=1"
      else if (/^[A-Z0-9]+=[0-9]+(,[A-Z0-9]+=[0-9]+)*$/i.test(input.trim())) {
        input.split(',').forEach(pair => {
          const [size, ratio] = pair.split('=');
          if (size && ratio) {
            ratios[size.trim().toUpperCase()] = parseInt(ratio.trim()) || 0;
          }
        });
      }
      
      // Pattern 4: JSON-like "{'S': 1, 'M': 2, 'L': 2, 'XL': 1}"
      else if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
        const jsonString = input.replace(/'/g, '"').replace(/([a-zA-Z0-9]+):/g, '"$1":');
        const parsed = JSON.parse(jsonString);
        Object.keys(parsed).forEach(size => {
          if (parsed[size] > 0) {
            ratios[size.toUpperCase()] = parseInt(parsed[size]) || 0;
          }
        });
      }
    } catch (error) {
      console.warn('Error parsing size configuration:', error);
    }
    
    return ratios;
  }
  
  static validateRatios(ratios: { [size: string]: number }): boolean {
    const total = Object.values(ratios).reduce((sum, val) => sum + val, 0);
    return total > 0 && Object.values(ratios).every(val => val >= 0);
  }
  
  static generateRatioString(ratios: { [size: string]: number }, format: 'colon' | 'comma' | 'json' = 'colon'): string {
    const validRatios = Object.entries(ratios)
      .filter(([size, ratio]) => ratio > 0)
      .sort(([a], [b]) => SIZES.indexOf(a) - SIZES.indexOf(b));
    
    switch (format) {
      case 'comma':
        return validRatios.map(([size, ratio]) => `${size}:${ratio}`).join(',');
      case 'json':
        return JSON.stringify(Object.fromEntries(validRatios));
      default: // colon
        return validRatios.map(([, ratio]) => ratio).join(':');
    }
  }
}

// Template Integration Service
class TemplateIntegrationService {
  static suggestTemplates(
    articles: Article[], 
    fabricType: string, 
    availableTemplates: SewingTemplate[]
  ): SewingTemplate[] {
    const suggestions: Array<{ template: SewingTemplate; score: number }> = [];
    
    availableTemplates.forEach(template => {
      let score = 0;
      
      // Category matching
      articles.forEach(article => {
        if (article.category === template.category) score += 30;
        if (article.articleName.toLowerCase().includes(template.name.toLowerCase())) score += 20;
      });
      
      // Fabric type compatibility
      if (template.tags.includes(fabricType.toLowerCase())) score += 15;
      
      // Usage popularity
      score += Math.min(template.usageCount * 0.1, 10);
      
      // Rating boost
      score += template.rating * 5;
      
      // Size ratio similarity
      articles.forEach(article => {
        const similarity = this.calculateSizeRatioSimilarity(article.sizeRatios, template.sizeRatios);
        score += similarity * 10;
      });
      
      if (score > 0) {
        suggestions.push({ template, score });
      }
    });
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.template);
  }
  
  static calculateSizeRatioSimilarity(
    ratios1: { [size: string]: number },
    ratios2: { [size: string]: number }
  ): number {
    const allSizes = new Set([...Object.keys(ratios1), ...Object.keys(ratios2)]);
    let similarity = 0;
    let totalPairs = 0;
    
    allSizes.forEach(size => {
      const val1 = ratios1[size] || 0;
      const val2 = ratios2[size] || 0;
      const maxVal = Math.max(val1, val2, 1);
      similarity += 1 - Math.abs(val1 - val2) / maxVal;
      totalPairs++;
    });
    
    return totalPairs > 0 ? similarity / totalPairs : 0;
  }
  
  static applyTemplateToArticle(article: Article, template: SewingTemplate): Article {
    return {
      ...article,
      templateId: template.id,
      operations: [...template.operations],
      estimatedTime: template.estimatedTime,
      complexity: template.complexity,
      qualityRequirements: [...template.qualityRequirements],
      sizeRatios: { ...article.sizeRatios, ...template.sizeRatios }
    };
  }
  
  static generateWorkflow(articles: Article[]): WorkflowStep[] {
    const workflow: WorkflowStep[] = [];
    let sequenceId = 1;
    
    // Pre-production steps
    workflow.push({
      id: `step_${sequenceId++}`,
      name: 'Material Inspection',
      description: 'Inspect and approve all materials',
      estimatedDuration: 30,
      dependencies: [],
      status: 'pending'
    });
    
    workflow.push({
      id: `step_${sequenceId++}`,
      name: 'Cutting Preparation',
      description: 'Prepare patterns and cutting layout',
      estimatedDuration: 60,
      dependencies: [workflow[workflow.length - 1].id],
      status: 'pending'
    });
    
    // Article-specific workflows
    articles.forEach((article, index) => {
      const baseStepId = `article_${index}`;
      
      // Cutting
      workflow.push({
        id: `${baseStepId}_cutting`,
        name: `Cutting - ${article.articleName}`,
        description: `Cut fabric for ${article.articleName}`,
        estimatedDuration: Math.ceil(article.totalQuantity * 0.5),
        dependencies: ['step_2'],
        status: 'pending'
      });
      
      // Operations from template
      article.operations.forEach((operation, opIndex) => {
        workflow.push({
          id: `${baseStepId}_op_${opIndex}`,
          name: `${operation.name} - ${article.articleName}`,
          description: `${operation.name} operation for ${article.articleName}`,
          estimatedDuration: operation.estimatedMinutes * article.totalQuantity,
          dependencies: opIndex === 0 ? [`${baseStepId}_cutting`] : [`${baseStepId}_op_${opIndex - 1}`],
          status: 'pending'
        });
      });
      
      // Quality check
      workflow.push({
        id: `${baseStepId}_quality`,
        name: `Quality Check - ${article.articleName}`,
        description: `Final quality inspection for ${article.articleName}`,
        estimatedDuration: Math.ceil(article.totalQuantity * 0.3),
        dependencies: [`${baseStepId}_op_${article.operations.length - 1}`],
        status: 'pending'
      });
    });
    
    // Final packaging
    workflow.push({
      id: `step_final_packaging`,
      name: 'Final Packaging',
      description: 'Package completed items',
      estimatedDuration: 45,
      dependencies: articles.map((_, i) => `article_${i}_quality`),
      status: 'pending'
    });
    
    return workflow;
  }
}

export const EnhancedWIPEntryForm: React.FC<EnhancedWIPEntryFormProps> = ({
  onSave,
  onCancel,
  initialData,
  mode = 'create',
  availableTemplates = [],
  teamMembers = [],
  onTemplateCreate,
  onCollaborate,
  realTimeUsers = []
}) => {
  // Advanced State Management with Smart Defaults
  const [currentStep, setCurrentStep] = useState(0);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [suggestedTemplates, setSuggestedTemplates] = useState<SewingTemplate[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const [formData, setFormData] = useState<EnhancedWIPEntry>(() => {
    const now = new Date();
    const defaultFabricSpec: FabricSpecification = {
      layerCount: 1,
      weight: 180,
      width: 60,
      length: 100,
      fabricType: '',
      color: '',
      composition: '100% Cotton',
      finish: '',
      stretch: false,
      washCare: [],
      supplier: '',
      batchNumber: '',
      receivedDate: now,
      inspectionStatus: 'pending',
      defects: []
    };
    
    const defaultArticle: Article = {
      id: `article_${Date.now()}`,
      articleNumber: '',
      articleName: '',
      description: '',
      category: TEMPLATE_CATEGORIES.SHIRTS,
      sizeRatios: DEFAULT_SIZE_PATTERNS.standard,
      totalQuantity: 6,
      estimatedTime: 30,
      complexity: 'medium',
      operations: [],
      qualityRequirements: []
    };
    
    const defaultCostBreakdown: CostBreakdown = {
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      totalCost: 0,
      profitMargin: 0,
      sellingPrice: 0
    };
    
    return {
      id: initialData?.id || `wip_${Date.now()}`,
      lotNumber: initialData?.lotNumber || generateSmartLotNumber(''),
      rollId: initialData?.rollId || `ROLL_${Date.now()}`,
      rollNumber: initialData?.rollNumber || '',
      fabricSpec: initialData?.fabricSpec || defaultFabricSpec,
      articles: initialData?.articles || [defaultArticle],
      selectedTemplates: initialData?.selectedTemplates || [],
      bundleCount: initialData?.bundleCount || 1,
      piecesPerBundle: initialData?.piecesPerBundle || 6,
      totalPieces: initialData?.totalPieces || 6,
      workflow: initialData?.workflow || [],
      estimatedStartDate: initialData?.estimatedStartDate || now,
      estimatedCompletionDate: initialData?.estimatedCompletionDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      priority: initialData?.priority || 'medium',
      costBreakdown: initialData?.costBreakdown || defaultCostBreakdown,
      qualityLevel: initialData?.qualityLevel || 'standard',
      complianceRequirements: initialData?.complianceRequirements || [],
      status: initialData?.status || 'draft',
      completionPercentage: initialData?.completionPercentage || 0,
      assignedTeam: initialData?.assignedTeam || [],
      notes: initialData?.notes || '',
      attachments: initialData?.attachments || [],
      collaborationNotes: initialData?.collaborationNotes || [],
      createdBy: initialData?.createdBy || 'current_user',
      createdAt: initialData?.createdAt || now,
      updatedBy: initialData?.updatedBy || 'current_user',
      updatedAt: initialData?.updatedAt || now,
      version: initialData?.version || 1
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Smart calculations with useMemo for performance
  const calculatedMetrics = useMemo(() => {
    const totalArticlePieces = formData.articles.reduce((sum, article) => sum + article.totalQuantity, 0);
    const totalPieces = totalArticlePieces * formData.bundleCount;
    const totalEstimatedTime = formData.articles.reduce((sum, article) => 
      sum + (article.estimatedTime * article.totalQuantity), 0
    ) * formData.bundleCount;
    
    const complexityScore = formData.articles.reduce((score, article) => {
      const complexity = { low: 1, medium: 2, high: 3 }[article.complexity] || 2;
      return score + complexity * article.totalQuantity;
    }, 0) / Math.max(totalArticlePieces, 1);
    
    return {
      totalArticlePieces,
      totalPieces,
      totalEstimatedTime,
      complexityScore,
      averageComplexity: complexityScore <= 1.5 ? 'low' : complexityScore <= 2.5 ? 'medium' : 'high'
    };
  }, [formData.articles, formData.bundleCount]);
  
  // Template suggestions with intelligent matching
  const templateSuggestions = useMemo(() => {
    return TemplateIntegrationService.suggestTemplates(
      formData.articles,
      formData.fabricSpec.fabricType,
      availableTemplates
    );
  }, [formData.articles, formData.fabricSpec.fabricType, availableTemplates]);
  
  // Form validation with comprehensive checks
  const formValidation = useMemo(() => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    // Step 1: Basic Info Validation
    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required';
    }
    
    if (!formData.lotNumber.trim()) {
      errors.lotNumber = 'Lot number is required';
    }
    
    // Step 2: Fabric Specifications
    if (!formData.fabricSpec.fabricType.trim()) {
      errors.fabricType = 'Fabric type is required';
    }
    
    if (formData.fabricSpec.layerCount <= 0) {
      errors.layerCount = 'Layer count must be greater than 0';
    }
    
    if (formData.fabricSpec.weight <= 0) {
      errors.weight = 'Fabric weight must be greater than 0';
    }
    
    if (formData.fabricSpec.weight > 600) {
      warnings.weight = 'Very heavy fabric weight detected';
    }
    
    // Step 3: Articles Validation
    formData.articles.forEach((article, index) => {
      if (!article.articleNumber.trim()) {
        errors[`article_${index}_number`] = 'Article number is required';
      }
      
      if (!article.articleName.trim()) {
        errors[`article_${index}_name`] = 'Article name is required';
      }
      
      const hasValidRatio = Object.values(article.sizeRatios).some(ratio => ratio > 0);
      if (!hasValidRatio) {
        errors[`article_${index}_ratios`] = 'At least one size ratio must be greater than 0';
      }
      
      if (article.operations.length === 0) {
        warnings[`article_${index}_operations`] = 'No operations defined - consider applying a template';
      }
    });
    
    // Bundle validation
    if (formData.bundleCount <= 0) {
      errors.bundleCount = 'Bundle count must be greater than 0';
    }
    
    if (calculatedMetrics.totalPieces > 10000) {
      warnings.totalPieces = 'Very large production quantity - ensure capacity planning';
    }
    
    return { errors, warnings, isValid: Object.keys(errors).length === 0 };
  }, [formData, calculatedMetrics]);
  
  // Smart auto-save functionality
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (autoSaveEnabled && isDirty && formValidation.isValid) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Auto-save logic here
        console.log('Auto-saving draft...');
        setIsDirty(false);
      }, 2000);
    }
  }, [autoSaveEnabled, isDirty, formValidation.isValid]);
  
  // Effect for auto-save
  useEffect(() => {
    debouncedAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [debouncedAutoSave]);
  
  // Smart lot number generation when fabric type changes
  useEffect(() => {
    if (formData.fabricSpec.fabricType && mode === 'create') {
      const newLotNumber = generateSmartLotNumber(formData.fabricSpec.fabricType);
      if (newLotNumber !== formData.lotNumber) {
        setFormData(prev => ({ ...prev, lotNumber: newLotNumber }));
        setIsDirty(true);
      }
    }
  }, [formData.fabricSpec.fabricType, mode]);
  
  // Update total pieces when articles or bundle count changes
  useEffect(() => {
    const newPiecesPerBundle = calculatedMetrics.totalArticlePieces;
    const newTotalPieces = calculatedMetrics.totalPieces;
    
    if (newPiecesPerBundle !== formData.piecesPerBundle || newTotalPieces !== formData.totalPieces) {
      setFormData(prev => ({
        ...prev,
        piecesPerBundle: newPiecesPerBundle,
        totalPieces: newTotalPieces
      }));
    }
  }, [calculatedMetrics.totalArticlePieces, calculatedMetrics.totalPieces, formData.piecesPerBundle, formData.totalPieces]);

  // Generate workflow when articles change
  useEffect(() => {
    if (formData.articles.some(article => article.operations.length > 0)) {
      const newWorkflow = TemplateIntegrationService.generateWorkflow(formData.articles);
      setFormData(prev => ({ ...prev, workflow: newWorkflow }));
    }
  }, [formData.articles]);

  // Smart Event Handlers with Optimistic Updates
  const handleFormDataChange = useCallback((updates: Partial<EnhancedWIPEntry>) => {
    setFormData(prev => ({ ...prev, ...updates, updatedAt: new Date(), version: prev.version + 1 }));
    setIsDirty(true);
  }, []);
  
  const handleFabricSpecChange = useCallback((field: keyof FabricSpecification, value: any) => {
    handleFormDataChange({
      fabricSpec: { ...formData.fabricSpec, [field]: value }
    });
  }, [formData.fabricSpec, handleFormDataChange]);
  
  const handleArticleChange = useCallback((index: number, updates: Partial<Article>) => {
    const updatedArticles = formData.articles.map((article, i) => 
      i === index ? { ...article, ...updates } : article
    );
    handleFormDataChange({ articles: updatedArticles });
  }, [formData.articles, handleFormDataChange]);
  
  const handleSizeRatioChange = useCallback((articleIndex: number, size: string, ratio: number) => {
    const updatedArticles = formData.articles.map((article, index) => {
      if (index === articleIndex) {
        const newSizeRatios = { ...article.sizeRatios, [size]: ratio };
        const totalQuantity = Object.values(newSizeRatios).reduce((sum, r) => sum + r, 0);
        return { ...article, sizeRatios: newSizeRatios, totalQuantity };
      }
      return article;
    });
    handleFormDataChange({ articles: updatedArticles });
  }, [formData.articles, handleFormDataChange]);
  
  const handleSizeRatioParse = useCallback((articleIndex: number, input: string) => {
    const parsedRatios = SizeConfigurationParser.parseRatioString(input);
    if (SizeConfigurationParser.validateRatios(parsedRatios)) {
      const totalQuantity = Object.values(parsedRatios).reduce((sum, r) => sum + r, 0);
      handleArticleChange(articleIndex, { sizeRatios: parsedRatios, totalQuantity });
      toast.success('Size ratios applied successfully!');
    } else {
      toast.error('Invalid size ratio format. Use patterns like "1:2:2:1" or "S:1,M:2,L:2,XL:1"');
    }
  }, [handleArticleChange]);
  
  const handleTemplateApply = useCallback((articleIndex: number, template: SewingTemplate) => {
    const updatedArticle = TemplateIntegrationService.applyTemplateToArticle(
      formData.articles[articleIndex], 
      template
    );
    handleArticleChange(articleIndex, updatedArticle);
    
    // Add to selected templates if not already present
    const isTemplateSelected = formData.selectedTemplates.some(t => t.id === template.id);
    if (!isTemplateSelected) {
      handleFormDataChange({ 
        selectedTemplates: [...formData.selectedTemplates, template] 
      });
    }
    
    toast.success(`Template "${template.name}" applied to ${updatedArticle.articleName}`);
  }, [formData.articles, formData.selectedTemplates, handleArticleChange, handleFormDataChange]);
  
  const addArticle = useCallback(() => {
    const newArticle: Article = {
      id: `article_${Date.now()}`,
      articleNumber: '',
      articleName: '',
      description: '',
      category: TEMPLATE_CATEGORIES.SHIRTS,
      sizeRatios: DEFAULT_SIZE_PATTERNS.standard,
      totalQuantity: 6,
      estimatedTime: 30,
      complexity: 'medium',
      operations: [],
      qualityRequirements: []
    };
    
    handleFormDataChange({ articles: [...formData.articles, newArticle] });
    toast.success('New article added');
  }, [formData.articles, handleFormDataChange]);
  
  const removeArticle = useCallback((index: number) => {
    if (formData.articles.length > 1) {
      const updatedArticles = formData.articles.filter((_, i) => i !== index);
      handleFormDataChange({ articles: updatedArticles });
      toast.success('Article removed');
    } else {
      toast.error('At least one article is required');
    }
  }, [formData.articles, handleFormDataChange]);
  
  const duplicateArticle = useCallback((index: number) => {
    const articleToDuplicate = formData.articles[index];
    const duplicatedArticle: Article = {
      ...articleToDuplicate,
      id: `article_${Date.now()}`,
      articleNumber: `${articleToDuplicate.articleNumber}_copy`,
      articleName: `${articleToDuplicate.articleName} (Copy)`
    };
    
    const updatedArticles = [...formData.articles];
    updatedArticles.splice(index + 1, 0, duplicatedArticle);
    handleFormDataChange({ articles: updatedArticles });
    toast.success('Article duplicated');
  }, [formData.articles, handleFormDataChange]);
  
  const handleStepNavigation = useCallback((step: number) => {
    if (step >= 0 && step < FORM_STEPS.length) {
      // Validate current step before proceeding
      if (step > currentStep) {
        const stepValidation = validateCurrentStep(currentStep);
        if (!stepValidation.isValid) {
          toast.error(`Please fix errors in ${FORM_STEPS[currentStep].label} before proceeding`);
          return;
        }
      }
      setCurrentStep(step);
    }
  }, [currentStep]);
  
  const validateCurrentStep = useCallback((step: number) => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.rollNumber.trim()) errors.rollNumber = 'Roll number is required';
        if (!formData.lotNumber.trim()) errors.lotNumber = 'Lot number is required';
        break;
        
      case 1: // Fabric Specs
        if (!formData.fabricSpec.fabricType.trim()) errors.fabricType = 'Fabric type is required';
        if (formData.fabricSpec.layerCount <= 0) errors.layerCount = 'Layer count must be greater than 0';
        if (formData.fabricSpec.weight <= 0) errors.weight = 'Weight must be greater than 0';
        break;
        
      case 2: // Articles
        formData.articles.forEach((article, index) => {
          if (!article.articleNumber.trim()) errors[`article_${index}_number`] = 'Article number is required';
          if (!article.articleName.trim()) errors[`article_${index}_name`] = 'Article name is required';
          const hasValidRatio = Object.values(article.sizeRatios).some(ratio => ratio > 0);
          if (!hasValidRatio) errors[`article_${index}_ratios`] = 'At least one size ratio must be greater than 0';
        });
        if (formData.bundleCount <= 0) errors.bundleCount = 'Bundle count must be greater than 0';
        break;
    }
    
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [formData]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValidation.isValid) {
      const finalData: EnhancedWIPEntry = {
        ...formData,
        status: formData.status === 'draft' ? 'planning' : formData.status,
        updatedAt: new Date(),
        version: formData.version + 1
      };
      
      onSave(finalData);
      toast.success(
        mode === 'create' 
          ? 'WIP Entry created successfully!' 
          : 'WIP Entry updated successfully!'
      );
    } else {
      toast.error('Please fix all validation errors before saving');
      // Focus on first error
      const firstError = Object.keys(formValidation.errors)[0];
      const errorElement = document.querySelector(`[data-error="${firstError}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [formData, formValidation, mode, onSave]);
  
  const handleCollaborationNote = useCallback((message: string, type: CollaborationNote['type']) => {
    if (onCollaborate) {
      const note: CollaborationNote = {
        id: `note_${Date.now()}`,
        userId: 'current_user',
        userName: 'Current User',
        message,
        type,
        timestamp: new Date(),
        resolved: false
      };
      
      onCollaborate(note);
      handleFormDataChange({
        collaborationNotes: [...formData.collaborationNotes, note]
      });
    }
  }, [onCollaborate, formData.collaborationNotes, handleFormDataChange]);

  // Progress calculation for multi-step form
  const progressPercentage = useMemo(() => {
    const baseProgress = (currentStep / (FORM_STEPS.length - 1)) * 100;
    
    // Add completion bonus based on form completeness
    let completionBonus = 0;
    if (formData.rollNumber && formData.fabricSpec.fabricType) completionBonus += 5;
    if (formData.articles.every(a => a.articleNumber && a.articleName)) completionBonus += 5;
    if (formData.selectedTemplates.length > 0) completionBonus += 5;
    
    return Math.min(100, baseProgress + completionBonus);
  }, [currentStep, formData]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSubmit(new Event('submit') as any);
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleStepNavigation(currentStep + 1);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            handleStepNavigation(currentStep - 1);
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handleStepNavigation, handleSubmit]);

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderFabricSpecStep();
      case 2:
        return renderArticlesStep();
      case 3:
        return renderTemplateStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Step Rendering Functions
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5" />
            Roll Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rollNumber">Roll Number *</Label>
            <Input
              id="rollNumber"
              value={formData.rollNumber}
              onChange={(e) => handleFormDataChange({ rollNumber: e.target.value })}
              placeholder="e.g., R-2024-001"
              className={formValidation.errors.rollNumber ? 'border-red-500' : ''}
              data-error="rollNumber"
            />
            {formValidation.errors.rollNumber && (
              <p className="text-sm text-red-500 mt-1">{formValidation.errors.rollNumber}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="lotNumber">Lot Number *</Label>
            <div className="flex gap-2">
              <Input
                id="lotNumber"
                value={formData.lotNumber}
                onChange={(e) => handleFormDataChange({ lotNumber: e.target.value })}
                placeholder="Smart generated lot number"
                className={formValidation.errors.lotNumber ? 'border-red-500' : ''}
                data-error="lotNumber"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLotNumber = generateSmartLotNumber(formData.fabricSpec.fabricType);
                  handleFormDataChange({ lotNumber: newLotNumber });
                  toast.success('Lot number regenerated');
                }}
                className="whitespace-nowrap"
              >
                <SparklesIcon className="h-4 w-4" />
                Generate
              </Button>
            </div>
            {formValidation.errors.lotNumber && (
              <p className="text-sm text-red-500 mt-1">{formValidation.errors.lotNumber}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="rollId">Roll ID (Auto-generated)</Label>
            <Input
              id="rollId"
              value={formData.rollId}
              disabled
              className="bg-gray-50"
              placeholder="Auto-generated roll ID"
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => handleFormDataChange({ status: value })}
            >
              <option value="draft">Draft</option>
              <option value="planning">Planning</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderFabricSpecStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BeakerIcon className="h-5 w-5" />
            Fabric Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="fabricType">Fabric Type *</Label>
              <Input
                id="fabricType"
                value={formData.fabricSpec.fabricType}
                onChange={(e) => handleFabricSpecChange('fabricType', e.target.value)}
                placeholder="e.g., Cotton, Polyester"
                className={formValidation.errors.fabricType ? 'border-red-500' : ''}
                data-error="fabricType"
              />
              {formValidation.errors.fabricType && (
                <p className="text-sm text-red-500 mt-1">{formValidation.errors.fabricType}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="layerCount">Layer Count *</Label>
              <Input
                id="layerCount"
                type="number"
                min="1"
                value={formData.fabricSpec.layerCount}
                onChange={(e) => handleFabricSpecChange('layerCount', parseInt(e.target.value) || 1)}
                className={formValidation.errors.layerCount ? 'border-red-500' : ''}
                data-error="layerCount"
              />
              {formValidation.errors.layerCount && (
                <p className="text-sm text-red-500 mt-1">{formValidation.errors.layerCount}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (GSM) *</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                value={formData.fabricSpec.weight}
                onChange={(e) => handleFabricSpecChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="180"
                className={formValidation.errors.weight ? 'border-red-500' : ''}
                data-error="weight"
              />
              {formValidation.errors.weight && (
                <p className="text-sm text-red-500 mt-1">{formValidation.errors.weight}</p>
              )}
              {formValidation.warnings.weight && (
                <p className="text-sm text-yellow-600 mt-1">{formValidation.warnings.weight}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
                type="number"
                min="1"
                value={formData.fabricSpec.width}
                onChange={(e) => handleFabricSpecChange('width', parseFloat(e.target.value) || 0)}
                placeholder="60"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="composition">Composition</Label>
              <Input
                id="composition"
                value={formData.fabricSpec.composition}
                onChange={(e) => handleFabricSpecChange('composition', e.target.value)}
                placeholder="100% Cotton"
              />
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.fabricSpec.color}
                onChange={(e) => handleFabricSpecChange('color', e.target.value)}
                placeholder="Navy Blue, White"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="stretch"
                checked={formData.fabricSpec.stretch}
                onCheckedChange={(checked) => handleFabricSpecChange('stretch', checked)}
              />
              <Label htmlFor="stretch">Stretch Fabric</Label>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.fabricSpec.supplier}
                onChange={(e) => handleFabricSpecChange('supplier', e.target.value)}
                placeholder="Supplier name"
              />
            </div>
            
            <div>
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.fabricSpec.batchNumber}
                onChange={(e) => handleFabricSpecChange('batchNumber', e.target.value)}
                placeholder="Fabric batch number"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderArticlesStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-5 w-5" />
            Article Information
          </CardTitle>
          <div className="flex gap-2">
            <Button type="button" onClick={addArticle} size="sm" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Article
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.articles.map((article, index) => (
            <div key={article.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  Article {index + 1}
                  {article.templateId && (
                    <Badge variant="secondary" className="text-xs">
                      <Cog6ToothIcon className="h-3 w-3 mr-1" />
                      Template Applied
                    </Badge>
                  )}
                </h4>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateArticle(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </Button>
                  {formData.articles.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArticle(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`articleNumber_${index}`}>Article Number *</Label>
                  <Input
                    id={`articleNumber_${index}`}
                    value={article.articleNumber}
                    onChange={(e) => handleArticleChange(index, { articleNumber: e.target.value })}
                    placeholder="e.g., TSA-SHIRT-001"
                    className={formValidation.errors[`article_${index}_number`] ? 'border-red-500' : ''}
                    data-error={`article_${index}_number`}
                  />
                  {formValidation.errors[`article_${index}_number`] && (
                    <p className="text-sm text-red-500 mt-1">{formValidation.errors[`article_${index}_number`]}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`articleName_${index}`}>Article Name *</Label>
                  <Input
                    id={`articleName_${index}`}
                    value={article.articleName}
                    onChange={(e) => handleArticleChange(index, { articleName: e.target.value })}
                    placeholder="e.g., Men's Cotton T-Shirt"
                    className={formValidation.errors[`article_${index}_name`] ? 'border-red-500' : ''}
                    data-error={`article_${index}_name`}
                  />
                  {formValidation.errors[`article_${index}_name`] && (
                    <p className="text-sm text-red-500 mt-1">{formValidation.errors[`article_${index}_name`]}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`category_${index}`}>Category</Label>
                  <Select 
                    value={article.category} 
                    onValueChange={(value: any) => handleArticleChange(index, { category: value })}
                  >
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`complexity_${index}`}>Complexity</Label>
                  <Select 
                    value={article.complexity} 
                    onValueChange={(value: any) => handleArticleChange(index, { complexity: value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
              </div>
              
              {/* Size Ratios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Size Ratios</Label>
                  <div className="flex gap-2">
                    {Object.entries(DEFAULT_SIZE_PATTERNS).map(([name, pattern]) => (
                      <Button
                        key={name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const totalQuantity = Object.values(pattern).reduce((sum, r) => sum + r, 0);
                          handleArticleChange(index, { sizeRatios: pattern, totalQuantity });
                        }}
                        className="text-xs"
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-3">
                  {SIZES.map(size => (
                    <div key={size}>
                      <Label className="text-xs">{size}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={article.sizeRatios[size] || 0}
                        onChange={(e) => handleSizeRatioChange(index, size, parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Quick ratio: 1:2:2:1, S:1,M:2,L:2,XL:1, or {'S':1,'M':2}"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSizeRatioParse(index, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1"
                  />
                  <Badge variant="secondary" className="whitespace-nowrap flex items-center gap-1">
                    <CalculatorIcon className="h-3 w-3" />
                    Total: {article.totalQuantity}
                  </Badge>
                </div>
                
                {formValidation.errors[`article_${index}_ratios`] && (
                  <p className="text-sm text-red-500 mt-1">{formValidation.errors[`article_${index}_ratios`]}</p>
                )}
                
                {formValidation.warnings[`article_${index}_operations`] && (
                  <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                    <LightBulbIcon className="h-4 w-4" />
                    {formValidation.warnings[`article_${index}_operations`]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Production Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Production Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="bundleCount">Bundle Count *</Label>
            <Input
              id="bundleCount"
              type="number"
              min="1"
              value={formData.bundleCount}
              onChange={(e) => handleFormDataChange({ bundleCount: parseInt(e.target.value) || 1 })}
              className={formValidation.errors.bundleCount ? 'border-red-500' : ''}
              data-error="bundleCount"
            />
            {formValidation.errors.bundleCount && (
              <p className="text-sm text-red-500 mt-1">{formValidation.errors.bundleCount}</p>
            )}
          </div>
          
          <div>
            <Label>Pieces per Bundle</Label>
            <Input
              value={calculatedMetrics.totalArticlePieces}
              disabled
              className="bg-gray-50 font-semibold"
            />
          </div>
          
          <div>
            <Label>Total Pieces</Label>
            <Input
              value={calculatedMetrics.totalPieces}
              disabled
              className="bg-green-50 font-bold text-green-800"
            />
            {formValidation.warnings.totalPieces && (
              <p className="text-sm text-yellow-600 mt-1">{formValidation.warnings.totalPieces}</p>
            )}
          </div>
          
          <div>
            <Label>Estimated Time</Label>
            <Input
              value={`${Math.ceil(calculatedMetrics.totalEstimatedTime / 60)}h ${calculatedMetrics.totalEstimatedTime % 60}m`}
              disabled
              className="bg-blue-50 font-semibold text-blue-800"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderTemplateStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5" />
            Template Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {templateSuggestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-yellow-500" />
                Suggested Templates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templateSuggestions.map(template => (
                  <div key={template.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{template.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {template.operations.length} operations • {template.estimatedTime}min
                    </p>
                    <div className="flex gap-1">
                      {formData.articles.map((article, index) => (
                        <Button
                          key={index}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleTemplateApply(index, template)}
                          className="text-xs flex-1"
                          disabled={article.templateId === template.id}
                        >
                          {article.templateId === template.id ? 'Applied' : `Apply to ${index + 1}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Selected Templates</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateModalOpen(true)}
              >
                Browse All Templates
              </Button>
            </div>
            
            {formData.selectedTemplates.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Cog6ToothIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No templates selected</p>
                <p className="text-sm">Apply templates to articles for optimized workflow</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.selectedTemplates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{template.name}</h5>
                      <p className="text-sm text-gray-600">
                        {template.operations.length} operations • Complexity: {template.complexity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Used {formData.articles.filter(a => a.templateId === template.id).length} times
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedTemplates = formData.selectedTemplates.filter(t => t.id !== template.id);
                          const updatedArticles = formData.articles.map(article => 
                            article.templateId === template.id 
                              ? { ...article, templateId: undefined, operations: [] }
                              : article
                          );
                          handleFormDataChange({ 
                            selectedTemplates: updatedTemplates,
                            articles: updatedArticles
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {formData.workflow.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.workflow.slice(0, 5).map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded border">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium text-sm">{step.name}</h6>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.estimatedDuration}min
                  </div>
                </div>
              ))}
              {formData.workflow.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{formData.workflow.length - 5} more steps
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            Review & Submit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Production Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Total Articles:</strong> {formData.articles.length}</p>
                <p><strong>Total Bundles:</strong> {formData.bundleCount}</p>
                <p><strong>Total Pieces:</strong> {calculatedMetrics.totalPieces}</p>
                <p><strong>Estimated Time:</strong> {Math.ceil(calculatedMetrics.totalEstimatedTime / 60)}h</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Production Details</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>Status:</strong> {formData.status.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Avg Complexity:</strong> {calculatedMetrics.averageComplexity}</p>
                <p><strong>Templates Used:</strong> {formData.selectedTemplates.length}</p>
                <p><strong>Total Bundles:</strong> {formData.bundleCount}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Fabric Details</h4>
              <div className="space-y-1 text-sm text-purple-800">
                <p><strong>Type:</strong> {formData.fabricSpec.fabricType}</p>
                <p><strong>Weight:</strong> {formData.fabricSpec.weight} GSM</p>
                <p><strong>Layers:</strong> {formData.fabricSpec.layerCount}</p>
                <p><strong>Color:</strong> {formData.fabricSpec.color || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {/* Validation Status */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Form Validation Status
            </h4>
            
            {formValidation.isValid ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span>All validations passed - Ready to submit!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>{Object.keys(formValidation.errors).length} errors need to be fixed</span>
                </div>
                <div className="text-sm text-red-600 space-y-1">
                  {Object.entries(formValidation.errors).slice(0, 5).map(([field, error]) => (
                    <p key={field}>• {error}</p>
                  ))}
                  {Object.keys(formValidation.errors).length > 5 && (
                    <p>• +{Object.keys(formValidation.errors).length - 5} more errors</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFormDataChange({ notes: e.target.value })}
              placeholder="Add any additional notes or special instructions..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-7 w-7" />
            Enhanced WIP Entry System
          </h1>
          <p className="text-muted-foreground">
            Multi-step form with intelligent template integration and real-time collaboration
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {realTimeUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4 text-gray-500" />
              <div className="flex -space-x-1">
                {realTimeUsers.slice(0, 3).map(user => (
                  <div
                    key={user.id}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.name.charAt(0)}
                  </div>
                ))}
                {realTimeUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-xs font-semibold text-white">
                    +{realTimeUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Switch
              id="autoSave"
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
            />
            <Label htmlFor="autoSave" className="text-sm text-gray-600">
              Auto-save
            </Label>
          </div>
          
          <Badge variant={formData.status === 'completed' ? 'default' : 'secondary'}>
            {formData.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Form Progress</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {/* Step Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8 overflow-x-auto">
          {FORM_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const hasErrors = Object.keys(validateCurrentStep(index).errors).length > 0;
            
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepNavigation(index)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : isCompleted
                    ? 'border-green-500 text-green-600'
                    : hasErrors
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap`}
              >
                <Icon className="h-4 w-4" />
                <span>{step.label}</span>
                {isCompleted && <CheckCircleIcon className="h-4 w-4" />}
                {hasErrors && !isActive && <ExclamationTriangleIcon className="h-4 w-4" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStepContent()}
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <ClockIcon className="h-3 w-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
            {autoSaveEnabled && isDirty && (
              <span className="text-sm text-gray-500">Auto-saving...</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
            
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleStepNavigation(currentStep - 1)}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Previous
              </Button>
            )}
            
            {currentStep < FORM_STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => handleStepNavigation(currentStep + 1)}
                className="flex items-center gap-2"
                disabled={!validateCurrentStep(currentStep).isValid}
              >
                Next
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={!formValidation.isValid}
              >
                <CheckCircleIcon className="h-4 w-4" />
                {mode === 'create' ? 'Create WIP Entry' : 'Update WIP Entry'}
              </Button>
            )}
          </div>
        </div>
      </form>
      
      {/* Keyboard Shortcuts Help */}
      {showAdvancedOptions && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">Ctrl+S</kbd>
                <span>Save form</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">Ctrl+→</kbd>
                <span>Next step</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">Ctrl+←</kbd>
                <span>Previous step</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">Enter</kbd>
                <span>Apply size ratios</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
        </Button>
      </div>
    </div>
  );
};

// Template Browser Modal Component (simplified for now)
const TemplateBrowserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  templates: SewingTemplate[];
  onSelect: (template: SewingTemplate) => void;
}> = ({ isOpen, onClose, templates, onSelect }) => {
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Browse Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {templates.map(template => (
            <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.category}</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs mr-2">
                  {template.complexity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.operations.length} ops
                </Badge>
              </div>
              <Button
                className="w-full mt-3"
                size="sm"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
              >
                Select Template
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedWIPEntryForm;
export { SizeConfigurationParser, TemplateIntegrationService };
export type { 
  EnhancedWIPEntry, 
  Article, 
  SewingTemplate, 
  FabricSpecification, 
  Operation, 
  QualityRequirement,
  WorkflowStep,
  CollaborationNote,
  CostBreakdown
};