import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@shared/schema";
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  CheckCircle 
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

function StatCard({ title, value, icon, bgColor, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Overall Attendance"
        value={`${stats?.overallAttendance || 0}%`}
        icon={<TrendingUp className="h-6 w-6" />}
        bgColor="bg-green-100 dark:bg-green-900"
        iconColor="text-green-600 dark:text-green-400"
      />
      
      <StatCard
        title="Safe to Bunk"
        value={`${stats?.safeToBunk || 0} lectures`}
        icon={<CheckCircle className="h-6 w-6" />}
        bgColor="bg-blue-100 dark:bg-blue-900"
        iconColor="text-blue-600 dark:text-blue-400"
      />
      
      <StatCard
        title="Upcoming Events"
        value={stats?.upcomingEvents || 0}
        icon={<Calendar className="h-6 w-6" />}
        bgColor="bg-purple-100 dark:bg-purple-900"
        iconColor="text-purple-600 dark:text-purple-400"
      />
      
      <StatCard
        title="Group Members"
        value={stats?.groupMembers || 0}
        icon={<Users className="h-6 w-6" />}
        bgColor="bg-orange-100 dark:bg-orange-900"
        iconColor="text-orange-600 dark:text-orange-400"
      />
    </div>
  );
}
