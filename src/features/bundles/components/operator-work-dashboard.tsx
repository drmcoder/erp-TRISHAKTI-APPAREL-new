// Operator Work Dashboard - Shows assigned operations and tracks earnings
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ChartBarIcon,
  WrenchIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import type { BundleOperation, OperatorEarnings, PartsReplacementRequest } from '@/shared/types/bundle-types';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { notify } from '@/utils/notification-utils';

interface OperatorWorkDashboardProps {
  operatorId: string;
  operatorName: string;
}

// Mock assigned operations data
const mockAssignedOperations: (BundleOperation & { bundleNumber: string })[] = [
  {
    id: 'BND-3233-M-001-OP-1',
    bundleId: 'bundle_1',
    bundleNumber: 'BND-3233-M-001',
    operationId: 'op_1',
    name: 'Shoulder Join',
    nameNepali: 'काँध जोड्ने',
    description: 'Join front and back shoulders',
    machineType: 'overlock',
    sequenceOrder: 1,
    pricePerPiece: 2.5,
    smvMinutes: 4.5,
    status: 'assigned',
    assignedOperatorId: 'DYNAMIC_OPERATOR_ID',
    assignedOperatorName: 'DYNAMIC_OPERATOR_NAME',
    assignedAt: new Date('2024-01-15T08:30:00'),
    prerequisites: [],
    isOptional: false,
    qualityCheckRequired: true,
    defectTolerance: 5
  },
  {
    id: 'BND-3265-S-002-OP-3',
    bundleId: 'bundle_2',
    bundleNumber: 'BND-3265-S-002',
    operationId: 'op_3',
    name: 'Sleeve Attach',
    nameNepali: 'आस्तीन लगाउने',
    description: 'Attach sleeves to body',
    machineType: 'overlock',
    sequenceOrder: 3,
    pricePerPiece: 4.0,
    smvMinutes: 7.0,
    status: 'in_progress',
    assignedOperatorId: 'DYNAMIC_OPERATOR_ID',
    assignedOperatorName: 'DYNAMIC_OPERATOR_NAME',
    assignedAt: new Date('2024-01-15T09:15:00'),
    startedAt: new Date('2024-01-15T09:30:00'),
    prerequisites: ['op_1', 'op_2'],
    isOptional: false,
    qualityCheckRequired: true,
    defectTolerance: 3
  }
];

// Mock earnings history
const mockEarnings: OperatorEarnings[] = [
  {
    operatorId: 'DYNAMIC_OPERATOR_ID',
    operatorName: 'DYNAMIC_OPERATOR_NAME',
    bundleId: 'bundle_1',
    bundleNumber: 'BND-3233-M-003',
    operationId: 'BND-3233-M-003-OP-1',
    operationName: 'Shoulder Join',
    baseRate: 2.5,
    piecesCompleted: 1,
    totalEarnings: 2.75,
    smvAllocated: 4.5,
    actualTimeSpent: 4.0,
    efficiency: 112.5,
    qualityRating: 'excellent',
    qualityBonus: 0.25,
    completedAt: new Date('2024-01-15T10:15:00'),
    paymentStatus: 'pending'
  },
  {
    operatorId: 'DYNAMIC_OPERATOR_ID',
    operatorName: 'DYNAMIC_OPERATOR_NAME',
    bundleId: 'bundle_2',
    bundleNumber: 'BND-3265-L-001',
    operationId: 'BND-3265-L-001-OP-2',
    operationName: 'Side Seam',
    baseRate: 3.0,
    piecesCompleted: 1,
    totalEarnings: 3.0,
    smvAllocated: 5.0,
    actualTimeSpent: 5.5,
    efficiency: 90.9,
    qualityRating: 'good',
    qualityBonus: 0,
    completedAt: new Date('2024-01-15T11:30:00'),
    paymentStatus: 'pending'
  }
];

export const OperatorWorkDashboard: React.FC<OperatorWorkDashboardProps> = ({
  operatorId,
  operatorName
}) => {
  // ✅ FIXED: Replace dynamic placeholders with real operator data
  const getDynamicOperations = () => {
    return mockAssignedOperations.map(op => ({
      ...op,
      assignedOperatorId: operatorId,
      assignedOperatorName: operatorName
    }));
  };
  
  const getDynamicEarnings = () => {
    return mockEarnings.map(earning => ({
      ...earning,
      operatorId: operatorId,
      operatorName: operatorName
    }));
  };

  const [assignedOps, setAssignedOps] = useState<(BundleOperation & { bundleNumber: string })[]>(getDynamicOperations());
  const [earnings, setEarnings] = useState<OperatorEarnings[]>(getDynamicEarnings());
  const [activeOperation, setActiveOperation] = useState<string | null>(
    assignedOps.find(op => op.status === 'in_progress')?.id || null
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [completingOperation, setCompletingOperation] = useState<BundleOperation | null>(null);
  const [qualityRating, setQualityRating] = useState<OperatorEarnings['qualityRating']>('good');
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [complainingOperation, setComplainingOperation] = useState<(BundleOperation & { bundleNumber: string }) | null>(null);
  const [partsComplaint, setPartsComplaint] = useState<Partial<PartsReplacementRequest>>({});

  // Timer effect for active operation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeOperation && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)); // in minutes
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeOperation, startTime]);

  // Start operation
  const handleStartOperation = async (operation: BundleOperation & { bundleNumber: string }) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date();
      setAssignedOps(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'in_progress' as const, startedAt: now }
          : op
      ));
      
      setActiveOperation(operation.id);
      setStartTime(now);
      setElapsedTime(0);
      
    } catch (error) {
      console.error('Start operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pause operation
  const handlePauseOperation = async (operationId: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssignedOps(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'assigned' as const }
          : op
      ));
      
      setActiveOperation(null);
      setStartTime(null);
      setElapsedTime(0);
      
    } catch (error) {
      console.error('Pause operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete operation
  const handleCompleteOperation = (operation: BundleOperation & { bundleNumber: string }) => {
    setCompletingOperation(operation);
    setShowQualityModal(true);
  };

  // Report parts issue
  const handleReportPartsIssue = (operation: BundleOperation & { bundleNumber: string }) => {
    setComplainingOperation(operation);
    setPartsComplaint({
      bundleId: operation.bundleId,
      operationId: operation.id,
      issueType: 'damaged',
      damagedParts: [],
      description: '',
      priority: 'normal'
    });
    setShowPartsModal(true);
  };

  // Submit parts complaint
  const submitPartsComplaint = async () => {
    if (!complainingOperation || !partsComplaint.damagedParts?.length || !partsComplaint.description) {
      notify.warning('Please fill in all required fields', 'Form Incomplete');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update operation status to parts_issue
      setAssignedOps(prev => prev.map(op => 
        op.id === complainingOperation.id 
          ? { ...op, status: 'parts_issue' as const }
          : op
      ));
      
      // Reset active operation if this was the active one
      if (activeOperation === complainingOperation.id) {
        setActiveOperation(null);
        setStartTime(null);
        setElapsedTime(0);
      }
      
      setShowPartsModal(false);
      setComplainingOperation(null);
      setPartsComplaint({});
      
      notify.success('Parts replacement request submitted successfully. Supervisor has been notified.', 'Request Submitted');
      
    } catch (error) {
      console.error('Submit parts complaint failed:', error);
      notify.error('Failed to submit complaint. Please try again.', 'Submission Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm completion with quality rating
  const confirmCompletion = async () => {
    if (!completingOperation) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const actualTime = elapsedTime || completingOperation.smvMinutes;
      const efficiency = (completingOperation.smvMinutes / actualTime) * 100;
      const qualityBonus = qualityRating === 'excellent' ? completingOperation.pricePerPiece * 0.1 : 0;
      const totalEarnings = completingOperation.pricePerPiece + qualityBonus;
      
      // Create earnings record
      const newEarning: OperatorEarnings = {
        operatorId,
        operatorName,
        bundleId: completingOperation.bundleId,
        bundleNumber: completingOperation.bundleNumber,
        operationId: completingOperation.id,
        operationName: completingOperation.name,
        baseRate: completingOperation.pricePerPiece,
        piecesCompleted: 1,
        totalEarnings,
        smvAllocated: completingOperation.smvMinutes,
        actualTimeSpent: actualTime,
        efficiency: Math.round(efficiency * 100) / 100,
        qualityRating,
        qualityBonus,
        completedAt: new Date(),
        paymentStatus: 'pending'
      };
      
      setEarnings(prev => [newEarning, ...prev]);
      
      // Update operation status
      setAssignedOps(prev => prev.filter(op => op.id !== completingOperation.id));
      
      // Reset active operation
      setActiveOperation(null);
      setStartTime(null);
      setElapsedTime(0);
      
      setShowQualityModal(false);
      setCompletingOperation(null);
      
    } catch (error) {
      console.error('Complete operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const todayEarnings = earnings
    .filter(e => new Date(e.completedAt).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.totalEarnings, 0);
  
  const weeklyEarnings = earnings.reduce((sum, e) => sum + e.totalEarnings, 0);
  const averageEfficiency = earnings.length > 0 
    ? earnings.reduce((sum, e) => sum + e.efficiency, 0) / earnings.length 
    : 0;
  const completedToday = earnings.filter(e => 
    new Date(e.completedAt).toDateString() === new Date().toDateString()
  ).length;

  // Get status color
  const getStatusColor = (status: BundleOperation['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'parts_issue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <PlayIcon className="h-8 w-8 text-green-600" />
            <span>My Work Dashboard</span>
          </h1>
          <p className="text-gray-600">Welcome back, {operatorName}!</p>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Earnings</p>
              <p className="text-xl font-bold text-green-600">Rs. {todayEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrophyIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Total</p>
              <p className="text-xl font-bold text-blue-600">Rs. {weeklyEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className="text-xl font-bold text-purple-600">{averageEfficiency.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-xl font-bold text-yellow-600">{completedToday}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Work Status */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <PlayIcon className="h-6 w-6 text-blue-600" />
            <span>My Current Work</span>
          </h2>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300"
          >
            Refresh Status
          </Button>
        </div>

        {activeOperation ? (
          <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-bold text-purple-900">Working on Operation</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Operation Name:</p>
                    <p className="font-bold text-lg text-gray-900">
                      {assignedOps.find(op => op.id === activeOperation)?.name}
                    </p>
                    <p className="text-sm text-purple-600">
                      ({assignedOps.find(op => op.id === activeOperation)?.nameNepali})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bundle Number:</p>
                    <p className="font-bold text-lg font-mono text-blue-600">
                      {assignedOps.find(op => op.id === activeOperation)?.bundleNumber}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">You'll Earn</p>
                      <p className="text-xl font-bold text-green-600">
                        Rs. {assignedOps.find(op => op.id === activeOperation)?.pricePerPiece}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Target Time</p>
                      <p className="text-xl font-bold text-blue-600">
                        {assignedOps.find(op => op.id === activeOperation)?.smvMinutes} min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Spent</p>
                      <p className="text-xl font-bold text-purple-600">{formatTime(elapsedTime)}</p>
                    </div>
                  </div>
                </div>

                {assignedOps.find(op => op.id === activeOperation)?.description && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-900 font-medium">Instructions:</p>
                    <p className="text-blue-800">
                      {assignedOps.find(op => op.id === activeOperation)?.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-6 flex flex-col space-y-3">
                <Button
                  onClick={() => handlePauseOperation(activeOperation)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center space-x-2 px-6 py-3"
                >
                  <PauseIcon className="h-5 w-5" />
                  <span>Pause Work</span>
                </Button>
                <Button
                  onClick={() => handleCompleteOperation(assignedOps.find(op => op.id === activeOperation)!)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Finish & Get Paid</span>
                </Button>
                <Button
                  onClick={() => handleReportPartsIssue(assignedOps.find(op => op.id === activeOperation)!)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 px-6 py-3"
                >
                  <WrenchIcon className="h-5 w-5" />
                  <span>Report Problem</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No work in progress</h3>
            <p className="text-gray-500 mb-4">You can start a new job from the assigned operations below</p>
            <div className="text-sm text-blue-600">
              👇 Check "My Assigned Operations" section below to start work
            </div>
          </div>
        )}
      </Card>

      {/* Assigned Operations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            My Assigned Operations ({assignedOps.length})
          </h3>
        </div>

        {assignedOps.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No operations assigned yet</h3>
            <p className="text-gray-500 mb-4">Your supervisor will assign new work soon, or you can pick work yourself.</p>
            <div className="text-sm text-blue-600">
              💡 Try the "Self Assignment" section to pick available work
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedOps.map((operation) => (
              <Card key={operation.id} className={`p-6 border-2 ${
                operation.status === 'in_progress' ? 'border-purple-300 bg-purple-50' : 
                operation.status === 'parts_issue' ? 'border-red-300 bg-red-50' : 
                'border-blue-200 hover:border-blue-300'
              } transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                        {operation.bundleNumber}
                      </Badge>
                      <Badge className={`${getStatusColor(operation.status)} text-sm px-3 py-1`}>
                        {operation.status === 'in_progress' ? '🔄 Working' : 
                         operation.status === 'parts_issue' ? '🔧 Parts Issue' : '⏳ Ready to Start'}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{operation.name}</h4>
                      <p className="text-lg text-purple-600">({operation.nameNepali})</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-white p-4 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Step Number</p>
                        <p className="text-lg font-bold text-blue-600">#{operation.sequenceOrder}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">You'll Earn</p>
                        <p className="text-lg font-bold text-green-600">Rs. {operation.pricePerPiece}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Target Time</p>
                        <p className="text-lg font-bold text-blue-600">{operation.smvMinutes} min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Machine Type</p>
                        <p className="text-lg font-bold text-purple-600 capitalize">{operation.machineType}</p>
                      </div>
                    </div>

                    {operation.description && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">📝 Instructions:</p>
                        <p className="text-blue-800">{operation.description}</p>
                      </div>
                    )}
                    
                    {operation.qualityCheckRequired && (
                      <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">⭐ Quality check required for this operation</span>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-3">
                    {operation.status === 'assigned' && (
                      <>
                        <Button
                          onClick={() => handleStartOperation(operation)}
                          disabled={isLoading || activeOperation !== null}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-8 py-4 text-lg"
                          size="lg"
                        >
                          <PlayIcon className="h-6 w-6" />
                          <span>🚀 START WORK</span>
                        </Button>
                        <Button
                          onClick={() => handleReportPartsIssue(operation)}
                          disabled={isLoading}
                          variant="outline"
                          className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 px-6 py-3"
                        >
                          <WrenchIcon className="h-5 w-5" />
                          <span>Report Problem</span>
                        </Button>
                      </>
                    )}

                    {operation.status === 'in_progress' && operation.id === activeOperation && (
                      <>
                        <Button
                          onClick={() => handlePauseOperation(operation.id)}
                          disabled={isLoading}
                          variant="outline"
                          className="flex items-center space-x-2 px-6 py-3"
                        >
                          <PauseIcon className="h-5 w-5" />
                          <span>⏸️ Pause Work</span>
                        </Button>
                        <Button
                          onClick={() => handleCompleteOperation(operation)}
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
                          size="lg"
                        >
                          <CheckCircleIcon className="h-6 w-6" />
                          <span>✅ FINISH & GET PAID</span>
                        </Button>
                        <Button
                          onClick={() => handleReportPartsIssue(operation)}
                          disabled={isLoading}
                          variant="outline"
                          className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 px-6 py-3"
                        >
                          <WrenchIcon className="h-5 w-5" />
                          <span>Report Problem</span>
                        </Button>
                      </>
                    )}

                    {operation.status === 'parts_issue' && (
                      <div className="bg-red-100 p-4 rounded-lg text-center">
                        <ExclamationCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-red-800">🔧 Parts being replaced</p>
                        <p className="text-xs text-red-600">Supervisor is fixing the issue</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Earnings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
        </div>

        {earnings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No earnings yet. Complete operations to see earnings here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {earnings.slice(0, 5).map((earning) => (
              <div key={`${earning.bundleId}-${earning.operationId}`} 
                   className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{earning.operationName}</div>
                  <div className="text-sm text-gray-500">
                    {earning.bundleNumber} • {earning.completedAt.toLocaleTimeString()}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={
                      earning.qualityRating === 'excellent' ? 'success' :
                      earning.qualityRating === 'good' ? 'default' :
                      earning.qualityRating === 'average' ? 'warning' : 'danger'
                    }>
                      {earning.qualityRating}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {earning.efficiency.toFixed(1)}% efficiency
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">Rs. {earning.totalEarnings.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {earning.actualTimeSpent.toFixed(1)}min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quality Rating Modal */}
      {showQualityModal && completingOperation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Complete Operation</h3>
                <p className="text-sm text-gray-500">{completingOperation.name} - {completingOperation.bundleNumber}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How was your work quality?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'excellent', label: 'Excellent', bonus: '+10% bonus', color: 'text-green-600' },
                      { value: 'good', label: 'Good', bonus: 'No bonus', color: 'text-blue-600' },
                      { value: 'average', label: 'Average', bonus: 'No bonus', color: 'text-yellow-600' },
                      { value: 'poor', label: 'Poor', bonus: 'May need rework', color: 'text-red-600' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="quality"
                          value={option.value}
                          checked={qualityRating === option.value}
                          onChange={(e) => setQualityRating(e.target.value as OperatorEarnings['qualityRating'])}
                          className="text-blue-600"
                        />
                        <span className="flex-1">{option.label}</span>
                        <span className={`text-xs ${option.color}`}>{option.bonus}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Base Rate:</span>
                      <span>Rs. {completingOperation.pricePerPiece.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Bonus:</span>
                      <span>Rs. {qualityRating === 'excellent' ? (completingOperation.pricePerPiece * 0.1).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                      <span>Total Earnings:</span>
                      <span className="text-green-600">
                        Rs. {(completingOperation.pricePerPiece + (qualityRating === 'excellent' ? completingOperation.pricePerPiece * 0.1 : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowQualityModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmCompletion}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Complete & Earn'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parts Complaint Modal */}
      {showPartsModal && complainingOperation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <WrenchIcon className="h-5 w-5 text-red-600" />
                  <span>Report Parts Issue</span>
                </h3>
                <p className="text-sm text-gray-500">{complainingOperation.name} - {complainingOperation.bundleNumber}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type
                  </label>
                  <select 
                    value={partsComplaint.issueType || 'damaged'}
                    onChange={(e) => setPartsComplaint({...partsComplaint, issueType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="damaged">Damaged Parts</option>
                    <option value="missing">Missing Parts</option>
                    <option value="defective">Defective Parts</option>
                    <option value="wrong_size">Wrong Size</option>
                    <option value="wrong_color">Wrong Color</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damaged/Missing Parts
                  </label>
                  <div className="space-y-2">
                    {['Front Panel', 'Back Panel', 'Left Sleeve', 'Right Sleeve', 'Collar', 'Cuff', 'Hem', 'Pocket'].map((part) => (
                      <label key={part} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={partsComplaint.damagedParts?.includes(part) || false}
                          onChange={(e) => {
                            const currentParts = partsComplaint.damagedParts || [];
                            if (e.target.checked) {
                              setPartsComplaint({...partsComplaint, damagedParts: [...currentParts, part]});
                            } else {
                              setPartsComplaint({...partsComplaint, damagedParts: currentParts.filter(p => p !== part)});
                            }
                          }}
                          className="text-red-600"
                        />
                        <span className="text-sm">{part}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={partsComplaint.description || ''}
                    onChange={(e) => setPartsComplaint({...partsComplaint, description: e.target.value})}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select 
                    value={partsComplaint.priority || 'normal'}
                    onChange={(e) => setPartsComplaint({...partsComplaint, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPartsModal(false);
                    setPartsComplaint({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitPartsComplaint}
                  disabled={isLoading || !partsComplaint.damagedParts?.length || !partsComplaint.description}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Submit Request'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorWorkDashboard;