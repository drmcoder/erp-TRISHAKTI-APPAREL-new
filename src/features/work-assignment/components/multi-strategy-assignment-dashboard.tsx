// Multi-Strategy Work Assignment Dashboard - Handle 1000+ bundles efficiently
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  TrophyIcon,
  ChartBarIcon,
  BoltIcon,
  QueueListIcon,
  UserIcon,
  CubeIcon,
  FireIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import type { BundleOperation, ProductionBundle } from '@/shared/types/bundle-types';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface AssignmentStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bestFor: string;
}

const assignmentStrategies: AssignmentStrategy[] = [
  {
    id: 'auto-smart',
    name: 'Auto Smart Assignment',
    description: 'AI automatically assigns work based on operator skills, efficiency, and workload',
    icon: BoltIcon,
    color: 'purple',
    bestFor: 'High volume, balanced workload'
  },
  {
    id: 'bulk-batch',
    name: 'Bulk Batch Assignment',
    description: 'Assign multiple operations to operators in batches by article/priority',
    icon: QueueListIcon,
    color: 'blue',
    bestFor: 'Large orders, similar operations'
  },
  {
    id: 'operator-focused',
    name: 'Operator-First Assignment',
    description: 'Select operator first, then assign multiple suitable operations',
    icon: UserIcon,
    color: 'green',
    bestFor: 'Specialist operators, custom workloads'
  },
  {
    id: 'priority-urgent',
    name: 'Priority-Based Rush',
    description: 'Assign urgent/high priority operations to best available operators',
    icon: FireIcon,
    color: 'red',
    bestFor: 'Rush orders, deadlines'
  },
  {
    id: 'schedule-planned',
    name: 'Planned Schedule Assignment',
    description: 'Pre-schedule assignments for future time slots and shifts',
    icon: CalendarIcon,
    color: 'indigo',
    bestFor: 'Shift planning, advance scheduling'
  }
];

// Mock data - in production this would be much larger (1000+ bundles)
const generateMockBundles = (count: number) => {
  const articles = ['3233', '3265', '3401', '3502', '3678'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  const operations = [
    { name: 'Shoulder Join', nameNepali: 'काँध जोड्ने', machine: 'overlock', price: 2.5, time: 4.5 },
    { name: 'Side Seam', nameNepali: 'छेउ सिलाई', machine: 'overlock', price: 3.0, time: 5.0 },
    { name: 'Sleeve Attach', nameNepali: 'आस्तीन लगाउने', machine: 'singleNeedle', price: 4.0, time: 7.0 },
    { name: 'Hem Finish', nameNepali: 'तल्लो भाग सिलाई', machine: 'singleNeedle', price: 1.5, time: 3.0 },
    { name: 'Button Attach', nameNepali: 'बटन लगाउने', machine: 'singleNeedle', price: 2.0, time: 4.0 }
  ];

  const bundles = [];
  for (let i = 1; i <= count; i++) {
    const article = articles[Math.floor(Math.random() * articles.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const bundleOps = operations.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 operations per bundle

    bundleOps.forEach((op, opIndex) => {
      bundles.push({
        id: `BND-${article}-${size}-${String(i).padStart(3, '0')}-OP-${opIndex + 1}`,
        bundleId: `bundle_${i}`,
        bundleNumber: `BND-${article}-${size}-${String(i).padStart(3, '0')}`,
        operationId: op.name.toLowerCase().replace(' ', '_'),
        name: op.name,
        nameNepali: op.nameNepali,
        machineType: op.machine,
        sequenceOrder: opIndex + 1,
        pricePerPiece: op.price,
        smvMinutes: op.time,
        status: 'pending' as const,
        prerequisites: opIndex === 0 ? [] : [`op_${opIndex}`],
        isOptional: false,
        qualityCheckRequired: Math.random() > 0.7,
        defectTolerance: 5,
        priority,
        articleNumber: article,
        size,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
      });
    });
  }
  return bundles;
};

const mockOperators = [
  { id: 'op_1', name: 'Maya Patel', machineType: 'overlock', efficiency: 94.5, currentWorkload: 2, experience: 'expert', specialties: ['shoulder_join', 'side_seam'] },
  { id: 'op_2', name: 'Rajesh Kumar', machineType: 'singleNeedle', efficiency: 91.2, currentWorkload: 1, experience: 'expert', specialties: ['sleeve_attach', 'hem_finish'] },
  { id: 'op_3', name: 'Priya Singh', machineType: 'overlock', efficiency: 89.8, currentWorkload: 0, experience: 'intermediate', specialties: ['side_seam'] },
  { id: 'op_4', name: 'Amit Patel', machineType: 'singleNeedle', efficiency: 85.6, currentWorkload: 3, experience: 'intermediate', specialties: ['hem_finish', 'button_attach'] },
  { id: 'op_5', name: 'Sunita Sharma', machineType: 'overlock', efficiency: 78.3, currentWorkload: 1, experience: 'beginner', specialties: ['shoulder_join'] },
  { id: 'op_6', name: 'Ravi Thapa', machineType: 'singleNeedle', efficiency: 92.1, currentWorkload: 0, experience: 'expert', specialties: ['sleeve_attach', 'button_attach'] },
  { id: 'op_7', name: 'Anita Gurung', machineType: 'overlock', efficiency: 87.4, currentWorkload: 2, experience: 'intermediate', specialties: ['shoulder_join', 'side_seam'] },
  { id: 'op_8', name: 'Deepak Rai', machineType: 'singleNeedle', efficiency: 83.9, currentWorkload: 1, experience: 'intermediate', specialties: ['hem_finish'] }
];

export const MultiStrategyAssignmentDashboard: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('auto-smart');
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);
  const [operators, setOperators] = useState(mockOperators);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    machineType: 'all',
    articleNumber: 'all',
    dateRange: 'today'
  });
  const [selectedOperations, setSelectedOperations] = useState<Set<string>>(new Set());
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(new Set());
  const [bulkCount, setBulkCount] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    const mockOps = generateMockBundles(100); // Start with 100 for demo, can be 1000+
    setPendingOperations(mockOps);
  }, []);

  // Filter operations
  const filteredOperations = pendingOperations.filter(op => {
    const matchesSearch = searchTerm === '' || 
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.bundleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.articleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filters.priority === 'all' || op.priority === filters.priority;
    const matchesMachine = filters.machineType === 'all' || op.machineType === filters.machineType;
    const matchesArticle = filters.articleNumber === 'all' || op.articleNumber === filters.articleNumber;
    
    return matchesSearch && matchesPriority && matchesMachine && matchesArticle;
  });

  // Get unique values for filters
  const uniqueArticles = [...new Set(pendingOperations.map(op => op.articleNumber))];
  const priorityCounts = {
    urgent: pendingOperations.filter(op => op.priority === 'urgent').length,
    high: pendingOperations.filter(op => op.priority === 'high').length,
    normal: pendingOperations.filter(op => op.priority === 'normal').length,
    low: pendingOperations.filter(op => op.priority === 'low').length
  };

  // Auto Smart Assignment
  const handleAutoSmartAssignment = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
      
      const assignments = [];
      const availableOperators = operators.filter(op => op.currentWorkload < 5);
      
      // Smart algorithm
      filteredOperations.slice(0, bulkCount).forEach(operation => {
        const suitableOperators = availableOperators
          .filter(op => op.machineType === operation.machineType)
          .sort((a, b) => {
            // Score based on efficiency, workload, and specialties
            const scoreA = a.efficiency - (a.currentWorkload * 10) + (a.specialties.includes(operation.operationId) ? 20 : 0);
            const scoreB = b.efficiency - (b.currentWorkload * 10) + (b.specialties.includes(operation.operationId) ? 20 : 0);
            return scoreB - scoreA;
          });
        
        if (suitableOperators.length > 0) {
          const bestOperator = suitableOperators[0];
          assignments.push({ operator: bestOperator, operation });
          bestOperator.currentWorkload += 1;
        }
      });

      // Apply assignments
      setOperators(prev => prev.map(op => {
        const newWorkload = assignments.filter(a => a.operator.id === op.id).length;
        return { ...op, currentWorkload: op.currentWorkload + newWorkload };
      }));

      setPendingOperations(prev => prev.filter(op => 
        !assignments.some(a => a.operation.id === op.id)
      ));

      alert(`✅ Auto Smart Assignment Complete!\n${assignments.length} operations assigned to ${new Set(assignments.map(a => a.operator.id)).size} operators`);
      
    } catch (error) {
      console.error('Auto assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk Batch Assignment
  const handleBulkBatchAssignment = async () => {
    if (selectedOperations.size === 0) {
      alert('Please select operations to assign');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const operations = filteredOperations.filter(op => selectedOperations.has(op.id));
      const assignments = [];

      // Group by machine type and assign in batches
      const groupedOps = operations.reduce((acc, op) => {
        if (!acc[op.machineType]) acc[op.machineType] = [];
        acc[op.machineType].push(op);
        return acc;
      }, {} as any);

      Object.entries(groupedOps).forEach(([machineType, ops]: [string, any[]]) => {
        const availableOperators = operators
          .filter(op => op.machineType === machineType && op.currentWorkload < 5)
          .sort((a, b) => a.currentWorkload - b.currentWorkload);

        ops.forEach((operation, index) => {
          const operator = availableOperators[index % availableOperators.length];
          if (operator) {
            assignments.push({ operator, operation });
            operator.currentWorkload += 1;
          }
        });
      });

      // Apply assignments
      setPendingOperations(prev => prev.filter(op => 
        !assignments.some(a => a.operation.id === op.id)
      ));

      setSelectedOperations(new Set());
      alert(`✅ Bulk Assignment Complete!\n${assignments.length} operations assigned in batches`);

    } catch (error) {
      console.error('Bulk assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Operator-First Assignment
  const handleOperatorFirstAssignment = async () => {
    if (selectedOperators.size === 0) {
      alert('Please select operators first');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedOps = Array.from(selectedOperators);
      const assignments = [];

      selectedOps.forEach(operatorId => {
        const operator = operators.find(op => op.id === operatorId);
        if (!operator) return;

        const suitableOperations = filteredOperations
          .filter(op => 
            op.machineType === operator.machineType &&
            (operator.specialties.length === 0 || operator.specialties.includes(op.operationId))
          )
          .slice(0, 5); // Assign up to 5 operations per operator

        suitableOperations.forEach(operation => {
          assignments.push({ operator, operation });
        });
      });

      // Apply assignments
      setPendingOperations(prev => prev.filter(op => 
        !assignments.some(a => a.operation.id === op.id)
      ));

      setSelectedOperators(new Set());
      alert(`✅ Operator-First Assignment Complete!\n${assignments.length} operations assigned to ${selectedOps.length} operators`);

    } catch (error) {
      console.error('Operator-first assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Priority Rush Assignment
  const handlePriorityRushAssignment = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get urgent and high priority operations
      const urgentOps = filteredOperations
        .filter(op => op.priority === 'urgent' || op.priority === 'high')
        .sort((a, b) => {
          if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
          if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

      const assignments = [];
      const expertOperators = operators
        .filter(op => op.experience === 'expert' && op.currentWorkload < 3)
        .sort((a, b) => b.efficiency - a.efficiency);

      urgentOps.slice(0, bulkCount).forEach((operation, index) => {
        const suitableExperts = expertOperators.filter(op => op.machineType === operation.machineType);
        if (suitableExperts.length > 0) {
          const operator = suitableExperts[index % suitableExperts.length];
          assignments.push({ operator, operation });
          operator.currentWorkload += 1;
        }
      });

      // Apply assignments
      setPendingOperations(prev => prev.filter(op => 
        !assignments.some(a => a.operation.id === op.id)
      ));

      alert(`🔥 Priority Rush Assignment Complete!\n${assignments.length} urgent/high priority operations assigned to expert operators`);

    } catch (error) {
      console.error('Priority assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrategyColor = (strategyId: string) => {
    const strategy = assignmentStrategies.find(s => s.id === strategyId);
    return strategy?.color || 'blue';
  };

  const currentStrategy = assignmentStrategies.find(s => s.id === selectedStrategy);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-8 w-8 text-blue-600" />
            <span>Multi-Strategy Work Assignment</span>
          </h1>
          <p className="text-gray-600">Handle 1000+ bundles efficiently with multiple assignment strategies</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{pendingOperations.length}</div>
          <div className="text-sm text-gray-500">Pending Operations</div>
        </div>
      </div>

      {/* Strategy Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Assignment Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignmentStrategies.map((strategy) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === strategy.id;
            return (
              <Card 
                key={strategy.id}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  isSelected 
                    ? `border-${strategy.color}-500 bg-${strategy.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-${strategy.color}-100`}>
                    <Icon className={`h-6 w-6 text-${strategy.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <Badge className={`bg-${strategy.color}-100 text-${strategy.color}-800 text-xs`}>
                      {strategy.bestFor}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FireIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgent Priority</p>
              <p className="text-xl font-bold text-red-600">{priorityCounts.urgent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-orange-600">{priorityCounts.high}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Operators</p>
              <p className="text-xl font-bold text-green-600">
                {operators.filter(op => op.currentWorkload < 5).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CubeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-xl font-bold text-blue-600">{uniqueArticles.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search operations, bundles, articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔥 Urgent ({priorityCounts.urgent})</option>
              <option value="high">⚠️ High ({priorityCounts.high})</option>
              <option value="normal">📋 Normal ({priorityCounts.normal})</option>
              <option value="low">⏳ Low ({priorityCounts.low})</option>
            </select>

            <select
              value={filters.machineType}
              onChange={(e) => setFilters({...filters, machineType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Machines</option>
              <option value="overlock">⚡ Overlock</option>
              <option value="singleNeedle">🪡 Single Needle</option>
            </select>

            {showAdvancedFilters && (
              <select
                value={filters.articleNumber}
                onChange={(e) => setFilters({...filters, articleNumber: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Articles</option>
                {uniqueArticles.map(article => (
                  <option key={article} value={article}>Article {article}</option>
                ))}
              </select>
            )}
          </div>

          {showAdvancedFilters && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Bulk Count:</label>
                <Input
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                  min="1"
                  max="100"
                />
              </div>
              <div className="text-sm text-gray-500">
                Number of operations to assign in bulk
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Assignment Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Assignment Actions - {currentStrategy?.name}
          </h3>
          <div className="text-sm text-gray-500">
            Filtered Operations: {filteredOperations.length}
          </div>
        </div>

        {selectedStrategy === 'auto-smart' && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">🤖 AI Smart Assignment</h4>
              <p className="text-sm text-purple-700 mb-4">
                AI will automatically assign operations based on operator skills, efficiency, and current workload.
              </p>
              <Button
                onClick={handleAutoSmartAssignment}
                disabled={isLoading || filteredOperations.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <BoltIcon className="h-4 w-4 mr-2" />}
                Auto Assign {Math.min(bulkCount, filteredOperations.length)} Operations
              </Button>
            </div>
          </div>
        )}

        {selectedStrategy === 'bulk-batch' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📦 Bulk Batch Assignment</h4>
              <p className="text-sm text-blue-700 mb-4">
                Select operations and assign them in batches. Selected: {selectedOperations.size}
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={handleBulkBatchAssignment}
                  disabled={isLoading || selectedOperations.size === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : <QueueListIcon className="h-4 w-4 mr-2" />}
                  Assign {selectedOperations.size} Selected Operations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const firstN = new Set(filteredOperations.slice(0, bulkCount).map(op => op.id));
                    setSelectedOperations(firstN);
                  }}
                >
                  Select First {Math.min(bulkCount, filteredOperations.length)}
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedStrategy === 'operator-focused' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">👤 Operator-First Assignment</h4>
              <p className="text-sm text-green-700 mb-4">
                Select operators first, then assign suitable operations. Selected: {selectedOperators.size}
              </p>
              <Button
                onClick={handleOperatorFirstAssignment}
                disabled={isLoading || selectedOperators.size === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <UserIcon className="h-4 w-4 mr-2" />}
                Assign to {selectedOperators.size} Selected Operators
              </Button>
            </div>
          </div>
        )}

        {selectedStrategy === 'priority-urgent' && (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">🔥 Priority Rush Assignment</h4>
              <p className="text-sm text-red-700 mb-4">
                Assign urgent and high priority operations to expert operators immediately.
              </p>
              <Button
                onClick={handlePriorityRushAssignment}
                disabled={isLoading || (priorityCounts.urgent + priorityCounts.high) === 0}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <FireIcon className="h-4 w-4 mr-2" />}
                Rush Assign {Math.min(bulkCount, priorityCounts.urgent + priorityCounts.high)} Priority Operations
              </Button>
            </div>
          </div>
        )}

        {selectedStrategy === 'schedule-planned' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">📅 Planned Schedule Assignment</h4>
              <p className="text-sm text-indigo-700 mb-4">
                Schedule assignments for future shifts and time slots. (Coming Soon)
              </p>
              <Button
                disabled
                variant="outline"
                className="text-indigo-600 border-indigo-300"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Assignments (Coming Soon)
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Operations List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Operations List ({filteredOperations.length})
          </h3>
          {(selectedStrategy === 'bulk-batch' || selectedStrategy === 'operator-focused') && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOperations(new Set())}
              >
                Clear Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allIds = new Set(filteredOperations.map(op => op.id));
                  setSelectedOperations(allIds);
                }}
              >
                Select All
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {filteredOperations.slice(0, 50).map((operation) => ( // Show first 50 for performance
            <div 
              key={operation.id} 
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                selectedOperations.has(operation.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                {selectedStrategy === 'bulk-batch' && (
                  <input
                    type="checkbox"
                    checked={selectedOperations.has(operation.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedOperations);
                      if (e.target.checked) {
                        newSelected.add(operation.id);
                      } else {
                        newSelected.delete(operation.id);
                      }
                      setSelectedOperations(newSelected);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                )}
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {operation.bundleNumber}
                    </Badge>
                    <Badge className={
                      operation.priority === 'urgent' ? 'bg-red-500 text-white' :
                      operation.priority === 'high' ? 'bg-orange-500 text-white' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {operation.priority}
                    </Badge>
                  </div>
                  <div className="font-medium text-gray-900">{operation.name}</div>
                  <div className="text-sm text-gray-500">
                    {operation.machineType} • Rs. {operation.pricePerPiece} • {operation.smvMinutes}min
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Article {operation.articleNumber}</div>
                <div className="text-xs text-gray-400">Size {operation.size}</div>
              </div>
            </div>
          ))}
          
          {filteredOperations.length > 50 && (
            <div className="text-center py-4 text-gray-500">
              Showing first 50 operations. Use filters to narrow down results.
            </div>
          )}
        </div>
      </Card>

      {/* Operators Grid (for operator-focused strategy) */}
      {selectedStrategy === 'operator-focused' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Operators ({selectedOperators.size} selected)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operators.map((operator) => (
              <Card 
                key={operator.id}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  selectedOperators.has(operator.id) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const newSelected = new Set(selectedOperators);
                  if (selectedOperators.has(operator.id)) {
                    newSelected.delete(operator.id);
                  } else {
                    newSelected.add(operator.id);
                  }
                  setSelectedOperators(newSelected);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{operator.name}</h4>
                  <Badge className={
                    operator.experience === 'expert' ? 'bg-purple-100 text-purple-800' :
                    operator.experience === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }>
                    {operator.experience}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Machine: {operator.machineType}</div>
                  <div>Efficiency: {operator.efficiency}%</div>
                  <div>Workload: {operator.currentWorkload}/5</div>
                  <div>Specialties: {operator.specialties.length}</div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MultiStrategyAssignmentDashboard;