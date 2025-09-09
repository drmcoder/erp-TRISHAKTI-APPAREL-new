// Smart Work Assignment Dashboard - Handles Lots of Bundles with Better UI/UX
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  BoltIcon,
  SwatchIcon,
  HashtagIcon,
  StarIcon,
  TrophyIcon,
  LightBulbIcon,
  ArrowRightIcon,
  EyeIcon,
  HandRaisedIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import EnhancedBundleService from '@/services/enhanced-bundle-service';

interface SmartWorkAssignmentDashboardProps {
  userRole: string;
}

interface BundleWithOperations {
  id: string;
  bundleNumber: string;
  articleNumber: string;
  articleStyle: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sizes: string[];
  colors: string[];
  totalPieces: number;
  estimatedTime: number;
  totalValue: number;
  operations: {
    id: string;
    name: string;
    nameNepali: string;
    machineType: string;
    requiredSkill: string;
    timePerPiece: number;
    pricePerPiece: number;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed';
    assignedTo?: string;
  }[];
  status: 'created' | 'partially_assigned' | 'fully_assigned' | 'in_progress' | 'completed';
}

interface Operator {
  id: string;
  name: string;
  machineType: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  efficiency: number;
  currentWorkload: number;
  maxCapacity: number;
  specialties: string[];
  status: 'available' | 'busy' | 'break' | 'offline';
  hourlyRate: number;
  todayEarnings: number;
}

export const SmartWorkAssignmentDashboard: React.FC<SmartWorkAssignmentDashboardProps> = ({
  userRole
}) => {
  const [bundles, setBundles] = useState<BundleWithOperations[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    priority: 'all',
    status: 'all',
    machineType: 'all',
    articleNumber: 'all'
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'value' | 'bundleNumber'>('priority');
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'bulk' | 'smart'>('individual');
  
  // Assignment State
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [assignments, setAssignments] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Generate comprehensive mock data
    const mockBundles: BundleWithOperations[] = [];
    const articleNumbers = ['3233', '3265', '3401', '3522', '3678', '3721'];
    const styles = ['Adult T-Shirt', 'Ladies Blouse', 'Kids T-Shirt', 'Polo Shirt', 'Tank Top', 'Hoodie'];
    const priorities = ['low', 'normal', 'high', 'urgent'] as const;
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = ['White', 'Black', 'Navy', 'Red', 'Blue', 'Green', 'Pink', 'Gray'];

    for (let i = 1; i <= 150; i++) {
      const articleIdx = Math.floor(Math.random() * articleNumbers.length);
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const bundleSizes = sizes.slice(0, 2 + Math.floor(Math.random() * 3));
      const bundleColors = colors.slice(0, 1 + Math.floor(Math.random() * 2));
      
      const operations = [
        {
          id: `op_${i}_1`,
          name: 'Shoulder Join',
          nameNepali: 'काँध जोड्ने',
          machineType: 'overlock',
          requiredSkill: 'shoulder_join',
          timePerPiece: 4.5,
          pricePerPiece: 2.5,
          status: 'pending' as const,
        },
        {
          id: `op_${i}_2`,
          name: 'Side Seam',
          nameNepali: 'छेउ सिलाई',
          machineType: 'overlock',
          requiredSkill: 'side_seam',
          timePerPiece: 5.0,
          pricePerPiece: 3.0,
          status: 'pending' as const,
        },
        {
          id: `op_${i}_3`,
          name: 'Sleeve Attach',
          nameNepali: 'आस्तीन लगाउने',
          machineType: 'singleNeedle',
          requiredSkill: 'sleeve_attach',
          timePerPiece: 7.0,
          pricePerPiece: 4.0,
          status: 'pending' as const,
        }
      ].slice(0, 1 + Math.floor(Math.random() * 3));

      const totalPieces = 20 + Math.floor(Math.random() * 30);
      const estimatedTime = operations.reduce((sum, op) => sum + (op.timePerPiece * totalPieces), 0);
      const totalValue = operations.reduce((sum, op) => sum + (op.pricePerPiece * totalPieces), 0);

      mockBundles.push({
        id: `bundle_${i}`,
        bundleNumber: `BND-${articleNumbers[articleIdx]}-${String(i).padStart(3, '0')}`,
        articleNumber: articleNumbers[articleIdx],
        articleStyle: styles[articleIdx],
        priority,
        sizes: bundleSizes,
        colors: bundleColors,
        totalPieces,
        estimatedTime,
        totalValue,
        operations,
        status: 'created'
      });
    }

    const mockOperators: Operator[] = [
      {
        id: 'op_maya',
        name: 'Maya Patel',
        machineType: 'overlock',
        skillLevel: 'expert',
        efficiency: 95,
        currentWorkload: 2,
        maxCapacity: 5,
        specialties: ['shoulder_join', 'side_seam'],
        status: 'available',
        hourlyRate: 450,
        todayEarnings: 2800
      },
      {
        id: 'op_rajesh',
        name: 'Rajesh Kumar',
        machineType: 'singleNeedle',
        skillLevel: 'expert',
        efficiency: 92,
        currentWorkload: 1,
        maxCapacity: 4,
        specialties: ['sleeve_attach', 'hem_finish'],
        status: 'available',
        hourlyRate: 420,
        todayEarnings: 2400
      },
      {
        id: 'op_sita',
        name: 'Sita Sharma',
        machineType: 'overlock',
        skillLevel: 'intermediate',
        efficiency: 87,
        currentWorkload: 3,
        maxCapacity: 5,
        specialties: ['shoulder_join'],
        status: 'busy',
        hourlyRate: 380,
        todayEarnings: 1900
      },
      {
        id: 'op_ram',
        name: 'Ram Bahadur',
        machineType: 'singleNeedle',
        skillLevel: 'intermediate',
        efficiency: 89,
        currentWorkload: 0,
        maxCapacity: 4,
        specialties: ['sleeve_attach'],
        status: 'available',
        hourlyRate: 400,
        todayEarnings: 1600
      },
      {
        id: 'op_gita',
        name: 'Gita Thapa',
        machineType: 'overlock',
        skillLevel: 'beginner',
        efficiency: 78,
        currentWorkload: 1,
        maxCapacity: 3,
        specialties: ['side_seam'],
        status: 'available',
        hourlyRate: 320,
        todayEarnings: 1200
      }
    ];

    setBundles(mockBundles);
    setOperators(mockOperators);
    setLoading(false);
  };

  // Filtering and Search Logic
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.bundleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bundle.articleNumber.includes(searchTerm) ||
                         bundle.articleStyle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = selectedFilters.priority === 'all' || bundle.priority === selectedFilters.priority;
    const matchesStatus = selectedFilters.status === 'all' || bundle.status === selectedFilters.status;
    const matchesArticle = selectedFilters.articleNumber === 'all' || bundle.articleNumber === selectedFilters.articleNumber;
    const matchesMachine = selectedFilters.machineType === 'all' || 
                          bundle.operations.some(op => op.machineType === selectedFilters.machineType);

    return matchesSearch && matchesPriority && matchesStatus && matchesArticle && matchesMachine;
  });

  const sortedBundles = [...filteredBundles].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'value':
        return b.totalValue - a.totalValue;
      case 'bundleNumber':
        return a.bundleNumber.localeCompare(b.bundleNumber);
      default:
        return 0;
    }
  });

  const availableOperators = operators.filter(op => 
    op.status === 'available' && op.currentWorkload < op.maxCapacity
  );

  const handleBulkSelection = (bundleId: string) => {
    setSelectedBundles(prev => 
      prev.includes(bundleId) 
        ? prev.filter(id => id !== bundleId)
        : [...prev, bundleId]
    );
  };

  const handleSmartAssignment = async () => {
    if (selectedBundles.length === 0) {
      alert('Please select bundles to assign');
      return;
    }

    // Smart assignment algorithm
    const newAssignments: {[key: string]: string} = {};
    
    for (const bundleId of selectedBundles) {
      const bundle = bundles.find(b => b.id === bundleId);
      if (!bundle) continue;

      // Find best operator for this bundle's operations
      for (const operation of bundle.operations) {
        const compatibleOperators = availableOperators.filter(op => 
          op.machineType === operation.machineType &&
          op.specialties.includes(operation.requiredSkill) &&
          op.currentWorkload < op.maxCapacity
        );

        if (compatibleOperators.length > 0) {
          // Select best operator based on efficiency and workload
          const bestOperator = compatibleOperators.reduce((best, current) => 
            (current.efficiency - current.currentWorkload * 10) > 
            (best.efficiency - best.currentWorkload * 10) ? current : best
          );

          newAssignments[`${bundleId}_${operation.id}`] = bestOperator.id;
          
          // Update operator workload
          setOperators(prev => prev.map(op => 
            op.id === bestOperator.id 
              ? { ...op, currentWorkload: op.currentWorkload + 1 }
              : op
          ));
        }
      }
    }

    setAssignments(prev => ({ ...prev, ...newAssignments }));
    setSelectedBundles([]);
    
    alert(`✅ Smart assignment completed!\nAssigned ${Object.keys(newAssignments).length} operations to operators.`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-purple-100 text-purple-800';
      case 'partially_assigned': return 'bg-yellow-100 text-yellow-800';
      case 'fully_assigned': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading smart assignment dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header with Smart Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              🧠 Smart Work Assignment
            </h1>
            <p className="text-gray-600 mt-1">
              Efficiently assign {bundles.length} bundles to {operators.length} operators with smart algorithms
            </p>
          </div>
          
          {/* Assignment Mode */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
            <Button
              variant={assignmentMode === 'individual' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setAssignmentMode('individual')}
            >
              👤 Individual
            </Button>
            <Button
              variant={assignmentMode === 'bulk' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setAssignmentMode('bulk')}
            >
              📦 Bulk
            </Button>
            <Button
              variant={assignmentMode === 'smart' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setAssignmentMode('smart')}
            >
              🧠 Smart AI
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bundles, articles, or styles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedFilters.priority}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="normal">🔵 Normal</option>
            <option value="low">⚪ Low</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedFilters.machineType}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, machineType: e.target.value }))}
          >
            <option value="all">All Machines</option>
            <option value="overlock">Overlock</option>
            <option value="singleNeedle">Single Needle</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="priority">Sort by Priority</option>
            <option value="value">Sort by Value</option>
            <option value="bundleNumber">Sort by Bundle #</option>
          </select>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              📋
            </Button>
          </div>
        </div>

        {/* Bulk Assignment Panel */}
        {assignmentMode !== 'individual' && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedBundles.length} bundles selected
                  </span>
                </div>
                
                {selectedBundles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSmartAssignment}
                    >
                      <LightBulbIcon className="h-4 w-4 mr-1" />
                      Smart Assign
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBundles([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{sortedBundles.length}</div>
          <p className="text-sm text-gray-600">Available Bundles</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{availableOperators.length}</div>
          <p className="text-sm text-gray-600">Available Operators</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sortedBundles.filter(b => b.priority === 'urgent').length}
          </div>
          <p className="text-sm text-gray-600">Urgent Priority</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            ${sortedBundles.reduce((sum, b) => sum + b.totalValue, 0).toFixed(0)}
          </div>
          <p className="text-sm text-gray-600">Total Value</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {Math.floor(sortedBundles.reduce((sum, b) => sum + b.estimatedTime, 0) / 60)}h
          </div>
          <p className="text-sm text-gray-600">Est. Time</p>
        </Card>
      </div>

      {/* Bundle Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedBundles.map((bundle) => (
          <Card 
            key={bundle.id}
            className={`p-4 transition-all cursor-pointer hover:shadow-lg ${
              selectedBundles.includes(bundle.id) 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:ring-1 hover:ring-gray-300'
            }`}
            onClick={() => {
              if (assignmentMode !== 'individual') {
                handleBulkSelection(bundle.id);
              }
            }}
          >
            {/* Bundle Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <HashtagIcon className="h-4 w-4 text-gray-500" />
                <span className="font-mono text-sm text-gray-700">{bundle.bundleNumber}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {assignmentMode !== 'individual' && (
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedBundles.includes(bundle.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedBundles.includes(bundle.id) && (
                      <CheckCircleIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                )}
                
                <Badge variant="outline" className={getPriorityColor(bundle.priority)}>
                  {bundle.priority}
                </Badge>
              </div>
            </div>

            {/* Bundle Info */}
            <div className="space-y-2 mb-3">
              <h3 className="font-semibold text-gray-900">{bundle.articleStyle}</h3>
              <p className="text-sm text-gray-600">Article: {bundle.articleNumber}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <SwatchIcon className="h-4 w-4 mr-1" />
                  {bundle.sizes.join(', ')}
                </span>
                <span>{bundle.totalPieces} pcs</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center text-green-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  ${bundle.totalValue.toFixed(2)}
                </span>
                <span className="flex items-center text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {Math.floor(bundle.estimatedTime / 60)}h {Math.floor(bundle.estimatedTime % 60)}m
                </span>
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Operations:</p>
              {bundle.operations.map((operation) => {
                const assignmentKey = `${bundle.id}_${operation.id}`;
                const assignedOperator = assignments[assignmentKey] 
                  ? operators.find(op => op.id === assignments[assignmentKey])
                  : null;

                return (
                  <div 
                    key={operation.id}
                    className={`p-2 rounded border text-xs ${
                      assignedOperator 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{operation.name}</p>
                        <p className="text-gray-600">{operation.machineType}</p>
                      </div>
                      <div className="text-right">
                        {assignedOperator ? (
                          <div className="flex items-center text-green-600">
                            <UserIcon className="h-3 w-3 mr-1" />
                            <span className="text-xs">{assignedOperator.name}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" size="sm">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Assign Button */}
            {assignmentMode === 'individual' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => {
                  setSelectedBundles([bundle.id]);
                  setShowAssignmentPanel(true);
                }}
              >
                <UserPlusIcon className="h-4 w-4 mr-1" />
                Assign to Operator
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* No Results */}
      {sortedBundles.length === 0 && (
        <Card className="p-8 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bundles match your current filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedFilters({
                priority: 'all',
                status: 'all',
                machineType: 'all',
                articleNumber: 'all'
              });
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Available Operators Sidebar */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Available Operators ({availableOperators.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableOperators.map((operator) => (
            <div 
              key={operator.id}
              className="p-3 border rounded-lg hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{operator.name}</h4>
                <Badge variant={operator.skillLevel === 'expert' ? 'success' : operator.skillLevel === 'intermediate' ? 'warning' : 'info'} size="sm">
                  {operator.skillLevel}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Machine: {operator.machineType}</p>
                <p>Efficiency: {operator.efficiency}%</p>
                <p>Load: {operator.currentWorkload}/{operator.maxCapacity}</p>
                <p>Today: ${operator.todayEarnings}</p>
              </div>

              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(operator.currentWorkload / operator.maxCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SmartWorkAssignmentDashboard;