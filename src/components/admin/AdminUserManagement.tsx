// Admin User Management - Create and manage supervisor and admin accounts
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
  CogIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { UserService, type UserProfile } from '@/services/user-service';
import { permissionService } from '@/services/permission-service';
import { notify } from '@/utils/notification-utils';
import { safeArray, safeString, safeGet } from '@/utils/null-safety';

interface AdminUserManagementProps {
  adminId: string;
}

interface CreateUserFormData {
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor';
  department: string;
  password: string;
  confirmPassword: string;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ adminId }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    email: '',
    name: '',
    role: 'supervisor',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all admin and supervisor users
      const result = await UserService.getAllUsers();
      if (result.success) {
        const adminAndSupervisors = safeArray(result.data).filter(
          user => user.role === 'admin' || user.role === 'supervisor'
        );
        setUsers(adminAndSupervisors);
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Error loading users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      notify.error('Passwords do not match!', 'Validation Error');
      return;
    }

    if (formData.password.length < 8) {
      notify.error('Password must be at least 8 characters long!', 'Password Too Short');
      return;
    }

    try {
      setFormLoading(true);
      
      const userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin'> = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        permissions: [], // Will be set by permissionService.setUserRole
        active: true,
        settings: {
          theme: 'system',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            workAssignment: true,
            qualityIssues: true,
          }
        }
      };

      const result = await UserService.createUser(userData);
      
      if (result.success) {
        // Set up role-based permissions
        if (result.data) {
          await permissionService.setUserRole(result.data.id, formData.role);
        }
        
        notify.success(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully!`, 'Account Created');
        
        // Reset form and reload users
        setFormData({
          username: '',
          email: '',
          name: '',
          role: 'supervisor',
          department: '',
          password: '',
          confirmPassword: ''
        });
        setShowCreateForm(false);
        await loadUsers();
      } else {
        notify.error(`Failed to create ${formData.role}: ${result.error}`, 'Creation Failed');
      }
    } catch (err) {
      notify.error(`Error creating ${formData.role}`, 'Creation Error');
      console.error('Error creating user:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await UserService.deleteUser(userId);
      if (result.success) {
        notify.success('User deleted successfully!', 'User Deleted');
        await loadUsers();
      } else {
        notify.error(`Failed to delete user: ${result.error}`, 'Deletion Failed');
      }
    } catch (err) {
      notify.error('Error deleting user', 'Deletion Error');
      console.error('Error deleting user:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await UserService.updateUser(userId, { active: !currentStatus });
      if (result.success) {
        notify.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'Status Updated');
        await loadUsers();
      } else {
        notify.error(`Failed to update user status: ${result.error}`, 'Status Update Failed');
      }
    } catch (err) {
      notify.error('Error updating user status', 'Update Error');
      console.error('Error updating user status:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      safeString(user.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(user.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeString(user.email).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5 text-red-600" />;
      case 'supervisor':
        return <UserIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadUsers}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <CogIcon className="h-8 w-8 text-blue-600" />
            <span>User Management</span>
          </h1>
          <p className="text-gray-600">Create and manage admin and supervisor accounts</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="supervisor">Supervisors</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Admin Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Supervisor Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'supervisor').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create User Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New User Account</h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'supervisor' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Production, Quality, Management"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password (minimum 8 characters)"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      username: '',
                      email: '',
                      name: '',
                      role: 'supervisor',
                      department: '',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : `Create ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                        {!user.active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        @{user.username} • {user.email}
                      </p>
                      {user.department && (
                        <p className="text-xs text-gray-500">{user.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleUserStatus(user.id, user.active)}
                      className={user.active ? 'text-orange-600 border-orange-600' : 'text-green-600 border-green-600'}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 border-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="text-red-600 border-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUserManagement;