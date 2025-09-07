// Modern Operator List Component with filtering and search
import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { EmptyState } from '@/shared/components/empty-state';
import { OperatorCard } from './operator-card';
import { useOperators } from '../hooks';
import { MACHINE_TYPES, SKILL_LEVELS, STATUS_CONFIG } from '../types';

interface OperatorListProps {
  onCreateNew?: () => void;
  onViewOperator?: (operatorId: string) => void;
  onEditOperator?: (operatorId: string) => void;
}

export const OperatorList: React.FC<OperatorListProps> = ({
  onCreateNew,
  onViewOperator,
  onEditOperator
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch operators data
  const { 
    data: operatorsResult, 
    isLoading, 
    error, 
    refetch 
  } = useOperators({
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  const operators = operatorsResult?.success ? operatorsResult.data : [];

  // Filter and search operators
  const filteredOperators = useMemo(() => {
    return operators.filter(operator => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        operator.currentStatus === statusFilter;

      // Machine filter
      const matchesMachine = machineFilter === 'all' || 
        operator.primaryMachine === machineFilter;

      return matchesSearch && matchesStatus && matchesMachine;
    });
  }, [operators, searchTerm, statusFilter, machineFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = operators.length;
    const active = operators.filter(op => op.currentStatus === 'working').length;
    const available = operators.filter(op => op.currentStatus === 'idle').length;
    const avgEfficiency = operators.reduce((sum, op) => sum + op.efficiency, 0) / total || 0;

    return { total, active, available, avgEfficiency };
  }, [operators]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load operators</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operators</h1>
          <p className="text-gray-600">Manage and monitor operator performance</p>
        </div>
        
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Add Operator</span>
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Working</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Available</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Avg Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(stats.avgEfficiency * 100)}%
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search operators by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {(statusFilter !== 'all' || machineFilter !== 'all' || skillFilter !== 'all') && (
              <Badge variant="primary" className="ml-1">
                {[statusFilter, machineFilter, skillFilter].filter(f => f !== 'all').length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Type
                </label>
                <select
                  value={machineFilter}
                  onChange={(e) => setMachineFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Machines</option>
                  {MACHINE_TYPES.map((machine) => (
                    <option key={machine.machineType} value={machine.machineType}>
                      {machine.displayName} ({machine.nepaliName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  {SKILL_LEVELS.map((skill) => (
                    <option key={skill.value} value={skill.value}>
                      {skill.label} ({skill.nepaliLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setMachineFilter('all');
                  setSkillFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {filteredOperators.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="No operators found"
            description={
              searchTerm || statusFilter !== 'all' || machineFilter !== 'all'
                ? "Try adjusting your filters to see more operators"
                : "Get started by adding your first operator"
            }
            action={
              onCreateNew ? (
                <Button onClick={onCreateNew}>
                  Add First Operator
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredOperators.length} of {operators.length} operators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOperators.map((operator) => (
                <OperatorCard
                  key={operator.id}
                  operator={operator}
                  onView={() => onViewOperator?.(operator.id)}
                  onEdit={() => onEditOperator?.(operator.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};