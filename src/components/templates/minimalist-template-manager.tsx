import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import { 
  PlusIcon, 
  SearchIcon, 
  SettingsIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  TrendingUpIcon,
  EyeIcon,
  EditIcon,
  MoreVerticalIcon,
  ChevronRightIcon,
  BarChart3Icon,
  XIcon
} from 'lucide-react';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';
import { sewingTemplateService } from '@/services/sewing-template-service';
import { safeFormatDate } from '@/utils/nepali-date';
import { InteractiveTemplateCreator } from './interactive-template-creator';
import { TemplateInfographics } from './template-infographics';

interface MinimalistTemplateManagerProps {
  onTemplateSelect?: (template: SewingTemplate) => void;
}

export const MinimalistTemplateManager: React.FC<MinimalistTemplateManagerProps> = ({
  onTemplateSelect
}) => {
  const [templates, setTemplates] = useState<SewingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SewingTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await sewingTemplateService.getActiveTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.templateCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    avgSmv: templates.length > 0 ? Math.round(templates.reduce((sum, t) => sum + t.totalSmv, 0) / templates.length) : 0,
    avgCost: templates.length > 0 ? (templates.reduce((sum, t) => sum + t.totalPricePerPiece, 0) / templates.length).toFixed(2) : '0'
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const result = await sewingTemplateService.createTemplate(templateData, 'user');
      if (result.success) {
        await loadTemplates();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      't-shirt': '👕',
      'shirt': '👔', 
      'pant': '👖',
      'jacket': '🧥',
      'dress': '👗',
      'underwear': '🩲',
      'tshirt': '👕',
      'tops': '👔'
    };
    return icons[category] || '👔';
  };

  if (showCreateModal) {
    return (
      <InteractiveTemplateCreator
        onSave={handleCreateTemplate}
        onCancel={() => setShowCreateModal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Templates</h1>
              <p className="text-sm text-gray-500">{stats.total} templates available</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.avgSmv}m</div>
            <div className="text-xs text-gray-500">Avg SMV</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">₹{stats.avgCost}</div>
            <div className="text-xs text-gray-500">Avg Cost</div>
          </div>
        </div>
      </div>

      {/* Template Cards */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Create your first template to get started'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                onClick={() => onTemplateSelect?.(template)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {template.templateName}
                          </h3>
                          <p className="text-sm text-gray-500 font-mono">{template.templateCode}</p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getComplexityColor(template.complexityLevel)}`}
                        >
                          {template.complexityLevel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-900">{template.operations.length}</div>
                          <div className="text-xs text-gray-500">Operations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-blue-600">{template.totalSmv}m</div>
                          <div className="text-xs text-gray-500">SMV</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-green-600">₹{template.totalPricePerPiece.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Cost</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>Used {template.timesUsed || 0}x</span>
                          <span>v{template.version || 1}</span>
                        </div>
                        <div className="text-gray-400">
                          {safeFormatDate(template.updatedAt || template.createdAt, 'relative')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-3 flex items-center">
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};