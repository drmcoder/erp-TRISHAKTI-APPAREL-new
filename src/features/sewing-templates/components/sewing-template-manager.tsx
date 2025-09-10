import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Copy, Download, Upload, Eye, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';
import { sewingTemplateService } from '@/services/sewing-template-service';
// Temporarily disabled to fix loading issue
// import { SewingTemplateForm } from './sewing-template-form';
// import { SewingTemplateView } from './sewing-template-view';
import { useAuthStore } from '@/app/store/auth-store';
import { safeFormatDate } from '@/utils/nepali-date';

const SewingTemplateManager: React.FC = () => {
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
      const result = await sewingTemplateService.getActiveTemplates();
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
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedGarmentType !== 'all') {
      filtered = filtered.filter(template => template.category === selectedGarmentType);
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
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Enhanced Header with Background */}
      <div className="mb-8 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl">🧵</span>
              Sewing Template Manager
            </h1>
            <p className="text-blue-100 text-lg">
              Create and manage sewing templates for different garment types
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 mb-2">
              <div className="text-2xl font-bold">{templates.length}</div>
              <div className="text-sm text-blue-100">Total Templates</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</div>
              <div className="text-sm text-blue-100">Active</div>
            </div>
          </div>
        </div>
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

      {/* Enhanced Controls */}
      <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search templates by name, code, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm"
              />
            </div>

            <div className="min-w-[220px]">
              <select
                value={selectedGarmentType}
                onChange={(e) => setSelectedGarmentType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-gray-50"
              >
                <option value="all">🔍 All Garment Types</option>
                <option value="tshirt">👕 T-Shirt</option>
                <option value="polo">🏌️ Polo Shirt</option>
                <option value="dress">👗 Dress</option>
                <option value="pants">👖 Pants</option>
                <option value="shirt">👔 Shirt</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button
              onClick={handleCreateTemplate}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>
        </div>
        
        {/* Filter Summary */}
        {(searchTerm || selectedGarmentType !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📊 Showing {filteredTemplates.length} of {templates.length} templates</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {selectedGarmentType !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Category: {selectedGarmentType}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-700 font-medium">Loading Templates...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your sewing templates</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-md overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 line-clamp-2">
                      {template.templateName || 'Untitled Template'}
                    </h3>
                    <p className="text-blue-100 text-sm flex items-center gap-1">
                      <span>🏷️</span> {template.templateCode || 'No Code'}
                    </p>
                  </div>
                  <Badge 
                    className={`${getComplexityBadgeColor(template.complexityLevel)} text-xs font-semibold`}
                  >
                    {template.complexityLevel?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>
                
                {/* Category */}
                <div className="text-blue-100 text-sm">
                  📝 {template.category || 'No Category'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {template.operations?.length || 0}
                    </div>
                    <div className="text-xs text-blue-500 font-medium">Operations</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {template.totalSmv || template.totalEstimatedTime || 0}
                    </div>
                    <div className="text-xs text-green-500 font-medium">SMV (min)</div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      💰 Est. Cost:
                    </span>
                    <span className="font-bold text-purple-600">
                      ₹{template.totalPricePerPiece || template.totalEstimatedCost || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      📊 Usage Count:
                    </span>
                    <span className="font-semibold text-orange-600">
                      {template.timesUsed || 0}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      📅 Version:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      v{template.version || 1}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTemplate(template)}
                    className="flex items-center justify-center gap-1 hover:bg-blue-50 border-blue-200 text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="flex items-center justify-center gap-1 hover:bg-green-50 border-green-200 text-green-600"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-1 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    className="flex items-center gap-1 text-xs hover:bg-gray-50 px-2 py-1"
                    title="Duplicate Template"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportTemplate(template)}
                    className="flex items-center gap-1 text-xs hover:bg-gray-50 px-2 py-1"
                    title="Export Template"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template)}
                    className="flex items-center gap-1 text-xs hover:bg-red-50 text-red-500 border-red-200 px-2 py-1"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Template Status Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        template.isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          template.isActive ? 'bg-green-400' : 'bg-gray-400'
                        }`}></span>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Updated {safeFormatDate(template.updatedAt || template.createdAt, 'relative')}
                    </div>
                  </div>
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

      {/* Enhanced Summary Stats */}
      {!loading && filteredTemplates.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              📊 Template Analytics
            </h3>
            <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1 text-sm font-medium">
              {searchTerm || selectedGarmentType !== 'all' ? 'Filtered View' : 'All Templates'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Templates */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{filteredTemplates.length}</div>
                  <div className="text-sm text-blue-500 font-medium">Total Templates</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {((filteredTemplates.length / templates.length) * 100).toFixed(1)}% of all templates
              </div>
            </div>

            {/* Active Templates */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {filteredTemplates.filter(t => t.isActive).length}
                  </div>
                  <div className="text-sm text-green-500 font-medium">Active Templates</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {((filteredTemplates.filter(t => t.isActive).length / filteredTemplates.length) * 100).toFixed(1)}% active rate
              </div>
            </div>

            {/* Average SMV */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">
                    {filteredTemplates.length > 0 
                      ? Math.round(filteredTemplates.reduce((sum, t) => sum + (t.totalSmv || 0), 0) / filteredTemplates.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-orange-500 font-medium">Avg. SMV (min)</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Standard Minute Value
              </div>
            </div>

            {/* Average Cost */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    ₹{filteredTemplates.length > 0 
                      ? Math.round(filteredTemplates.reduce((sum, t) => sum + (t.totalPricePerPiece || 0), 0) / filteredTemplates.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-purple-500 font-medium">Avg. Cost per Piece</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Production cost estimate
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Most Complex</div>
              <div className="text-lg font-bold text-red-600">
                {filteredTemplates.filter(t => t.complexityLevel === 'expert').length} Expert
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Most Used</div>
              <div className="text-lg font-bold text-indigo-600">
                {Math.max(...filteredTemplates.map(t => t.timesUsed || 0), 0)}x Usage
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Categories</div>
              <div className="text-lg font-bold text-teal-600">
                {[...new Set(filteredTemplates.map(t => t.category))].length} Types
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SewingTemplateManager;
export { SewingTemplateManager };