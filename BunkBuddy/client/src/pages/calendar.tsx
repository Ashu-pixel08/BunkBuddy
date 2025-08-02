import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import type { Event, Subject } from "@shared/schema";

interface EventFormData {
  title: string;
  description: string;
  date: Date;
  type: string;
  subjectId?: string;
  priority: string;
}

export default function Calendar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: new Date(),
    type: "exam",
    subjectId: "",
    priority: "medium"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => apiRequest("POST", "/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      resetForm();
      toast({ title: "Event added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add event", variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Event>) =>
      apiRequest("PUT", `/api/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      resetForm();
      toast({ title: "Event updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: selectedDate || new Date(),
      type: "exam",
      subjectId: "",
      priority: "medium"
    });
    setShowAddForm(false);
    setEditingEvent(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Please enter an event title", variant: "destructive" });
      return;
    }

    if (editingEvent) {
      updateEventMutation.mutate({
        id: editingEvent.id,
        ...formData,
      });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      date: new Date(event.date),
      type: event.type,
      subjectId: event.subjectId || "",
      priority: event.priority || "medium"
    });
    setShowAddForm(true);
  };

  const selectedDateEvents = events.filter((event: Event) => 
    selectedDate && format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const eventDates = events.map((event: Event) => new Date(event.date));

  const priorityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const typeColors = {
    exam: "bg-red-500",
    assignment: "bg-blue-500",
    lab: "bg-green-500",
    quiz: "bg-purple-500",
    project: "bg-orange-500"
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar 
          title="Calendar" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-white">
                  Academic Calendar
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your exams, assignments, and important dates
                </p>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasEvent: eventDates
                    }}
                    modifiersStyles={{
                      hasEvent: { fontWeight: 'bold', color: 'var(--primary)' }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Events for selected date */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDateEvents.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                        No events on this date
                      </p>
                    ) : (
                      selectedDateEvents.map((event: Event) => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div 
                                  className={`w-3 h-3 rounded-full ${typeColors[event.type as keyof typeof typeColors] || 'bg-gray-500'}`}
                                />
                                <h4 className="font-medium text-sm">{event.title}</h4>
                              </div>
                              {event.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${priorityColors[event.priority as keyof typeof priorityColors]}`}
                                >
                                  {event.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(event)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEventMutation.mutate(event.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add/Edit Event Form */}
            {showAddForm && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Mathematics Final Exam"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="date">Date & Time</Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="lab">Lab Session</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject (Optional)</Label>
                      <Select value={formData.subjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject: Subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details about the event..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleSubmit}
                      disabled={createEventMutation.isPending || updateEventMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {editingEvent ? 'Update Event' : 'Add Event'}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
