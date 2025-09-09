import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Copy, Download, Upload, Eye, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';
import { sewingTemplateService } from '@/services/sewing-template-service';
import { SewingTemplateForm } from './sewing-template-form';
import { SewingTemplateView } from './sewing-template-view';
import { useAuthStore } from '@/app/store/auth-store';

export const SewingTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<SewingTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<SewingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGarmentType, setSelectedGarmentType] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<SewingTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedGarmentType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await sewingTemplateService.getAllTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      } else {
        setError(result.error || 'Failed to load templates');
      }
    } catch (error) {
      setError('Failed to load templates');
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.templateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.articleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.articleName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Garment type filter
    if (selectedGarmentType !== 'all') {
      filtered = filtered.filter(template => template.garmentType === selectedGarmentType);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setCurrentView('create');
  };

  const handleEditTemplate = (template: SewingTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('edit');
  };

  const handleViewTemplate = (template: SewingTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('view');
  };

  const handleDeleteTemplate = async (template: SewingTemplate) => {
    if (!confirm(`Are you sure you want to delete template "${template.templateName}"?`)) {
      return;
    }

    try {
      const result = await sewingTemplateService.deleteTemplate(template.id!);
      if (result.success) {
        await loadTemplates();
      } else {
        setError(result.error || 'Failed to delete template');
      }
    } catch (error) {
      setError('Failed to delete template');
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: SewingTemplate) => {
    try {
      const duplicateData = {
        templateName: `${template.templateName} (Copy)`,
        templateCode: `${template.templateCode}_COPY`,
        articleCode: template.articleCode,
        articleName: template.articleName,
        articleNameNepali: template.articleNameNepali,
        garmentType: template.garmentType,
        operations: template.operations.map(op => ({
          name: op.name,
          nameNepali: op.nameNepali,
          description: op.description,
          machineType: op.machineType,
          estimatedTimeMinutes: op.estimatedTimeMinutes,
          skillLevelRequired: op.skillLevelRequired,
          pricePerPiece: op.pricePerPiece,
          pricePerMinute: op.pricePerMinute,
          dependencies: [...op.dependencies],
          canRunParallel: op.canRunParallel,
          parallelGroup: op.parallelGroup,
          qualityCheckRequired: op.qualityCheckRequired,
          defectTolerance: op.defectTolerance,
          isOptional: op.isOptional,
          notes: op.notes
        })),
        complexityLevel: template.complexityLevel,
        notes: template.notes,
        setupInstructions: template.setupInstructions,
        qualityNotes: template.qualityNotes
      };

      const result = await sewingTemplateService.createTemplate(duplicateData, user?.id || 'system');
      if (result.success) {
        await loadTemplates();
      } else {
        setError(result.error || 'Failed to duplicate template');
      }
    } catch (error) {
      setError('Failed to duplicate template');
      console.error('Error duplicating template:', error);
    }
  };

  const handleExportTemplate = async (template: SewingTemplate) => {
    try {
      const result = await sewingTemplateService.exportTemplate(template.id!);
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.templateCode}_template.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError('Failed to export template');
      console.error('Error exporting template:', error);
    }
  };

  const handleFormSuccess = async (templateData: Omit<SewingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'timesUsed' | 'version'>) => {
    try {
      const result = currentView === 'edit' && selectedTemplate
        ? await sewingTemplateService.updateTemplate(selectedTemplate.id!, templateData, user?.id || 'system')
        : await sewingTemplateService.createTemplate(templateData, user?.id || 'system');
      
      if (result.success) {
        setCurrentView('list');
        loadTemplates();
      } else {
        setError(result.error || 'Failed to save template');
      }
    } catch (error) {
      setError('Failed to save template');
      console.error('Error saving template:', error);
    }
  };

  const getComplexityBadgeColor = (complexity: SewingTemplate['complexityLevel']) => {
    switch (complexity) {
      case 'simple': return 'success';
      case 'medium': return 'warning';
      case 'complex': return 'danger';
      case 'expert': return 'destructive';
      default: return 'secondary';
    }
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="p-6">
        <SewingTemplateForm
          template={selectedTemplate}
          onSave={handleFormSuccess}
          onCancel={() => setCurrentView('list')}
        />
      </div>
    );
  }

  if (currentView === 'view' && selectedTemplate) {
    return (
      <div className="p-6">
        <SewingTemplateView
          template={selectedTemplate}
          onEdit={() => setCurrentView('edit')}
          onClose={() => setCurrentView('list')}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sewing Template Manager
        </h1>
        <p className="text-gray-600">
          Create and manage sewing templates for different garment types
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedGarmentType}
            onChange={(e) => setSelectedGarmentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Garment Types</option>
            <option value="tshirt">T-Shirt</option>
            <option value="polo">Polo Shirt</option>
            <option value="dress">Dress</option>
            <option value="pants">Pants</option>
            <option value="shirt">Shirt</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {template.templateName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Code: {template.templateCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Article: {template.articleCode} - {template.articleName}
                  </p>
                </div>
                <Badge color={getComplexityBadgeColor(template.complexityLevel)}>
                  {template.complexityLevel}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operations:</span>
                  <span className="font-medium">{template.operations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Time:</span>
                  <span className="font-medium">{template.totalEstimatedTime} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Cost:</span>
                  <span className="font-medium">Rs. {template.totalEstimatedCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Times Used:</span>
                  <span className="font-medium">{template.timesUsed}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  color="danger"
                  onClick={() => handleDeleteTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>

              {/* Template Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Version {template.version}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedGarmentType !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first sewing template to get started.'
            }
          </p>
          {(!searchTerm && selectedGarmentType === 'all') && (
            <Button onClick={handleCreateTemplate} className="flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Create First Template
            </Button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && filteredTemplates.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Template Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredTemplates.length}</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredTemplates.filter(t => t.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredTemplates.reduce((sum, t) => sum + t.totalEstimatedTime, 0) / filteredTemplates.length)}
              </div>
              <div className="text-sm text-gray-600">Avg. Time (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                Rs. {Math.round(filteredTemplates.reduce((sum, t) => sum + t.totalEstimatedCost, 0) / filteredTemplates.length)}
              </div>
              <div className="text-sm text-gray-600">Avg. Cost</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};