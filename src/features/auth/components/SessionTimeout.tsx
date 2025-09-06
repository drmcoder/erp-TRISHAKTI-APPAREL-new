import React, { useState, useEffect } from 'react';
import { 
  Modal, ModalBody, ModalFooter, Button, Text, 
  H3, Flex 
} from '@/shared/components/ui';
import { useAuthStore } from '@/app/store/auth-store';
import { Clock, AlertTriangle } from 'lucide-react';

interface SessionTimeoutProps {
  warningTime?: number; // Time in minutes to show warning before session expires
  extendTime?: number; // Time in minutes to extend session
}

export const SessionTimeout: React.FC<SessionTimeoutProps> = ({
  warningTime = 5, // 5 minutes warning
  extendTime = 30, // Extend by 30 minutes
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExtending, setIsExtending] = useState(false);
  
  const { user, sessionExpiry, extendSession, logout } = useAuthStore();

  useEffect(() => {
    if (!user || !sessionExpiry) return;

    const checkSessionStatus = () => {
      const now = Date.now();
      const msLeft = sessionExpiry - now;
      const minutesLeft = Math.floor(msLeft / (1000 * 60));
      
      setTimeLeft(minutesLeft);

      if (minutesLeft <= 0) {
        // Session expired
        setShowWarning(false);
        logout();
        return;
      }

      if (minutesLeft <= warningTime && !showWarning) {
        setShowWarning(true);
      } else if (minutesLeft > warningTime && showWarning) {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSessionStatus();

    // Set up interval to check every minute
    const interval = setInterval(checkSessionStatus, 60000);

    return () => clearInterval(interval);
  }, [user, sessionExpiry, warningTime, showWarning, logout]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      // Extend the session
      extendSession();
      setShowWarning(false);
      setTimeLeft(extendTime);
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogoutNow = async () => {
    setShowWarning(false);
    await logout();
  };

  if (!showWarning || timeLeft <= 0) {
    return null;
  }

  const progressPercentage = Math.max(0, (timeLeft / warningTime) * 100);

  return (
    <Modal
      isOpen={showWarning}
      onClose={() => {}} // Prevent closing by clicking outside
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Warning Header */}
          <Flex align="center" gap={3}>
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <H3 color="warning">Session Expiring Soon</H3>
              <Text color="muted" size="sm">
                Your session will expire automatically
              </Text>
            </div>
          </Flex>

          {/* Time Remaining */}
          <div className="space-y-3">
            <Flex align="center" justify="between">
              <Flex align="center" gap={2}>
                <Clock className="w-4 h-4 text-secondary-500" />
                <Text weight="medium">Time Remaining:</Text>
              </Flex>
              <Text weight="bold" size="lg" color={timeLeft <= 2 ? 'danger' : 'warning'}>
                {timeLeft} minute{timeLeft !== 1 ? 's' : ''}
              </Text>
            </Flex>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 2 
                      ? 'bg-danger-500' 
                      : timeLeft <= 4 
                      ? 'bg-warning-500' 
                      : 'bg-primary-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <Text size="xs" color="muted" align="center">
                Session will auto-logout when time reaches zero
              </Text>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <Text size="sm" color="muted" className="mb-1">
                Logged in as:
              </Text>
              <Text weight="medium">
                {user.name} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
              </Text>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
            <Text size="sm" color="info">
              💡 <strong>Tip:</strong> To avoid losing your work, extend your session or save any unsaved changes now.
            </Text>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="justify-between">
        <Button
          variant="outline"
          onClick={handleLogoutNow}
          disabled={isExtending}
        >
          Sign Out Now
        </Button>
        
        <Button
          variant="primary"
          onClick={handleExtendSession}
          loading={isExtending}
          leftIcon={<Clock className="w-4 h-4" />}
        >
          {isExtending ? 'Extending...' : `Extend Session (+${extendTime}m)`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};