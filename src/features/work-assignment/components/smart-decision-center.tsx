// Smart Decision Support Center - NOT Auto Assignment!
// Provides visual information to help supervisors make better decisions faster
// Focus: Human judgment with smart visual aids, not lottery-style automation

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface WorkItem {
  id: string;
  bundleNumber: string;
  operation: string;
  operationType: 'cutting' | 'sewing' | 'finishing' | 'quality' | 'packing';
  pieces: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  priority: 'normal' | 'high' | 'urgent';
  deadline: string;
  estimatedHours: number;
  requiredSkills: string[];
}

interface OperatorOption {
  id: string;
  name: string;
  photo?: string;
  currentStatus: 'available' | 'busy' | 'break';
  skillLevel: number; // 1-5 for this operation
  efficiency: number; // percentage
  currentWorkload: number; // percentage  
  qualityScore: number; // percentage
  recentWork: string[];
  estimatedCompletion?: string;
  why: string; // Why this is a good/bad match
  pros: string[];
  cons: string[];
}

const SmartDecisionCenter: React.FC = () => {
  const [currentWork, setCurrentWork] = useState<WorkItem | null>(null);
  const [operatorOptions, setOperatorOptions] = useState<OperatorOption[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    loadWorkItem();
  }, []);

  const loadWorkItem = () => {
    // Mock current work item
    setCurrentWork({
      id: 'work_001',
      bundleNumber: 'TSA-2024-0342',
      operation: 'Sleeve Attachment',
      operationType: 'sewing',
      pieces: 150,
      difficulty: 3,
      priority: 'high',
      deadline: '2024-01-15 4:00 PM',
      estimatedHours: 6,
      requiredSkills: ['Machine Sewing', 'Sleeve Setting', 'Quality Control']
    });

    // Mock operator options with realistic data
    setOperatorOptions([
      {
        id: 'maya',
        name: 'Maya Patel',
        currentStatus: 'available',
        skillLevel: 5,
        efficiency: 120,
        currentWorkload: 45,
        qualityScore: 96,
        recentWork: ['Sleeve Attachment', 'Collar Setting', 'Button Holes'],
        why: 'Expert in sleeve work with excellent quality',
        pros: ['Highest skill level', 'Available now', 'Excellent quality record'],
        cons: ['Already has some workload']
      },
      {
        id: 'ram',
        name: 'Ram Sharma',
        currentStatus: 'available', 
        skillLevel: 4,
        efficiency: 105,
        currentWorkload: 20,
        qualityScore: 88,
        recentWork: ['Basic Sewing', 'Hemming', 'Pocket Attachment'],
        why: 'Good skill level, very available, but less sleeve experience',
        pros: ['Very available', 'Good efficiency', 'Reliable worker'],
        cons: ['Less experience with sleeves', 'Lower quality scores']
      },
      {
        id: 'sita',
        name: 'Sita Devi',
        currentStatus: 'busy',
        skillLevel: 5,
        efficiency: 95,
        currentWorkload: 85,
        qualityScore: 98,
        recentWork: ['Sleeve Attachment', 'Complex Alterations'],
        estimatedCompletion: '2:30 PM',
        why: 'Perfect skills but currently overloaded',
        pros: ['Perfect skill match', 'Highest quality scores', 'Sleeve specialist'],
        cons: ['Currently very busy', 'May cause delays']
      },
      {
        id: 'krishna',
        name: 'Krishna Kumar',
        currentStatus: 'available',
        skillLevel: 2,
        efficiency: 80,
        currentWorkload: 10,
        qualityScore: 75,
        recentWork: ['Basic Hemming', 'Simple Repairs'],
        why: 'Available but skill level too low for this work',
        pros: ['Completely available', 'Willing to learn'],
        cons: ['Skill level too low', 'May make mistakes', 'Slower pace']
      }
    ]);
  };

  const handleAssignWork = () => {
    if (!selectedOperator || !currentWork) return;
    
    const operator = operatorOptions.find(op => op.id === selectedOperator);
    if (operator) {
      notify.success(`${currentWork.operation} assigned to ${operator.name}`, 'Assignment Complete');
      // Load next work item
      setTimeout(loadWorkItem, 1000);
      setSelectedOperator(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-orange-100 text-orange-800';
      case 'break': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 4) return 'text-green-600';
    if (skill >= 3) return 'text-yellow-600'; 
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  if (!currentWork) {
    return <div className="text-center p-8">Loading work item...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Assignment Decision Center</h1>
        <p className="text-gray-600">Review work details → Compare operator options → Make informed decision</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Work Details */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Current Work</h2>
              <Badge className={getPriorityColor(currentWork.priority)}>
                {currentWork.priority.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentWork.bundleNumber}</div>
                <div className="text-lg text-gray-700">{currentWork.operation}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Pieces</div>
                  <div className="font-semibold">{currentWork.pieces}</div>
                </div>
                <div>
                  <div className="text-gray-500">Est. Hours</div>
                  <div className="font-semibold">{currentWork.estimatedHours}h</div>
                </div>
                <div>
                  <div className="text-gray-500">Deadline</div>
                  <div className="font-semibold text-red-600">{currentWork.deadline}</div>
                </div>
                <div>
                  <div className="text-gray-500">Difficulty</div>
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <StarIcon 
                        key={star} 
                        className={`h-4 w-4 ${star <= currentWork.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm mb-2">Required Skills</div>
                <div className="flex flex-wrap gap-1">
                  {currentWork.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Operator Options */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Available Operators</h2>
            <div className="text-sm text-gray-600">Click to select → Review details → Assign</div>
          </div>
          
          <div className="space-y-4">
            {operatorOptions.map((operator) => (
              <Card 
                key={operator.id} 
                className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedOperator === operator.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOperator(operator.id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Operator Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{operator.name}</div>
                      <Badge className={getStatusColor(operator.currentStatus)}>
                        {operator.currentStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className={`text-lg font-bold ${getSkillColor(operator.skillLevel)}`}>
                        {operator.skillLevel}/5
                      </div>
                      <div className="text-xs text-gray-500">Skill Level</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{operator.currentWorkload}%</div>
                      <div className="text-xs text-gray-500">Current Load</div>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{operator.efficiency}%</div>
                      <div className="text-xs text-gray-500">Efficiency</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{operator.qualityScore}%</div>
                      <div className="text-xs text-gray-500">Quality</div>
                    </div>
                  </div>

                  {/* Quick Assessment */}
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">Assessment:</div>
                    <div className="text-sm text-gray-600">{operator.why}</div>
                    
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetails(showDetails === operator.id ? null : operator.id);
                        }}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Detailed View */}
                {showDetails === operator.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-semibold text-green-700 mb-2">✅ Pros:</div>
                        <ul className="text-sm text-green-600 space-y-1">
                          {operator.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-red-700 mb-2">⚠️ Cons:</div>
                        <ul className="text-sm text-red-600 space-y-1">
                          {operator.cons.map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm font-semibold text-gray-700 mb-1">Recent Work:</div>
                      <div className="flex flex-wrap gap-1">
                        {operator.recentWork.map((work, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {work}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {operator.estimatedCompletion && (
                      <div className="mt-3 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        Available at: {operator.estimatedCompletion}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Action */}
      {selectedOperator && (
        <div className="fixed bottom-6 right-6">
          <Card className="p-4 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Assign to: <strong>{operatorOptions.find(op => op.id === selectedOperator)?.name}</strong>
              </div>
              <Button
                onClick={handleAssignWork}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Assign Work</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartDecisionCenter;