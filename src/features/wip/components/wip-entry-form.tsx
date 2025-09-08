// WIP Entry Form Component
// Handles Work In Progress entry creation with roll tracking

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface WIPEntry {
  id?: string;
  rollId: string;
  rollNumber: string;
  articleNumber: string;
  articleName: string;
  bundleCount: number;
  piecesPerBundle: number;
  totalPieces: number;
  fabricType: string;
  color: string;
  supplier: string;
  receivedDate: Date;
  qualityGrade: 'A' | 'B' | 'C';
  status: 'pending' | 'in_progress' | 'completed';
}

interface WIPEntryFormProps {
  onSave: (wipEntry: WIPEntry) => void;
  onCancel: () => void;
  initialData?: WIPEntry;
}

export const WIPEntryForm: React.FC<WIPEntryFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<WIPEntry>({
    rollId: initialData?.rollId || '',
    rollNumber: initialData?.rollNumber || '',
    articleNumber: initialData?.articleNumber || '',
    articleName: initialData?.articleName || '',
    bundleCount: initialData?.bundleCount || 1,
    piecesPerBundle: initialData?.piecesPerBundle || 12,
    totalPieces: initialData?.totalPieces || 12,
    fabricType: initialData?.fabricType || '',
    color: initialData?.color || '',
    supplier: initialData?.supplier || '',
    receivedDate: initialData?.receivedDate || new Date(),
    qualityGrade: initialData?.qualityGrade || 'A',
    status: initialData?.status || 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    }

    if (!formData.articleNumber.trim()) {
      newErrors.articleNumber = 'Article number is required';
    }

    if (!formData.articleName.trim()) {
      newErrors.articleName = 'Article name is required';
    }

    if (formData.bundleCount <= 0) {
      newErrors.bundleCount = 'Bundle count must be greater than 0';
    }

    if (formData.piecesPerBundle <= 0) {
      newErrors.piecesPerBundle = 'Pieces per bundle must be greater than 0';
    }

    if (!formData.fabricType.trim()) {
      newErrors.fabricType = 'Fabric type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WIPEntry, value: any) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-calculate total pieces
    if (field === 'bundleCount' || field === 'piecesPerBundle') {
      updatedData.totalPieces = updatedData.bundleCount * updatedData.piecesPerBundle;
    }

    setFormData(updatedData);
    
    // Clear error for this field if it was previously invalid
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate roll ID if not exists
    const wipEntryData = {
      ...formData,
      rollId: formData.rollId || `ROLL-${Date.now()}`,
      id: initialData?.id || `WIP-${Date.now()}`
    };

    onSave(wipEntryData);
  };

  const getQualityGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A': return 'default';
      case 'B': return 'secondary';
      case 'C': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit WIP Entry' : 'Create WIP Entry'}
            </h2>
            <p className="text-gray-600">
              Enter work in progress details for roll to production tracking
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getQualityGradeBadgeVariant(formData.qualityGrade)}>
              Grade {formData.qualityGrade}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Roll Information */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              Roll Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number *
                </label>
                <Input
                  value={formData.rollNumber}
                  onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                  placeholder="e.g., ROLL-001-2024"
                  className={errors.rollNumber ? 'border-red-500' : ''}
                />
                {errors.rollNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabric Type *
                </label>
                <Input
                  value={formData.fabricType}
                  onChange={(e) => handleInputChange('fabricType', e.target.value)}
                  placeholder="e.g., Cotton, Polyester"
                  className={errors.fabricType ? 'border-red-500' : ''}
                />
                {errors.fabricType && (
                  <p className="text-red-500 text-xs mt-1">{errors.fabricType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Navy Blue, White"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Grade
                </label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => handleInputChange('qualityGrade', e.target.value as 'A' | 'B' | 'C')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Basic)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received Date
                </label>
                <Input
                  type="date"
                  value={formData.receivedDate.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('receivedDate', new Date(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Article Information */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mr-2" />
              Article Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Number *
                </label>
                <Input
                  value={formData.articleNumber}
                  onChange={(e) => handleInputChange('articleNumber', e.target.value)}
                  placeholder="e.g., TSA-SHIRT-001"
                  className={errors.articleNumber ? 'border-red-500' : ''}
                />
                {errors.articleNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.articleNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Name *
                </label>
                <Input
                  value={formData.articleName}
                  onChange={(e) => handleInputChange('articleName', e.target.value)}
                  placeholder="e.g., Basic Cotton Shirt"
                  className={errors.articleName ? 'border-red-500' : ''}
                />
                {errors.articleName && (
                  <p className="text-red-500 text-xs mt-1">{errors.articleName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Production Planning */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Production Planning</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle Count *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.bundleCount}
                  onChange={(e) => handleInputChange('bundleCount', parseInt(e.target.value) || 0)}
                  className={errors.bundleCount ? 'border-red-500' : ''}
                />
                {errors.bundleCount && (
                  <p className="text-red-500 text-xs mt-1">{errors.bundleCount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pieces per Bundle *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.piecesPerBundle}
                  onChange={(e) => handleInputChange('piecesPerBundle', parseInt(e.target.value) || 0)}
                  className={errors.piecesPerBundle ? 'border-red-500' : ''}
                />
                {errors.piecesPerBundle && (
                  <p className="text-red-500 text-xs mt-1">{errors.piecesPerBundle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Pieces
                </label>
                <Input
                  type="number"
                  value={formData.totalPieces}
                  readOnly
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {formData.bundleCount} × {formData.piecesPerBundle}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{initialData ? 'Update WIP Entry' : 'Create WIP Entry'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};