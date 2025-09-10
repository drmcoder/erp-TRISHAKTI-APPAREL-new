// METHOD 4: "Mobile Touch" Assignment
// Big buttons and touch-friendly interface - like mobile banking or food delivery apps
// Practical: Perfect for tablets and mobile devices, easy to use with fingers

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  FireIcon
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
  estimatedTime: string;
}

interface OperatorCard {
  id: string;
  name: string;
  photo: string;
  status: 'available' | 'busy' | 'break';
  skillLevel: number;
  currentTasks: number;
  efficiency: number;
  location: string;
}

const MobileTouchAssignment: React.FC = () => {
  const [currentWork, setCurrentWork] = useState<WorkCard | null>(null);
  const [operators, setOperators] = useState<OperatorCard[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [step, setStep] = useState<'work' | 'operators' | 'confirm'>('work');
  const [workQueue, setWorkQueue] = useState<WorkCard[]>([]);
  const [assignedToday, setAssignedToday] = useState(0);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Initialize work queue
    const queue: WorkCard[] = [
      {
        id: 'w1',
        bundleNumber: 'TSA-001',
        operation: 'Sleeve Attachment',
        pieces: 120,
        difficulty: 3,
        priority: 'high',
        deadline: '2:00 PM',
        estimatedTime: '3.5 hours'
      },
      {
        id: 'w2',
        bundleNumber: 'TSA-002',
        operation: 'Button Holes',
        pieces: 80,
        difficulty: 2,
        priority: 'normal',
        deadline: '4:00 PM', 
        estimatedTime: '2 hours'
      },
      {
        id: 'w3',
        bundleNumber: 'TSA-003',
        operation: 'Quality Check',
        pieces: 200,
        difficulty: 4,
        priority: 'urgent',
        deadline: '1:00 PM',
        estimatedTime: '4 hours'
      }
    ];

    setWorkQueue(queue);
    setCurrentWork(queue[0]);

    // Initialize operators
    setOperators([
      {
        id: 'maya',
        name: 'Maya Patel',
        photo: '👩‍🏭',
        status: 'available',
        skillLevel: 5,
        currentTasks: 1,
        efficiency: 125,
        location: 'Floor A'
      },
      {
        id: 'ram', 
        name: 'Ram Sharma',
        photo: '👨‍🏭',
        status: 'available',
        skillLevel: 4,
        currentTasks: 0,
        efficiency: 110,
        location: 'Floor B'
      },
      {
        id: 'sita',
        name: 'Sita Devi',
        photo: '👩‍🏭',
        status: 'busy',
        skillLevel: 5,
        currentTasks: 3,
        efficiency: 95,
        location: 'Floor A'
      },
      {
        id: 'krishna',
        name: 'Krishna Kumar',
        photo: '👨‍🏭',
        status: 'available',
        skillLevel: 3,
        currentTasks: 0,
        efficiency: 85,
        location: 'Floor C'
      }
    ]);
  };

  const nextWork = () => {
    const currentIndex = workQueue.findIndex(w => w.id === currentWork?.id);
    if (currentIndex < workQueue.length - 1) {
      setCurrentWork(workQueue[currentIndex + 1]);
      setStep('work');
      setSelectedOperator(null);
    } else {
      // Load more work or show completion
      notify.success('All work assigned!', 'Queue Complete');
    }
  };

  const confirmAssignment = () => {
    if (!currentWork || !selectedOperator) return;

    const operator = operators.find(op => op.id === selectedOperator);
    if (operator) {
      // Update operator task count
      setOperators(prev => prev.map(op =>
        op.id === selectedOperator
          ? { ...op, currentTasks: op.currentTasks + 1 }
          : op
      ));

      setAssignedToday(prev => prev + 1);
      notify.success(`${currentWork.bundleNumber} assigned to ${operator.name}!`, 'Assignment Confirmed');
      
      // Move to next work item
      setTimeout(nextWork, 1500);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'break': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level);
  };

  if (!currentWork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Work Assigned!</h2>
          <p className="text-gray-600">Great job! All tasks have been assigned to operators.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold flex items-center">
              <DevicePhoneMobileIcon className="h-6 w-6 mr-2" />
              Mobile Touch Assignment
            </h1>
            <Badge className="bg-white text-blue-600 font-semibold px-3 py-1">
              {assignedToday} assigned today
            </Badge>
          </div>
          <p className="text-blue-100">Tap-friendly interface for tablets and mobile devices</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              step === 'work' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            }`}>
              1
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              step === 'operators' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            }`}>
              2
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Work Details */}
        {step === 'work' && (
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-r from-white to-blue-50 shadow-xl">
              <div className="text-center mb-6">
                <Badge className={`${getPriorityColor(currentWork.priority)} text-lg px-4 py-2 mb-4`}>
                  {currentWork.priority.toUpperCase()} PRIORITY
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentWork.bundleNumber}</h2>
                <p className="text-xl text-gray-700">{currentWork.operation}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-3xl font-bold text-blue-600">{currentWork.pieces}</div>
                  <div className="text-gray-600">Pieces</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-3xl font-bold text-green-600">{currentWork.estimatedTime}</div>
                  <div className="text-gray-600">Est. Time</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl">{getDifficultyStars(currentWork.difficulty)}</div>
                  <div className="text-gray-600">Difficulty</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow">
                  <div className="text-xl font-bold text-red-600 flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 mr-1" />
                    {currentWork.deadline}
                  </div>
                  <div className="text-gray-600">Deadline</div>
                </div>
              </div>
              
              <Button
                onClick={() => setStep('operators')}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xl font-semibold rounded-xl"
              >
                Choose Operator
                <ArrowRightIcon className="h-6 w-6 ml-2" />
              </Button>
            </Card>
          </div>
        )}

        {/* Step 2: Select Operator */}
        {step === 'operators' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Operator</h2>
              <p className="text-gray-600">Tap to select the best operator for this work</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {operators.map(operator => (
                <Card
                  key={operator.id}
                  className={`p-6 cursor-pointer transition-all duration-200 ${
                    selectedOperator === operator.id
                      ? 'ring-4 ring-blue-500 bg-blue-50 shadow-xl'
                      : operator.status === 'available' 
                      ? 'hover:shadow-lg hover:bg-gray-50'
                      : 'opacity-60'
                  }`}
                  onClick={() => operator.status === 'available' && setSelectedOperator(operator.id)}
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Operator Info */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-3xl">
                          {operator.photo}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(operator.status)}`}></div>
                      </div>
                      
                      <div>
                        <div className="text-xl font-bold text-gray-900">{operator.name}</div>
                        <div className="text-sm text-gray-600 mb-1">{operator.location}</div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-blue-600 font-semibold">
                            Skill: {operator.skillLevel}/5
                          </span>
                          <span className="text-green-600 font-semibold">
                            {operator.efficiency}% efficient
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Tasks */}
                    <div className="text-right">
                      <Badge className={`${
                        operator.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      } mb-2`}>
                        {operator.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {operator.currentTasks} current tasks
                      </div>
                    </div>
                  </div>
                  
                  {selectedOperator === operator.id && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <div className="text-sm text-blue-800 font-semibold">✅ Selected for assignment</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button
                onClick={() => setStep('work')}
                variant="outline"
                size="lg"
                className="flex-1 py-3 text-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!selectedOperator}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                Confirm
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Assignment */}
        {step === 'confirm' && selectedOperator && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Assignment</h2>
              <p className="text-gray-600">Review and confirm the work assignment</p>
            </div>

            <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
              
              {/* Assignment Summary */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Assign</h3>
                
                <div className="bg-white rounded-lg p-6 shadow-inner">
                  <div className="flex items-center justify-between text-lg">
                    <div>
                      <div className="font-bold text-blue-600">{currentWork.bundleNumber}</div>
                      <div className="text-gray-600">{currentWork.operation}</div>
                    </div>
                    <ArrowRightIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-bold text-green-600">
                        {operators.find(op => op.id === selectedOperator)?.name}
                      </div>
                      <div className="text-gray-600">
                        {operators.find(op => op.id === selectedOperator)?.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentWork.pieces}</div>
                  <div className="text-sm text-gray-600">Pieces to Complete</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{currentWork.deadline}</div>
                  <div className="text-sm text-gray-600">Deadline</div>
                </div>
              </div>

              {/* Confirm Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => setStep('operators')}
                  variant="outline"
                  size="lg"
                  className="flex-1 py-4 text-lg"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Change Operator
                </Button>
                <Button
                  onClick={confirmAssignment}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-bold"
                >
                  <CheckCircleIcon className="h-6 w-6 mr-2" />
                  Assign Work
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-white/80">
            <div className="text-lg font-bold text-blue-600">{workQueue.length - 1}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </Card>
          <Card className="p-4 text-center bg-white/80">
            <div className="text-lg font-bold text-green-600">{assignedToday}</div>
            <div className="text-xs text-gray-600">Assigned Today</div>
          </Card>
          <Card className="p-4 text-center bg-white/80">
            <div className="text-lg font-bold text-orange-600">{operators.filter(op => op.status === 'available').length}</div>
            <div className="text-xs text-gray-600">Available</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileTouchAssignment;