import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  Users,
  CheckCircle,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const notificationIcons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: AlertTriangle,
};

const notificationColors = {
  warning: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200",
  info: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200",
  success: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200",
  error: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200",
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    },
  });

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform z-40",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-title font-semibold text-lg text-gray-900 dark:text-white">
            Notifications
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-full pb-20">
        <div className="p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons];
              const colorClasses = notificationColors[notification.type as keyof typeof notificationColors];
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-opacity",
                    colorClasses,
                    notification.read && "opacity-60"
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm mt-1">{notification.message}</div>
                      <div className="text-xs mt-2 opacity-75">
                        {formatDistanceToNow(new Date(notification.createdAt!), { addSuffix: true })}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-current rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
