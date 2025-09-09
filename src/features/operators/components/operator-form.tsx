// Modern Operator Form Component (following REBUILD_BLUEPRINT design system)
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserIcon,
  CpuChipIcon,
  StarIcon,
  ClockIcon,
  PhotoIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import type { CreateOperatorData, UpdateOperatorData } from '@/types/operator-types';
import { MACHINE_TYPES, SKILL_LEVELS } from '@/types/operator-types';

// Form validation schema - dynamic based on mode
const getOperatorSchema = (mode: 'create' | 'edit') => z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: mode === 'create' 
    ? z.string().min(6, 'Password must be at least 6 characters')
    : z.string().optional(), // Optional in edit mode
  name: z.string().min(2, 'Full Name must be at least 2 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  primaryMachine: z.string().min(1, 'Primary machine selection is required'),
  machineTypes: z.array(z.string()).min(1, 'At least one machine type must be selected'),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    required_error: 'Skill level selection is required'
  }),
  specializations: z.array(z.string()).optional(),
  maxConcurrentWork: z.number().min(1, 'Must be at least 1').max(10, 'Cannot exceed 10')
});

type FormData = z.infer<ReturnType<typeof getOperatorSchema>>;

interface OperatorFormProps {
  initialData?: Partial<CreateOperatorData | UpdateOperatorData>;
  onSubmit: (data: CreateOperatorData | UpdateOperatorData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

interface AvatarOption {
  type: 'emoji' | 'initials' | 'photo';
  value: string;
  backgroundColor?: string;
  label: string;
}

const EMOJI_OPTIONS = [
  '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '👨‍🏭', '👩‍🏭',
  '🧑‍💻', '👨‍💻', '👩‍💻', '🥷', '👤', '🔧'
];

const COLOR_OPTIONS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

// Predefined operations for specializations dropdown
const AVAILABLE_OPERATIONS = [
  { value: 'stitching', label: 'Stitching', nepaliLabel: 'सिलाई' },
  { value: 'hemming', label: 'Hemming', nepaliLabel: 'हेमिंग' },
  { value: 'buttonhole_making', label: 'Buttonhole Making', nepaliLabel: 'बटनहोल बनाउने' },
  { value: 'button_attaching', label: 'Button Attaching', nepaliLabel: 'बटन जोड्ने' },
  { value: 'zipper_insertion', label: 'Zipper Insertion', nepaliLabel: 'जिपर लगाउने' },
  { value: 'seam_finishing', label: 'Seam Finishing', nepaliLabel: 'सिम फिनिशिंग' },
  { value: 'edge_stitching', label: 'Edge Stitching', nepaliLabel: 'किनारा सिलाई' },
  { value: 'topstitching', label: 'Topstitching', nepaliLabel: 'टपस्टिचिंग' },
  { value: 'blind_hemming', label: 'Blind Hemming', nepaliLabel: 'अन्धा हेमिंग' },
  { value: 'overlock_stitching', label: 'Overlock Stitching', nepaliLabel: 'ओभरलक सिलाई' },
  { value: 'flatlock_stitching', label: 'Flatlock Stitching', nepaliLabel: 'फ्ल्यालक सिलाई' },
  { value: 'coverstitch', label: 'Coverstitch', nepaliLabel: 'कभरस्टिच' },
  { value: 'binding', label: 'Binding', nepaliLabel: 'बाइन्डिंग' },
  { value: 'piping', label: 'Piping', nepaliLabel: 'पाइपिंग' },
  { value: 'pleating', label: 'Pleating', nepaliLabel: 'प्लिटिंग' },
  { value: 'gathering', label: 'Gathering', nepaliLabel: 'ग्याद्रिंग' },
  { value: 'smocking', label: 'Smocking', nepaliLabel: 'स्मकिंग' },
  { value: 'applique', label: 'Applique', nepaliLabel: 'एप्लिक' },
  { value: 'embroidery', label: 'Embroidery', nepaliLabel: 'कसिदाकारी' },
  { value: 'quality_inspection', label: 'Quality Inspection', nepaliLabel: 'गुणस्तर जाँच' },
  { value: 'pattern_matching', label: 'Pattern Matching', nepaliLabel: 'नमुना मिलान' },
  { value: 'pressing', label: 'Pressing', nepaliLabel: 'प्रेसिंग' },
  { value: 'cutting', label: 'Cutting', nepaliLabel: 'काट्ने' },
  { value: 'marking', label: 'Marking', nepaliLabel: 'चिन्ह लगाउने' },
  { value: 'packaging', label: 'Packaging', nepaliLabel: 'प्याकेजिंग' },
];

export const OperatorForm: React.FC<OperatorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null);
  const [customSpecialization, setCustomSpecialization] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(getOperatorSchema(mode)),
    defaultValues: {
      username: initialData?.username || '',
      password: '', // Always require password input for security
      name: initialData?.name || '',
      employeeId: initialData?.employeeId || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      primaryMachine: initialData?.primaryMachine || '', // No default to force selection
      machineTypes: initialData?.machineTypes || [], // No default to force selection
      skillLevel: initialData?.skillLevel || 'beginner', // Keep default for better UX
      specializations: initialData?.specializations || [],
      maxConcurrentWork: initialData?.maxConcurrentWork || 1
    }
  });

  const watchedValues = watch();
  const watchedMachineTypes = watch('machineTypes') || [];
  const watchedSpecializations = watch('specializations') || [];

  // Initialize avatar from initial data
  useEffect(() => {
    if (initialData?.avatar) {
      setSelectedAvatar({
        type: initialData.avatar.type,
        value: initialData.avatar.value,
        backgroundColor: initialData.avatar.backgroundColor,
        label: initialData.avatar.type === 'emoji' ? initialData.avatar.value : 
               initialData.avatar.type === 'initials' ? initialData.avatar.value : 'Photo'
      });
    }
  }, [initialData]);

  // Generate initials avatar
  const generateInitialsAvatar = (name: string): AvatarOption => {
    const initials = name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
    return {
      type: 'initials',
      value: initials,
      backgroundColor: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
      label: initials
    };
  };

  // Auto-generate avatar when name changes
  useEffect(() => {
    if (watchedValues.name && !selectedAvatar && mode === 'create') {
      setSelectedAvatar(generateInitialsAvatar(watchedValues.name));
    }
  }, [watchedValues.name, selectedAvatar, mode]);

  const handleMachineTypeToggle = (machineType: string) => {
    const current = watchedMachineTypes;
    const updated = current.includes(machineType)
      ? current.filter(type => type !== machineType)
      : [...current, machineType];
    setValue('machineTypes', updated, { shouldValidate: true });
  };

  const handleSpecializationAdd = () => {
    if (customSpecialization.trim()) {
      const current = watchedSpecializations;
      setValue('specializations', [...current, customSpecialization.trim()]);
      setCustomSpecialization('');
    }
  };

  const handleSpecializationRemove = (index: number) => {
    const current = watchedSpecializations;
    setValue('specializations', current.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: FormData, event?: React.FormEvent) => {
    try {
      // If form is invalid, provide detailed feedback
      if (!isValid) {
        event?.preventDefault();
        
        // Find the first field with an error
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
          const firstErrorField = errorFields[0];
          
          // Scroll to the first error field
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`) ||
                              document.querySelector(`input[name="${firstErrorField}"]`) ||
                              document.querySelector(`select[name="${firstErrorField}"]`);
          
          if (errorElement) {
            errorElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
          
          // Show detailed validation errors
          const errorMessages = Object.entries(errors)
            .map(([field, error]) => {
              const fieldName = field === 'primaryMachine' ? 'Primary Machine' :
                              field === 'machineTypes' ? 'Machine Types' :
                              field === 'skillLevel' ? 'Skill Level' :
                              field === 'maxConcurrentWork' ? 'Max Concurrent Work' :
                              field === 'employeeId' ? 'Employee ID' :
                              field.charAt(0).toUpperCase() + field.slice(1);
              return `• ${fieldName}: ${error?.message || 'Required'}`;
            })
            .join('\n');
          
          alert(`Please fix the following required fields:\n\n${errorMessages}`);
          return;
        }
      }

      const formattedData = {
        ...data,
        hiredDate: new Date(), // Set current date as default since field is removed
        shift: 'morning' as const, // Default to morning since only one shift
        avatar: selectedAvatar ? {
          type: selectedAvatar.type,
          value: selectedAvatar.value,
          backgroundColor: selectedAvatar.backgroundColor
        } : undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        specializations: data.specializations?.filter(s => s.trim()) || []
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to create operator. Please check all required fields and try again.');
    }
  };

  const renderAvatarPreview = () => {
    if (!selectedAvatar) return null;

    switch (selectedAvatar.type) {
      case 'emoji':
        return (
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
            {selectedAvatar.value}
          </div>
        );
      case 'initials':
        return (
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: selectedAvatar.backgroundColor }}
          >
            {selectedAvatar.value}
          </div>
        );
      case 'photo':
        return (
          <img
            src={selectedAvatar.value}
            alt="Avatar"
            className="h-16 w-16 rounded-full object-cover"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <UserIcon className="h-5 w-5" />
          <span>Basic Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <Input
              {...register('username')}
              placeholder="Enter username"
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder={mode === 'edit' ? 'Enter new password (leave blank to keep current)' : 'Enter password'}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              {...register('name')}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID *
            </label>
            <Input
              {...register('employeeId')}
              placeholder="Enter employee ID"
              className={errors.employeeId ? 'border-red-500' : ''}
            />
            {errors.employeeId && (
              <p className="text-red-500 text-sm mt-1">{errors.employeeId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              {...register('phone')}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <Input
            {...register('address')}
            placeholder="Enter full address"
          />
        </div>
      </Card>

      {/* Avatar Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <FaceSmileIcon className="h-5 w-5" />
          <span>Avatar</span>
        </h3>

        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="text-sm text-gray-500 mb-2">Preview</div>
            {renderAvatarPreview() || (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="space-y-4">
              {/* Emoji Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar({ type: 'emoji', value: emoji, label: emoji })}
                      className={`p-2 rounded-lg border text-2xl hover:bg-gray-50 ${
                        selectedAvatar?.type === 'emoji' && selectedAvatar?.value === emoji
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initials with Color Selection */}
              {watchedValues.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Use Initials
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color, index) => {
                      const initials = watchedValues.name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAvatar({
                            type: 'initials',
                            value: initials,
                            backgroundColor: color,
                            label: initials
                          })}
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold border-2 ${
                            selectedAvatar?.type === 'initials' && selectedAvatar?.backgroundColor === color
                              ? 'border-gray-800'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Work Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <CpuChipIcon className="h-5 w-5" />
          <span>Work Information</span>
        </h3>

        <div className="space-y-6">
          {/* Machine Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machine Types * (Select all applicable)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MACHINE_TYPES.map((machine) => (
                <label
                  key={machine.machineType}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={watchedMachineTypes.includes(machine.machineType)}
                    onChange={() => handleMachineTypeToggle(machine.machineType)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">
                    {machine.displayName}
                    <span className="text-gray-500 ml-1">({machine.nepaliName})</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.machineTypes && (
              <p className="text-red-500 text-sm mt-1">{errors.machineTypes.message}</p>
            )}
          </div>

          {/* Primary Machine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Machine *
            </label>
            <select
              {...register('primaryMachine')}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.primaryMachine ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select primary machine</option>
              {MACHINE_TYPES.filter(m => watchedMachineTypes.includes(m.machineType)).map((machine) => (
                <option key={machine.machineType} value={machine.machineType}>
                  {machine.displayName} ({machine.nepaliName})
                </option>
              ))}
            </select>
            {errors.primaryMachine && (
              <p className="text-red-500 text-sm mt-1">{errors.primaryMachine.message}</p>
            )}
          </div>

          {/* Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Level *
              </label>
              <select
                {...register('skillLevel')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SKILL_LEVELS.map((skill) => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label} ({skill.nepaliLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Concurrent Work *
            </label>
            <Input
              {...register('maxConcurrentWork', { valueAsNumber: true })}
              type="number"
              min="1"
              max="10"
              placeholder="Maximum concurrent work items"
              className={errors.maxConcurrentWork ? 'border-red-500' : ''}
            />
            {errors.maxConcurrentWork && (
              <p className="text-red-500 text-sm mt-1">{errors.maxConcurrentWork.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Specializations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <StarIcon className="h-5 w-5" />
          <span>Specializations</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Operations (Select multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {AVAILABLE_OPERATIONS.map((operation) => (
                <label
                  key={operation.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={watchedSpecializations.includes(operation.value)}
                    onChange={(e) => {
                      const current = watchedSpecializations;
                      const updated = e.target.checked
                        ? [...current, operation.value]
                        : current.filter(spec => spec !== operation.value);
                      setValue('specializations', updated);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{operation.label}</div>
                    <div className="text-xs text-gray-500">{operation.nepaliLabel}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Input
              value={customSpecialization}
              onChange={(e) => setCustomSpecialization(e.target.value)}
              placeholder="Add custom specialization..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSpecializationAdd())}
            />
            <Button
              type="button"
              onClick={handleSpecializationAdd}
              variant="secondary"
              disabled={!customSpecialization.trim()}
            >
              Add Custom
            </Button>
          </div>

          {watchedSpecializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedSpecializations.map((spec, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => handleSpecializationRemove(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>{mode === 'create' ? 'Create Operator' : 'Update Operator'}</span>
        </Button>
      </div>
    </form>
  );
};