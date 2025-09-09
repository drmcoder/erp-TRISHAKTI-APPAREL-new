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

  const [operationErrors, setOperationErrors] = useState<string[]>([]);
  const [operationAdded, setOperationAdded] = useState(false);
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

  const validateOperation = () => {
    const errors: string[] = [];
    if (!newOperation.name?.trim()) errors.push('Operation name is required');
    if (!newOperation.machineType?.trim()) errors.push('Machine type is required');
    if (!newOperation.smvMinutes || newOperation.smvMinutes <= 0) errors.push('SMV must be greater than 0');
    if (!newOperation.pricePerPiece || newOperation.pricePerPiece <= 0) errors.push('Price must be greater than 0');
    return errors;
  };

  const addOperation = () => {
    const validationErrors = validateOperation();
    setOperationErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const operation: SewingOperation = {
        id: `op_${Date.now()}`,
        name: newOperation.name!.trim(),
        nameNepali: newOperation.nameNepali?.trim() || '',
        description: newOperation.description?.trim(),
        machineType: newOperation.machineType!,
        smvMinutes: newOperation.smvMinutes!,
        pricePerPiece: newOperation.pricePerPiece!,
        processingType: newOperation.processingType!,
        sequenceOrder: formData.operations.length + 1,
        prerequisites: newOperation.prerequisites || [],
        qualityCheckRequired: newOperation.qualityCheckRequired || false,
        defectTolerance: newOperation.defectTolerance || 5,
        isOptional: newOperation.isOptional || false,
        notes: newOperation.notes?.trim()
      };

      setFormData(prev => ({
        ...prev,
        operations: [...prev.operations, operation]
      }));

      // Clear form after successful addition - with immediate state reset
      const clearedOperation = {
        name: '',
        nameNepali: '',
        description: '',
        machineType: '',
        smvMinutes: 0,
        pricePerPiece: 0,
        processingType: 'sequential' as const,
        sequenceOrder: formData.operations.length + 2,
        prerequisites: [],
        qualityCheckRequired: false,
        defectTolerance: 5,
        isOptional: false,
        notes: ''
      };
      
      setNewOperation(clearedOperation);
      
      // Clear any previous errors
      setOperationErrors([]);
      
      // Show success feedback
      setOperationAdded(true);
      setTimeout(() => setOperationAdded(false), 2000); // Clear success message after 2 seconds
      console.log('✓ Operation added successfully, form cleared');
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
                  onChange={(e) => {
                    setNewOperation(prev => ({ ...prev, name: e.target.value }));
                    // Clear errors and success feedback when user types
                    if (operationErrors.length > 0) {
                      setOperationErrors([]);
                    }
                    if (operationAdded) {
                      setOperationAdded(false);
                    }
                  }}
                  placeholder="e.g., Shoulder Join"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMV (auto) *
                  {newOperation.pricePerPiece > 0 && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Auto: {(newOperation.pricePerPiece * 1.9).toFixed(2)}
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newOperation.smvMinutes || ''}
                  onChange={(e) => {
                    setNewOperation(prev => ({ ...prev, smvMinutes: parseFloat(e.target.value) || 0 }));
                    // Clear errors when user types
                    if (operationErrors.length > 0) {
                      setOperationErrors([]);
                    }
                  }}
                  placeholder="Auto-calculated from price"
                  title="Auto-calculated from price × 1.9, but editable"
                  className={newOperation.pricePerPiece > 0 ? 'bg-blue-50 border-blue-300' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs.) *
                  {newOperation.pricePerPiece > 0 && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      → SMV: {(newOperation.pricePerPiece * 1.9).toFixed(2)}
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newOperation.pricePerPiece || ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const price = inputValue === '' ? 0 : parseFloat(inputValue);
                    
                    // Only calculate SMV if we have a valid price > 0
                    const autoSmv = price > 0 ? parseFloat((price * 1.9).toFixed(2)) : 0;
                    
                    console.log(`Price changed: ${price} → SMV: ${autoSmv}`); // Debug log
                    
                    setNewOperation(prev => ({ 
                      ...prev, 
                      pricePerPiece: price,
                      smvMinutes: autoSmv 
                    }));
                    
                    // Clear errors when user types
                    if (operationErrors.length > 0) {
                      setOperationErrors([]);
                    }
                  }}
                  placeholder="2.5"
                  className="focus:ring-2 focus:ring-green-500"
                />
                {newOperation.pricePerPiece > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ SMV auto-calculated: {newOperation.pricePerPiece} × 1.9 = {(newOperation.pricePerPiece * 1.9).toFixed(2)}
                  </p>
                )}
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
                  onChange={(e) => {
                    setNewOperation(prev => ({ ...prev, machineType: e.target.value }));
                    // Clear errors when user selects
                    if (operationErrors.length > 0) {
                      setOperationErrors([]);
                    }
                  }}
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

            {/* Operation Validation Errors */}
            {operationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</p>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {operationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addOperation}
                className={`w-full md:w-auto transition-all duration-200 ${
                  operationAdded 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                {operationAdded ? '✓ Added Successfully!' : 'Add Operation'}
              </Button>
              
              {operationAdded && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Operation added! Form cleared and ready for next operation.
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                SMV will auto-calculate from price (Price × 1.9), but you can edit it manually
              </p>
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