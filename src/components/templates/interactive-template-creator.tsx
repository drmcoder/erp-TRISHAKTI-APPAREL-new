import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import type { SewingTemplate, SewingOperation } from '@/shared/types/sewing-template-types';

interface InteractiveTemplateCreatorProps {
  onSave: (template: Omit<SewingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'timesUsed' | 'version'>) => void;
  onCancel: () => void;
}

type CreationStep = 'basic' | 'operations' | 'review' | 'success';

const MACHINE_TYPES = [
  { value: 'overlock', label: 'Overlock', icon: '🧵', color: 'bg-blue-100 text-blue-700' },
  { value: 'flatlock', label: 'Flatlock', icon: '📐', color: 'bg-green-100 text-green-700' },
  { value: 'singleNeedle', label: 'Single Needle', icon: '📌', color: 'bg-purple-100 text-purple-700' },
  { value: 'buttonhole', label: 'Buttonhole', icon: '🕳️', color: 'bg-orange-100 text-orange-700' },
  { value: 'buttonAttach', label: 'Button Attach', icon: '🔘', color: 'bg-red-100 text-red-700' },
  { value: 'iron', label: 'Iron/Press', icon: '🔥', color: 'bg-yellow-100 text-yellow-700' }
];

const CATEGORIES = [
  { value: 't-shirt', label: 'T-Shirt', icon: '👕' },
  { value: 'shirt', label: 'Shirt', icon: '👔' },
  { value: 'pant', label: 'Pant', icon: '👖' },
  { value: 'jacket', label: 'Jacket', icon: '🧥' },
  { value: 'dress', label: 'Dress', icon: '👗' },
  { value: 'underwear', label: 'Underwear', icon: '🩲' }
];

export const InteractiveTemplateCreator: React.FC<InteractiveTemplateCreatorProps> = ({
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>('basic');
  const [formData, setFormData] = useState({
    templateName: '',
    templateCode: '',
    category: '',
    operations: [] as SewingOperation[],
    notes: '',
    setupInstructions: ''
  });

  const [newOperation, setNewOperation] = useState<Partial<SewingOperation>>({
    operationName: '',
    machineType: '',
    smvMinutes: 0,
    pricePerPiece: 0,
    processingType: 'sequential',
    qualityCheckRequired: false,
    defectTolerance: 5,
    isOptional: false,
    notes: ''
  });

  const [operationStep, setOperationStep] = useState<'input' | 'configure' | 'confirm'>('input');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const totalSmv = formData.operations.reduce((sum, op) => sum + op.smvMinutes, 0);
  const totalPricePerPiece = formData.operations.reduce((sum, op) => sum + op.pricePerPiece, 0);

  // Auto-generate template code from name
  const generateTemplateCode = (name: string) => {
    return name.toUpperCase().replace(/\s+/g, '_').substring(0, 10);
  };

  // Handle price input and auto-calculate SMV
  const handlePriceChange = (price: number) => {
    const autoSmv = price > 0 ? parseFloat((price * 1.9).toFixed(2)) : 0;
    setNewOperation(prev => ({ 
      ...prev, 
      pricePerPiece: price,
      smvMinutes: autoSmv 
    }));
  };

  // Add operation to template
  const addOperation = () => {
    if (!newOperation.operationName || !newOperation.machineType) {
      setErrors({ operation: 'Operation name and machine type are required' });
      return;
    }

    const operation: SewingOperation = {
      id: `op_${Date.now()}`,
      operationName: newOperation.operationName!,
      machineType: newOperation.machineType!,
      smvMinutes: newOperation.smvMinutes || 0,
      pricePerPiece: newOperation.pricePerPiece || 0,
      processingType: newOperation.processingType || 'sequential',
      sequenceOrder: formData.operations.length + 1,
      prerequisites: newOperation.processingType === 'sequential' && formData.operations.length > 0 
        ? [formData.operations[formData.operations.length - 1].id] 
        : [],
      qualityCheckRequired: newOperation.qualityCheckRequired || false,
      defectTolerance: newOperation.defectTolerance || 5,
      isOptional: newOperation.isOptional || false,
      notes: newOperation.notes || ''
    };

    setFormData(prev => ({
      ...prev,
      operations: [...prev.operations, operation]
    }));

    // Reset form
    setNewOperation({
      operationName: '',
      machineType: '',
      smvMinutes: 0,
      pricePerPiece: 0,
      processingType: 'sequential',
      qualityCheckRequired: false,
      defectTolerance: 5,
      isOptional: false,
      notes: ''
    });
    setOperationStep('input');
    setErrors({});
  };

  // Remove operation
  const removeOperation = (operationId: string) => {
    setFormData(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.id !== operationId)
    }));
  };

  // Validate and save template
  const handleSave = () => {
    if (!formData.templateName || !formData.category || formData.operations.length === 0) {
      setErrors({ general: 'Please complete all required fields' });
      return;
    }

    const complexityLevel = totalSmv > 30 || formData.operations.length > 10 ? 'expert' :
                           totalSmv > 15 || formData.operations.length > 5 ? 'intermediate' : 'beginner';

    const template = {
      ...formData,
      totalSmv,
      totalPricePerPiece,
      complexityLevel,
      isActive: true
    };

    onSave(template);
    setCurrentStep('success');
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'basic', label: 'Basic Info', icon: DocumentTextIcon },
      { key: 'operations', label: 'Operations', icon: CpuChipIcon },
      { key: 'review', label: 'Review', icon: CheckIcon }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              currentStep === step.key 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : index < steps.findIndex(s => s.key === currentStep)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
            }`}>
              <step.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRightIcon className="w-4 h-4 text-gray-400 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render basic info step
  const renderBasicStep = () => (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Template</h2>
        <p className="text-gray-600">Let's start with the basic information about your sewing template</p>
      </div>

      <div className="space-y-6">
        <div>
          <Input
            label="Template Name *"
            placeholder="e.g., Round Neck T-Shirt Basic"
            value={formData.templateName}
            onChange={(e) => {
              const name = e.target.value;
              setFormData(prev => ({
                ...prev,
                templateName: name,
                templateCode: generateTemplateCode(name)
              }));
            }}
            className="text-lg"
          />
        </div>

        <div>
          <Input
            label="Template Code *"
            placeholder="AUTO_GENERATED"
            value={formData.templateCode}
            onChange={(e) => setFormData(prev => ({ ...prev, templateCode: e.target.value }))}
            className="font-mono bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  formData.category === category.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm">{category.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Setup Instructions</label>
          <textarea
            value={formData.setupInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, setupInstructions: e.target.value }))}
            placeholder="Describe any special setup requirements..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => setCurrentStep('operations')}
            disabled={!formData.templateName || !formData.category}
            className="flex items-center gap-2"
          >
            Next: Add Operations
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  // Render operations step
  const renderOperationsStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Operations List */}
      {formData.operations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Operations ({formData.operations.length})</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {totalSmv} min
              </div>
              <div className="flex items-center gap-1">
                <CurrencyRupeeIcon className="w-4 h-4" />
                {totalPricePerPiece.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {formData.operations.map((operation, index) => (
              <div key={operation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{operation.operationName}</div>
                    <div className="text-sm text-gray-600">
                      {MACHINE_TYPES.find(m => m.value === operation.machineType)?.label} • 
                      {operation.smvMinutes}min • Rs.{operation.pricePerPiece}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeOperation(operation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Operation */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <PlusIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add New Operation</h3>
            <p className="text-gray-600">Define the sewing operations for this template</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Operation Name *"
              placeholder="e.g., Attach Collar"
              value={newOperation.operationName}
              onChange={(e) => setNewOperation(prev => ({ ...prev, operationName: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Machine Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {MACHINE_TYPES.map((machine) => (
                  <button
                    key={machine.value}
                    onClick={() => setNewOperation(prev => ({ ...prev, machineType: machine.value }))}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      newOperation.machineType === machine.value
                        ? `border-blue-500 ${machine.color} scale-105`
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{machine.icon}</span>
                    {machine.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                step="0.01"
                label="Price per Piece (Rs) *"
                placeholder="0.00"
                value={newOperation.pricePerPiece}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Input
                type="number"
                step="0.1"
                label={
                  <div className="flex items-center gap-2">
                    SMV (Auto) *
                    <SparklesIcon className="w-4 h-4 text-yellow-500" />
                  </div>
                }
                placeholder="Auto-calculated"
                value={newOperation.smvMinutes}
                onChange={(e) => setNewOperation(prev => ({ ...prev, smvMinutes: parseFloat(e.target.value) || 0 }))}
                className="bg-yellow-50 border-yellow-200"
              />
              <p className="text-xs text-yellow-700 mt-1">
                ✨ Auto-calculated: Price × 1.9 = {((newOperation.pricePerPiece || 0) * 1.9).toFixed(2)} min
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={newOperation.notes}
              onChange={(e) => setNewOperation(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions for this operation..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <Button 
            onClick={addOperation}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            disabled={!newOperation.operationName || !newOperation.machineType}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Operation
          </Button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('basic')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('review')}
          disabled={formData.operations.length === 0}
        >
          Review Template
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render review step
  const renderReviewStep = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Template</h2>
          <p className="text-gray-600">Make sure everything looks correct before saving</p>
        </div>

        {/* Template Summary */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{formData.operations.length}</div>
              <div className="text-sm text-blue-700">Operations</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{totalSmv}</div>
              <div className="text-sm text-green-700">Total SMV</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">Rs.{totalPricePerPiece.toFixed(2)}</div>
              <div className="text-sm text-purple-700">Per Piece</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                {totalSmv > 30 || formData.operations.length > 10 ? 'Expert' :
                 totalSmv > 15 || formData.operations.length > 5 ? 'Intermediate' : 'Beginner'}
              </Badge>
              <div className="text-sm text-orange-700 mt-1">Complexity</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{formData.templateName}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Code:</strong> {formData.templateCode}</p>
              <p><strong>Category:</strong> {CATEGORIES.find(c => c.value === formData.category)?.label}</p>
              {formData.setupInstructions && (
                <p><strong>Setup:</strong> {formData.setupInstructions}</p>
              )}
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{errors.general}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={() => setCurrentStep('operations')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Operations
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8"
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            Save Template
          </Button>
        </div>
      </Card>
    </div>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Template Created!</h2>
        <p className="text-gray-600 mb-8">
          Your sewing template "{formData.templateName}" has been successfully created and saved.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{formData.operations.length}</div>
            <div className="text-sm text-gray-600">Operations</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{totalSmv}min</div>
            <div className="text-sm text-gray-600">Total SMV</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">Rs.{totalPricePerPiece.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Per Piece</div>
          </div>
        </div>
        <Button onClick={onCancel} className="px-8">
          Done
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-6">
        {/* Step Indicator */}
        {currentStep !== 'success' && renderStepIndicator()}

        {/* Step Content */}
        {currentStep === 'basic' && renderBasicStep()}
        {currentStep === 'operations' && renderOperationsStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
};