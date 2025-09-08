// Integrated Production Manager
// Complete workflow: WIP Entry → Template Mapping → Bundle Creation → Work Monitoring

import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Badge, Stack, Flex,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/shared/components/ui';
import {
  PlusIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/shared/utils';

// Import our new components
import { EnhancedWIPEntryForm, EnhancedWIPEntry } from '@/features/wip/components/enhanced-wip-entry-form';
import { SewingTemplateManager, SewingTemplate } from '@/features/templates/components/sewing-template-manager';
import { integratedWIPBundleService, EnhancedProductionBundle } from '@/services/integrated-wip-bundle-service';

interface IntegratedProductionManagerProps {
  userRole: 'management' | 'supervisor' | 'admin';
}

export const IntegratedProductionManager: React.FC<IntegratedProductionManagerProps> = ({
  userRole
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('wip-entry');
  const [wipEntries, setWipEntries] = useState<EnhancedWIPEntry[]>([]);
  const [sewingTemplates, setSewingTemplates] = useState<SewingTemplate[]>([]);
  const [productionBundles, setProductionBundles] = useState<EnhancedProductionBundle[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [wipEntryModal, setWipEntryModal] = useState({ isOpen: false, editingEntry: null as EnhancedWIPEntry | null });
  const [templateModal, setTemplateModal] = useState({ isOpen: false, editingTemplate: null as SewingTemplate | null });
  const [bundleCreationModal, setBundleCreationModal] = useState({ 
    isOpen: false, 
    wipEntry: null as EnhancedWIPEntry | null,
    templateMappings: {} as Record<string, string>
  });

  // Statistics
  const [stats, setStats] = useState({
    totalWIPEntries: 0,
    totalBundles: 0,
    completedBundles: 0,
    activeOperators: 0,
    todayProduction: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load production stats
      const productionStats = await integratedWIPBundleService.getProductionStats('today');
      
      setStats({
        totalWIPEntries: wipEntries.length,
        totalBundles: productionStats.totalBundles,
        completedBundles: productionStats.completedBundles,
        activeOperators: productionStats.activeOperators.size,
        todayProduction: productionStats.completedPieces
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWIPEntry = async (wipEntry: EnhancedWIPEntry) => {
    try {
      // In a real implementation, save to database
      console.log('Saving WIP entry:', wipEntry);
      
      setWipEntries(prev => {
        if (wipEntryModal.editingEntry) {
          return prev.map(entry => entry.id === wipEntry.id ? wipEntry : entry);
        } else {
          return [...prev, { ...wipEntry, id: `wip_${Date.now()}` }];
        }
      });
      
      setWipEntryModal({ isOpen: false, editingEntry: null });
      await loadDashboardData();
    } catch (error) {
      console.error('Error saving WIP entry:', error);
    }
  };

  const handleSaveSewingTemplate = async (template: SewingTemplate) => {
    try {
      console.log('Saving sewing template:', template);
      
      setSewingTemplates(prev => {
        if (templateModal.editingTemplate) {
          return prev.map(t => t.id === template.id ? template : t);
        } else {
          return [...prev, template];
        }
      });
      
      setTemplateModal({ isOpen: false, editingTemplate: null });
    } catch (error) {
      console.error('Error saving sewing template:', error);
    }
  };

  const openBundleCreation = (wipEntry: EnhancedWIPEntry) => {
    // Initialize template mappings
    const mappings: Record<string, string> = {};
    wipEntry.articles.forEach(article => {
      // Try to find matching template by garment type
      const matchingTemplate = sewingTemplates.find(t => t.garmentType === article.garmentType && t.isActive);
      if (matchingTemplate) {
        mappings[article.id] = matchingTemplate.id;
      }
    });
    
    setBundleCreationModal({
      isOpen: true,
      wipEntry,
      templateMappings: mappings
    });
  };

  const handleCreateBundles = async () => {
    if (!bundleCreationModal.wipEntry) return;
    
    try {
      setLoading(true);
      
      const bundles = await integratedWIPBundleService.createBundlesFromWIP(
        bundleCreationModal.wipEntry,
        bundleCreationModal.templateMappings
      );
      
      setProductionBundles(prev => [...prev, ...bundles]);
      setBundleCreationModal({ isOpen: false, wipEntry: null, templateMappings: {} });
      
      await loadDashboardData();
      
      console.log(`✅ Created ${bundles.length} bundles successfully!`);
    } catch (error) {
      console.error('Error creating bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'gray',
      'cutting_ready': 'yellow',
      'bundles_created': 'blue',
      'in_production': 'green',
      'ready': 'blue',
      'assigned': 'yellow',
      'in_progress': 'green',
      'completed': 'green',
      'on_hold': 'red'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Management</h1>
          <p className="text-gray-600">Complete production workflow management system</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" disabled={loading}>
          <ChartBarIcon className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="text-center">
            <ClipboardDocumentListIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <Text size="xl" weight="bold">{stats.totalWIPEntries}</Text>
            <Text size="sm" color="muted">WIP Entries</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <CubeIcon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <Text size="xl" weight="bold">{stats.totalBundles}</Text>
            <Text size="sm" color="muted">Total Bundles</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <Text size="xl" weight="bold">{stats.completedBundles}</Text>
            <Text size="sm" color="muted">Completed</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <Text size="xl" weight="bold">{stats.activeOperators}</Text>
            <Text size="sm" color="muted">Active Operators</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <PlayIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
            <Text size="xl" weight="bold">{stats.todayProduction}</Text>
            <Text size="sm" color="muted">Today's Production</Text>
          </CardBody>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card>
        <CardBody>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="wip-entry">WIP Entry</TabsTrigger>
              <TabsTrigger value="templates">Sewing Templates</TabsTrigger>
              <TabsTrigger value="bundles">Production Bundles</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            </TabsList>
            
            {/* WIP Entry Tab */}
            <TabsContent value="wip-entry" className="space-y-4">
              <Flex justify="between" align="center">
                <Text size="lg" weight="medium">Work In Progress Entries</Text>
                <Button onClick={() => setWipEntryModal({ isOpen: true, editingEntry: null })}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New WIP Entry
                </Button>
              </Flex>
              
              <div className="space-y-4">
                {wipEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <Text>No WIP entries yet. Create your first entry to get started.</Text>
                  </div>
                ) : (
                  wipEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardBody>
                        <Flex justify="between" align="center" className="mb-3">
                          <div>
                            <Flex align="center" gap={2} className="mb-1">
                              <Text weight="medium">{entry.batchNumber}</Text>
                              <Badge variant={getStatusColor(entry.status) as any}>
                                {entry.status}
                              </Badge>
                            </Flex>
                            <Text size="sm" color="muted">
                              Lot: {entry.lotNumber} • Articles: {entry.articles.length} • Rolls: {entry.rolls.length}
                            </Text>
                          </div>
                          
                          <Flex gap={2}>
                            {entry.status === 'cutting_ready' && (
                              <Button size="sm" onClick={() => openBundleCreation(entry)}>
                                <CubeIcon className="w-4 h-4 mr-1" />
                                Create Bundles
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setWipEntryModal({ isOpen: true, editingEntry: entry })}
                            >
                              <CogIcon className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Flex>
                        </Flex>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <Text size="xs" color="muted">Total Garments</Text>
                            <Text weight="medium">{entry.totalGarments}</Text>
                          </div>
                          <div>
                            <Text size="xs" color="muted">Total Pieces</Text>
                            <Text weight="medium">{entry.totalPieces}</Text>
                          </div>
                          <div>
                            <Text size="xs" color="muted">Created</Text>
                            <Text weight="medium">{new Date(entry.createdDate).toLocaleDateString()}</Text>
                          </div>
                          <div>
                            <Text size="xs" color="muted">Created By</Text>
                            <Text weight="medium">{entry.createdBy}</Text>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <Text color="muted">{entry.notes}</Text>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Sewing Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <Flex justify="between" align="center">
                <Text size="lg" weight="medium">Sewing Templates</Text>
                <Button onClick={() => setTemplateModal({ isOpen: true, editingTemplate: null })}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </Flex>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sewingTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardBody>
                      <Flex justify="between" align="start" className="mb-3">
                        <div>
                          <Text weight="medium">{template.name}</Text>
                          <Text size="sm" color="muted">{template.nameNepali}</Text>
                        </div>
                        <Badge variant={template.isActive ? 'green' : 'gray'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Flex>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <Text color="muted">Garment Type:</Text>
                          <Text weight="medium">{template.garmentType}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text color="muted">Steps:</Text>
                          <Text weight="medium">{template.steps.length}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text color="muted">Total Time:</Text>
                          <Text weight="medium">{template.totalEstimatedTime} min</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text color="muted">Total Cost:</Text>
                          <Text weight="medium">₹{template.totalCost.toFixed(2)}</Text>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setTemplateModal({ isOpen: true, editingTemplate: template })}
                          className="w-full"
                        >
                          <CogIcon className="w-4 h-4 mr-1" />
                          Edit Template
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
                
                {sewingTemplates.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <Text>No sewing templates yet. Create templates for your garment types.</Text>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Production Bundles Tab */}
            <TabsContent value="bundles" className="space-y-4">
              <Text size="lg" weight="medium">Production Bundles</Text>
              
              <div className="space-y-4">
                {productionBundles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CubeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <Text>No production bundles yet. Create bundles from WIP entries.</Text>
                  </div>
                ) : (
                  productionBundles.map((bundle) => (
                    <Card key={bundle.id}>
                      <CardBody>
                        <Flex justify="between" align="center" className="mb-3">
                          <div>
                            <Flex align="center" gap={2} className="mb-1">
                              <Text weight="medium">{bundle.bundleNumber}</Text>
                              <Badge variant={getStatusColor(bundle.status) as any}>
                                {bundle.status}
                              </Badge>
                              <Badge variant="purple" size="sm">
                                {bundle.priority}
                              </Badge>
                            </Flex>
                            <Text size="sm" color="muted">
                              {bundle.articleNumber} • {bundle.color} • {bundle.size} • {bundle.pieces} pieces
                            </Text>
                          </div>
                          
                          <Text size="sm" color="green" weight="medium">
                            Estimated: {bundle.estimatedCompletionTime} min
                          </Text>
                        </Flex>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <Text size="xs" color="muted">Current Step</Text>
                            <Text weight="medium">{bundle.currentStep}/{bundle.processSteps.length}</Text>
                          </div>
                          <div>
                            <Text size="xs" color="muted">Assigned Operators</Text>
                            <Text weight="medium">{bundle.assignedOperators.length}</Text>
                          </div>
                          <div>
                            <Text size="xs" color="muted">Quality Grade</Text>
                            <Badge size="xs" variant="blue">{bundle.qualityGrade}</Badge>
                          </div>
                          <div>
                            <Text size="xs" color="muted">Roll</Text>
                            <Text weight="medium">{bundle.rollNumber}</Text>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <Text color="muted">Progress</Text>
                            <Text color="muted">
                              {bundle.processSteps.filter(s => s.status === 'completed').length} / {bundle.processSteps.length} steps
                            </Text>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(bundle.processSteps.filter(s => s.status === 'completed').length / bundle.processSteps.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Live Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-4">
              <Text size="lg" weight="medium">Live Production Monitoring</Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Text weight="medium">Active Work Sessions</Text>
                  </CardHeader>
                  <CardBody>
                    <div className="text-center py-8 text-gray-500">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <Text>Real-time operator work sessions will appear here</Text>
                    </div>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Text weight="medium">Production Alerts</Text>
                  </CardHeader>
                  <CardBody>
                    <div className="text-center py-8 text-gray-500">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <Text>Quality alerts and production warnings will appear here</Text>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>

      {/* WIP Entry Modal */}
      <EnhancedWIPEntryForm
        isOpen={wipEntryModal.isOpen}
        onClose={() => setWipEntryModal({ isOpen: false, editingEntry: null })}
        onSave={handleSaveWIPEntry}
        initialData={wipEntryModal.editingEntry}
      />

      {/* Sewing Template Modal */}
      <SewingTemplateManager
        isOpen={templateModal.isOpen}
        onClose={() => setTemplateModal({ isOpen: false, editingTemplate: null })}
        onSave={handleSaveSewingTemplate}
        initialTemplate={templateModal.editingTemplate}
      />

      {/* Bundle Creation Modal */}
      <Modal 
        isOpen={bundleCreationModal.isOpen} 
        onClose={() => setBundleCreationModal({ isOpen: false, wipEntry: null, templateMappings: {} })}
        size="xl"
      >
        <ModalHeader>
          <Text weight="medium">Create Production Bundles</Text>
        </ModalHeader>
        <ModalBody>
          {bundleCreationModal.wipEntry && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <Text weight="medium">WIP Entry: {bundleCreationModal.wipEntry.batchNumber}</Text>
                <Text size="sm" color="muted">
                  {bundleCreationModal.wipEntry.articles.length} articles, {bundleCreationModal.wipEntry.rolls.length} rolls
                </Text>
              </div>
              
              <div>
                <Text weight="medium" className="mb-3">Template Mapping</Text>
                <div className="space-y-2">
                  {bundleCreationModal.wipEntry.articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <Text weight="medium">{article.articleNumber}</Text>
                        <Text size="sm" color="muted">{article.garmentType}</Text>
                      </div>
                      
                      <select
                        value={bundleCreationModal.templateMappings[article.id] || ''}
                        onChange={(e) => setBundleCreationModal(prev => ({
                          ...prev,
                          templateMappings: {
                            ...prev.templateMappings,
                            [article.id]: e.target.value
                          }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Template</option>
                        {sewingTemplates
                          .filter(t => t.garmentType === article.garmentType && t.isActive)
                          .map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name} ({template.steps.length} steps)
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded">
                <Text size="sm" weight="medium">
                  This will create bundles for each article-roll-color-size combination based on your size ratios and roll layers.
                </Text>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="ghost" 
            onClick={() => setBundleCreationModal({ isOpen: false, wipEntry: null, templateMappings: {} })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateBundles}
            disabled={!bundleCreationModal.wipEntry || 
              Object.keys(bundleCreationModal.templateMappings).length === 0 ||
              loading}
          >
            <CubeIcon className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Bundles'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default IntegratedProductionManager;