// Modern Notification System
// Replaces native alerts with proper UI notifications

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationManager {
  private container: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
      max-width: 400px;
    `;
    document.body.appendChild(this.container);
  }

  show(options: NotificationOptions): string {
    if (!this.container) this.createContainer();

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification = this.createNotification(id, options);
    
    this.notifications.set(id, notification);
    this.container!.appendChild(notification);

    // Auto-dismiss after duration
    const duration = options.duration || this.getDefaultDuration(options.type);
    setTimeout(() => this.dismiss(id), duration);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });

    return id;
  }

  private createNotification(id: string, options: NotificationOptions): HTMLElement {
    const notification = document.createElement('div');
    const { type, title, message, action } = options;

    notification.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border-left: 4px solid ${this.getTypeColor(type)};
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      position: relative;
    `;

    const icon = this.getTypeIcon(type);
    const titleHtml = title ? `<div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${this.escapeHtml(title)}</div>` : '';
    const actionHtml = action ? `<button id="${id}-action" style="
      background: ${this.getTypeColor(type)};
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      margin-top: 8px;
    ">${this.escapeHtml(action.label)}</button>` : '';

    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="color: ${this.getTypeColor(type)}; font-size: 20px; line-height: 1;">${icon}</div>
        <div style="flex: 1; min-width: 0;">
          ${titleHtml}
          <div style="color: #6b7280; font-size: 14px; line-height: 1.4;">${this.escapeHtml(message)}</div>
          ${actionHtml}
        </div>
        <button id="${id}-close" style="
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
          margin-left: 8px;
        ">×</button>
      </div>
    `;

    // Add event listeners
    const closeBtn = notification.querySelector(`#${id}-close`) as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => this.dismiss(id));

    if (action) {
      const actionBtn = notification.querySelector(`#${id}-action`) as HTMLButtonElement;
      actionBtn?.addEventListener('click', () => {
        action.onClick();
        this.dismiss(id);
      });
    }

    return notification;
  }

  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications.delete(id);
    }, 300);
  }

  private getTypeColor(type: NotificationType): string {
    const colors = {
      success: '#10b981',
      error: '#ef4444', 
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[type];
  }

  private getTypeIcon(type: NotificationType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ⓘ'
    };
    return icons[type];
  }

  private getDefaultDuration(type: NotificationType): number {
    const durations = {
      success: 4000,
      error: 6000,
      warning: 5000,
      info: 4000
    };
    return durations[type];
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.forEach((_, id) => this.dismiss(id));
  }
}

// Global notification manager instance
const notificationManager = new NotificationManager();

// Convenient helper functions to replace alert()
export const notify = {
  success: (message: string, title?: string, options?: Partial<NotificationOptions>) => 
    notificationManager.show({ type: 'success', message, title, ...options }),
    
  error: (message: string, title?: string, options?: Partial<NotificationOptions>) => 
    notificationManager.show({ type: 'error', message, title, ...options }),
    
  warning: (message: string, title?: string, options?: Partial<NotificationOptions>) => 
    notificationManager.show({ type: 'warning', message, title, ...options }),
    
  info: (message: string, title?: string, options?: Partial<NotificationOptions>) => 
    notificationManager.show({ type: 'info', message, title, ...options }),

  dismiss: (id: string) => notificationManager.dismiss(id),
  
  clearAll: () => notificationManager.clearAll()
};

// Legacy support for gradual migration
export const showNotification = notify;