import React, { useState, useEffect } from 'react';
import {
  Activity, Clock, User, Filter, Calendar, Eye, Download,
  ChevronDown, Search, RefreshCw
} from 'lucide-react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Input, Badge, Stack, Flex,
  Modal, ModalHeader, ModalBody, ModalFooter
} from '@/shared/components/ui';
import { UserService, UserActivity } from '@/services/user-service';
import { cn } from '@/shared/utils';

interface UserActivityLogProps {
  userId?: string; // If not provided, shows all user activities
  showUserNames?: boolean;
  maxEntries?: number;
  className?: string;
}

interface ActivityFilters {
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export const UserActivityLog: React.FC<UserActivityLogProps> = ({
  userId,
  showUserNames = true,
  maxEntries = 50,
  className
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      if (userId) {
        // Load activities for specific user
        const result = await UserService.getUserActivity(userId, maxEntries);
        if (result.success && result.data) {
          setActivities(result.data);
        }
      } else {
        // Load all activities (would need a different service method)
        // For now, we'll show empty state
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = activities;

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchTerm) ||
        activity.description.toLowerCase().includes(searchTerm) ||
        activity.userName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply action filter
    if (filters.action) {
      filtered = filtered.filter(activity => activity.action === filters.action);
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(activity => new Date(activity.timestamp) <= toDate);
    }

    setFilteredActivities(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="w-4 h-4" />;
      case 'profile_update':
      case 'role_changed':
        return <User className="w-4 h-4" />;
      case 'work_assignment':
      case 'work_completion':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'green';
      case 'logout':
        return 'red';
      case 'profile_update':
        return 'blue';
      case 'role_changed':
        return 'purple';
      case 'account_activated':
        return 'green';
      case 'account_deactivated':
        return 'red';
      case 'work_assignment':
      case 'work_completion':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getUniqueActions = (): string[] => {
    return Array.from(new Set(activities.map(activity => activity.action)));
  };

  const exportActivities = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Description', 'IP Address'].join(','),
      ...filteredActivities.map(activity => [
        new Date(activity.timestamp).toISOString(),
        activity.userName,
        activity.action,
        activity.description.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        activity.ipAddress || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Flex align="center" justify="between">
        <div>
          <Text size="xl" weight="bold">
            <Activity className="w-5 h-5 inline mr-2" />
            Activity Log
          </Text>
          <Text color="muted">
            {filteredActivities.length} activities found
          </Text>
        </div>
        
        <Flex gap={2}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivities}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportActivities}
            disabled={filteredActivities.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={cn(
              "w-4 h-4 ml-2 transition-transform",
              showFilters && "rotate-180"
            )} />
          </Button>
        </Flex>
      </Flex>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search activities..."
                leftIcon={<Search className="w-4 h-4" />}
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                clearable
                onClear={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              />
              
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={filters.action || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                >
                  <option value="">All Actions</option>
                  {getUniqueActions().map(action => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              
              <Input
                type="date"
                label="From Date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
              
              <Input
                type="date"
                label="To Date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Activity List */}
      <Card>
        <CardBody>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Text size="lg" weight="medium">No activity found</Text>
              <Text color="muted">
                {activities.length === 0 
                  ? "No activities recorded yet" 
                  : "Try adjusting your filters"
                }
              </Text>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedActivity(activity)}
                >
                  {/* Action Icon */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    `bg-${getActionBadgeVariant(activity.action)}-100`
                  )}>
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <Flex align="center" justify="between" className="mb-1">
                      <div>
                        <Flex align="center" gap={2}>
                          {showUserNames && (
                            <Text weight="medium">{activity.userName}</Text>
                          )}
                          <Badge 
                            variant={getActionBadgeVariant(activity.action)}
                            size="sm"
                          >
                            {activity.action.replace(/_/g, ' ')}
                          </Badge>
                        </Flex>
                      </div>
                      
                      <Flex align="center" gap={2}>
                        <Text size="sm" color="muted">
                          {formatTimeAgo(activity.timestamp)}
                        </Text>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </Flex>
                    </Flex>
                    
                    <Text size="sm" className="mb-2">
                      {activity.description}
                    </Text>
                    
                    {activity.ipAddress && (
                      <Text size="xs" color="muted">
                        IP: {activity.ipAddress}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Activity Detail Modal */}
      <Modal 
        isOpen={!!selectedActivity} 
        onClose={() => setSelectedActivity(null)}
        size="lg"
      >
        <ModalHeader>
          <Flex align="center" gap={2}>
            {selectedActivity && getActionIcon(selectedActivity.action)}
            Activity Details
          </Flex>
        </ModalHeader>
        
        {selectedActivity && (
          <ModalBody>
            <Stack spacing={4}>
              <div>
                <Text weight="medium" className="mb-2">Basic Information</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="sm" color="muted">User</Text>
                    <Text>{selectedActivity.userName}</Text>
                  </div>
                  <div>
                    <Text size="sm" color="muted">Action</Text>
                    <Badge variant={getActionBadgeVariant(selectedActivity.action)}>
                      {selectedActivity.action.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" color="muted">Timestamp</Text>
                    <Text>{new Date(selectedActivity.timestamp).toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text size="sm" color="muted">IP Address</Text>
                    <Text>{selectedActivity.ipAddress || 'N/A'}</Text>
                  </div>
                </div>
              </div>
              
              <div>
                <Text weight="medium" className="mb-2">Description</Text>
                <Text>{selectedActivity.description}</Text>
              </div>
              
              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <Text weight="medium" className="mb-2">Additional Data</Text>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedActivity.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedActivity.userAgent && (
                <div>
                  <Text weight="medium" className="mb-2">User Agent</Text>
                  <Text size="sm" className="break-all">
                    {selectedActivity.userAgent}
                  </Text>
                </div>
              )}
            </Stack>
          </ModalBody>
        )}
        
        <ModalFooter>
          <Button onClick={() => setSelectedActivity(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};