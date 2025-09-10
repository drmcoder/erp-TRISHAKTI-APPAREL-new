// METHOD 3: "Quick List" Assignment
// Excel/spreadsheet style - fast bulk assignment with dropdown selectors
// Practical: Like filling out a simple form or spreadsheet that everyone knows

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  PlusIcon,
  ArrowDownIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';
import { operationsDataService, type WorkAssignmentItem } from '../services/operations-data-service';

interface WorkRow {
  id: string;
  bundleNumber: string;
  operation: string;
  pieces: number;
  difficulty: number;
  priority: 'normal' | 'high' | 'urgent';
  deadline: string;
  assignedTo: string | null;
  status: 'pending' | 'assigned' | 'completed';
}

interface Operator {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
  skillLevel: number;
  currentWork: string;
  efficiency: number;
}

const QuickListAssignment: React.FC = () => {
  const [workRows, setWorkRows] = useState<WorkRow[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkOperator, setBulkOperator] = useState('');

  useEffect(() => {
    // Initialize work queue (like a to-do list)
    setWorkRows([
      {
        id: 'w1',
        bundleNumber: 'TSA-001',
        operation: 'Sleeve Sewing',
        pieces: 120,
        difficulty: 3,
        priority: 'high',
        deadline: '2:00 PM',
        assignedTo: null,
        status: 'pending'
      },
      {
        id: 'w2',
        bundleNumber: 'TSA-002', 
        operation: 'Button Holes',
        pieces: 80,
        difficulty: 2,
        priority: 'normal',
        deadline: '4:00 PM',
        assignedTo: null,
        status: 'pending'
      },
      {
        id: 'w3',
        bundleNumber: 'TSA-003',
        operation: 'Collar Work',
        pieces: 150,
        difficulty: 4,
        priority: 'urgent',
        deadline: '12:30 PM',
        assignedTo: null,
        status: 'pending'
      },
      {
        id: 'w4',
        bundleNumber: 'TSA-004',
        operation: 'Hemming',
        pieces: 200,
        difficulty: 1,
        priority: 'normal', 
        deadline: '5:00 PM',
        assignedTo: null,
        status: 'pending'
      },
      {
        id: 'w5',
        bundleNumber: 'TSA-005',
        operation: 'Pocket Attachment',
        pieces: 60,
        difficulty: 2,
        priority: 'high',
        deadline: '3:30 PM',
        assignedTo: null,
        status: 'pending'
      }
    ]);

    // Initialize operators (like contacts list)
    setOperators([
      {
        id: 'maya',
        name: 'Maya Patel',
        avatar: '👩‍🏭',
        status: 'available',
        skillLevel: 5,
        currentWork: '0 tasks',
        efficiency: 120
      },
      {
        id: 'ram',
        name: 'Ram Sharma',
        avatar: '👨‍🏭', 
        status: 'available',
        skillLevel: 4,
        currentWork: '1 task',
        efficiency: 105
      },
      {
        id: 'sita',
        name: 'Sita Devi',
        avatar: '👩‍🏭',
        status: 'busy',
        skillLevel: 5,
        currentWork: '3 tasks',
        efficiency: 95
      },
      {
        id: 'krishna',
        name: 'Krishna Kumar',
        avatar: '👨‍🏭',
        status: 'available',
        skillLevel: 3,
        currentWork: '0 tasks',
        efficiency: 85
      }
    ]);
  }, []);

  const assignWork = (workId: string, operatorId: string) => {
    const operator = operators.find(op => op.id === operatorId);
    if (!operator) return;

    setWorkRows(prev => prev.map(work => 
      work.id === workId 
        ? { ...work, assignedTo: operatorId, status: 'assigned' as const }
        : work
    ));

    setOperators(prev => prev.map(op =>
      op.id === operatorId
        ? { ...op, currentWork: `${parseInt(op.currentWork.split(' ')[0]) + 1} tasks` }
        : op
    ));

    const workItem = workRows.find(w => w.id === workId);
    notify.success(`${workItem?.bundleNumber} assigned to ${operator.name}`, 'Quick Assignment');
  };

  const bulkAssign = () => {
    if (!bulkOperator || selectedRows.size === 0) return;

    const operator = operators.find(op => op.id === bulkOperator);
    if (!operator) return;

    selectedRows.forEach(workId => {
      setWorkRows(prev => prev.map(work => 
        work.id === workId 
          ? { ...work, assignedTo: bulkOperator, status: 'assigned' as const }
          : work
      ));
    });

    setOperators(prev => prev.map(op =>
      op.id === bulkOperator
        ? { ...op, currentWork: `${parseInt(op.currentWork.split(' ')[0]) + selectedRows.size} tasks` }
        : op
    ));

    notify.success(`${selectedRows.size} items assigned to ${operator.name}`, 'Bulk Assignment');
    setSelectedRows(new Set());
    setBulkOperator('');
  };

  const toggleRowSelection = (workId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(workId)) {
      newSelected.delete(workId);
    } else {
      newSelected.add(workId);
    }
    setSelectedRows(newSelected);
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

  const pendingWork = workRows.filter(w => w.status === 'pending');
  const assignedWork = workRows.filter(w => w.status === 'assigned');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">📋 Quick List Assignment</h1>
          <p className="text-blue-100">Fast assignment with dropdown selectors - like filling a spreadsheet</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingWork.length}</div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{assignedWork.length}</div>
            <div className="text-sm text-gray-600">Assigned Today</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{operators.filter(op => op.status === 'available').length}</div>
            <div className="text-sm text-gray-600">Available Workers</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{selectedRows.size}</div>
            <div className="text-sm text-gray-600">Selected Items</div>
          </Card>
        </div>

        {/* Bulk Assignment Bar */}
        {selectedRows.size > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-semibold">
                  🎯 Bulk Assign {selectedRows.size} selected items to:
                </div>
                <select 
                  value={bulkOperator} 
                  onChange={(e) => setBulkOperator(e.target.value)}
                  className="px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Operator...</option>
                  {operators.filter(op => op.status === 'available').map(operator => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} ({operator.currentWork})
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={bulkAssign}
                disabled={!bulkOperator}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BoltIcon className="h-4 w-4 mr-1" />
                Assign All
              </Button>
            </div>
          </Card>
        )}

        {/* Work List Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={selectedRows.size === pendingWork.length && pendingWork.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(pendingWork.map(w => w.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieces</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workRows.map((work) => (
                  <tr key={work.id} className={`hover:bg-gray-50 ${selectedRows.has(work.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {work.status === 'pending' && (
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedRows.has(work.id)}
                          onChange={() => toggleRowSelection(work.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{work.bundleNumber}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{work.operation}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{work.pieces}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getPriorityColor(work.priority)}>
                        {work.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {work.deadline}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {work.status === 'pending' ? (
                        <select 
                          value={work.assignedTo || ''} 
                          onChange={(e) => assignWork(work.id, e.target.value)}
                          className="px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                        >
                          <option value="">Select operator...</option>
                          {operators.map(operator => (
                            <option key={operator.id} value={operator.id}>
                              {operator.avatar} {operator.name} ({operator.currentWork})
                            </option>
                          ))}
                        </select>
                      ) : work.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <div>{operators.find(op => op.id === work.assignedTo)?.avatar}</div>
                          <div className="font-medium">
                            {operators.find(op => op.id === work.assignedTo)?.name}
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(work.status)}>
                        {work.status === 'assigned' ? '✅ ASSIGNED' : 
                         work.status === 'completed' ? '🎉 DONE' : '⏳ PENDING'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Available Operators */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">👥 Available Operators</h3>
            <div className="space-y-3">
              {operators.filter(op => op.status === 'available').map(operator => (
                <div key={operator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{operator.avatar}</div>
                    <div>
                      <div className="font-semibold">{operator.name}</div>
                      <div className="text-sm text-gray-600">Skill: {operator.skillLevel}/5 • {operator.currentWork}</div>
                    </div>
                  </div>
                  <div className="text-sm text-blue-600 font-medium">{operator.efficiency}% efficiency</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">📝 How to Use Quick List</h3>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-start space-x-2">
                <div className="font-semibold">1.</div>
                <div>Select checkboxes for multiple items (or click header to select all)</div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="font-semibold">2.</div>
                <div>Use dropdown in "Assign To" column for individual assignments</div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="font-semibold">3.</div>
                <div>For bulk assignment: select items → choose operator → click "Assign All"</div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="font-semibold">4.</div>
                <div>Check operator workload before assigning (shown in parentheses)</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickListAssignment;