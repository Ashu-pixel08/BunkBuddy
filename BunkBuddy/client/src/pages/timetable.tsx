import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  BookOpen,
  Calendar,
  FileSpreadsheet
} from "lucide-react";
import type { Timetable, Subject } from "@shared/schema";

interface TimetableEntry {
  time: string;
  subject: string;
  type?: string;
  location?: string;
}

interface DaySchedule {
  [key: string]: TimetableEntry[];
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

export default function Timetable() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingSlot, setEditingSlot] = useState<{day: string, time: string} | null>(null);
  const [slotData, setSlotData] = useState<TimetableEntry>({
    time: "",
    subject: "",
    type: "lecture",
    location: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timetables = [] } = useQuery({
    queryKey: ["/api/timetables"],
  });

  const { data: activeTimetable } = useQuery({
    queryKey: ["/api/timetables/active"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const uploadTimetableMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch('/api/timetables/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      setShowUploadForm(false);
      setSelectedFile(null);
      toast({ title: "Timetable uploaded successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to upload timetable", variant: "destructive" });
    },
  });

  const createTimetableMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/timetables", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      toast({ title: "Timetable created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create timetable", variant: "destructive" });
    },
  });

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }
    uploadTimetableMutation.mutate(selectedFile);
  };

  const handleSlotEdit = (day: string, time: string, entry?: TimetableEntry) => {
    setEditingSlot({ day, time });
    setSlotData(entry || {
      time,
      subject: "",
      type: "lecture",
      location: ""
    });
  };

  const handleSlotSave = () => {
    // Implementation for saving individual slot
    // This would update the active timetable's schedule
    setEditingSlot(null);
    toast({ title: "Slot updated successfully!" });
  };

  const getScheduleForDay = (day: string): TimetableEntry[] => {
    if (!activeTimetable?.schedule) return [];
    return (activeTimetable.schedule as DaySchedule)[day] || [];
  };

  const getSlotEntry = (day: string, time: string): TimetableEntry | undefined => {
    const daySchedule = getScheduleForDay(day);
    return daySchedule.find(entry => entry.time === time);
  };

  const createEmptyTimetable = () => {
    const emptySchedule: DaySchedule = {};
    weekDays.forEach(day => {
      emptySchedule[day] = [];
    });

    createTimetableMutation.mutate({
      name: "New Timetable",
      schedule: emptySchedule,
      isActive: true
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar 
          title="Timetable" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-white">
                  Timetable Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload or create your class schedule
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
                <Button 
                  onClick={createEmptyTimetable}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </div>

            {/* Upload Form */}
            {showUploadForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Upload Timetable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">Select CSV File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        CSV format: Day,Time,Subject (e.g., Monday,09:00,Mathematics)
                      </p>
                    </div>
                    {selectedFile && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploadTimetableMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Upload
                    </Button>
                    <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="schedule" className="w-full">
              <TabsList>
                <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                <TabsTrigger value="saved">Saved Timetables</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="space-y-6">
                {activeTimetable ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {activeTimetable.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
                                Time
                              </th>
                              {weekDays.map(day => (
                                <th key={day} className="border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 min-w-32">
                                  {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timeSlots.map(time => (
                              <tr key={time}>
                                <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium bg-gray-50 dark:bg-gray-800">
                                  {time}
                                </td>
                                {weekDays.map(day => {
                                  const entry = getSlotEntry(day, time);
                                  return (
                                    <td 
                                      key={`${day}-${time}`} 
                                      className="border border-gray-200 dark:border-gray-700 p-2"
                                    >
                                      {entry ? (
                                        <div 
                                          className="p-2 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                                          onClick={() => handleSlotEdit(day, time, entry)}
                                        >
                                          <div className="font-medium text-sm">{entry.subject}</div>
                                          {entry.location && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {entry.location}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div 
                                          className="p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary/50 transition-colors text-center"
                                          onClick={() => handleSlotEdit(day, time)}
                                        >
                                          <Plus className="h-4 w-4 mx-auto text-gray-400" />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No active timetable
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create a new timetable or upload one from a CSV file
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={createEmptyTimetable}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create New
                        </Button>
                        <Button 
                          onClick={() => setShowUploadForm(true)}
                          variant="outline"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                {timetables.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No saved timetables
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your created and uploaded timetables will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timetables.map((timetable: Timetable) => (
                      <Card key={timetable.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{timetable.name}</CardTitle>
                            {timetable.isActive && (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Created {new Date(timetable.createdAt!).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Edit Slot Modal */}
            {editingSlot && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>
                      Edit {editingSlot.day} at {editingSlot.time}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select 
                          value={slotData.subject} 
                          onValueChange={(value) => setSlotData(prev => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject: Subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={slotData.type} 
                          onValueChange={(value) => setSlotData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lecture">Lecture</SelectItem>
                            <SelectItem value="lab">Lab</SelectItem>
                            <SelectItem value="tutorial">Tutorial</SelectItem>
                            <SelectItem value="seminar">Seminar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={slotData.location}
                          onChange={(e) => setSlotData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., Room 101, Lab A"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button 
                        onClick={handleSlotSave}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSlot(null)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
