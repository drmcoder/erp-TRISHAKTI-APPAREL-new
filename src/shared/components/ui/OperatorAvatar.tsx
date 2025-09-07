import React from 'react';
import { cn } from '@/shared/utils';
import { Badge } from './Badge';

export interface OperatorAvatarProps {
  operator: OperatorData;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  showWorkload?: boolean;
  showBadges?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface OperatorData {
  id: string;
  name: string;
  status?: 'available' | 'busy' | 'offline' | 'break';
  currentWorkload?: number;
  visualBadges?: string[];
  avatar?: {
    type: 'emoji' | 'photo' | 'initials' | 'unique';
    value?: string;
    photoUrl?: string;
  };
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

const statusColors = {
  available: 'bg-green-500',
  busy: 'bg-yellow-500',
  offline: 'bg-gray-500',
  break: 'bg-blue-500'
};

const statusIndicatorSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4'
};

// Generate unique emoji based on operator ID
const generateUniqueEmoji = (operatorId: string): string => {
  const emojis = ['👨‍🏭', '👩‍🏭', '🧑‍🔧', '👨‍🔧', '👩‍🔧', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🏭', '👷‍♂️', '👷‍♀️', '🧑‍🎨', '👨‍🎨', '👩‍🎨'];
  const hash = operatorId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return emojis[Math.abs(hash) % emojis.length];
};

// Generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const OperatorAvatar: React.FC<OperatorAvatarProps> = ({
  operator,
  size = 'md',
  showStatus = true,
  showWorkload = false,
  showBadges = false,
  onClick,
  className
}) => {
  const renderAvatarContent = () => {
    const { avatar, name, id } = operator;
    
    if (avatar?.type === 'photo' && avatar.photoUrl) {
      return (
        <img
          src={avatar.photoUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      );
    }
    
    if (avatar?.type === 'emoji' && avatar.value) {
      return <span>{avatar.value}</span>;
    }
    
    if (avatar?.type === 'unique') {
      return <span>{generateUniqueEmoji(id)}</span>;
    }
    
    if (avatar?.type === 'initials' || !avatar) {
      return <span className="font-medium">{getInitials(name)}</span>;
    }
    
    return <span className="font-medium">{getInitials(name)}</span>;
  };

  const getWorkloadColor = (workload?: number) => {
    if (!workload) return 'bg-green-100 text-green-800';
    if (workload < 30) return 'bg-green-100 text-green-800';
    if (workload < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Main Avatar */}
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 overflow-hidden transition-all duration-200",
          avatarSizes[size],
          onClick && "cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-2",
          "text-gray-700"
        )}
        onClick={onClick}
      >
        {renderAvatarContent()}
        
        {/* Status Indicator */}
        {showStatus && operator.status && (
          <div
            className={cn(
              "absolute -bottom-0 -right-0 rounded-full border-2 border-white",
              statusIndicatorSizes[size],
              statusColors[operator.status]
            )}
          />
        )}
      </div>

      {/* Workload Badge */}
      {showWorkload && operator.currentWorkload !== undefined && (
        <div className="absolute -top-2 -right-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium px-1.5 py-0.5",
              getWorkloadColor(operator.currentWorkload)
            )}
          >
            {operator.currentWorkload}%
          </Badge>
        </div>
      )}

      {/* Visual Badges */}
      {showBadges && operator.visualBadges && operator.visualBadges.length > 0 && (
        <div className="absolute -top-1 -left-1 flex space-x-1">
          {operator.visualBadges.slice(0, 2).map((badge, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full border border-white text-xs flex items-center justify-center",
                badge === 'star' && 'bg-yellow-400 text-white',
                badge === 'crown' && 'bg-purple-500 text-white',
                badge === 'fire' && 'bg-red-500 text-white',
                badge === 'check' && 'bg-green-500 text-white'
              )}
            >
              {badge === 'star' && '⭐'}
              {badge === 'crown' && '👑'}
              {badge === 'fire' && '🔥'}
              {badge === 'check' && '✓'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Specialized Components based on documentation

export interface BackButtonProps {
  onClick: () => void;
  text?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  text = "Back",
  className
}) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
      className
    )}
  >
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    {text}
  </button>
);

export interface LogoutButtonProps {
  className?: string;
  variant?: 'button' | 'dropdown';
  onLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className,
  variant = 'button',
  onLogout
}) => {
  if (variant === 'dropdown') {
    return (
      <button
        onClick={onLogout}
        className={cn(
          "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center",
          className
        )}
      >
        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={onLogout}
      className={cn(
        "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
        className
      )}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Logout
    </button>
  );
};

export default OperatorAvatar;