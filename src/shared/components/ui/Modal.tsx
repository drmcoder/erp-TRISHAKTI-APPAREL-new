import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-none m-4',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className,
  overlayClassName,
  contentClassName,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'overflow-x-hidden overflow-y-auto',
            overlayClassName
          )}
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative w-full bg-white rounded-lg shadow-xl',
              'dark:bg-secondary-900',
              modalSizes[size],
              size === 'full' && 'h-full',
              contentClassName
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                {title && (
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            <div className={cn('relative', className)}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    'px-6 py-4 border-b border-secondary-200 dark:border-secondary-700',
    className
  )}>
    {children}
  </div>
);

export const ModalBody: React.FC<ModalBodyProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<ModalFooterProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    'flex items-center justify-end space-x-3 px-6 py-4',
    'border-t border-secondary-200 dark:border-secondary-700',
    className
  )}>
    {children}
  </div>
);

// Confirmation Modal Component
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm"
      title={title}
    >
      <ModalBody>
        <p className="text-secondary-600 dark:text-secondary-400">
          {message}
        </p>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Alert Modal Component
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  okText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title = 'Alert',
  message = '',
  variant = 'info',
  okText = 'OK',
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm"
      title={title}
    >
      <ModalBody>
        <p className="text-secondary-600 dark:text-secondary-400">
          {message}
        </p>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant={variant}
          onClick={onClose}
          fullWidth
        >
          {okText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};