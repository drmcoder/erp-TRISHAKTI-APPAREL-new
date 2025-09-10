// METHOD 1: "Visual Board" Assignment 
// Drag & drop work cards onto operator cards - intuitive visual matching
// Good for: Visual learners, supervisors who like seeing everything at once

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { 
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface WorkCard {
  id: string;
  bundleNumber: string;
  operation: string;
  pieces: number;
  difficulty: number;
  priority: 'normal' | 'high' | 'urgent';
  deadline: string;
}

interface OperatorCard {
  id: string;
  name: string;
  skillLevel: number;
  currentLoad: number;
  status: 'available' | 'busy' | 'break';
  assignedWork: WorkCard[];
}

const VisualBoardAssignment: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkCard[]>([]);
  const [operators, setOperators] = useState<OperatorCard[]>([]);
  const [draggedWork, setDraggedWork] = useState<WorkCard | null>(null);
  const [todaysAssignments, setTodaysAssignments] = useState(0);

  useEffect(() => {
    // Initialize mock data
    setWorkItems([
      {
        id: 'w1',
        bundleNumber: 'TSA-001',
        operation: 'Sleeve Sewing',
        pieces: 120,
        difficulty: 3,
        priority: 'high',
        deadline: '2:00 PM'
      },
      {
        id: 'w2', 
        bundleNumber: 'TSA-002',
        operation: 'Button Holes',
        pieces: 80,
        difficulty: 2,
        priority: 'normal',
        deadline: '4:00 PM'
      },
      {
        id: 'w3',
        bundleNumber: 'TSA-003', 
        operation: 'Collar Attachment',
        pieces: 200,
        difficulty: 4,
        priority: 'urgent',
        deadline: '12:30 PM'
      }
    ]);

    setOperators([
      {
        id: 'op1',
        name: 'Maya Patel',
        skillLevel: 5,
        currentLoad: 60,
        status: 'available',
        assignedWork: []
      },
      {
        id: 'op2',
        name: 'Ram Sharma',
        skillLevel: 3,
        currentLoad: 40,
        status: 'available', 
        assignedWork: []
      },
      {
        id: 'op3',
        name: 'Sita Devi',
        skillLevel: 4,
        currentLoad: 80,
        status: 'busy',
        assignedWork: []
      }
    ]);
  }, []);

  const handleDragStart = (work: WorkCard) => {
    setDraggedWork(work);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, operator: OperatorCard) => {
    e.preventDefault();
    if (!draggedWork) return;

    // Simple assignment logic
    const newOperators = operators.map(op => {
      if (op.id === operator.id) {
        return {
          ...op,
          assignedWork: [...op.assignedWork, draggedWork],
          currentLoad: op.currentLoad + 20 // Increase load
        };
      }
      return op;
    });

    const newWorkItems = workItems.filter(w => w.id !== draggedWork.id);

    setOperators(newOperators);
    setWorkItems(newWorkItems);
    setTodaysAssignments(prev => prev + 1);
    
    notify.success(`${draggedWork.operation} assigned to ${operator.name}`, 'Work Assigned');
    setDraggedWork(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getOperatorColor = (load: number, status: string) => {
    if (status !== 'available') return 'border-gray-400 bg-gray-50';
    if (load > 80) return 'border-red-400 bg-red-50';
    if (load > 60) return 'border-yellow-400 bg-yellow-50';
    return 'border-green-400 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Visual Board Assignment</h1>
            <p className="text-gray-600">Drag work cards and drop them on operator cards</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{todaysAssignments}</div>
            <div className="text-sm text-gray-500">Today's Assignments</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Work Items to Assign */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">🎯 Work to Assign</h2>
          <div className="space-y-4">
            {workItems.map(work => (
              <Card
                key={work.id}
                className={`p-4 cursor-grab active:cursor-grabbing ${getPriorityColor(work.priority)} border-2 hover:shadow-lg transition-shadow`}
                draggable
                onDragStart={() => handleDragStart(work)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-lg">{work.bundleNumber}</div>
                  <Badge className={work.priority === 'urgent' ? 'bg-red-500' : work.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}>
                    {work.priority.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="text-gray-700 mb-2">{work.operation}</div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Pieces</div>
                    <div className="font-semibold">{work.pieces}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Difficulty</div>
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <StarIcon 
                          key={star} 
                          className={`h-3 w-3 ${star <= work.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Deadline</div>
                    <div className="font-semibold text-red-600">{work.deadline}</div>
                  </div>
                </div>
              </Card>
            ))}
            
            {workItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg">All work assigned! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Operators */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">👥 Operators</h2>
          <div className="space-y-4">
            {operators.map(operator => (
              <Card
                key={operator.id}
                className={`p-6 border-2 ${getOperatorColor(operator.currentLoad, operator.status)} transition-all hover:shadow-lg min-h-[120px]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, operator)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{operator.name}</div>
                      <Badge className={operator.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {operator.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current Load</div>
                    <div className={`text-lg font-bold ${operator.currentLoad > 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {operator.currentLoad}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Skill Level</div>
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <StarIcon 
                          key={star} 
                          className={`h-4 w-4 ${star <= operator.skillLevel ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assigned Work */}
                {operator.assignedWork.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-2">Recent Assignments:</div>
                    <div className="space-y-1">
                      {operator.assignedWork.slice(-2).map(work => (
                        <div key={work.id} className="text-xs bg-white rounded px-2 py-1">
                          {work.bundleNumber} - {work.operation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drop Zone Indicator */}
                <div className="text-center text-gray-400 text-sm mt-2 border-2 border-dashed border-gray-300 rounded-lg py-2">
                  Drop work here to assign
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto mt-8">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-2 text-blue-800">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="font-semibold">How to use Visual Board:</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            1. Look at work cards on the left (priority color-coded) 
            2. Drag any work card to an operator on the right
            3. Green operators = available, Yellow = getting full, Red = overloaded
            4. Assignment is instant when you drop the card
          </p>
        </Card>
      </div>
    </div>
  );
};

export default VisualBoardAssignment;