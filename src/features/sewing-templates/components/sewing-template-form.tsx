import React, { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import type { SewingTemplate, SewingOperation } from '@/shared/types/sewing-template-types';

interface SewingTemplateFormProps {
  template?: SewingTemplate;
  onSave: (template: Omit<SewingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'timesUsed' | 'version'>) => void;
  onCancel: () => void;
}

export const SewingTemplateForm: React.FC<SewingTemplateFormProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    templateName: template?.templateName || '',
    templateCode: template?.templateCode || '',
    category: template?.category || '',
    operations: template?.operations || [],
    notes: template?.notes || '',
    setupInstructions: template?.setupInstructions || ''
  });

  const [newOperation, setNewOperation] = useState<Partial<SewingOperation>>({
    name: '',
    nameNepali: '',
    description: '',
    machineType: '',
    smvMinutes: 0,
    pricePerPiece: 0,
    processingType: 'sequential',
    sequenceOrder: formData.operations.length + 1,
    prerequisites: [],
    qualityCheckRequired: false,
    defectTolerance: 5,
    isOptional: false,
    notes: ''
  });

  // Calculate totals
  const totalSmv = formData.operations.reduce((sum, op) => sum + op.smvMinutes, 0);
  const totalPricePerPiece = formData.operations.reduce((sum, op) => sum + op.pricePerPiece, 0);

  // Calculate complexity level
  const getComplexityLevel = (): SewingTemplate['complexityLevel'] => {
    if (totalSmv > 30 || formData.operations.length > 10) return 'expert';
    if (totalSmv > 20 || formData.operations.length > 7) return 'complex';
    if (totalSmv > 10 || formData.operations.length > 5) return 'medium';
    return 'simple';
  };

  const addOperation = () => {
    if (newOperation.name && newOperation.smvMinutes && newOperation.pricePerPiece) {
      const operation: SewingOperation = {
        id: `op_${Date.now()}`,
        name: newOperation.name!,
        nameNepali: newOperation.nameNepali || '',
        description: newOperation.description,
        machineType: newOperation.machineType!,
        smvMinutes: newOperation.smvMinutes!,
        pricePerPiece: newOperation.pricePerPiece!,
        processingType: newOperation.processingType!,
        sequenceOrder: newOperation.sequenceOrder!,
        prerequisites: newOperation.prerequisites || [],
        qualityCheckRequired: newOperation.qualityCheckRequired || false,
        defectTolerance: newOperation.defectTolerance || 5,
        isOptional: newOperation.isOptional || false,
        notes: newOperation.notes
      };

      setFormData(prev => ({
        ...prev,
        operations: [...prev.operations, operation]
      }));

      setNewOperation({
        name: '',
        nameNepali: '',
        description: '',
        machineType: '',
        smvMinutes: 0,
        pricePerPiece: 0,
        processingType: 'sequential',
        sequenceOrder: formData.operations.length + 2,
        prerequisites: [],
        qualityCheckRequired: false,
        defectTolerance: 5,
        isOptional: false,
        notes: ''
      });
    }
  };

  const removeOperation = (operationId: string) => {
    setFormData(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.id !== operationId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.templateName && formData.templateCode && formData.category && formData.operations.length > 0) {
      onSave({
        templateName: formData.templateName,
        templateCode: formData.templateCode,
        category: formData.category,
        operations: formData.operations,
        totalSmv,
        totalPricePerPiece,
        complexityLevel: getComplexityLevel(),
        isActive: true,
        notes: formData.notes,
        setupInstructions: formData.setupInstructions
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {template ? 'Edit Sewing Template' : 'Create New Sewing Template'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <Input
              value={formData.templateName}
              onChange={(e) => setFormData(prev => ({ ...prev, templateName: e.target.value }))}
              placeholder="Enter template name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Code *
            </label>
            <Input
              value={formData.templateCode}
              onChange={(e) => setFormData(prev => ({ ...prev, templateCode: e.target.value }))}
              placeholder="e.g., TSHIRT_BASIC"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., T-Shirt, Polo"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Template notes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Instructions
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.setupInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, setupInstructions: e.target.value }))}
              placeholder="Setup instructions"
            />
          </div>
        </div>

        {/* Template Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Template Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Operations:</span>
              <span className="font-medium ml-1">{formData.operations.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Total SMV:</span>
              <span className="font-medium ml-1">{totalSmv} min</span>
            </div>
            <div>
              <span className="text-blue-700">Total Cost:</span>
              <span className="font-medium ml-1">Rs. {totalPricePerPiece}</span>
            </div>
            <div>
              <span className="text-blue-700">Complexity:</span>
              <span className="font-medium ml-1 capitalize">{getComplexityLevel()}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations</h3>
          
          {formData.operations.length > 0 && (
            <div className="mb-6">
              <div className="space-y-3">
                {formData.operations.map((operation, index) => (
                  <div key={operation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">#{operation.sequenceOrder}</span>
                        <h4 className="font-medium text-gray-900">{operation.name}</h4>
                        <span className="text-sm text-gray-600">{operation.smvMinutes} SMV</span>
                        <span className="text-sm text-gray-600">Rs. {operation.pricePerPiece}</span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {operation.machineType}
                        </span>
                      </div>
                      {operation.description && (
                        <p className="text-sm text-gray-600 mt-1 ml-8">{operation.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOperation(operation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">Add New Operation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operation Name *
                </label>
                <Input
                  value={newOperation.name || ''}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Shoulder Join"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMV (auto) *
                </label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newOperation.smvMinutes || ''}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, smvMinutes: parseFloat(e.target.value) || 0 }))}
                  placeholder="Auto-calculated"
                  title="Auto-calculated from price × 1.9, but editable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs.) *
                </label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newOperation.pricePerPiece || ''}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const autoSmv = price * 1.9; // Auto-calculate SMV
                    setNewOperation(prev => ({ 
                      ...prev, 
                      pricePerPiece: price,
                      smvMinutes: autoSmv 
                    }));
                  }}
                  placeholder="2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Type *
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newOperation.machineType || ''}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, machineType: e.target.value }))}
                >
                  <option value="">Select Machine Type</option>
                  <option value="overlock">Overlock</option>
                  <option value="flatlock">Flatlock</option>
                  <option value="singleNeedle">Single Needle</option>
                  <option value="doubleNeedle">Double Needle</option>
                  <option value="kansai">Kansai</option>
                  <option value="buttonhole">Buttonhole</option>
                  <option value="buttonAttach">Button Attach</option>
                  <option value="iron">Iron/Press</option>
                  <option value="cutting">Cutting Machine</option>
                  <option value="manual">Manual Work</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Type
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newOperation.processingType || 'sequential'}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, processingType: e.target.value as 'parallel' | 'sequential' }))}
                >
                  <option value="sequential">Sequential</option>
                  <option value="parallel">Parallel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newOperation.qualityCheckRequired || false}
                    onChange={(e) => setNewOperation(prev => ({ ...prev, qualityCheckRequired: e.target.checked }))}
                    className="mr-2"
                  />
                  Quality Check Required
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newOperation.isOptional || false}
                    onChange={(e) => setNewOperation(prev => ({ ...prev, isOptional: e.target.checked }))}
                    className="mr-2"
                  />
                  Optional
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Defect Tolerance (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newOperation.defectTolerance || 5}
                  onChange={(e) => setNewOperation(prev => ({ ...prev, defectTolerance: parseInt(e.target.value) || 5 }))}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addOperation}
                disabled={!newOperation.name || !newOperation.smvMinutes || !newOperation.pricePerPiece || !newOperation.machineType}
              >
                Add Operation
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.templateName || !formData.templateCode || !formData.category || formData.operations.length === 0}
          >
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  );
};