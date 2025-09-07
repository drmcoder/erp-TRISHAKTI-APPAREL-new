// Approval Workflow Component for Supervisors
// Manages assignment requests with batch approval capabilities

import React, { useState, useMemo } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FunnelIcon,
  ChartBarIcon,
  StarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/input';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/empty-state';
import {
  usePendingAssignmentRequests,
  useApproveAssignmentRequest,
  useRejectAssignmentRequest,
  useBulkProcessRequests
} from '../hooks/use-work-assignments';
import type { AssignmentRequest } from '../types';
import { WORK_PRIORITIES } from '../types';

interface ApprovalWorkflowProps {
  supervisorId: string;
  onRequestProcessed?: (requestId: string, action: 'approved' | 'rejected') => void;
}

interface RequestWithAnalysis extends AssignmentRequest {
  operatorName: string;
  operatorEfficiency: number;
  workItemDetails: {
    bundleNumber: string;
    operation: string;
    machineType: string;
    estimatedDuration: number;
    ratePerPiece: number;
    targetPieces: number;
  };
  riskFactors: string[];
  recommendations: string[];
  autoApprovalEligible: boolean;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  supervisorId,
  onRequestProcessed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'auto_eligible'>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending requests
  const { 
    data: requestsResult, 
    isLoading, 
    refetch 
  } = usePendingAssignmentRequests();

  // Mutations
  const approveRequestMutation = useApproveAssignmentRequest();
  const rejectRequestMutation = useRejectAssignmentRequest();
  const bulkProcessMutation = useBulkProcessRequests();

  // Mock data with analysis (in real implementation, this would come from API)
  const mockRequestsWithAnalysis: RequestWithAnalysis[] = [
    {
      id: 'req_001',
      workItemId: 'work_001',
      operatorId: 'op_001',
      operatorName: 'Maya Sharma',
      operatorEfficiency: 0.89,
      requestType: 'self_assignment',
      requestedAt: new Date('2024-01-15T10:30:00'),
      reason: 'I have experience with this type of stitching and am available',
      status: 'pending',
      skillMatches: true,
      machineAvailable: true,
      workloadAcceptable: true,
      timeSlotAvailable: true,
      priorityScore: 85,
      workComplexity: 6,
      expiresAt: new Date('2024-01-16T10:30:00'),
      workItemDetails: {
        bundleNumber: 'BDL-2024-001',
        operation: 'Side Seam Stitching',
        machineType: 'sewing',
        estimatedDuration: 45,
        ratePerPiece: 15,
        targetPieces: 50
      },
      riskFactors: [],
      recommendations: [
        'High efficiency operator',
        'Perfect skill match',
        'Machine expertise'
      ],
      autoApprovalEligible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'req_002',
      workItemId: 'work_002',
      operatorId: 'op_002',
      operatorName: 'Ram Thapa',
      operatorEfficiency: 0.65,
      requestType: 'self_assignment',
      requestedAt: new Date('2024-01-15T11:00:00'),
      reason: 'Want to learn this new technique',
      status: 'pending',
      skillMatches: false,
      machineAvailable: true,
      workloadAcceptable: true,
      timeSlotAvailable: true,
      priorityScore: 45,
      workComplexity: 8,
      expiresAt: new Date('2024-01-16T11:00:00'),
      workItemDetails: {
        bundleNumber: 'BDL-2024-002',
        operation: 'Button Hole Making',
        machineType: 'sewing',
        estimatedDuration: 60,
        ratePerPiece: 25,
        targetPieces: 30
      },
      riskFactors: [
        'Skill level mismatch',
        'Complex operation',
        'Lower efficiency operator'
      ],
      recommendations: [
        'Provide additional supervision',
        'Consider training first',
        'Pair with experienced operator'
      ],
      autoApprovalEligible: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Filter requests
  const filteredRequests = useMemo(() => {
    let filtered = mockRequestsWithAnalysis;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.operatorName.toLowerCase().includes(term) ||
        req.workItemDetails.bundleNumber.toLowerCase().includes(term) ||
        req.workItemDetails.operation.toLowerCase().includes(term)
      );
    }

    // Status filter
    switch (statusFilter) {
      case 'pending':
        filtered = filtered.filter(req => req.status === 'pending');
        break;
      case 'auto_eligible':
        filtered = filtered.filter(req => req.autoApprovalEligible);
        break;
      default:
        // Show all
        break;
    }

    // Sort by priority score (highest first)
    return filtered.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [mockRequestsWithAnalysis, searchTerm, statusFilter]);

  // Handle individual request approval
  const handleApproveRequest = async (request: RequestWithAnalysis) => {
    try {
      await approveRequestMutation.mutateAsync({
        requestId: request.id!,
        notes: 'Approved by supervisor'
      });
      onRequestProcessed?.(request.id!, 'approved');
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  // Handle individual request rejection
  const handleRejectRequest = async (request: RequestWithAnalysis, reason: string) => {
    try {
      await rejectRequestMutation.mutateAsync({
        requestId: request.id!,
        reason: reason || 'Rejected by supervisor'
      });
      onRequestProcessed?.(request.id!, 'rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedRequests.length === 0) return;

    try {
      await bulkProcessMutation.mutateAsync({
        requestIds: selectedRequests,
        action: bulkAction,
        reason: bulkAction === 'reject' ? rejectionReason : 'Bulk approved by supervisor'
      });
      
      setSelectedRequests([]);
      setShowBulkModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to process bulk requests:', error);
    }
  };

  // Auto-approve eligible requests
  const handleAutoApprove = async () => {
    const autoEligibleRequests = filteredRequests
      .filter(req => req.autoApprovalEligible && req.status === 'pending')
      .map(req => req.id!);

    if (autoEligibleRequests.length === 0) return;

    try {
      await bulkProcessMutation.mutateAsync({
        requestIds: autoEligibleRequests,
        action: 'approve',
        reason: 'Auto-approved based on AI analysis'
      });
    } catch (error) {
      console.error('Failed to auto-approve requests:', error);
    }
  };

  // Toggle request selection
  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Select all/none
  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id!));
    }
  };

  // Get priority badge color
  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const autoEligibleCount = filteredRequests.filter(req => req.autoApprovalEligible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Assignment Approvals</h2>
          <p className="text-gray-600">
            Review and approve operator assignment requests
          </p>
        </div>
        
        <div className="flex space-x-2">
          {autoEligibleCount > 0 && (
            <Button
              onClick={handleAutoApprove}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <StarIcon className="h-4 w-4" />
              <span>Auto-Approve ({autoEligibleCount})</span>
            </Button>
          )}
          
          {selectedRequests.length > 0 && (
            <Button
              onClick={() => setShowBulkModal(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Bulk Actions ({selectedRequests.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Auto-Eligible</p>
              <p className="text-2xl font-bold text-green-600">{autoEligibleCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Need Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredRequests.filter(r => !r.autoApprovalEligible).length}
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
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(filteredRequests.reduce((sum, r) => sum + r.priorityScore, 0) / filteredRequests.length || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by operator name, bundle, or operation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Only</option>
            <option value="auto_eligible">Auto-Eligible</option>
          </select>
        </div>
      </Card>

      {/* Bulk Selection Controls */}
      {selectedRequests.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-700 font-medium">
                {selectedRequests.length} request(s) selected
              </span>
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedRequests.length === filteredRequests.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => {
                  setBulkAction('approve');
                  setShowBulkModal(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Bulk Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBulkAction('reject');
                  setShowBulkModal(true);
                }}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Bulk Reject
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Requests List */}
      <div>
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={CheckCircleIcon}
            title="No assignment requests"
            description={
              searchTerm || statusFilter !== 'all'
                ? "Try adjusting your filters"
                : "All assignment requests have been processed"
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className={`p-6 ${
                  selectedRequests.includes(request.id!) 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : request.autoApprovalEligible
                    ? 'border-green-200 bg-green-50'
                    : request.riskFactors.length > 0
                    ? 'border-yellow-200 bg-yellow-50'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id!)}
                      onChange={() => toggleRequestSelection(request.id!)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Request Details */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <h4 className="font-semibold text-gray-900">{request.operatorName}</h4>
                        </div>
                        
                        <Badge variant={getPriorityColor(request.priorityScore)}>
                          {request.priorityScore}% match
                        </Badge>
                        
                        {request.autoApprovalEligible && (
                          <Badge variant="success" className="flex items-center space-x-1">
                            <StarIcon className="h-3 w-3" />
                            <span>Auto-Eligible</span>
                          </Badge>
                        )}
                      </div>

                      {/* Work Item Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Bundle & Operation</p>
                          <p className="font-medium text-gray-900">{request.workItemDetails.bundleNumber}</p>
                          <p className="text-sm text-gray-600">{request.workItemDetails.operation}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Machine Type</p>
                            <div className="flex items-center space-x-1">
                              <CpuChipIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {request.workItemDetails.machineType}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {request.workItemDetails.estimatedDuration}min
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Earnings Potential</p>
                          <p className="font-medium text-green-600">
                            ₹{(request.workItemDetails.ratePerPiece * request.workItemDetails.targetPieces).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Operator Request Details */}
                      <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">Operator's Request</span>
                        </div>
                        <p className="text-sm text-gray-700">{request.reason}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {request.requestedAt.toLocaleString()}
                        </p>
                      </div>

                      {/* AI Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recommendations */}
                        {request.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center space-x-1">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>AI Recommendations</span>
                            </h5>
                            <div className="space-y-1">
                              {request.recommendations.map((rec, index) => (
                                <Badge key={index} variant="outline" className="text-xs text-green-700 border-green-300">
                                  {rec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risk Factors */}
                        {request.riskFactors.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center space-x-1">
                              <ExclamationTriangleIcon className="h-4 w-4" />
                              <span>Risk Factors</span>
                            </h5>
                            <div className="space-y-1">
                              {request.riskFactors.map((risk, index) => (
                                <Badge key={index} variant="outline" className="text-xs text-red-700 border-red-300">
                                  {risk}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request)}
                      disabled={approveRequestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 min-w-[80px]"
                    >
                      {approveRequestMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request, '')}
                      disabled={rejectRequestMutation.isPending}
                      className="text-red-600 border-red-600 hover:bg-red-50 min-w-[80px]"
                    >
                      {rejectRequestMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Reject'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {bulkAction === 'approve' ? 'Bulk Approve' : 'Bulk Reject'} Requests
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {bulkAction === 'approve' 
                ? `Approve ${selectedRequests.length} selected request(s)?`
                : `Reject ${selectedRequests.length} selected request(s)?`
              }
            </p>

            {bulkAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <Input
                  placeholder="Why are these requests being rejected?"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowBulkModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAction}
                disabled={bulkProcessMutation.isPending || (bulkAction === 'reject' && !rejectionReason)}
                className={`flex-1 ${
                  bulkAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {bulkProcessMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  bulkAction === 'approve' ? 'Approve All' : 'Reject All'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};