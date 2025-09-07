// Operator Work Dashboard
// Comprehensive dashboard for operators to track their work progress

import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  UserIcon,
  CpuChipIcon,
  CalendarDaysIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/empty-state';
import {
  useOperatorAssignments,
  useStartWorkSession,
  usePauseWorkSession,
  useCompleteAssignment
} from '../hooks/use-work-assignments';
import type {
  WorkAssignmentSummary,
  WorkSession
} from '../types';
import {
  ASSIGNMENT_STATUS
} from '../types';

interface OperatorWorkDashboardProps {
  operatorId: string;
  operatorName: string;
  operatorSkills: {
    skillLevel: string;
    efficiency: number;
    qualityScore: number;
  };
}

interface LiveSession {
  assignmentId: string;
  startTime: Date;
  currentDuration: number;
  targetPieces: number;
  completedPieces: number;
  breaksTaken: number;
  totalBreakTime: number;
  currentEfficiency: number;
  isOnBreak: boolean;
  breakStartTime?: Date;
}

interface DashboardStats {
  todayHours: number;
  todayEarnings: number;
  todayPieces: number;
  avgEfficiency: number;
  completedAssignments: number;
  activeAssignments: number;
}

export const OperatorWorkDashboard: React.FC<OperatorWorkDashboardProps> = ({
  operatorId,
  operatorName,
  operatorSkills
}) => {
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakType, setBreakType] = useState<'tea' | 'lunch' | 'personal' | 'maintenance'>('tea');

  // Fetch assignments
  const { 
    data: assignmentsResult, 
    isLoading, 
    refetch 
  } = useOperatorAssignments(operatorId);

  // Mutations
  const startSessionMutation = useStartWorkSession();
  const pauseSessionMutation = usePauseWorkSession();
  const completeAssignmentMutation = useCompleteAssignment();

  const assignments = assignmentsResult?.success ? assignmentsResult.data?.items || [] : [];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update active session duration
      if (activeSession && !activeSession.isOnBreak) {
        setActiveSession(prev => prev ? {
          ...prev,
          currentDuration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        } : null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Calculate dashboard statistics
  const dashboardStats: DashboardStats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAssignments = assignments.filter(a => 
      new Date(a.assignedDate) >= today
    );

    const completedToday = todayAssignments.filter(a => a.status === 'completed');
    const activeToday = todayAssignments.filter(a => 
      ['assigned', 'started'].includes(a.status)
    );

    return {
      todayHours: completedToday.reduce((sum, a) => sum + (a.actualDuration || 0), 0) / 60,
      todayEarnings: completedToday.reduce((sum, a) => sum + a.estimatedEarnings, 0),
      todayPieces: completedToday.reduce((sum, a) => sum + (a.completedPieces || 0), 0),
      avgEfficiency: assignments.length > 0 
        ? assignments.reduce((sum, a) => sum + a.efficiency, 0) / assignments.length
        : 0,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      activeAssignments: activeToday.length
    };
  }, [assignments]);

  // Start work session
  const handleStartWork = async (assignment: WorkAssignmentSummary) => {
    try {
      await startSessionMutation.mutateAsync({
        assignmentId: assignment.id,
        operatorId
      });

      setActiveSession({
        assignmentId: assignment.id,
        startTime: new Date(),
        currentDuration: 0,
        targetPieces: assignment.targetPieces || 0,
        completedPieces: assignment.completedPieces || 0,
        breaksTaken: 0,
        totalBreakTime: 0,
        currentEfficiency: assignment.efficiency,
        isOnBreak: false
      });

    } catch (error) {
      console.error('Failed to start work session:', error);
    }
  };

  // Pause/Resume work
  const handlePauseResume = async () => {
    if (!activeSession) return;

    try {
      if (activeSession.isOnBreak) {
        // Resume work
        await startSessionMutation.mutateAsync({
          assignmentId: activeSession.assignmentId,
          operatorId
        });

        setActiveSession(prev => prev ? {
          ...prev,
          isOnBreak: false,
          breakStartTime: undefined,
          totalBreakTime: prev.totalBreakTime + (prev.breakStartTime 
            ? Math.floor((Date.now() - prev.breakStartTime.getTime()) / 1000)
            : 0
          )
        } : null);
      } else {
        // Take break
        setShowBreakModal(true);
      }
    } catch (error) {
      console.error('Failed to pause/resume work:', error);
    }
  };

  // Start break
  const handleStartBreak = async () => {
    if (!activeSession) return;

    try {
      await pauseSessionMutation.mutateAsync({
        assignmentId: activeSession.assignmentId,
        breakType,
        reason: `${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break`
      });

      setActiveSession(prev => prev ? {
        ...prev,
        isOnBreak: true,
        breakStartTime: new Date(),
        breaksTaken: prev.breaksTaken + 1
      } : null);

      setShowBreakModal(false);
    } catch (error) {
      console.error('Failed to start break:', error);
    }
  };

  // Complete work
  const handleCompleteWork = async () => {
    if (!activeSession) return;

    try {
      await completeAssignmentMutation.mutateAsync({
        assignmentId: activeSession.assignmentId,
        completedPieces: activeSession.completedPieces,
        actualDuration: activeSession.currentDuration,
        operatorNotes: 'Completed via dashboard'
      });

      setActiveSession(null);
      refetch();
    } catch (error) {
      console.error('Failed to complete work:', error);
    }
  };

  // Format time duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Dashboard</h1>
          <p className="text-gray-600">Welcome back, {operatorName}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <ClockIcon className="h-3 w-3" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </Badge>
        </div>
      </div>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hours Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats.todayHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Earnings Today</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{dashboardStats.todayEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pieces Today</p>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardStats.todayPieces}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(dashboardStats.avgEfficiency * 100)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Work Session */}
      {activeSession && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${activeSession.isOnBreak ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span>{activeSession.isOnBreak ? 'On Break' : 'Active Work Session'}</span>
            </h3>
            
            <div className="flex space-x-2">
              <Button
                onClick={handlePauseResume}
                variant={activeSession.isOnBreak ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-1"
              >
                {activeSession.isOnBreak ? (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <PauseIcon className="h-4 w-4" />
                    <span>Break</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleCompleteWork}
                size="sm"
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Complete</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">
                {formatDuration(activeSession.currentDuration)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-xl font-bold text-blue-600">
                {activeSession.completedPieces}/{activeSession.targetPieces}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className={`text-xl font-bold ${
                activeSession.currentEfficiency > 0.8 ? 'text-green-600' : 
                activeSession.currentEfficiency > 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(activeSession.currentEfficiency * 100)}%
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Breaks</p>
              <p className="text-xl font-bold text-gray-900">
                {activeSession.breaksTaken} ({formatDuration(activeSession.totalBreakTime)})
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Work Progress</span>
              <span className="text-gray-900">
                {Math.round((activeSession.completedPieces / activeSession.targetPieces) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                style={{ 
                  width: `${Math.min(100, (activeSession.completedPieces / activeSession.targetPieces) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      {/* My Assignments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Assignments</h3>
          <Badge variant="primary">
            {dashboardStats.activeAssignments} active
          </Badge>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            icon={UserIcon}
            title="No assignments yet"
            description="You don't have any work assignments. Check back later or request available work."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => {
              const statusConfig = ASSIGNMENT_STATUS[assignment.status as keyof typeof ASSIGNMENT_STATUS];
              const isActive = activeSession?.assignmentId === assignment.id;
              
              return (
                <Card
                  key={assignment.id}
                  className={`p-4 transition-all duration-200 ${
                    isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {assignment.bundleNumber}
                    </h4>
                    <Badge
                      variant={statusConfig?.color as any}
                      className="flex items-center space-x-1"
                    >
                      <span>{statusConfig?.icon}</span>
                      <span className="text-xs">{statusConfig?.label}</span>
                    </Badge>
                  </div>

                  {/* Work Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CpuChipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{assignment.operation}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">{assignment.machineType}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{assignment.progress.toFixed(1)}% complete</span>
                      <span className="text-green-600 font-medium">
                        ₹{assignment.estimatedEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          assignment.progress === 100 
                            ? 'bg-green-500' 
                            : assignment.progress > 50 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${assignment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {assignment.status === 'assigned' && !activeSession && (
                    <Button
                      onClick={() => handleStartWork(assignment)}
                      disabled={startSessionMutation.isPending}
                      className="w-full flex items-center space-x-2"
                    >
                      {startSessionMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4" />
                          <span>Start Work</span>
                        </>
                      )}
                    </Button>
                  )}

                  {assignment.status === 'started' && !isActive && (
                    <Button
                      onClick={() => handleStartWork(assignment)}
                      variant="outline"
                      className="w-full"
                    >
                      Resume Work
                    </Button>
                  )}

                  {assignment.status === 'completed' && (
                    <div className="flex items-center justify-center space-x-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Break Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Take a Break</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Type
              </label>
              <select
                value={breakType}
                onChange={(e) => setBreakType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tea">Tea Break (15 min)</option>
                <option value="lunch">Lunch Break (60 min)</option>
                <option value="personal">Personal Break (10 min)</option>
                <option value="maintenance">Machine Maintenance</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowBreakModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartBreak}
                className="flex-1"
              >
                Start Break
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};