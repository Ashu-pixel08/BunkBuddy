import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatRelativeTime } from "@/lib/date-utils";
import { Users } from "lucide-react";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  time: Date;
}

// Mock data for group activity
const mockActivity: ActivityItem[] = [
  {
    id: "1",
    user: { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" },
    action: "planned to bunk Physics",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    user: { name: "Mike", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" },
    action: "joined the group",
    time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: "3",
    user: { name: "Emma", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" },
    action: "shared timetable",
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export function GroupActivity() {
  const { data: groups = [] } = useQuery<ActivityItem[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      // Replace with actual API call if available
      // Example: return fetch("/api/groups").then(res => res.json());
      return mockActivity;
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-title">Group Activity</CardTitle>
          <Link href="/groups">
            <Button className="variant-ghost size-sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No groups joined yet</p>
              <Link href="/groups">
                <Button className="variant-outline size-sm">
                  Join or Create Group
                </Button>
              </Link>
            </div>
          ) : (
            mockActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>
                    {activity.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user.name}</span> {activity.action}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(activity.time)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
