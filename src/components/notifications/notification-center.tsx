// Notification Center Component
// Comprehensive notification management interface with real-time updates

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Coffee,
  Briefcase,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
// DropdownMenu components not available - using simple buttons instead
import { NotificationPayload, notificationService } from '@/services/notification-service';
import { formatRelativeTime } from '@/config/i18n-config';
import { useI18n } from '@/shared/hooks/useI18n';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  className
}) => {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // Load notifications
  const loadNotifications = useCallback(() => {
    const allNotifications = notificationService.getNotifications({
      read: filter === 'unread' ? false : undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
      limit: 100
    });
    setNotifications(allNotifications);
  }, [filter, typeFilter]);

  // Subscribe to new notifications
  useEffect(() => {
    loadNotifications();
    
    const unsubscribe = notificationService.subscribe('notification-center', () => {
      loadNotifications();
    });

    return unsubscribe;
  }, [loadNotifications]);

  // Get notification icon
  const getNotificationIcon = (type: string, read: boolean) => {
    const iconClass = cn(
      "w-5 h-5 flex-shrink-0",
      read ? "text-muted-foreground" : "text-primary"
    );

    switch (type) {
      case 'system':
        return <Info className={iconClass} />;
      case 'assignment':
        return <Briefcase className={iconClass} />;
      case 'quality':
        return <Shield className={iconClass} />;
      case 'break':
        return <Coffee className={iconClass} />;
      case 'achievement':
        return <Trophy className={iconClass} />;
      case 'alert':
        return <AlertTriangle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Get notification type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return t('common:status.system');
      case 'assignment': return t('workAssignment:title');
      case 'quality': return t('common:quality');
      case 'break': return t('common:break');
      case 'achievement': return t('common:achievement');
      case 'alert': return t('common:status.alert');
      default: return type;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-4 border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationPayload) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    notificationService.markAsRead(notificationId);
  };

  // Handle delete notification
  const handleDelete = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    notificationService.deleteNotification(notificationId);
  };

  // Handle selection
  const handleSelect = (notificationId: string, checked: boolean) => {
    const newSelection = new Set(selectedNotifications);
    if (checked) {
      newSelection.add(notificationId);
    } else {
      newSelection.delete(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  // Handle bulk actions
  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(typeFilter === 'all' ? undefined : typeFilter);
    setSelectedNotifications(new Set());
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach(id => {
      notificationService.deleteNotification(id);
    });
    setSelectedNotifications(new Set());
  };

  const handleClearAll = () => {
    notificationService.clearNotifications(typeFilter === 'all' ? undefined : typeFilter);
    setSelectedNotifications(new Set());
  };

  // Get notification counts
  const totalCount = notificationService.getNotifications().length;
  const unreadCount = notificationService.getUnreadCount();
  const filteredCount = notifications.length;

  if (!open) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "md:relative md:inset-auto md:bg-transparent md:z-auto",
      className
    )}>
      <div className={cn(
        "absolute right-0 top-0 h-full w-full bg-background shadow-lg",
        "md:relative md:w-96 md:h-auto md:rounded-lg md:border",
        "flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkAllRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearAll} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({totalCount})</SelectItem>
              <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="break">Break</SelectItem>
              <SelectItem value="achievement">Achievements</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="flex items-center gap-2 p-3 border-b bg-blue-50">
            <span className="text-sm font-medium">
              {selectedNotifications.size} selected
            </span>
            <div className="flex gap-1 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setSelectedNotifications(new Set())}>
                Cancel
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeleteSelected}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Notification List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      !notification.read && "ring-2 ring-primary/20",
                      getPriorityColor(notification.priority),
                      selectedNotifications.has(notification.id) && "ring-2 ring-blue-500"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Selection checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.has(notification.id)}
                          onChange={(e) => handleSelect(notification.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />

                        {/* Icon */}
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type, notification.read)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={cn(
                              "font-medium truncate",
                              !notification.read && "text-foreground",
                              notification.read && "text-muted-foreground"
                            )}>
                              {notification.title}
                            </h3>
                            
                            <div className="flex items-center gap-1 ml-2">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              
                              {notification.priority === 'critical' && (
                                <Badge variant="destructive" className="text-xs">
                                  Critical
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className={cn(
                            "text-sm mb-2 line-clamp-2",
                            !notification.read && "text-foreground/80",
                            notification.read && "text-muted-foreground"
                          )}>
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(notification.timestamp)}</span>
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  className="h-6 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(notification.id, e)}
                                className="h-6 px-2 text-destructive hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-2 mt-2 pt-2 border-t">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle action
                                    console.log('Action clicked:', action);
                                  }}
                                >
                                  {action.title}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredCount === totalCount 
                ? `${totalCount} notifications`
                : `${filteredCount} of ${totalCount} notifications`
              }
            </span>
            
            <Button variant="ghost" size="sm" onClick={() => setSelectedNotifications(new Set())}>
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};