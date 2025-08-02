import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  AlertTriangle, 
  FileText, 
  GraduationCap 
} from "lucide-react";
import { formatEventDate, getPriorityBadgeText, getPriorityColor } from "@/lib/date-utils";
import type { Event } from "@shared/schema";

const eventIcons = {
  exam: AlertTriangle,
  assignment: FileText,
  lab: GraduationCap,
  default: FileText,
};

export function UpcomingEvents() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/upcoming"],
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-title">Upcoming Events</CardTitle>
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 p-3 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-title">Upcoming Events</CardTitle>
            <Link href="/calendar">
            <Button variant="ghost" size="sm">
              View Calendar
            </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
              <Link href="/calendar">
                <Button variant="outline" size="sm" className="mt-2">
                  Add Event
                </Button>
              </Link>
            </div>
          ) : (
            events.map((event: Event) => {
              const IconComponent = eventIcons[event.type as keyof typeof eventIcons] || eventIcons.default;
              const priorityText = getPriorityBadgeText(new Date(event.date));
              const priorityColor = getPriorityColor(new Date(event.date));
              
              return (
                <div key={event.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className={`w-10 h-10 ${priorityColor.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatEventDate(new Date(event.date))}
                    </div>
                  </div>
                  <Badge className={`text-xs ${priorityColor} border-0`}>
                    {priorityText}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
