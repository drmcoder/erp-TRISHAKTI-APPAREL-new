// Mobile-Optimized Operator Dashboard
// Touch-friendly interface with swipe gestures and large buttons

import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ChevronRightIcon,
  HandRaisedIcon,
  EyeIcon,
  ArrowRightIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface MobileOperatorDashboardProps {
  operatorId: string;
  operatorName: string;
}

interface WorkItem {
  id: string;
  bundleNumber: string;
  operation: string;
  articleNumber: string;
  color: string;
  size: string;
  pieces: number;
  completedPieces: number;
  pricePerPiece: number;
  totalEarning: number;
  status: 'assigned' | 'started' | 'paused' | 'completed';
  estimatedTime: number;
  machineType: string;
  qualityGrade?: 'A+' | 'A' | 'B' | 'C';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface AvailableWork {
  id: string;
  bundleNumber: string;
  operation: string;
  articleNumber: string;
  color: string;
  size: string;
  pieces: number;
  pricePerPiece: number;
  totalValue: number;
  machineType: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  estimatedTime: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export const MobileOperatorDashboard: React.FC<MobileOperatorDashboardProps> = ({
  operatorId,
  operatorName
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current');
  const [currentWork, setCurrentWork] = useState<WorkItem[]>([]);
  const [availableWork, setAvailableWork] = useState<AvailableWork[]>([]);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [showWorkDetail, setShowWorkDetail] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCurrentWork: WorkItem[] = [
      {
        id: '1',
        bundleNumber: 'BATCH-001-Blue-XL-001',
        operation: 'Shoulder Join',
        articleNumber: 'TSA-001',
        color: 'Blue',
        size: 'XL',
        pieces: 30,
        completedPieces: 18,
        pricePerPiece: 1.5,
        totalEarning: 27.0,
        status: 'started',
        estimatedTime: 25,
        machineType: 'overlock',
        qualityGrade: 'A',
        priority: 'normal'
      },
      {
        id: '2', 
        bundleNumber: 'BATCH-002-Red-L-005',
        operation: 'Side Seam',
        articleNumber: 'TSA-002',
        color: 'Red',
        size: 'L',
        pieces: 25,
        completedPieces: 0,
        pricePerPiece: 2.0,
        totalEarning: 0,
        status: 'assigned',
        estimatedTime: 30,
        machineType: 'overlock',
        priority: 'high'
      }
    ];

    const mockAvailableWork: AvailableWork[] = [
      {
        id: '3',
        bundleNumber: 'BATCH-003-Green-2XL-008',
        operation: 'Bottom Hem',
        articleNumber: 'TSA-001',
        color: 'Green',
        size: '2XL',
        pieces: 35,
        pricePerPiece: 1.75,
        totalValue: 61.25,
        machineType: 'flatlock',
        skillLevel: 'beginner',
        estimatedTime: 40,
        priority: 'normal'
      },
      {
        id: '4',
        bundleNumber: 'BATCH-004-Black-XL-012',
        operation: 'Neck Bind',
        articleNumber: 'TSA-003',
        color: 'Black',
        size: 'XL',
        pieces: 20,
        pricePerPiece: 2.5,
        totalValue: 50.0,
        machineType: 'overlock',
        skillLevel: 'intermediate',
        estimatedTime: 35,
        priority: 'urgent'
      }
    ];

    setCurrentWork(mockCurrentWork);
    setAvailableWork(mockAvailableWork);
  }, []);

  const calculateDayStats = () => {
    const totalEarnings = currentWork.reduce((sum, work) => sum + work.totalEarning, 0);
    const totalPieces = currentWork.reduce((sum, work) => sum + work.completedPieces, 0);
    const activeJobs = currentWork.filter(work => work.status === 'started').length;
    
    return { totalEarnings, totalPieces, activeJobs };
  };

  const { totalEarnings, totalPieces, activeJobs } = calculateDayStats();

  const getStatusColor = (status: string) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800 border-blue-200',
      'started': 'bg-green-100 text-green-800 border-green-200',
      'paused': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-gray-500',
      'normal': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-500';
  };

  const getMachineIcon = (machineType: string) => {
    const icons = {
      'single_needle': '🪡',
      'overlock': '✂️',
      'flatlock': '📎',
      'finishing': '✨'
    };
    return icons[machineType as keyof typeof icons] || '🪡';
  };

  const handleStartWork = (workId: string) => {
    setCurrentWork(prev => prev.map(work => 
      work.id === workId 
        ? { ...work, status: 'started' as const }
        : work
    ));
  };

  const handlePauseWork = (workId: string) => {
    setCurrentWork(prev => prev.map(work => 
      work.id === workId 
        ? { ...work, status: 'paused' as const }
        : work
    ));
  };

  const handleTakeJob = (availableWork: AvailableWork) => {
    const newWork: WorkItem = {
      id: availableWork.id,
      bundleNumber: availableWork.bundleNumber,
      operation: availableWork.operation,
      articleNumber: availableWork.articleNumber,
      color: availableWork.color,
      size: availableWork.size,
      pieces: availableWork.pieces,
      completedPieces: 0,
      pricePerPiece: availableWork.pricePerPiece,
      totalEarning: 0,
      status: 'assigned',
      estimatedTime: availableWork.estimatedTime,
      machineType: availableWork.machineType,
      priority: availableWork.priority
    };

    setCurrentWork(prev => [...prev, newWork]);
    setAvailableWork(prev => prev.filter(work => work.id !== availableWork.id));
    setActiveTab('current');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Good Morning!</h2>
            <p className="text-blue-100 text-sm">{operatorName}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-100">Today</div>
            <div className="text-lg font-bold">₹{totalEarnings.toFixed(2)}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <CurrencyRupeeIcon className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">₹{totalEarnings.toFixed(0)}</div>
            <div className="text-xs text-blue-100">Earned</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <CheckCircleIcon className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">{totalPieces}</div>
            <div className="text-xs text-blue-100">Pieces</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <ClockIcon className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-semibold">{activeJobs}</div>
            <div className="text-xs text-blue-100">Active</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('current')}
            className={cn(
              "flex-1 py-4 px-4 text-center text-sm font-medium border-b-2 transition-colors",
              activeTab === 'current'
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            )}
          >
            My Work ({currentWork.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={cn(
              "flex-1 py-4 px-4 text-center text-sm font-medium border-b-2 transition-colors",
              activeTab === 'available'
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            )}
          >
            Available ({availableWork.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'current' ? (
          <div className="p-4 space-y-4">
            {currentWork.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">No active work</p>
                <p className="text-gray-400 text-sm">Check available jobs to get started</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              currentWork.map((work) => (
                <div key={work.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Work Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMachineIcon(work.machineType)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{work.operation}</h3>
                          <p className="text-sm text-gray-500">{work.bundleNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={cn("text-xs font-medium", getPriorityColor(work.priority))}>
                          {work.priority.toUpperCase()}
                        </span>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(work.status)
                        )}>
                          {work.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {work.articleNumber} • {work.color} {work.size}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-600">
                        Progress: {work.completedPieces}/{work.pieces} pieces
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        ₹{work.totalEarning.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(work.completedPieces / work.pieces) * 100}%` }}
                      />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Rate</div>
                        <div className="font-semibold">₹{work.pricePerPiece}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Time</div>
                        <div className="font-semibold">{work.estimatedTime}min</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Quality</div>
                        <div className="font-semibold">{work.qualityGrade || 'A'}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {work.status === 'assigned' && (
                        <button
                          onClick={() => handleStartWork(work.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                        >
                          <PlayIcon className="h-5 w-5" />
                          <span>Start Work</span>
                        </button>
                      )}
                      
                      {work.status === 'started' && (
                        <>
                          <button
                            onClick={() => handlePauseWork(work.id)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                          >
                            <PauseIcon className="h-5 w-5" />
                            <span>Pause</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWork(work);
                              setShowWorkDetail(true);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Complete</span>
                          </button>
                        </>
                      )}
                      
                      {work.status === 'paused' && (
                        <button
                          onClick={() => handleStartWork(work.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                        >
                          <PlayIcon className="h-5 w-5" />
                          <span>Resume</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedWork(work);
                          setShowWorkDetail(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-4 rounded-xl transition-colors"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Available Work Tab */
          <div className="p-4 space-y-4">
            {availableWork.length === 0 ? (
              <div className="text-center py-12">
                <HandRaisedIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">No available work</p>
                <p className="text-gray-400 text-sm">Check back later for new assignments</p>
              </div>
            ) : (
              availableWork.map((work) => (
                <div key={work.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMachineIcon(work.machineType)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{work.operation}</h3>
                          <p className="text-sm text-gray-500">{work.bundleNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-xs font-medium mb-1", getPriorityColor(work.priority))}>
                          {work.priority.toUpperCase()}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{work.totalValue.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {work.articleNumber} • {work.color} {work.size} • {work.pieces} pieces
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Rate</div>
                        <div className="text-sm font-semibold">₹{work.pricePerPiece}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Time</div>
                        <div className="text-sm font-semibold">{work.estimatedTime}min</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Skill</div>
                        <div className="text-sm font-semibold capitalize">{work.skillLevel[0].toUpperCase()}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Value</div>
                        <div className="text-sm font-semibold">₹{work.totalValue.toFixed(0)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTakeJob(work)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg"
                    >
                      <HandRaisedIcon className="h-5 w-5" />
                      <span>Take This Job</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-4 z-10">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
          <TrophyIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Work Detail Modal */}
      {showWorkDetail && selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-2xl animate-slide-up">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Work Details</h3>
                <button
                  onClick={() => setShowWorkDetail(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-2">{selectedWork.operation}</h4>
                <p className="text-sm text-gray-600">{selectedWork.bundleNumber}</p>
                <p className="text-sm text-gray-600">{selectedWork.articleNumber} • {selectedWork.color} {selectedWork.size}</p>
              </div>
              
              {/* Completion Form would go here */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Completed Pieces</span>
                  <input
                    type="number"
                    max={selectedWork.pieces}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Enter completed pieces"
                  />
                </label>
                
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Quality Grade</span>
                  <select className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="A+">A+ Grade</option>
                    <option value="A">A Grade</option>
                    <option value="B">B Grade</option>
                    <option value="C">C Grade</option>
                  </select>
                </label>
                
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors">
                  Submit Completion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOperatorDashboard;