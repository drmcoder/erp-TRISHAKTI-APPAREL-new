// Sewing Template Management System
// Manages process steps for different garment types with pricing and timing

import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Input, Badge, Stack, Flex,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/shared/components/ui';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/shared/utils';

export interface SewingStep {
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: 'single_needle' | 'overlock' | 'flatlock' | 'finishing' | 'buttonhole' | 'cutting';
  pricePerPiece: number;
  estimatedMinutes: number;
  canRunParallel: boolean;
  dependencies: number[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  qualityCheckRequired: boolean;
  notes?: string;
}

export interface SewingTemplate {
  id: string;
  name: string;
  nameNepali: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants' | 'shorts' | 'hoodie' | 'dress';
  steps: SewingStep[];
  totalEstimatedTime: number;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  isActive: boolean;
  version: number;
}

interface SewingTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (template: SewingTemplate) => void;
  initialTemplate?: SewingTemplate;
}

const MACHINE_TYPES = [
  { value: 'single_needle', label: 'Single Needle', icon: '🪡' },
  { value: 'overlock', label: 'Overlock', icon: '✂️' },
  { value: 'flatlock', label: 'Flatlock', icon: '📎' },
  { value: 'finishing', label: 'Finishing', icon: '✨' },
  { value: 'buttonhole', label: 'Buttonhole', icon: '🔘' },
  { value: 'cutting', label: 'Cutting', icon: '✂️' }
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'expert', label: 'Expert', color: 'red' }
];

// Pre-defined templates for common garments
const TEMPLATE_PRESETS = {
  tshirt: {
    name: 'Basic T-Shirt',
    nameNepali: 'आधारभूत टी-शर्ट',
    steps: [
      {
        stepNumber: 1,
        operation: 'Shoulder Join',
        operationNepali: 'काँध जोड्ने',
        machineType: 'overlock' as const,
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [],
        skillLevel: 'beginner' as const,
        qualityCheckRequired: true
      },
      {
        stepNumber: 2,
        operation: 'Neck Bind',
        operationNepali: 'घाँटी बाइंड',
        machineType: 'overlock' as const,
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [1],
        skillLevel: 'intermediate' as const,
        qualityCheckRequired: true
      },
      {
        stepNumber: 3,
        operation: 'Sleeve Attach',
        operationNepali: 'बाही जोड्ने',
        machineType: 'overlock' as const,
        pricePerPiece: 3.0,
        estimatedMinutes: 4,
        canRunParallel: false,
        dependencies: [2],
        skillLevel: 'intermediate' as const,
        qualityCheckRequired: false
      },
      {
        stepNumber: 4,
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock' as const,
        pricePerPiece: 2.5,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [3],
        skillLevel: 'beginner' as const,
        qualityCheckRequired: false
      },
      {
        stepNumber: 5,
        operation: 'Bottom Hem',
        operationNepali: 'तलको हेम',
        machineType: 'flatlock' as const,
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [4],
        skillLevel: 'beginner' as const,
        qualityCheckRequired: false
      },
      {
        stepNumber: 6,
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing' as const,
        pricePerPiece: 1.0,
        estimatedMinutes: 1,
        canRunParallel: false,
        dependencies: [5],
        skillLevel: 'beginner' as const,
        qualityCheckRequired: true
      }
    ]
  }
};

export const SewingTemplateManager: React.FC<SewingTemplateManagerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate
}) => {
  const [template, setTemplate] = useState<Partial<SewingTemplate>>({
    name: '',
    nameNepali: '',
    garmentType: 'tshirt',
    steps: [],
    isActive: true,
    version: 1
  });

  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  // Calculate totals when steps change
  useEffect(() => {
    const totalTime = template.steps?.reduce((sum, step) => sum + step.estimatedMinutes, 0) || 0;
    const totalCost = template.steps?.reduce((sum, step) => sum + step.pricePerPiece, 0) || 0;
    
    setTemplate(prev => ({
      ...prev,
      totalEstimatedTime: totalTime,
      totalCost: totalCost
    }));
  }, [template.steps]);

  const loadPreset = (garmentType: keyof typeof TEMPLATE_PRESETS) => {
    const preset = TEMPLATE_PRESETS[garmentType];
    if (preset) {
      setTemplate(prev => ({
        ...prev,
        name: preset.name,
        nameNepali: preset.nameNepali,
        steps: preset.steps.map(step => ({ ...step }))
      }));
    }
  };

  const addStep = () => {
    const newStep: SewingStep = {
      stepNumber: (template.steps?.length || 0) + 1,
      operation: '',
      operationNepali: '',
      machineType: 'single_needle',
      pricePerPiece: 0,
      estimatedMinutes: 0,
      canRunParallel: false,
      dependencies: [],
      skillLevel: 'beginner',
      qualityCheckRequired: false,
      notes: ''
    };

    setTemplate(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));

    setEditingStep(newStep.stepNumber);
  };

  const updateStep = (stepNumber: number, updates: Partial<SewingStep>) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.stepNumber === stepNumber ? { ...step, ...updates } : step
      ) || []
    }));
  };

  const removeStep = (stepNumber: number) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.stepNumber !== stepNumber)
        .map((step, index) => ({ ...step, stepNumber: index + 1 })) || []
    }));
    
    setEditingStep(null);
  };

  const moveStep = (stepNumber: number, direction: 'up' | 'down') => {
    const steps = [...(template.steps || [])];
    const currentIndex = steps.findIndex(s => s.stepNumber === stepNumber);
    
    if (direction === 'up' && currentIndex > 0) {
      [steps[currentIndex], steps[currentIndex - 1]] = [steps[currentIndex - 1], steps[currentIndex]];
    } else if (direction === 'down' && currentIndex < steps.length - 1) {
      [steps[currentIndex], steps[currentIndex + 1]] = [steps[currentIndex + 1], steps[currentIndex]];
    }
    
    // Renumber steps
    const reorderedSteps = steps.map((step, index) => ({
      ...step,
      stepNumber: index + 1
    }));
    
    setTemplate(prev => ({ ...prev, steps: reorderedSteps }));
  };

  const validateTemplate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!template.name?.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!template.nameNepali?.trim()) {
      newErrors.nameNepali = 'Nepali name is required';
    }

    if (!template.steps || template.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    template.steps?.forEach((step, index) => {
      if (!step.operation.trim()) {
        newErrors[`step_${index}_operation`] = 'Operation name is required';
      }
      if (step.pricePerPiece <= 0) {
        newErrors[`step_${index}_price`] = 'Price must be greater than 0';
      }
      if (step.estimatedMinutes <= 0) {
        newErrors[`step_${index}_time`] = 'Time must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateTemplate()) return;

    const savedTemplate: SewingTemplate = {
      id: initialTemplate?.id || `template_${Date.now()}`,
      name: template.name!,
      nameNepali: template.nameNepali!,
      garmentType: template.garmentType!,
      steps: template.steps!,
      totalEstimatedTime: template.totalEstimatedTime!,
      totalCost: template.totalCost!,
      createdBy: 'current_user', // TODO: Get from auth
      createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isActive: template.isActive!,
      version: template.version!
    };

    onSave?.(savedTemplate);
    onClose();
  };

  const getMachineIcon = (machineType: string) => {
    return MACHINE_TYPES.find(m => m.value === machineType)?.icon || '🪡';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalHeader>
        <Flex align="center" gap={2}>
          <ClipboardDocumentListIcon className="w-5 h-5" />
          Sewing Template Manager
        </Flex>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Template Basic Info */}
          <Card>
            <CardHeader>
              <Flex justify="between" align="center">
                <Text weight="medium">Template Information</Text>
                <div>
                  <Select 
                    value={template.garmentType}
                    onValueChange={(value: any) => setTemplate(prev => ({ ...prev, garmentType: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tshirt">T-Shirt</SelectItem>
                      <SelectItem value="polo">Polo</SelectItem>
                      <SelectItem value="shirt">Shirt</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="shorts">Shorts</SelectItem>
                      <SelectItem value="hoodie">Hoodie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Flex>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Template Name *"
                  value={template.name || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  error={errors.name}
                  placeholder="e.g., Basic T-Shirt"
                />
                
                <Input
                  label="Nepali Name *"
                  value={template.nameNepali || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, nameNepali: e.target.value }))}
                  error={errors.nameNepali}
                  placeholder="e.g., आधारभूत टी-शर्ट"
                />
              </div>

              {/* Quick preset loading */}
              <div className="mb-4">
                <Text size="sm" weight="medium" className="mb-2">Quick Start Templates:</Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset('tshirt')}
                  disabled={template.garmentType !== 'tshirt'}
                >
                  Load T-Shirt Template
                </Button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <Text size="lg" weight="bold" color="blue">{template.steps?.length || 0}</Text>
                  <Text size="sm" color="muted">Steps</Text>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <Text size="lg" weight="bold" color="green">{template.totalEstimatedTime || 0} min</Text>
                  <Text size="sm" color="muted">Total Time</Text>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <Text size="lg" weight="bold" color="purple">₹{template.totalCost?.toFixed(2) || '0.00'}</Text>
                  <Text size="sm" color="muted">Total Cost</Text>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Steps Management */}
          <Card>
            <CardHeader>
              <Flex justify="between" align="center">
                <Text weight="medium">Sewing Steps</Text>
                <Button onClick={addStep} size="sm">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Step
                </Button>
              </Flex>
              {errors.steps && (
                <Text size="sm" color="red" className="mt-1">{errors.steps}</Text>
              )}
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {template.steps?.map((step, index) => (
                  <div key={step.stepNumber} className="border rounded-lg p-4 bg-gray-50">
                    <Flex justify="between" align="center" className="mb-3">
                      <Flex align="center" gap={2}>
                        <Badge variant="blue">Step {step.stepNumber}</Badge>
                        <Text size="sm">{getMachineIcon(step.machineType)}</Text>
                        <Text weight="medium">{step.operation || 'Unnamed Step'}</Text>
                      </Flex>
                      
                      <Flex gap={1}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.stepNumber, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.stepNumber, 'down')}
                          disabled={index === (template.steps?.length || 0) - 1}
                        >
                          <ArrowDownIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStep(editingStep === step.stepNumber ? null : step.stepNumber)}
                          className={editingStep === step.stepNumber ? 'bg-blue-100' : ''}
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.stepNumber)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </Flex>
                    </Flex>

                    {editingStep === step.stepNumber && (
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            label="Operation Name *"
                            value={step.operation}
                            onChange={(e) => updateStep(step.stepNumber, { operation: e.target.value })}
                            error={errors[`step_${index}_operation`]}
                            placeholder="e.g., Shoulder Join"
                          />
                          
                          <Input
                            label="Nepali Name"
                            value={step.operationNepali}
                            onChange={(e) => updateStep(step.stepNumber, { operationNepali: e.target.value })}
                            placeholder="e.g., काँध जोड्ने"
                          />
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Machine Type</label>
                            <select
                              value={step.machineType}
                              onChange={(e) => updateStep(step.stepNumber, { machineType: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {MACHINE_TYPES.map(machine => (
                                <option key={machine.value} value={machine.value}>
                                  {machine.icon} {machine.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Skill Level</label>
                            <select
                              value={step.skillLevel}
                              onChange={(e) => updateStep(step.stepNumber, { skillLevel: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {SKILL_LEVELS.map(skill => (
                                <option key={skill.value} value={skill.value}>
                                  {skill.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <Input
                            label="Price per Piece (₹) *"
                            type="number"
                            step="0.1"
                            min="0"
                            value={step.pricePerPiece}
                            onChange={(e) => updateStep(step.stepNumber, { pricePerPiece: parseFloat(e.target.value) || 0 })}
                            error={errors[`step_${index}_price`]}
                          />
                          
                          <Input
                            label="Estimated Minutes *"
                            type="number"
                            min="1"
                            value={step.estimatedMinutes}
                            onChange={(e) => updateStep(step.stepNumber, { estimatedMinutes: parseInt(e.target.value) || 0 })}
                            error={errors[`step_${index}_time`]}
                          />
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={step.canRunParallel}
                              onChange={(e) => updateStep(step.stepNumber, { canRunParallel: e.target.checked })}
                              className="rounded"
                            />
                            <Text size="sm">Can run parallel with other steps</Text>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={step.qualityCheckRequired}
                              onChange={(e) => updateStep(step.stepNumber, { qualityCheckRequired: e.target.checked })}
                              className="rounded"
                            />
                            <Text size="sm">Quality check required</Text>
                          </label>
                        </div>

                        <Input
                          label="Notes"
                          value={step.notes || ''}
                          onChange={(e) => updateStep(step.stepNumber, { notes: e.target.value })}
                          placeholder="Additional notes for this step..."
                        />
                      </div>
                    )}

                    {/* Quick summary */}
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                      <div>₹{step.pricePerPiece}</div>
                      <div>{step.estimatedMinutes} min</div>
                      <div>
                        <Badge 
                          size="xs" 
                          variant={SKILL_LEVELS.find(s => s.value === step.skillLevel)?.color as any || 'gray'}
                        >
                          {step.skillLevel}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {step.qualityCheckRequired && <Badge size="xs" variant="yellow">QC</Badge>}
                        {step.canRunParallel && <Badge size="xs" variant="green">Parallel</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!template.steps || template.steps.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <Text>No steps added yet. Click "Add Step" to get started.</Text>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Flex gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!template.name || !template.steps?.length}>
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            {initialTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </Flex>
      </ModalFooter>
    </Modal>
  );
};

export default SewingTemplateManager;