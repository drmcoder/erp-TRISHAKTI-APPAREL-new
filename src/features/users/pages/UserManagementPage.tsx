import React, { useState } from 'react';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Badge, Stack, Flex, Tabs,
  PermissionGate
} from '@/shared/components/ui';
import { 
  UserList, UserForm, UserProfile, UserActivityLog 
} from '@/features/users/components';
import { UserProfile as UserProfileType } from '@/services/user-service';

type TabValue = 'list' | 'activity' | 'stats' | 'profile';

export const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('list');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfileType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfileType | null>(null);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: UserProfileType) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleUserSelect = (user: UserProfileType) => {
    setSelectedUser(user);
    setActiveTab('profile');
  };

  const handleUserSave = (user: UserProfileType) => {
    setShowUserForm(false);
    setEditingUser(null);
    // Optionally refresh the user list here
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const tabs = [
    { 
      value: 'list' as TabValue, 
      label: 'All Users', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      value: 'activity' as TabValue, 
      label: 'Activity Log', 
      icon: <Activity className="w-4 h-4" /> 
    },
    { 
      value: 'stats' as TabValue, 
      label: 'Statistics', 
      icon: <TrendingUp className="w-4 h-4" /> 
    },
  ];

  // Add profile tab when user is selected
  const allTabs = selectedUser 
    ? [
        ...tabs,
        { 
          value: 'profile' as TabValue, 
          label: selectedUser.name, 
          icon: <Users className="w-4 h-4" /> 
        }
      ] 
    : tabs;

  const renderUserStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <Card>
        <CardBody>
          <Flex align="center" justify="between">
            <div>
              <Text size="2xl" weight="bold" color="blue">124</Text>
              <Text size="sm" color="muted">Total Users</Text>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </Flex>
        </CardBody>
      </Card>

      {/* Active Users */}
      <Card>
        <CardBody>
          <Flex align="center" justify="between">
            <div>
              <Text size="2xl" weight="bold" color="green">118</Text>
              <Text size="sm" color="muted">Active Users</Text>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </Flex>
        </CardBody>
      </Card>

      {/* By Role Stats */}
      <Card>
        <CardBody>
          <Text weight="medium" className="mb-3">Users by Role</Text>
          <Stack spacing={2}>
            <Flex align="center" justify="between">
              <Flex align="center" gap={2}>
                <Badge variant="green" size="sm">Operator</Badge>
              </Flex>
              <Text size="sm">89</Text>
            </Flex>
            <Flex align="center" justify="between">
              <Flex align="center" gap={2}>
                <Badge variant="blue" size="sm">Supervisor</Badge>
              </Flex>
              <Text size="sm">18</Text>
            </Flex>
            <Flex align="center" justify="between">
              <Flex align="center" gap={2}>
                <Badge variant="purple" size="sm">Management</Badge>
              </Flex>
              <Text size="sm">12</Text>
            </Flex>
            <Flex align="center" justify="between">
              <Flex align="center" gap={2}>
                <Badge variant="red" size="sm">Admin</Badge>
              </Flex>
              <Text size="sm">5</Text>
            </Flex>
          </Stack>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardBody>
          <Text weight="medium" className="mb-3">Recent Activity</Text>
          <Stack spacing={2}>
            <div>
              <Text size="sm" weight="medium">45 logins today</Text>
              <Text size="xs" color="muted">Last hour: 8 logins</Text>
            </div>
            <div>
              <Text size="sm" weight="medium">12 new users this week</Text>
              <Text size="xs" color="muted">Up 20% from last week</Text>
            </div>
            <div>
              <Text size="sm" weight="medium">3 role changes</Text>
              <Text size="xs" color="muted">In the last 24 hours</Text>
            </div>
          </Stack>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <Flex align="center" justify="between" className="mb-2">
          <div>
            <Text size="2xl" weight="bold">User Management</Text>
            <Text color="muted">Manage system users, roles, and permissions</Text>
          </div>
          
          <PermissionGate permissions={['user:create']}>
            <Button onClick={handleCreateUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </PermissionGate>
        </Flex>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 overflow-x-auto">
            {allTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap
                  transition-colors duration-200
                  ${activeTab === tab.value
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      <div>
        {activeTab === 'list' && (
          <UserList
            onUserSelect={handleUserSelect}
            onUserEdit={handleEditUser}
            onUserCreate={handleCreateUser}
          />
        )}

        {activeTab === 'activity' && (
          <UserActivityLog showUserNames={true} />
        )}

        {activeTab === 'stats' && renderUserStats()}

        {activeTab === 'profile' && selectedUser && (
          <div className="space-y-6">
            <Flex align="center" justify="between">
              <Text size="xl" weight="bold">User Profile</Text>
              <Button
                variant="outline"
                onClick={() => setActiveTab('list')}
              >
                Back to List
              </Button>
            </Flex>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile */}
              <div className="lg:col-span-2">
                <UserProfile
                  userId={selectedUser.id}
                  onUpdate={(updatedUser) => setSelectedUser(updatedUser)}
                />
              </div>
              
              {/* Activity Log for this user */}
              <div>
                <UserActivityLog
                  userId={selectedUser.id}
                  showUserNames={false}
                  maxEntries={20}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={showUserForm}
        onClose={handleCloseUserForm}
        onSave={handleUserSave}
      />
    </div>
  );
};