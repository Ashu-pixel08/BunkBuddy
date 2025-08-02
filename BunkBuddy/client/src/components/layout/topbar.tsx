import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { useQuery } from "@tanstack/react-query";
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  X
} from "lucide-react";
import { useState } from "react";
import { NotificationPanel } from "@/components/shared/notification-panel";
import type { User, Notification } from "@shared/schema";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/unread"],
  });

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-title font-semibold text-xl text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search subjects..."
                className="bg-transparent border-0 text-sm w-32 lg:w-48 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="hidden md:block text-gray-700 dark:text-gray-300 text-sm font-medium">
                {user?.name || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
