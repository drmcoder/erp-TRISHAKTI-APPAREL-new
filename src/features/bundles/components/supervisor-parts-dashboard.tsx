// Supervisor Parts Replacement Dashboard - Handle operator complaints and parts replacement
import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  WrenchIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import type { PartsComplaint, BundleOperation } from '@/shared/types/bundle-types';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { notify } from '@/utils/notification-utils';

// Mock parts complaints data
const mockPartsComplaints: PartsComplaint[] = [
  {
    id: 'complaint_1',
    bundleId: 'bundle_1',
    operationId: 'BND-3233-M-001-OP-2',
    bundleNumber: 'BND-3233-M-001',
    reportedBy: 'op_maya_001',
    reportedByName: 'Maya Patel',
    reportedAt: new Date('2024-01-15T10:30:00'),
    issueType: 'damaged',
    damagedParts: ['Front Panel', 'Left Sleeve'],
    description: 'Found tear in front panel and left sleeve has loose stitching that came apart during handling.',
    status: 'reported',
    priority: 'normal',
    replacedParts: [],
    resolution: 'parts_replaced'
  },
  {
    id: 'complaint_2',
    bundleId: 'bundle_2',
    operationId: 'BND-3265-L-001-OP-1',
    bundleNumber: 'BND-3265-L-001',
    reportedBy: 'op_rajesh_002',
    reportedByName: 'Rajesh Kumar',
    reportedAt: new Date('2024-01-15T11:15:00'),
    issueType: 'missing',
    damagedParts: ['Right Sleeve', 'Collar'],
    description: 'Right sleeve and collar pieces are missing from the bundle.',
    status: 'acknowledged',
    priority: 'high',
    acknowledgedBy: 'supervisor_1',
    acknowledgedByName: 'Ram Sharma',
    acknowledgedAt: new Date('2024-01-15T11:20:00'),
    estimatedReplacementTime: 30,
    replacedParts: [],
    resolution: 'parts_replaced'
  },
  {
    id: 'complaint_3',
    bundleId: 'bundle_3',
    operationId: 'BND-3233-L-002-OP-3',
    bundleNumber: 'BND-3233-L-002',
    reportedBy: 'op_priya_003',
    reportedByName: 'Priya Singh',
    reportedAt: new Date('2024-01-15T09:45:00'),
    issueType: 'wrong_color',
    damagedParts: ['Back Panel'],
    description: 'Back panel is wrong color - received blue instead of red.',
    status: 'replacing',
    priority: 'urgent',
    acknowledgedBy: 'supervisor_1',
    acknowledgedByName: 'Ram Sharma',
    acknowledgedAt: new Date('2024-01-15T10:00:00'),
    replacementStartedAt: new Date('2024-01-15T10:15:00'),
    estimatedReplacementTime: 20,
    replacedParts: [],
    resolution: 'parts_replaced'
  }
];

export const SupervisorPartsDashboard: React.FC = () => {
  const [partsComplaints, setPartsComplaints] = useState<PartsComplaint[]>(mockPartsComplaints);
  const [isLoading, setIsLoading] = useState(false);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<PartsComplaint | null>(null);

  // Handle parts complaint resolution
  const handleComplaintAction = async (
    complaint: PartsComplaint, 
    action: 'acknowledge' | 'start_replacement' | 'complete_replacement' | 'reject',
    notes?: string
  ) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPartsComplaints(prev => prev.map(c => {
        if (c.id !== complaint.id) return c;
        
        const now = new Date();
        switch (action) {
          case 'acknowledge':
            return {
              ...c,
              status: 'acknowledged' as const,
              acknowledgedBy: 'supervisor_1',
              acknowledgedByName: 'Ram Sharma',
              acknowledgedAt: now,
              estimatedReplacementTime: 30,
              supervisorNotes: notes || ''
            };
          case 'start_replacement':
            return {
              ...c,
              status: 'replacing' as const,
              replacementStartedAt: now,
              supervisorNotes: notes || c.supervisorNotes
            };
          case 'complete_replacement':
            return {
              ...c,
              status: 'resolved' as const,
              replacementCompletedAt: now,
              resolvedAt: now,
              replacedParts: c.damagedParts,
              operatorNotified: true,
              operatorNotifiedAt: now,
              replacementNotes: notes || ''
            };
          case 'reject':
            return {
              ...c,
              status: 'rejected' as const,
              resolvedAt: now,
              supervisorNotes: notes || ''
            };
          default:
            return c;
        }
      }));
      
      if (action === 'complete_replacement') {
        notify.success(`Parts replacement completed for ${complaint.bundleNumber}! Operator ${complaint.reportedByName} has been notified and can continue work.`, 'Parts Replaced Successfully');
      }
      
      setSupervisorNotes('');
      setSelectedComplaint(null);
      
    } catch (error) {
      console.error('Complaint action failed:', error);
      notify.error('Action failed. Please try again.', 'Action Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Get complaint status color
  const getComplaintStatusColor = (status: PartsComplaint['status']) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'replacing': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: PartsComplaint['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get pending complaints count
  const pendingCount = partsComplaints.filter(c => 
    c.status === 'reported' || c.status === 'acknowledged' || c.status === 'replacing'
  ).length;

  const reportedCount = partsComplaints.filter(c => c.status === 'reported').length;
  const inProgressCount = partsComplaints.filter(c => c.status === 'replacing').length;
  const resolvedCount = partsComplaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <WrenchIcon className="h-8 w-8 text-red-600" />
            <span>Parts Replacement Center</span>
          </h1>
          <p className="text-gray-600">Manage operator parts complaints and replacement requests</p>
        </div>
        
        {pendingCount > 0 && (
          <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
            <BellIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Reports</p>
              <p className="text-xl font-bold text-red-600">{reportedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xl font-bold text-blue-600">{inProgressCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-xl font-bold text-green-600">{resolvedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <WrenchIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-purple-600">{partsComplaints.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Parts Complaints List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Parts Replacement Requests</h3>
        </div>

        {partsComplaints.length === 0 ? (
          <div className="text-center py-8">
            <WrenchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parts complaints</h3>
            <p className="text-gray-500">All operations are running smoothly without parts issues.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {partsComplaints
              .sort((a, b) => {
                // Sort by status priority and then by report time
                const statusPriority = { reported: 0, acknowledged: 1, replacing: 2, resolved: 3, rejected: 4 };
                const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
              })
              .map((complaint) => (
                <div key={complaint.id} className={`border rounded-lg p-4 ${
                  complaint.status === 'reported' ? 'border-red-300 bg-red-50' :
                  complaint.status === 'acknowledged' || complaint.status === 'replacing' ? 'border-yellow-300 bg-yellow-50' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {complaint.bundleNumber}
                        </Badge>
                        <Badge className={getComplaintStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Reported by:</span>
                          <span className="font-medium ml-2">{complaint.reportedByName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reported at:</span>
                          <span className="font-medium ml-2">
                            {complaint.reportedAt.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Issue Type:</span>
                          <span className="font-medium ml-2 capitalize">
                            {complaint.issueType.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Affected Parts:</span>
                          <span className="font-medium ml-2">
                            {complaint.damagedParts.join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm font-medium">Operator Description:</span>
                        <p className="text-gray-900 mt-1 bg-white p-3 rounded border">{complaint.description}</p>
                      </div>

                      {/* Status Updates */}
                      <div className="space-y-2">
                        {complaint.acknowledgedBy && (
                          <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                            <div className="text-sm">
                              <div className="flex justify-between items-start mb-1">
                                <strong className="text-yellow-800">Acknowledged by {complaint.acknowledgedByName}</strong>
                                <span className="text-yellow-600 text-xs">{complaint.acknowledgedAt?.toLocaleString()}</span>
                              </div>
                              {complaint.estimatedReplacementTime && (
                                <div className="text-yellow-700">Estimated time: {complaint.estimatedReplacementTime} minutes</div>
                              )}
                              {complaint.supervisorNotes && (
                                <div className="text-yellow-700 mt-1">
                                  <strong>Notes:</strong> {complaint.supervisorNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {complaint.replacementStartedAt && (
                          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            <div className="text-sm">
                              <div className="flex justify-between items-start">
                                <strong className="text-blue-800">Replacement in progress</strong>
                                <span className="text-blue-600 text-xs">{complaint.replacementStartedAt.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {complaint.status === 'resolved' && (
                          <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <div className="text-sm text-green-800">
                              <div className="flex justify-between items-start mb-1">
                                <strong>✅ Resolved - Parts Replaced</strong>
                                <span className="text-green-600 text-xs">{complaint.resolvedAt?.toLocaleString()}</span>
                              </div>
                              <div>Replaced parts: {complaint.replacedParts.join(', ')}</div>
                              {complaint.operatorNotified && (
                                <div>✅ Operator notified and can continue work</div>
                              )}
                              {complaint.replacementNotes && (
                                <div className="mt-1">
                                  <strong>Notes:</strong> {complaint.replacementNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {complaint.status === 'rejected' && (
                          <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
                            <div className="text-sm text-gray-800">
                              <div className="flex justify-between items-start mb-1">
                                <strong>❌ Request Rejected</strong>
                                <span className="text-gray-600 text-xs">{complaint.resolvedAt?.toLocaleString()}</span>
                              </div>
                              {complaint.supervisorNotes && (
                                <div>Reason: {complaint.supervisorNotes}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {complaint.status === 'reported' && (
                        <>
                          <Button
                            onClick={() => handleComplaintAction(complaint, 'acknowledge', 'Complaint acknowledged, will start replacement soon.')}
                            disabled={isLoading}
                            className="bg-yellow-600 hover:bg-yellow-700"
                            size="sm"
                          >
                            {isLoading ? <LoadingSpinner size="sm" /> : 'Acknowledge'}
                          </Button>
                          <Button
                            onClick={() => handleComplaintAction(complaint, 'reject', 'Parts appear to be in acceptable condition.')}
                            disabled={isLoading}
                            variant="outline"
                            className="text-red-600 border-red-300"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {complaint.status === 'acknowledged' && (
                        <Button
                          onClick={() => handleComplaintAction(complaint, 'start_replacement', 'Started parts replacement process.')}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          {isLoading ? <LoadingSpinner size="sm" /> : 'Start Replacement'}
                        </Button>
                      )}

                      {complaint.status === 'replacing' && (
                        <Button
                          onClick={() => handleComplaintAction(complaint, 'complete_replacement', 'Parts successfully replaced and quality checked.')}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {isLoading ? <LoadingSpinner size="sm" /> : 'Complete & Notify'}
                        </Button>
                      )}

                      {complaint.status === 'resolved' && (
                        <Badge className="bg-green-100 text-green-800 text-center py-2">
                          ✅ Completed
                        </Badge>
                      )}

                      {complaint.status === 'rejected' && (
                        <Badge className="bg-gray-100 text-gray-800 text-center py-2">
                          ❌ Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </Card>
    </div>
  );
};

export default SupervisorPartsDashboard;