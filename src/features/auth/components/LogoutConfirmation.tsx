import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Modal, ModalBody, ModalFooter, Button, Text, Flex 
} from '@/shared/components/ui';
import { useAuthStore, useUser } from '@/app/store/auth-store';
import { useLoadingState } from '@/shared/hooks/useLoadingState';
import { LogOut, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/shared/utils';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onClose,
  redirectTo = '/login'
}) => {
  const user = useUser();
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const { isLoading, withLoading } = useLoadingState();

  const handleLogout = withLoading(async () => {
    try {
      await logout();
      onClose();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Sign Out"
      closeOnOverlayClick={!isLoading}
    >
      <ModalBody>
        <div className="space-y-4">
          {/* User Info */}
          <Flex align="center" gap={4} className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Text weight="bold" className="text-white">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </div>
            <div className="flex-1">
              <Text weight="medium">{user.name}</Text>
              <Text size="sm" color="muted">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </div>
          </Flex>

          {/* Session Info */}
          {user.lastLogin && (
            <div className="p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
              <Flex align="center" gap={2} className="mb-1">
                <Clock className="w-4 h-4 text-info-600 dark:text-info-400" />
                <Text size="sm" weight="medium" color="info">
                  Session Info
                </Text>
              </Flex>
              <Text size="sm" color="muted">
                Last login: {formatRelativeTime(user.lastLogin)}
              </Text>
            </div>
          )}

          {/* Confirmation Message */}
          <Text>
            Are you sure you want to sign out? You'll need to sign in again to access your account.
          </Text>

          {/* Warning for unsaved changes */}
          <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <Text size="sm" color="warning">
              ⚠️ Make sure to save any unsaved work before signing out.
            </Text>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleLogout}
          loading={isLoading}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};