import React from 'react';
import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { 
  ClockIcon,
  CurrencyRupeeIcon,
  CpuChipIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';

interface SewingTemplateViewProps {
  template: SewingTemplate;
  onBack: () => void;
  onEdit: () => void;
}

export const SewingTemplateView: React.FC<SewingTemplateViewProps> = ({
  template,
  onBack,
  onEdit
}) => {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.templateName}</h1>
            <p className="text-sm text-gray-500">{template.templateCode}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={template.isActive ? 'success' : 'secondary'}>
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button onClick={onEdit}>
            Edit Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-sm text-gray-900">{template.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <p className="text-sm text-gray-900">v{template.version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                <Badge variant="secondary">{template.complexityLevel}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Times Used</label>
                <p className="text-sm text-gray-900">{template.timesUsed || 0}</p>
              </div>
            </div>
            
            {template.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-sm text-gray-600">{template.notes}</p>
              </div>
            )}
            
            {template.setupInstructions && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Setup Instructions</label>
                <p className="text-sm text-gray-600">{template.setupInstructions}</p>
              </div>
            )}
          </Card>

          {/* Operations List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sewing Operations ({template.operations.length})
            </h3>
            <div className="space-y-3">
              {template.operations.map((operation, index) => (
                <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        #{operation.sequenceOrder}
                      </span>
                      <h4 className="font-medium text-gray-900">{operation.name}</h4>
                      <span className="text-sm text-gray-500">({operation.nameNepali})</span>
                    </div>
                    <Badge variant={operation.processingType === 'parallel' ? 'success' : 'secondary'}>
                      {operation.processingType}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <CpuChipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Machine:</span>
                      <span className="font-medium">{operation.machineType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">SMV:</span>
                      <span className="font-medium">{operation.smvMinutes}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">Rs. {operation.pricePerPiece}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Quality:</span>
                      <span className={`font-medium ${operation.qualityCheckRequired ? 'text-orange-600' : 'text-green-600'}`}>
                        {operation.qualityCheckRequired ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  </div>
                  
                  {operation.prerequisites && operation.prerequisites.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Prerequisites: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {operation.prerequisites.map((prereq, idx) => (
                          <Badge key={idx} variant="outline" size="sm">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {operation.notes && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">{operation.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Operations:</span>
                <span className="font-semibold">{template.operations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total SMV:</span>
                <span className="font-semibold">{template.totalSmv} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Cost:</span>
                <span className="font-semibold">Rs. {template.totalPricePerPiece}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Parallel Ops:</span>
                <span className="font-semibold">
                  {template.operations.filter(op => op.processingType === 'parallel').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sequential Ops:</span>
                <span className="font-semibold">
                  {template.operations.filter(op => op.processingType === 'sequential').length}
                </span>
              </div>
            </div>
          </Card>

          {/* Machine Types Used */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Types</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(template.operations.map(op => op.machineType))).map((machine, index) => (
                <Badge key={index} variant="outline">
                  {machine}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">{formatDate(template.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2">{formatDate(template.updatedAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Created By:</span>
                <span className="ml-2">{template.createdBy}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};