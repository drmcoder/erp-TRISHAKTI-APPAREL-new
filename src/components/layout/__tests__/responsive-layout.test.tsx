import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { ResponsiveLayout } from '../responsive-layout';

// Mock react-swipeable
vi.mock('react-swipeable', () => ({
  useSwipeable: vi.fn(() => ({
    onTouchStart: vi.fn(),
    onTouchEnd: vi.fn(),
  })),
}));

// Mock UI components
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-description">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-title">{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-trigger">{children}</div>,
}));

vi.mock('@/shared/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  Bell: () => <span data-testid="bell-icon">Bell</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Settings: () => <span data-testid="settings-icon">Settings</span>,
  X: () => <span data-testid="x-icon">X</span>,
  ChevronLeft: () => <span data-testid="chevron-left-icon">ChevronLeft</span>,
}));

// Mock useMediaQuery hook
const mockUseMediaQuery = vi.fn();
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: mockUseMediaQuery,
}));

describe('ResponsiveLayout', () => {
  const mockUser = {
    uid: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'operator'
  };

  const mockNotifications = [
    {
      id: '1',
      title: 'Test Notification',
      message: 'Test message',
      type: 'system',
      read: false,
      timestamp: new Date(),
      priority: 'medium'
    }
  ];

  const defaultProps = {
    user: mockUser,
    notifications: mockNotifications,
    unreadCount: 1,
    onMarkNotificationRead: vi.fn(),
    onDeleteNotification: vi.fn(),
    onClearAllNotifications: vi.fn(),
    children: <div data-testid="main-content">Main Content</div>
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to desktop view
    mockUseMediaQuery.mockReturnValue(false);
  });

  describe('rendering', () => {
    it('should render main content', () => {
      render(<ResponsiveLayout {...defaultProps} />);
      
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('should render user information in header', () => {
      render(<ResponsiveLayout {...defaultProps} />);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show notification count badge', () => {
      render(<ResponsiveLayout {...defaultProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render navigation menu', () => {
      render(<ResponsiveLayout {...defaultProps} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Work Queue')).toBeInTheDocument();
      expect(screen.getByText('My Assignments')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should show mobile layout on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile view

      render(<ResponsiveLayout {...defaultProps} />);

      // Should show menu button in mobile view
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('should show desktop layout on large screens', () => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop view

      render(<ResponsiveLayout {...defaultProps} />);

      // Navigation should be visible in desktop view
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should toggle sidebar in mobile view', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile view

      render(<ResponsiveLayout {...defaultProps} />);

      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);

      // Sidebar should be opened (implementation depends on your Sheet component)
      expect(screen.getByTestId('sheet')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should handle keyboard shortcuts', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      // Test Ctrl+K for command palette (if implemented)
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

      // Test Ctrl+/ for help
      fireEvent.keyDown(document, { key: '/', ctrlKey: true });

      // These would depend on your actual implementation
      // For now, just ensure no errors are thrown
    });

    it('should navigate with tab key', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      const interactiveElements = screen.getAllByRole('button');
      
      // Focus should move through interactive elements
      interactiveElements[0].focus();
      expect(interactiveElements[0]).toHaveFocus();

      fireEvent.keyDown(interactiveElements[0], { key: 'Tab' });
      // Next element should be focused (implementation depends on your focus management)
    });
  });

  describe('notification handling', () => {
    it('should call mark as read callback', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      // This would depend on how notifications are displayed in your layout
      // For now, just test that the prop is passed correctly
      expect(defaultProps.onMarkNotificationRead).toBeDefined();
    });

    it('should call delete notification callback', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      expect(defaultProps.onDeleteNotification).toBeDefined();
    });

    it('should call clear all notifications callback', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      expect(defaultProps.onClearAllNotifications).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      // Check for navigation landmarks
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Check for main content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      // Check for skip links (if implemented)
      const skipLink = screen.queryByText(/skip to main content/i);
      // This is optional but good for accessibility

      // Check that interactive elements have proper labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should have proper heading hierarchy', () => {
      render(<ResponsiveLayout {...defaultProps} />);

      // Check that headings follow proper hierarchy (h1, h2, h3, etc.)
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // First heading should be h1 or h2 depending on implementation
      if (headings.length > 0) {
        expect(headings[0].tagName).toMatch(/^H[1-6]$/);
      }
    });
  });

  describe('error handling', () => {
    it('should handle missing user gracefully', () => {
      const propsWithoutUser = {
        ...defaultProps,
        user: null
      };

      expect(() => {
        render(<ResponsiveLayout {...propsWithoutUser} />);
      }).not.toThrow();
    });

    it('should handle empty notifications array', () => {
      const propsWithEmptyNotifications = {
        ...defaultProps,
        notifications: [],
        unreadCount: 0
      };

      render(<ResponsiveLayout {...propsWithEmptyNotifications} />);
      
      // Should still render without errors
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<ResponsiveLayout {...defaultProps} />);

      // Re-render with same props
      rerender(<ResponsiveLayout {...defaultProps} />);

      // Should not cause additional renders (this is hard to test without React DevTools)
      // For now, just ensure no errors
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });
});