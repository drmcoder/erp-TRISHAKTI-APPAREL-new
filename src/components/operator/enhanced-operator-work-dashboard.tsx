// Enhanced Operator Work Dashboard
// Shows available work, current assignments, and allows work completion

import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Badge, Stack, Flex,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/shared/components/ui';
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  HandRaisedIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/shared/utils';
import { OperatorWorkAssignment, integratedWIPBundleService } from '@/services/integrated-wip-bundle-service';

interface EnhancedOperatorWorkDashboardProps {
  operatorId: string;
  operatorName: string;
  operatorSkillLevel?: 'beginner' | 'intermediate' | 'expert';
  preferredMachineTypes?: string[];
}

export const EnhancedOperatorWorkDashboard: React.FC<EnhancedOperatorWorkDashboardProps> = ({
  operatorId,
  operatorName,
  operatorSkillLevel = 'intermediate',
  preferredMachineTypes = []
}) => {
  const [availableWork, setAvailableWork] = useState<OperatorWorkAssignment[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<OperatorWorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<OperatorWorkAssignment | null>(null);
  const [workCompletionModal, setWorkCompletionModal] = useState<{
    isOpen: boolean;
    assignment: OperatorWorkAssignment | null;
  }>({ isOpen: false, assignment: null });

  // Filters
  const [filters, setFilters] = useState({
    machineType: '',
    skillLevel: operatorSkillLevel,
    priority: ''
  });

  // Work completion form
  const [completionForm, setCompletionForm] = useState({
    completedPieces: 0,
    qualityGrade: 'A' as 'A+' | 'A' | 'B' | 'C',
    notes: ''
  });

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [operatorId, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load available work with filters
      const available = await integratedWIPBundleService.getAvailableWorkForOperators({
        machineType: filters.machineType || undefined,
        skillLevel: filters.skillLevel || undefined,
        priority: filters.priority || undefined
      });
      
      // Filter by operator skill level and machine preferences
      const filteredAvailable = available.filter(work => {
        // Skill level matching (operators can take work at or below their level)
        const skillLevels = { 'beginner': 1, 'intermediate': 2, 'expert': 3 };
        const operatorLevel = skillLevels[operatorSkillLevel];
        const workLevel = skillLevels[work.machineType as keyof typeof skillLevels] || 1;
        
        const skillMatch = operatorLevel >= workLevel;
        
        // Machine type preference (if specified)
        const machineMatch = preferredMachineTypes.length === 0 || 
                           preferredMachineTypes.includes(work.machineType);
        
        return skillMatch && machineMatch;
      });
      
      // Load current assignments
      const assignments = await integratedWIPBundleService.getOperatorWorkAssignments(operatorId);
      
      setAvailableWork(filteredAvailable);
      setCurrentAssignments(assignments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const takeWorkAssignment = async (workAssignment: OperatorWorkAssignment) => {
    try {
      const success = await integratedWIPBundleService.assignWorkToOperator(
        workAssignment.id,
        operatorId,
        operatorName,
        undefined, // machineNumber - could be selected by operator
        undefined  // lineNumber - could be selected by operator
      );
      
      if (success) {
        await loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error taking work assignment:', error);
    }
  };

  const startWork = async (assignment: OperatorWorkAssignment) => {
    // Update work session status to 'started'
    // This would typically involve updating the work session in the database
    console.log('Starting work for assignment:', assignment.id);
    await loadDashboardData();
  };

  const pauseWork = async (assignment: OperatorWorkAssignment) => {
    // Update work session status to 'paused'
    console.log('Pausing work for assignment:', assignment.id);
    await loadDashboardData();
  };

  const openWorkCompletion = (assignment: OperatorWorkAssignment) => {
    setWorkCompletionModal({ isOpen: true, assignment });
    setCompletionForm({
      completedPieces: assignment.completedPieces,
      qualityGrade: assignment.qualityGrade || 'A',
      notes: assignment.notes || ''
    });
  };

  const submitWorkCompletion = async () => {
    if (!workCompletionModal.assignment) return;
    
    try {
      const success = await integratedWIPBundleService.completeOperatorWork(
        workCompletionModal.assignment.id,
        completionForm.completedPieces,
        completionForm.qualityGrade,
        completionForm.notes
      );
      
      if (success) {
        setWorkCompletionModal({ isOpen: false, assignment: null });
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error completing work:', error);
    }
  };

  const getMachineIcon = (machineType: string) => {
    const icons = {
      'single_needle': '🪡',
      'overlock': '✂️',
      'flatlock': '📎',
      'finishing': '✨',
      'buttonhole': '🔘',
      'cutting': '✂️'
    };
    return icons[machineType as keyof typeof icons] || '🪡';
  };

  const getSkillColor = (skillLevel: string) => {
    const colors = {
      'beginner': 'green',
      'intermediate': 'yellow',
      'expert': 'red'
    };
    return colors[skillLevel as keyof typeof colors] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'gray',
      'normal': 'blue',
      'high': 'orange',
      'urgent': 'red'
    };
    return colors[priority as keyof typeof colors] || 'gray';
  };

  const calculateTotalEarnings = () => {
    return currentAssignments.reduce((total, assignment) => 
      total + (assignment.completedPieces * assignment.pricePerPiece), 0
    );
  };

  const calculateTotalPieces = () => {
    return currentAssignments.reduce((total, assignment) => 
      total + assignment.completedPieces, 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Dashboard</h1>
          <p className="text-gray-600">Welcome back, {operatorName}</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <ClockIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <CurrencyRupeeIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <Text size="xl" weight="bold">₹{calculateTotalEarnings().toFixed(2)}</Text>
            <Text size="sm" color="muted">Today's Earnings</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <Text size="xl" weight="bold">{calculateTotalPieces()}</Text>
            <Text size="sm" color="muted">Pieces Completed</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <Text size="xl" weight="bold">{currentAssignments.length}</Text>
            <Text size="sm" color="muted">Active Jobs</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <HandRaisedIcon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <Text size="xl" weight="bold">{availableWork.length}</Text>
            <Text size="sm" color="muted">Available Jobs</Text>
          </CardBody>
        </Card>
      </div>

      {/* Current Work Assignments */}
      <Card>
        <CardHeader>
          <Text weight="medium">Current Work Assignments</Text>
        </CardHeader>
        <CardBody>
          {currentAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <Text>No current work assignments</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {currentAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white">
                  <Flex justify="between" align="center" className="mb-3">
                    <div>
                      <Flex align="center" gap={2} className="mb-1">
                        <Badge variant="blue">{assignment.bundleNumber}</Badge>
                        <Text size="sm">{getMachineIcon(assignment.machineType)}</Text>
                        <Text weight="medium">{assignment.operation}</Text>
                      </Flex>
                      <Text size="sm" color="muted">
                        {assignment.articleNumber} • {assignment.color} • {assignment.size}
                      </Text>
                    </div>
                    
                    <Flex gap={2}>
                      {assignment.status === 'assigned' && (
                        <Button size="sm" onClick={() => startWork(assignment)}>
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {assignment.status === 'started' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => pauseWork(assignment)}>
                            <PauseIcon className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                          <Button size="sm" onClick={() => openWorkCompletion(assignment)}>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedWork(assignment)}>
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </Flex>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <Text size="xs" color="muted">Progress</Text>
                      <Text weight="medium">{assignment.completedPieces}/{assignment.assignedPieces}</Text>
                    </div>
                    <div>
                      <Text size="xs" color="muted">Rate</Text>
                      <Text weight="medium">₹{assignment.pricePerPiece}</Text>
                    </div>
                    <div>
                      <Text size="xs" color="muted">Earned</Text>
                      <Text weight="medium">₹{(assignment.completedPieces * assignment.pricePerPiece).toFixed(2)}</Text>
                    </div>
                    <div>
                      <Text size="xs" color="muted">Status</Text>
                      <Badge size="xs" variant={assignment.status === 'started' ? 'green' : 'blue'}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(assignment.completedPieces / assignment.assignedPieces) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Available Work */}
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <Text weight="medium">Available Work</Text>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select 
                value={filters.machineType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, machineType: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Machine Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Machines</SelectItem>
                  <SelectItem value="single_needle">Single Needle</SelectItem>
                  <SelectItem value="overlock">Overlock</SelectItem>
                  <SelectItem value="flatlock">Flatlock</SelectItem>
                  <SelectItem value="finishing">Finishing</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Flex>
        </CardHeader>
        <CardBody>
          {availableWork.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HandRaisedIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <Text>No available work matching your criteria</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {availableWork.slice(0, 10).map((work) => (
                <div key={work.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <Flex justify="between" align="center" className="mb-3">
                    <div>
                      <Flex align="center" gap={2} className="mb-1">
                        <Badge variant="gray">{work.bundleNumber}</Badge>
                        <Text size="sm">{getMachineIcon(work.machineType)}</Text>
                        <Text weight="medium">{work.operation}</Text>
                        <Badge size="xs" variant={getPriorityColor('normal') as any}>
                          Normal
                        </Badge>
                      </Flex>
                      <Text size="sm" color="muted">
                        {work.articleNumber} • {work.color} • {work.size}
                      </Text>
                    </div>
                    
                    <Button size="sm" onClick={() => takeWorkAssignment(work)}>
                      <HandRaisedIcon className="w-4 h-4 mr-1" />
                      Take Job
                    </Button>
                  </Flex>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <Text size="xs" color="muted">Pieces</Text>
                      <Text weight="medium">{work.assignedPieces}</Text>
                    </div>
                    <div>
                      <Text size="xs" color="muted">Rate</Text>
                      <Text weight="medium">₹{work.pricePerPiece}</Text>
                    </div>
                    <div>
                      <Text size="xs" color="muted">Total Value</Text>
                      <Text weight="medium" color="green">₹{work.totalEarning.toFixed(2)}</Text>
                    </div>
                    <div>
                      <Text size="xs" color="muted">Machine</Text>
                      <Text weight="medium">{work.machineType}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Work Completion Modal */}
      <Modal 
        isOpen={workCompletionModal.isOpen} 
        onClose={() => setWorkCompletionModal({ isOpen: false, assignment: null })}
      >
        <ModalHeader>
          <Text weight="medium">Complete Work</Text>
        </ModalHeader>
        <ModalBody>
          {workCompletionModal.assignment && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <Text weight="medium">{workCompletionModal.assignment.operation}</Text>
                <Text size="sm" color="muted">
                  {workCompletionModal.assignment.bundleNumber} • {workCompletionModal.assignment.articleNumber}
                </Text>
              </div>
              
              <Input
                label="Completed Pieces *"
                type="number"
                min="0"
                max={workCompletionModal.assignment.assignedPieces}
                value={completionForm.completedPieces}
                onChange={(e) => setCompletionForm(prev => ({ 
                  ...prev, 
                  completedPieces: parseInt(e.target.value) || 0 
                }))}
              />
              
              <div>
                <label className="block text-sm font-medium mb-1">Quality Grade</label>
                <select
                  value={completionForm.qualityGrade}
                  onChange={(e) => setCompletionForm(prev => ({ 
                    ...prev, 
                    qualityGrade: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="A+">A+ Grade</option>
                  <option value="A">A Grade</option>
                  <option value="B">B Grade</option>
                  <option value="C">C Grade</option>
                </select>
              </div>
              
              <Input
                label="Notes"
                value={completionForm.notes}
                onChange={(e) => setCompletionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any notes about the work..."
              />
              
              <div className="p-3 bg-blue-50 rounded">
                <Text size="sm" weight="medium">
                  Earnings: ₹{(completionForm.completedPieces * (workCompletionModal.assignment.pricePerPiece || 0)).toFixed(2)}
                </Text>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="ghost" 
            onClick={() => setWorkCompletionModal({ isOpen: false, assignment: null })}
          >
            Cancel
          </Button>
          <Button onClick={submitWorkCompletion}>
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Submit Completion
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EnhancedOperatorWorkDashboard;