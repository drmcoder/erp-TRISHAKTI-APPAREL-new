// Supervisor Work Assignment Dashboard
// Drag-and-drop work assignment with operator matching

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/select';
import {
  UserIcon,
  ClockIcon,
  CubeIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface WorkItem {
  id: string;
  bundleId: string;
  operation: string;
  operationNepali: string;
  articleName: string;
  size: string;
  color: string;
  pieces: number;
  estimatedTimePerPiece: number;
  ratePerPiece: number;
  machineType: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  qualityRequirements: string[];
  dependencies: string[];
  templateStep: number;
  totalTemplateSteps: number;
}

interface Operator {
  id: string;
  name: string;
  nameNepali: string;
  photo?: string;
  skills: {
    machineTypes: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    specializations: string[];
    efficiency: number;
    qualityScore: number;
  };
  currentWork: {
    workItemId: string;
    bundleId: string;
    operation: string;
    progress: number; // 0-100
    estimatedTimeLeft: number; // minutes
  } | null;
  status: 'available' | 'working' | 'break' | 'quality_check' | 'offline';
  shift: 'morning' | 'evening' | 'night';
  line: string;
  todayStats: {
    piecesCompleted: number;
    hoursWorked: number;
    earnings: number;
    efficiency: number;
  };
}

interface WorkAssignmentDashboardProps {
  supervisorId: string;
  onWorkAssign: (workItemId: string, operatorId: string) => void;
  onAutoAssign: () => void;
}

export const SupervisorWorkAssignmentDashboard: React.FC<WorkAssignmentDashboardProps> = ({
  supervisorId,
  onWorkAssign,
  onAutoAssign
}) => {
  const [availableWork, setAvailableWork] = useState<WorkItem[]>([
    {
      id: 'work_001',
      bundleId: 'M-013',
      operation: 'Shoulder Seam',
      operationNepali: 'काँध जोड्ने',
      articleName: 'Basic T-Shirt',
      size: 'Medium',
      color: 'Blue',
      pieces: 50,
      estimatedTimePerPiece: 2.5,
      ratePerPiece: 3.0,
      machineType: 'Overlock',
      skillLevel: 'intermediate',
      urgency: 'high',
      qualityRequirements: ['Seam strength', 'Alignment', 'No loose threads'],
      dependencies: [],
      templateStep: 1,
      totalTemplateSteps: 12
    },
    {
      id: 'work_002',
      bundleId: 'M-014',
      operation: 'Side Seam',
      operationNepali: 'छेउको सिलाई',
      articleName: 'Basic T-Shirt',
      size: 'Large',
      color: 'Green',
      pieces: 50,
      estimatedTimePerPiece: 3.0,
      ratePerPiece: 3.5,
      machineType: 'Overlock',
      skillLevel: 'intermediate',
      urgency: 'medium',
      qualityRequirements: ['Even seam width', 'Proper stitch density'],
      dependencies: ['work_001'],
      templateStep: 3,
      totalTemplateSteps: 12
    },
    {
      id: 'work_003',
      bundleId: 'M-015',
      operation: 'Neck Attach',
      operationNepali: 'घाँटी जोड्ने',
      articleName: 'Basic T-Shirt',
      size: 'XL',
      color: 'Black',
      pieces: 50,
      estimatedTimePerPiece: 4.0,
      ratePerPiece: 5.0,
      machineType: 'Single Needle',
      skillLevel: 'advanced',
      urgency: 'low',
      qualityRequirements: ['Perfect curve', 'No puckering', 'Consistent topstitch'],
      dependencies: [],
      templateStep: 8,
      totalTemplateSteps: 12
    }
  ]);

  const [operators, setOperators] = useState<Operator[]>([
    {
      id: 'op_sunita',
      name: 'Sunita Devi',
      nameNepali: 'सुनीता देवी',
      skills: {
        machineTypes: ['Overlock', 'Single Needle', 'Flatlock'],
        skillLevel: 'advanced',
        specializations: ['precision_work', 'quality_control'],
        efficiency: 127,
        qualityScore: 96
      },
      currentWork: null,
      status: 'available',
      shift: 'morning',
      line: 'Line A',
      todayStats: {
        piecesCompleted: 156,
        hoursWorked: 4.5,
        earnings: 347,
        efficiency: 127
      }
    },
    {
      id: 'op_mukesh',
      name: 'Mukesh Kumar',
      nameNepali: 'मुकेश कुमार',
      skills: {
        machineTypes: ['Overlock', 'Buttonhole', 'Bar Tack'],
        skillLevel: 'intermediate',
        specializations: ['speed_work', 'heavy_fabrics'],
        efficiency: 115,
        qualityScore: 92
      },
      currentWork: {
        workItemId: 'work_prev',
        bundleId: 'M-010',
        operation: 'Side Seam',
        progress: 60,
        estimatedTimeLeft: 45
      },
      status: 'working',
      shift: 'morning',
      line: 'Line A',
      todayStats: {
        piecesCompleted: 89,
        hoursWorked: 4.0,
        earnings: 267,
        efficiency: 115
      }
    },
    {
      id: 'op_rekha',
      name: 'Rekha Sharma',
      nameNepali: 'रेखा शर्मा',
      skills: {
        machineTypes: ['Single Needle', 'Cover Stitch'],
        skillLevel: 'beginner',
        specializations: ['finishing', 'hemming'],
        efficiency: 85,
        qualityScore: 88
      },
      currentWork: null,
      status: 'break',
      shift: 'morning',
      line: 'Line B',
      todayStats: {
        piecesCompleted: 67,
        hoursWorked: 3.5,
        earnings: 201,
        efficiency: 85
      }
    }
  ]);

  const [filters, setFilters] = useState({
    machineType: '',
    skillLevel: '',
    urgency: '',
    searchTerm: ''
  });

  const [draggedWork, setDraggedWork] = useState<WorkItem | null>(null);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);

  // Filter available work based on filters
  const filteredWork = availableWork.filter(work => {
    const matchesMachine = !filters.machineType || work.machineType === filters.machineType;
    const matchesSkill = !filters.skillLevel || work.skillLevel === filters.skillLevel;
    const matchesUrgency = !filters.urgency || work.urgency === filters.urgency;
    const matchesSearch = !filters.searchTerm || 
      work.bundleId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      work.operation.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesMachine && matchesSkill && matchesUrgency && matchesSearch;
  });

  // Calculate operator compatibility score
  const calculateCompatibility = (work: WorkItem, operator: Operator): number => {
    let score = 0;
    
    // Machine type match
    if (operator.skills.machineTypes.includes(work.machineType)) score += 40;
    
    // Skill level match
    const skillLevels = { beginner: 1, intermediate: 2, advanced: 3 };
    const workSkill = skillLevels[work.skillLevel];
    const opSkill = skillLevels[operator.skills.skillLevel];
    
    if (opSkill >= workSkill) score += 30;
    else score += 10; // Partial credit
    
    // Efficiency bonus
    if (operator.skills.efficiency > 110) score += 15;
    else if (operator.skills.efficiency > 100) score += 10;
    
    // Quality score bonus
    if (operator.skills.qualityScore > 95) score += 10;
    else if (operator.skills.qualityScore > 90) score += 5;
    
    // Availability bonus
    if (operator.status === 'available') score += 20;
    
    return score;
  };

  const getSuggestedOperators = (work: WorkItem): Operator[] => {
    return operators
      .map(op => ({ operator: op, score: calculateCompatibility(work, op) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.operator);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'working': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'quality_check': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Handle drag and drop
  const handleDragStart = (work: WorkItem) => {
    setDraggedWork(work);
  };

  const handleDrop = (operator: Operator) => {
    if (draggedWork && operator.status === 'available') {
      const compatibility = calculateCompatibility(draggedWork, operator);
      
      if (compatibility < 50) {
        if (!confirm(`Low compatibility (${compatibility}%). Assign anyway?`)) {
          return;
        }
      }
      
      onWorkAssign(draggedWork.id, operator.id);
      
      // Update local state
      setOperators(prev => prev.map(op => 
        op.id === operator.id 
          ? {
              ...op,
              status: 'working',
              currentWork: {
                workItemId: draggedWork.id,
                bundleId: draggedWork.bundleId,
                operation: draggedWork.operation,
                progress: 0,
                estimatedTimeLeft: draggedWork.pieces * draggedWork.estimatedTimePerPiece
              }
            }
          : op
      ));
      
      setAvailableWork(prev => prev.filter(work => work.id !== draggedWork.id));
      setDraggedWork(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Assignment Dashboard</h1>
          <p className="text-gray-600">Drag work items to operators or use smart assignment</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAutoAssignModal(true)}
            className="flex items-center gap-2"
          >
            <SparklesIcon className="h-4 w-4" />
            Smart Auto Assign
          </Button>
          <Badge variant="secondary">
            {availableWork.length} Work Items Available
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Available Work Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CubeIcon className="h-5 w-5" />
              Available Work Items
            </CardTitle>
            
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <Select
                value={filters.machineType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, machineType: value }))}
              >
                <option value="">All Machines</option>
                <option value="Overlock">Overlock</option>
                <option value="Single Needle">Single Needle</option>
                <option value="Flatlock">Flatlock</option>
                <option value="Cover Stitch">Cover Stitch</option>
              </Select>
              
              <Select
                value={filters.skillLevel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, skillLevel: value }))}
              >
                <option value="">All Skills</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              
              <Select
                value={filters.urgency}
                onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}
              >
                <option value="">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {filteredWork.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CubeIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No work items match your filters</p>
              </div>
            ) : (
              filteredWork.map(work => (
                <div
                  key={work.id}
                  draggable
                  onDragStart={() => handleDragStart(work)}
                  className="border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">
                        Bundle {work.bundleId} - {work.operation}
                      </h4>
                      <p className="text-sm text-gray-600">{work.operationNepali}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={`text-xs ${getUrgencyColor(work.urgency)}`}>
                        {work.urgency === 'critical' && <FireIcon className="h-3 w-3 mr-1" />}
                        {work.urgency.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Machine:</span>
                      <div>{work.machineType}</div>
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>
                      <div>{work.estimatedTimePerPiece}min/pc</div>
                    </div>
                    <div>
                      <span className="font-medium">Pieces:</span>
                      <div>{work.pieces}</div>
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span>
                      <div>₹{work.ratePerPiece}/pc</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Step {work.templateStep} of {work.totalTemplateSteps} • {work.articleName} • {work.color} {work.size}
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      Total: ₹{work.pieces * work.ratePerPiece}
                    </div>
                  </div>
                  
                  {/* Suggested Operators */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-600 mb-1">Suggested operators:</div>
                    <div className="flex gap-1">
                      {getSuggestedOperators(work).slice(0, 3).map((op, index) => (
                        <Badge 
                          key={op.id} 
                          variant="outline" 
                          className={`text-xs ${index === 0 ? 'border-green-400 bg-green-50' : ''}`}
                        >
                          {op.name} 
                          {index === 0 && <span className="ml-1">⭐</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Operators Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Operators Status
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {operators.map(operator => (
              <div
                key={operator.id}
                onDrop={() => handleDrop(operator)}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                  operator.status === 'available' 
                    ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                    : 'border-gray-300 bg-gray-50'
                } ${draggedWork && operator.status === 'available' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{operator.name}</h4>
                      <p className="text-sm text-gray-600">{operator.nameNepali}</p>
                      <div className="text-xs text-gray-500">
                        {operator.shift} • {operator.line}
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(operator.status)}`}>
                    {operator.status === 'working' && <PlayIcon className="h-3 w-3 mr-1" />}
                    {operator.status === 'break' && <PauseIcon className="h-3 w-3 mr-1" />}
                    {operator.status === 'available' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                    {operator.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                {/* Skills */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {operator.skills.machineTypes.map(machine => (
                      <Badge key={machine} variant="outline" className="text-xs">
                        {machine}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Efficiency:</span>
                      <span className={`ml-1 font-medium ${
                        operator.skills.efficiency > 100 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {operator.skills.efficiency}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quality:</span>
                      <span className="ml-1 font-medium text-blue-600">
                        {operator.skills.qualityScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Work */}
                {operator.currentWork ? (
                  <div className="bg-blue-50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">
                        Bundle {operator.currentWork.bundleId}
                      </h5>
                      <span className="text-xs text-gray-600">
                        <ClockIcon className="h-3 w-3 inline mr-1" />
                        {operator.currentWork.estimatedTimeLeft}min left
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {operator.currentWork.operation}
                    </div>
                    <div className="bg-white rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${operator.currentWork.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {operator.currentWork.progress}% complete
                    </div>
                  </div>
                ) : operator.status === 'available' ? (
                  <div className="border-2 border-dashed border-green-300 rounded p-3 text-center text-green-600">
                    <div className="text-sm font-medium">Ready for Work</div>
                    <div className="text-xs">Drag work item here</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center">
                    {operator.status === 'break' ? 'On break' : 'Not available'}
                  </div>
                )}

                {/* Today's Stats */}
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div>
                      <div className="font-medium">{operator.todayStats.piecesCompleted}</div>
                      <div className="text-gray-600">Pieces</div>
                    </div>
                    <div>
                      <div className="font-medium">₹{operator.todayStats.earnings}</div>
                      <div className="text-gray-600">Earnings</div>
                    </div>
                    <div>
                      <div className="font-medium">{operator.todayStats.hoursWorked.toFixed(1)}h</div>
                      <div className="text-gray-600">Hours</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                {operator.status === 'available' && (
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-xs"
                      onClick={() => {
                        if (filteredWork.length > 0) {
                          const bestWork = getSuggestedOperators(filteredWork[0]).includes(operator) 
                            ? filteredWork[0] 
                            : filteredWork.find(work => getSuggestedOperators(work).includes(operator)) || filteredWork[0];
                          handleDrop(operator);
                        }
                      }}
                    >
                      Quick Assign
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Smart Auto Assignment Modal */}
      {showAutoAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Smart Auto Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Match machine skills</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Consider efficiency ratings</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Balance workload</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Prioritize urgent work</span>
                </label>
              </div>
              
              <div className="pt-4 border-t flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAutoAssignModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onAutoAssign();
                    setShowAutoAssignModal(false);
                  }}
                  className="flex-1"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Auto Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupervisorWorkAssignmentDashboard;