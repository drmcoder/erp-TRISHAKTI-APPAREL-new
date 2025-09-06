import React, { useState, useEffect } from 'react';
import { 
  User, Edit, Camera, Mail, Phone, MapPin, Calendar, 
  Shield, Clock, Award, Save, X, Upload 
} from 'lucide-react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Input, Textarea, Badge, Stack, Flex,
  Modal, ModalHeader, ModalBody, ModalFooter,
  UserInfo, PermissionGate
} from '@/shared/components/ui';
import { usePermissions } from '@/app/hooks/usePermissions';
import { UserService, UserProfile as UserProfileType } from '@/services/user-service';
import { cn } from '@/shared/utils';

interface UserProfileProps {
  userId?: string; // If not provided, shows current user profile
  onUpdate?: (user: UserProfileType) => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
  className
}) => {
  const { user: currentUser } = usePermissions();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfileType>>({});

  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    if (targetUserId) {
      loadUserProfile();
    }
  }, [targetUserId]);

  const loadUserProfile = async () => {
    if (!targetUserId) return;

    setIsLoading(true);
    try {
      const result = await UserService.getUserProfile(targetUserId);
      if (result.success && result.data) {
        setUser(result.data);
        setEditForm(result.data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!targetUserId || !editForm) return;

    setIsSaving(true);
    try {
      const result = await UserService.updateUserProfile(targetUserId, editForm);
      if (result.success && result.data) {
        setUser(result.data);
        setIsEditing(false);
        onUpdate?.(result.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setEditForm(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings?.notifications,
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 bg-gray-300 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardBody>
          <Text align="center" color="muted">User not found</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile Header Card */}
      <Card>
        <CardBody>
          <Flex align="start" gap={6}>
            {/* Avatar Section */}
            <div className="relative">
              <div 
                className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors"
                onClick={() => isOwnProfile && setShowAvatarModal(true)}
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-600" />
                )}
              </div>
              
              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full bg-white shadow-lg"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <Flex align="center" justify="between" className="mb-2">
                <div>
                  <Text size="xl" weight="bold">{user.name}</Text>
                  <Text color="muted">@{user.username}</Text>
                </div>
                
                <Flex gap={2}>
                  <Badge variant={user.active ? 'green' : 'red'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <Badge 
                    variant={
                      user.role === 'admin' ? 'red' : 
                      user.role === 'management' ? 'purple' :
                      user.role === 'supervisor' ? 'blue' : 'green'
                    }
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </Flex>
              </Flex>

              {/* Contact Info */}
              <Stack spacing={2}>
                {user.email && (
                  <Flex align="center" gap={2}>
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Text size="sm">{user.email}</Text>
                  </Flex>
                )}
                
                {user.phone && (
                  <Flex align="center" gap={2}>
                    <Phone className="w-4 h-4 text-gray-500" />
                    <Text size="sm">{user.phone}</Text>
                  </Flex>
                )}
                
                {user.department && (
                  <Flex align="center" gap={2}>
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <Text size="sm">{user.department}</Text>
                  </Flex>
                )}
                
                <Flex align="center" gap={2}>
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Text size="sm">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
              </Stack>
            </div>

            {/* Edit Button */}
            {(isOwnProfile || currentUser?.role === 'admin') && (
              <Button
                variant={isEditing ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Editing Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <Text weight="bold">Edit Profile</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={editForm.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                
                <Input
                  label="Phone"
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                
                <Input
                  label="Department"
                  value={editForm.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself..."
                value={editForm.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
              />

              <Textarea
                label="Address"
                placeholder="Your address..."
                value={editForm.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
              />

              {/* Preferences */}
              <div className="border-t pt-4">
                <Text weight="medium" className="mb-3">Preferences</Text>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Theme</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editForm.settings?.theme || 'system'}
                      onChange={(e) => handleSettingsChange('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editForm.settings?.language || 'en'}
                      onChange={(e) => handleSettingsChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="ne">Nepali</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="border-t pt-4">
                <Text weight="medium" className="mb-3">Notification Settings</Text>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editForm.settings?.notifications?.email ?? true}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      className="rounded"
                    />
                    <Text size="sm">Email notifications</Text>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editForm.settings?.notifications?.push ?? true}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                      className="rounded"
                    />
                    <Text size="sm">Push notifications</Text>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editForm.settings?.notifications?.workAssignment ?? true}
                      onChange={(e) => handleNotificationChange('workAssignment', e.target.checked)}
                      className="rounded"
                    />
                    <Text size="sm">Work assignment notifications</Text>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editForm.settings?.notifications?.qualityIssues ?? true}
                      onChange={(e) => handleNotificationChange('qualityIssues', e.target.checked)}
                      className="rounded"
                    />
                    <Text size="sm">Quality issue notifications</Text>
                  </label>
                </div>
              </div>

              {/* Save Actions */}
              <Flex justify="end" gap={2} className="border-t pt-4">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  loading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </Flex>
            </Stack>
          </CardBody>
        </Card>
      )}

      {/* Profile Stats */}
      {user.activity && (
        <Card>
          <CardHeader>
            <Text weight="bold">Activity Stats</Text>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Text size="2xl" weight="bold" color="primary">
                  {user.activity.totalLogins || 0}
                </Text>
                <Text size="sm" color="muted">Total Logins</Text>
              </div>
              
              <div className="text-center">
                <Text size="2xl" weight="bold" color="green">
                  {user.activity.completedTasks || 0}
                </Text>
                <Text size="sm" color="muted">Tasks Done</Text>
              </div>
              
              <div className="text-center">
                <Text size="2xl" weight="bold" color="blue">
                  {user.activity.workHours || 0}h
                </Text>
                <Text size="sm" color="muted">Work Hours</Text>
              </div>
              
              <div className="text-center">
                <Flex align="center" justify="center" gap={1}>
                  <Clock className="w-4 h-4 text-gray-500" />
                  <Text size="sm">
                    {user.activity.lastSeen 
                      ? new Date(user.activity.lastSeen).toLocaleDateString()
                      : 'Never'
                    }
                  </Text>
                </Flex>
                <Text size="sm" color="muted">Last Seen</Text>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Avatar Upload Modal */}
      <Modal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)}>
        <ModalHeader>Update Profile Picture</ModalHeader>
        <ModalBody>
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
            
            <Text size="sm" color="muted">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </Text>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAvatarModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowAvatarModal(false)}>
            Upload
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};