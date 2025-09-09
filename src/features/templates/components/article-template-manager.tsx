// Article Template Manager Component
// Manages sewing process templates with operation sequencing

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CogIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

// Enhanced sewing operations library based on documentation
export const SEWING_OPERATIONS_LIBRARY = {
  cutting: [
    { code: 'CUT001', name: 'Main Body Cutting', SAM: 15, rate: 0.75, machineType: 'Cutting Table', skillRequired: 'intermediate' },
    { code: 'CUT002', name: 'Sleeve Cutting', SAM: 10, rate: 0.50, machineType: 'Cutting Table', skillRequired: 'beginner' },
    { code: 'CUT003', name: 'Collar Cutting', SAM: 12, rate: 0.60, machineType: 'Cutting Table', skillRequired: 'advanced' },
    { code: 'CUT004', name: 'Pocket Cutting', SAM: 8, rate: 0.40, machineType: 'Cutting Table', skillRequired: 'beginner' }
  ],
  sewing: [
    { code: 'SEW001', name: 'Side Seam', SAM: 25, rate: 1.25, machineType: 'Overlock', skillRequired: 'intermediate' },
    { code: 'SEW002', name: 'Shoulder Seam', SAM: 20, rate: 1.00, machineType: 'Overlock', skillRequired: 'intermediate' },
    { code: 'SEW003', name: 'Collar Attachment', SAM: 30, rate: 1.50, machineType: 'Single Needle', skillRequired: 'advanced' },
    { code: 'SEW004', name: 'Button Hole Making', SAM: 15, rate: 0.80, machineType: 'Button Hole', skillRequired: 'expert' },
    { code: 'SEW005', name: 'Sleeve Attachment', SAM: 18, rate: 0.95, machineType: 'Overlock', skillRequired: 'intermediate' },
    { code: 'SEW006', name: 'Hem Stitching', SAM: 12, rate: 0.65, machineType: 'Single Needle', skillRequired: 'beginner' }
  ],
  finishing: [
    { code: 'FIN001', name: 'Button Attachment', SAM: 10, rate: 0.60, machineType: 'Manual', skillRequired: 'beginner' },
    { code: 'FIN002', name: 'Final Pressing', SAM: 8, rate: 0.45, machineType: 'Press Machine', skillRequired: 'intermediate' },
    { code: 'FIN003', name: 'Final Quality Check', SAM: 12, rate: 0.70, machineType: 'Inspection Table', skillRequired: 'advanced' },
    { code: 'FIN004', name: 'Packaging', SAM: 5, rate: 0.30, machineType: 'Manual', skillRequired: 'beginner' }
  ]
};

export interface TemplateOperation {
  sequence: number;
  operationCode: string;
  operationName: string;
  description: string;
  SAM: number; // Standard Allowed Minutes
  rate: number; // Payment rate per piece
  machineType: string;
  skillRequired: string;
  dependencies: string[]; // Operations that must complete first
  canRunParallel: string[]; // Operations that can run simultaneously
  qualityChecks: string[];
}

export interface ArticleTemplate {
  id?: string;
  articleNumber: string;
  articleName: string;
  style: string;
  category: string;
  operations: TemplateOperation[];
  totalSAM: number;
  totalRate: number;
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  estimatedPieces: number;
  isActive: boolean;
  createdAt: Date;
}

interface ArticleTemplateManagerProps {
  onSave: (template: ArticleTemplate) => void;
  onCancel: () => void;
  initialData?: ArticleTemplate;
}

const ArticleTemplateManager: React.FC<ArticleTemplateManagerProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [template, setTemplate] = useState<ArticleTemplate>({
    articleNumber: initialData?.articleNumber || '',
    articleName: initialData?.articleName || '',
    style: initialData?.style || '',
    category: initialData?.category || 'shirt',
    operations: initialData?.operations || [],
    totalSAM: initialData?.totalSAM || 0,
    totalRate: initialData?.totalRate || 0,
    complexity: initialData?.complexity || 'simple',
    estimatedPieces: initialData?.estimatedPieces || 12,
    isActive: initialData?.isActive ?? true,
    createdAt: initialData?.createdAt || new Date()
  });

  const [showOperationLibrary, setShowOperationLibrary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof SEWING_OPERATIONS_LIBRARY>('cutting');

  // Calculate totals when operations change
  const updateTotals = (operations: TemplateOperation[]) => {
    const totalSAM = operations.reduce((sum, op) => sum + op.SAM, 0);
    const totalRate = operations.reduce((sum, op) => sum + op.rate, 0);
    
    // Determine complexity based on total SAM and skill requirements
    let complexity: ArticleTemplate['complexity'] = 'simple';
    if (totalSAM > 100 || operations.some(op => op.skillRequired === 'expert')) {
      complexity = 'expert';
    } else if (totalSAM > 60 || operations.some(op => op.skillRequired === 'advanced')) {
      complexity = 'complex';
    } else if (totalSAM > 30) {
      complexity = 'medium';
    }

    setTemplate(prev => ({
      ...prev,
      operations,
      totalSAM,
      totalRate,
      complexity
    }));
  };

  const addOperationFromLibrary = (libOperation: any) => {
    const newOperation: TemplateOperation = {
      sequence: template.operations.length + 1,
      operationCode: libOperation.code,
      operationName: libOperation.name,
      description: `${libOperation.name} operation`,
      SAM: libOperation.SAM,
      rate: libOperation.rate,
      machineType: libOperation.machineType,
      skillRequired: libOperation.skillRequired,
      dependencies: [],
      canRunParallel: [],
      qualityChecks: ['visual_inspection']
    };

    const updatedOperations = [...template.operations, newOperation];
    updateTotals(updatedOperations);
    setShowOperationLibrary(false);
  };

  const removeOperation = (index: number) => {
    const updatedOperations = template.operations.filter((_, i) => i !== index);
    // Re-sequence operations
    updatedOperations.forEach((op, i) => op.sequence = i + 1);
    updateTotals(updatedOperations);
  };

  const moveOperation = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.operations.length) return;

    const updatedOperations = [...template.operations];
    [updatedOperations[index], updatedOperations[newIndex]] = [updatedOperations[newIndex], updatedOperations[index]];
    
    // Re-sequence
    updatedOperations.forEach((op, i) => op.sequence = i + 1);
    updateTotals(updatedOperations);
  };

  const updateOperation = (index: number, field: keyof TemplateOperation, value: any) => {
    const updatedOperations = [...template.operations];
    updatedOperations[index] = { ...updatedOperations[index], [field]: value };
    updateTotals(updatedOperations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template.articleNumber || !template.articleName || template.operations.length === 0) {
      alert('Please fill in all required fields and add at least one operation');
      return;
    }

    onSave({ ...template, id: initialData?.id || `TPL-${Date.now()}` });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'complex': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Article Template' : 'Create Article Template'}
            </h2>
            <p className="text-gray-600">
              Define operations sequence and pricing for garment production
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getComplexityColor(template.complexity)}>
              {template.complexity.toUpperCase()}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Number *
              </label>
              <Input
                value={template.articleNumber}
                onChange={(e) => setTemplate(prev => ({ ...prev, articleNumber: e.target.value }))}
                placeholder="e.g., TSA-SHIRT-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Name *
              </label>
              <Input
                value={template.articleName}
                onChange={(e) => setTemplate(prev => ({ ...prev, articleName: e.target.value }))}
                placeholder="e.g., Basic Cotton Shirt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <Input
                value={template.style}
                onChange={(e) => setTemplate(prev => ({ ...prev, style: e.target.value }))}
                placeholder="e.g., Casual, Formal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={template.category}
                onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="shirt">Shirt</option>
                <option value="trouser">Trouser</option>
                <option value="jacket">Jacket</option>
                <option value="dress">Dress</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Pieces per Bundle
              </label>
              <Input
                type="number"
                value={template.estimatedPieces}
                onChange={(e) => setTemplate(prev => ({ ...prev, estimatedPieces: parseInt(e.target.value) || 12 }))}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Status
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={template.isActive}
                  onChange={(e) => setTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active Template
                </label>
              </div>
            </div>
          </div>

          {/* Template Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{template.operations.length}</div>
                <div className="text-sm text-gray-600">Operations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  {template.totalSAM}
                </div>
                <div className="text-sm text-gray-600">Total SAM</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                  <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                  {template.totalRate.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Rate</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${getComplexityColor(template.complexity)}`}>
                  {template.complexity.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Complexity</div>
              </div>
            </div>
          </div>

          {/* Operations List */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Operations Sequence</h3>
              <Button
                type="button"
                onClick={() => setShowOperationLibrary(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Operation</span>
              </Button>
            </div>

            {template.operations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CogIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No operations added yet</p>
                <p className="text-sm">Click "Add Operation" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {template.operations.map((operation, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg bg-white">
                    <div className="text-sm font-medium w-8">{operation.sequence}</div>
                    
                    <div className="flex-1">
                      <div className="font-medium">{operation.operationName}</div>
                      <div className="text-sm text-gray-600">
                        {operation.operationCode} • {operation.machineType} • {operation.skillRequired}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">{operation.SAM} min</div>
                      <div className="text-sm text-gray-600">₹{operation.rate}</div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveOperation(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveOperation(index, 'down')}
                        disabled={index === template.operations.length - 1}
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOperation(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <span>{initialData ? 'Update Template' : 'Create Template'}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Operation Library Modal */}
      {showOperationLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl m-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Operation from Library</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowOperationLibrary(false)}
                >
                  ×
                </Button>
              </div>

              <div className="mb-4">
                <div className="flex space-x-2">
                  {Object.keys(SEWING_OPERATIONS_LIBRARY).map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category as keyof typeof SEWING_OPERATIONS_LIBRARY)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                {SEWING_OPERATIONS_LIBRARY[selectedCategory].map((operation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addOperationFromLibrary(operation)}
                  >
                    <div>
                      <div className="font-medium">{operation.name}</div>
                      <div className="text-sm text-gray-600">
                        {operation.code} • {operation.machineType} • {operation.skillRequired}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{operation.SAM} min</div>
                      <div className="text-sm text-gray-600">₹{operation.rate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ArticleTemplateManager;
export { ArticleTemplateManager, SEWING_OPERATIONS_LIBRARY };