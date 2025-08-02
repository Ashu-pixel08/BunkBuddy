import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime } from "@/lib/date-utils";
import { 
  Bell, 
  AlertTriangle, 
  Settings, 
  Calendar,
  CheckCircle,
  X,
  Info,
  Clock,
  GraduationCap
} from "lucide-react";
import type { Notification, Subject } from "@shared/schema";

interface AlertSettings {
  lowAttendanceEnabled: boolean;
  lowAttendanceThreshold: number;
  upcomingEventsEnabled: boolean;
  upcomingEventsDays: number;
  subjectAlerts: Record<string, {
    enabled: boolean;
    threshold: number;
  }>;
}

export default function Alerts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    lowAttendanceEnabled: true,
    lowAttendanceThreshold: 75,
    upcomingEventsEnabled: true,
    upcomingEventsDays: 3,
    subjectAlerts: {}
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const promises = unreadNotifications.map((notification: Notification) =>
        apiRequest("PUT", `/api/notifications/${notification.id}/read`)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleSubjectAlertToggle = (subjectId: string, enabled: boolean) => {
    setAlertSettings(prev => ({
      ...prev,
      subjectAlerts: {
        ...prev.subjectAlerts,
        [subjectId]: {
          ...prev.subjectAlerts[subjectId],
          enabled
        }
      }
    }));
  };

  const handleSubjectThresholdChange = (subjectId: string, threshold: number) => {
    setAlertSettings(prev => ({
      ...prev,
      subjectAlerts: {
        ...prev.subjectAlerts,
        [subjectId]: {
          ...prev.subjectAlerts[subjectId],
          threshold
        }
      }
    }));
  };

  const notificationIcons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    error: AlertTriangle,
  };

  const notificationColors = {
    warning: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700",
    info: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700",
    success: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700",
    error: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700",
  };

  const iconColors = {
    warning: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar 
          title="Alerts & Notifications" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-white">
                  Alerts & Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your notifications and alert preferences
                </p>
              </div>
              {unreadNotifications.length > 0 && (
                <Button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>

            <Tabs defaultValue="notifications" className="w-full">
              <TabsList>
                <TabsTrigger value="notifications">
                  Notifications
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">Alert Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="animate-pulse flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No notifications yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        You'll see alerts about attendance and upcoming events here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification: Notification) => {
                      const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons];
                      const colorClasses = notificationColors[notification.type as keyof typeof notificationColors];
                      const iconColorClass = iconColors[notification.type as keyof typeof iconColors];
                      
                      return (
                        <Card 
                          key={notification.id}
                          className={`cursor-pointer transition-opacity ${colorClasses} ${notification.read ? 'opacity-60' : ''}`}
                          onClick={() => handleMarkAsRead(notification)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-200 dark:bg-gray-600' : 'bg-white dark:bg-gray-800'}`}>
                                <IconComponent className={`h-5 w-5 ${iconColorClass}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      {formatRelativeTime(new Date(notification.createdAt!))}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      General Alert Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Low Attendance Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified when your attendance drops below the threshold
                        </p>
                      </div>
                      <Switch
                        checked={alertSettings.lowAttendanceEnabled}
                        onCheckedChange={(checked) => 
                          setAlertSettings(prev => ({ ...prev, lowAttendanceEnabled: checked }))
                        }
                      />
                    </div>

                    {alertSettings.lowAttendanceEnabled && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="threshold">Alert Threshold</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="threshold"
                            type="number"
                            min="0"
                            max="100"
                            value={alertSettings.lowAttendanceThreshold}
                            onChange={(e) => 
                              setAlertSettings(prev => ({ 
                                ...prev, 
                                lowAttendanceThreshold: parseInt(e.target.value) || 75 
                              }))
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Upcoming Events Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified about upcoming exams and assignments
                        </p>
                      </div>
                      <Switch
                        checked={alertSettings.upcomingEventsEnabled}
                        onCheckedChange={(checked) => 
                          setAlertSettings(prev => ({ ...prev, upcomingEventsEnabled: checked }))
                        }
                      />
                    </div>

                    {alertSettings.upcomingEventsEnabled && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="eventDays">Alert Days in Advance</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="eventDays"
                            type="number"
                            min="1"
                            max="30"
                            value={alertSettings.upcomingEventsDays}
                            onChange={(e) => 
                              setAlertSettings(prev => ({ 
                                ...prev, 
                                upcomingEventsDays: parseInt(e.target.value) || 3 
                              }))
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Subject-wise Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subjects.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No subjects added yet. Add subjects to configure individual alerts.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subjects.map((subject: Subject) => {
                          const subjectAlert = alertSettings.subjectAlerts[subject.id] || {
                            enabled: true,
                            threshold: subject.requiredPercentage
                          };
                          
                          return (
                            <div key={subject.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {subject.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Current: {subject.totalLectures > 0 
                                        ? ((subject.attendedLectures / subject.totalLectures) * 100).toFixed(1)
                                        : 0}%
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={subjectAlert.enabled}
                                  onCheckedChange={(checked) => 
                                    handleSubjectAlertToggle(subject.id, checked)
                                  }
                                />
                              </div>
                              
                              {subjectAlert.enabled && (
                                <div className="ml-7">
                                  <Label htmlFor={`threshold-${subject.id}`} className="text-sm">
                                    Alert Threshold
                                  </Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      id={`threshold-${subject.id}`}
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={subjectAlert.threshold}
                                      onChange={(e) => 
                                        handleSubjectThresholdChange(
                                          subject.id, 
                                          parseInt(e.target.value) || subject.requiredPercentage
                                        )
                                      }
                                      className="w-20"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
