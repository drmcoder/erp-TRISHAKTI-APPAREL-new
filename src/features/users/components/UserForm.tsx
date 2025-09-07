import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Phone, MapPin, Shield, Settings } from 'lucide-react';
import {
  Card, CardHeader, CardBody,
  Button, Text, Input, Textarea, Badge, Stack, Flex,
  Modal, ModalHeader, ModalBody, ModalFooter
} from '@/shared/components/ui';
import { UserService, UserProfile } from '@/services/user-service';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/services/permissions-service';
import { cn } from '@/shared/utils';

interface UserFormProps {
  user?: UserProfile; // If provided, edit mode. If not, create mode
  isOpen: boolean;
  onClose: () => void;
  onSave?: (user: UserProfile) => void;
}

interface UserFormData {
  username: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: 'operator' | 'supervisor' | 'management' | 'admin';
  permissions: string[];
  bio?: string;
  address?: string;
  machineType?: string;
  skills?: string[];
  active: boolean;
}

const initialFormData: UserFormData = {
  username: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  role: 'operator',
  permissions: [],
  bio: '',
  address: '',
  machineType: '',
  skills: [],
  active: true,
};

export const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState('');

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      // Populate form with user data
      setFormData({
        username: user.username,
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        role: user.role,
        permissions: user.permissions || [],
        bio: user.bio || '',
        address: user.address || '',
        machineType: user.machineType || '',
        skills: user.skills || [],
        active: user.active,
      });
    } else {
      // Reset form for create mode
      setFormData(initialFormData);
    }
    setErrors({});
  }, [user, isOpen]);

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (newRole: string) => {
    const rolePermissions = ROLE_PERMISSIONS[newRole] || [];
    setFormData(prev => ({
      ...prev,
      role: newRole as any,
      permissions: rolePermissions,
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleInputChange('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    handleInputChange('skills', formData.skills.filter(s => s !== skill));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let result;
      
      if (isEditMode && user) {
        // Update existing user
        result = await UserService.updateUserProfile(user.id, formData as Partial<UserProfile>);
      } else {
        // Create new user
        result = await UserService.createUser(formData as Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin'>);
      }

      if (result.success && result.data) {
        onSave?.(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'operator', label: 'Operator', description: 'Production line worker' },
    { value: 'supervisor', label: 'Supervisor', description: 'Line supervisor and quality control' },
    { value: 'management', label: 'Management', description: 'Middle management and operations' },
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
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

  // Group permissions by category for better UI
  const groupedPermissions = Object.entries(PERMISSIONS).reduce((acc, [key, permission]) => {
    const category = permission.split(':')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, permission });
    return acc;
  }, {} as Record<string, Array<{ key: string; permission: string }>>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <Flex align="center" gap={2}>
          <User className="w-5 h-5" />
          {isEditMode ? 'Edit User' : 'Create New User'}
        </Flex>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <Text weight="medium">Basic Information</Text>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username *"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  error={errors.username}
                  disabled={isEditMode} // Username cannot be changed
                />
                
                <Input
                  label="Full Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
                
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
                
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />

                {formData.role === 'operator' && (
                  <Input
                    label="Machine Type"
                    value={formData.machineType}
                    onChange={(e) => handleInputChange('machineType', e.target.value)}
                    placeholder="e.g., Sewing Machine, Overlock"
                  />
                )}
              </div>

              <Textarea
                label="Bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Brief description about the user..."
                rows={3}
                className="mt-4"
              />

              <Textarea
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="User's address..."
                rows={2}
                className="mt-4"
              />
            </CardBody>
          </Card>

          {/* Role and Permissions */}
          <Card>
            <CardHeader>
              <Flex align="center" gap={2}>
                <Shield className="w-4 h-4" />
                <Text weight="medium">Role & Permissions</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">User Role *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                        formData.role === option.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <Flex align="center" gap={2}>
                          <Text weight="medium">{option.label}</Text>
                          <Badge variant={getRoleBadgeVariant(option.value)} size="sm">
                            {option.value}
                          </Badge>
                        </Flex>
                        <Text size="sm" color="muted">{option.description}</Text>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <Text size="sm" color="red" className="mt-1">{errors.role}</Text>
                )}
              </div>

              {/* Custom Permissions */}
              <div>
                <Text weight="medium" className="mb-3">
                  Additional Permissions (Role: {formData.role})
                </Text>
                <Text size="sm" color="muted" className="mb-4">
                  The selected role already includes basic permissions. You can add additional permissions below.
                </Text>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category}>
                      <Text size="sm" weight="medium" className="mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </Text>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {permissions.map(({ key, permission }) => {
                          const isRolePermission = ROLE_PERMISSIONS[formData.role]?.includes(permission);
                          return (
                            <label key={key} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission)}
                                onChange={() => handlePermissionToggle(permission)}
                                disabled={isRolePermission}
                                className="rounded"
                              />
                              <Text 
                                size="sm" 
                                className={cn(
                                  isRolePermission && "text-gray-500"
                                )}
                              >
                                {permission}
                                {isRolePermission && (
                                  <Badge size="xs" variant="gray" className="ml-1">
                                    role
                                  </Badge>
                                )}
                              </Text>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Skills (for operators) */}
          {formData.role === 'operator' && (
            <Card>
              <CardHeader>
                <Text weight="medium">Skills & Expertise</Text>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Flex gap={2}>
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1"
                    />
                    <Button onClick={addSkill} disabled={!skillInput.trim()}>
                      Add
                    </Button>
                  </Flex>
                  
                  {formData.skills.length > 0 && (
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Current Skills:</Text>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="blue"
                            className="cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardHeader>
              <Text weight="medium">Account Status</Text>
            </CardHeader>
            <CardBody>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <Text weight="medium">Active Account</Text>
                  <Text size="sm" color="muted">
                    Inactive accounts cannot log in to the system
                  </Text>
                </div>
              </label>
            </CardBody>
          </Card>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          loading={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditMode ? 'Save Changes' : 'Create User'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};