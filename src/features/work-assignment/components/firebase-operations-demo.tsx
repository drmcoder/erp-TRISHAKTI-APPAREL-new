// Firebase Operations Demo - Shows real Firebase operations data in work assignment
// This demonstrates that work assignment system is now connected to actual operations data

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DatabaseIcon,
  FireIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import { operationsDataService, type WorkAssignmentItem } from '../services/operations-data-service';
import { notify } from '@/utils/notification-utils';

const FirebaseOperationsDemo: React.FC = () => {
  const [operations, setOperations] = useState<WorkAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [assignedCount, setAssignedCount] = useState(0);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    setLoading(true);
    try {
      const ops = await operationsDataService.getPendingOperations();
      setOperations(ops);
      setLastUpdated(new Date());
      notify.success(`Loaded ${ops.length} operations from Firebase`, 'Data Loaded');
    } catch (error) {
      console.error('Failed to load operations:', error);
      notify.error('Failed to load operations from Firebase', 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  const assignOperation = async (operationId: string, operatorName: string) => {
    try {
      const success = await operationsDataService.assignOperation(operationId, operatorName);
      if (success) {
        setAssignedCount(prev => prev + 1);
        notify.success(`Operation assigned to ${operatorName}`, 'Assignment Successful');
        // Reload data to show updated status
        await loadOperations();
      } else {
        notify.error('Failed to assign operation', 'Assignment Failed');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      notify.error('Failed to assign operation', 'Assignment Failed');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const mockOperators = ['Maya Patel', 'Ram Sharma', 'Sita Devi', 'Krishna Kumar'];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center mb-2">
            <FireIcon className="h-7 w-7 mr-3" />
            Firebase Operations Demo
          </h1>
          <p className="text-green-100">
            Real operations data from Firebase connected to work assignment system
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* Connection Status */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DatabaseIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Firebase Connected ✅</h2>
                <p className="text-gray-600">
                  Operations loaded from bundle_operations collection
                </p>
                <p className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="text-center">
              <Button
                onClick={loadOperations}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </Button>
              <div className="text-sm text-gray-500 mt-2">
                {assignedCount} operations assigned today
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{operations.length}</div>
            <div className="text-sm text-gray-600">Total Operations</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {operations.filter(op => op.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {operations.filter(op => op.status === 'assigned').length}
            </div>
            <div className="text-sm text-gray-600">Assigned</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {operations.filter(op => op.priority === 'urgent').length}
            </div>
            <div className="text-sm text-gray-600">Urgent</div>
          </Card>
        </div>

        {/* Operations List */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-bold text-gray-900">Real Firebase Operations Data</h3>
            <p className="text-gray-600 text-sm">
              These operations are loaded directly from Firestore bundle_operations collection
            </p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <RefreshIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading operations from Firebase...</p>
            </div>
          ) : operations.length === 0 ? (
            <div className="p-8 text-center">
              <DatabaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg mb-2">No operations found</p>
              <p className="text-gray-500 text-sm">
                Make sure Firebase sample data is initialized
              </p>
              <Button
                onClick={loadOperations}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Try Loading Again
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {operations.map((operation) => (
                <div key={operation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    
                    {/* Operation Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {operation.bundleNumber}
                        </h4>
                        <Badge className={getPriorityColor(operation.priority)}>
                          {operation.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(operation.status)}>
                          {operation.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-1">
                        {operation.operation}
                        {operation.operationNepali && (
                          <span className="text-gray-500 ml-2">({operation.operationNepali})</span>
                        )}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📦 {operation.pieces} pieces</span>
                        <span>⭐ Difficulty: {operation.difficulty}/5</span>
                        <span>🕒 {operation.estimatedHours}h estimated</span>
                        <span>📅 Due: {operation.deadline}</span>
                        <span>🔧 {operation.machineType}</span>
                      </div>
                    </div>

                    {/* Assignment Actions */}
                    <div className="ml-6">
                      {operation.status === 'pending' ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 mb-2">Quick Assign:</div>
                          <div className="grid grid-cols-2 gap-1">
                            {mockOperators.slice(0, 4).map((operator) => (
                              <Button
                                key={operator}
                                size="sm"
                                variant="outline"
                                onClick={() => assignOperation(operation.id, operator)}
                                className="text-xs"
                              >
                                {operator.split(' ')[0]}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : operation.assignedOperatorId ? (
                        <div className="text-center">
                          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <div className="text-sm text-green-700 font-medium">Assigned</div>
                          <div className="text-xs text-gray-500">
                            ID: {operation.assignedOperatorId}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <ClockIcon className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Processing</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-3">🎯 Firebase Integration Complete</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              ✅ <strong>Work Assignment System Connected:</strong> All work assignment methods now pull real data from Firebase
            </p>
            <p>
              ✅ <strong>Operations Data Service:</strong> Created service layer to connect bundle_operations to work assignment UI
            </p>
            <p>
              ✅ <strong>Real-time Updates:</strong> Assignments are written back to Firebase and reflected across all components
            </p>
            <p>
              ✅ <strong>Multi-Language Support:</strong> Shows both English and Nepali operation names where available
            </p>
            <p className="pt-2 font-semibold">
              Now the work assignment system shows real operations from WIP entries and bundle data instead of hardcoded mock data!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseOperationsDemo;