import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Calculator, 
  Calendar, 
  Users, 
  Table, 
  Bell,
  GraduationCap,
  BarChart3
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Attendance Calculator", href: "/attendance", icon: Calculator },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Group Planning", href: "/groups", icon: Users },
  { name: "Timetable", href: "/timetable", icon: Table },
  { name: "Alerts & Notifications", href: "/alerts", icon: Bell },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <h1 className="font-title font-bold text-lg text-gray-900 dark:text-white">
            Bunk Planner
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.name === "Alerts & Notifications" && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      3
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
