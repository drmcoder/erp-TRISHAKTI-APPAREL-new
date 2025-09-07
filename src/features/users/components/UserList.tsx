import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical,
  Shield, Mail, Phone, Calendar, MapPin, ChevronDown
} from 'lucide-react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Input, Badge, Stack, Flex,
  Dropdown, DropdownOption,
  Modal, ModalHeader, ModalBody, ModalFooter,
  PermissionGate, ConditionalButton
} from '@/shared/components/ui';
import { usePermissions } from '@/app/hooks/usePermissions';
import { UserService, UserProfile, UserListFilters } from '@/services/user-service';
import { cn } from '@/shared/utils';

interface UserListProps {
  onUserSelect?: (user: UserProfile) => void;
  onUserEdit?: (user: UserProfile) => void;
  onUserCreate?: () => void;
  className?: string;
}

export const UserList: React.FC<UserListProps> = ({
  onUserSelect,
  onUserEdit,
  onUserCreate,
  className
}) => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserListFilters>({});
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await UserService.getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }

    if (filters.active !== undefined) {
      filtered = filtered.filter(user => user.active === filters.active);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = (action: string, user: UserProfile) => {
    switch (action) {
      case 'view':
        onUserSelect?.(user);
        break;
      case 'edit':
        onUserEdit?.(user);
        break;
      case 'delete':
        setSelectedUser(user);
        setShowDeleteModal(true);
        break;
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await UserService.deactivateUser(selectedUser.id, 'Deleted by admin');
      if (result.success) {
        await loadUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const getUserActions = (user: UserProfile): DropdownOption[] => {
    const actions: DropdownOption[] = [
      {
        value: 'view',
        label: 'View Profile',
        icon: <Eye className="w-4 h-4" />
      }
    ];

    if (hasPermission('user:update')) {
      actions.push({
        value: 'edit',
        label: 'Edit User',
        icon: <Edit className="w-4 h-4" />
      });
    }

    if (hasPermission('user:delete')) {
      actions.push({
        value: 'delete',
        label: 'Delete User',
        icon: <Trash2 className="w-4 h-4" />
      });
    }

    return actions;
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'operator', label: 'Operator' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'management', label: 'Management' },
    { value: 'admin', label: 'Admin' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'management': return 'purple';
      case 'supervisor': return 'blue';
      case 'operator': return 'green';
      default: return 'gray';
    }
  };

  const getUniqueValues = (field: keyof UserProfile): string[] => {
    return Array.from(new Set(users.map(user => user[field]).filter(Boolean))) as string[];
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
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
          <Text size="xl" weight="bold">Users</Text>
          <Text color="muted">{filteredUsers.length} users found</Text>
        </div>
        
        <PermissionGate permissions={['user:create']}>
          <Button onClick={onUserCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </PermissionGate>
      </Flex>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <Stack spacing={4}>
            <Flex gap={4}>
              <div className="flex-1">
                <Input
                  placeholder="Search users..."
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  clearable
                  onClear={() => setSearchTerm('')}
                />
              </div>
              
              <Button
                variant="outline"
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

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.role || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value || undefined }))}
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.department || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value || undefined }))}
                  >
                    <option value="">All Departments</option>
                    {getUniqueValues('department').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.active !== undefined ? String(filters.active) : ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      active: e.target.value ? e.target.value === 'true' : undefined 
                    }))}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </Stack>
        </CardBody>
      </Card>

      {/* User List */}
      <Card>
        <CardBody>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Text size="lg" weight="medium">No users found</Text>
              <Text color="muted">Try adjusting your search or filters</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Flex align="center" gap={4}>
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Text weight="medium" className="text-primary-600">
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <Flex align="center" gap={2} className="mb-1">
                        <Text weight="medium">{user.name}</Text>
                        <Badge 
                          variant={getRoleBadgeVariant(user.role)}
                          size="sm"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                        <Badge 
                          variant={user.active ? 'green' : 'red'}
                          size="sm"
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Flex>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <Flex align="center" gap={1}>
                          <Text size="sm" color="muted">@{user.username}</Text>
                        </Flex>
                        
                        {user.email && (
                          <Flex align="center" gap={1}>
                            <Mail className="w-3 h-3" />
                            <Text size="sm">{user.email}</Text>
                          </Flex>
                        )}
                        
                        {user.department && (
                          <Flex align="center" gap={1}>
                            <MapPin className="w-3 h-3" />
                            <Text size="sm">{user.department}</Text>
                          </Flex>
                        )}
                        
                        <Flex align="center" gap={1}>
                          <Calendar className="w-3 h-3" />
                          <Text size="sm">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </div>
                    </div>
                  </Flex>

                  {/* Actions */}
                  <Dropdown
                    options={getUserActions(user)}
                    onSelectionChange={(action) => handleUserAction(action, user)}
                    placement="left"
                  >
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>Delete User</ModalHeader>
        <ModalBody>
          <Text>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? 
            This action will deactivate their account and they won't be able to access the system.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};