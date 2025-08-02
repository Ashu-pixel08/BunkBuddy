import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateAttendance, getProgressBarColor } from "@/lib/attendance-utils";
import { Plus, Trash2, BookOpen } from "lucide-react";
import type { Subject } from "@shared/schema";

interface SubjectFormData {
  name: string;
  totalLectures: number;
  attendedLectures: number;
  requiredPercentage: number;
  color: string;
}

export default function AttendanceCalculator() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: "",
    totalLectures: 0,
    attendedLectures: 0,
    requiredPercentage: 75,
    color: "#7341ff"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data: SubjectFormData) => apiRequest("POST", "/api/subjects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setShowAddForm(false);
      setFormData({
        name: "",
        totalLectures: 0,
        attendedLectures: 0,
        requiredPercentage: 75,
        color: "#7341ff"
      });
      toast({ title: "Subject added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add subject", variant: "destructive" });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Subject>) =>
      apiRequest("PUT", `/api/subjects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({ title: "Subject updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update subject", variant: "destructive" });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({ title: "Subject deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete subject", variant: "destructive" });
    },
  });

  const handleAddSubject = () => {
    if (!formData.name.trim()) {
      toast({ title: "Please enter a subject name", variant: "destructive" });
      return;
    }
    createSubjectMutation.mutate(formData);
  };

  const handleUpdateAttendance = (subject: Subject, attended: number, total: number) => {
    updateSubjectMutation.mutate({
      id: subject.id,
      attendedLectures: attended,
      totalLectures: total,
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar 
          title="Attendance Calculator" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-white">
                  Attendance Calculator
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your attendance and plan your bunks wisely
                </p>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </div>

            {showAddForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="name">Subject Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div>
                      <Label htmlFor="total">Total Lectures</Label>
                      <Input
                        id="total"
                        type="number"
                        value={formData.totalLectures}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalLectures: parseInt(e.target.value) || 0 }))}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="attended">Attended</Label>
                      <Input
                        id="attended"
                        type="number"
                        value={formData.attendedLectures}
                        onChange={(e) => setFormData(prev => ({ ...prev, attendedLectures: parseInt(e.target.value) || 0 }))}
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="required">Required %</Label>
                      <Input
                        id="required"
                        type="number"
                        value={formData.requiredPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiredPercentage: parseInt(e.target.value) || 75 }))}
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleAddSubject}
                      disabled={createSubjectMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Add Subject
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No subjects added yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start by adding your first subject to track attendance
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Subject
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject: Subject) => {
                  const calculation = calculateAttendance(
                    subject.attendedLectures,
                    subject.totalLectures,
                    subject.requiredPercentage
                  );
                  
                  return (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      calculation={calculation}
                      onUpdate={handleUpdateAttendance}
                      onDelete={() => deleteSubjectMutation.mutate(subject.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface SubjectCardProps {
  subject: Subject;
  calculation: ReturnType<typeof calculateAttendance>;
  onUpdate: (subject: Subject, attended: number, total: number) => void;
  onDelete: () => void;
}

function SubjectCard({ subject, calculation, onUpdate, onDelete }: SubjectCardProps) {
  const [attended, setAttended] = useState(subject.attendedLectures);
  const [total, setTotal] = useState(subject.totalLectures);

  const handleUpdate = () => {
    onUpdate(subject, attended, total);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            <CardTitle className="text-lg">{subject.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Attendance</span>
              <span className="font-medium">{calculation.currentPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={calculation.currentPercentage} 
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`attended-${subject.id}`}>Attended</Label>
              <Input
                id={`attended-${subject.id}`}
                type="number"
                value={attended}
                onChange={(e) => setAttended(parseInt(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor={`total-${subject.id}`}>Total</Label>
              <Input
                id={`total-${subject.id}`}
                type="number"
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600 dark:text-green-400">
                  {calculation.canBunk}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Can Bunk</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600 dark:text-red-400">
                  {calculation.mustAttend}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Must Attend</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleUpdate}
            className="w-full bg-primary hover:bg-primary/90"
            size="sm"
          >
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
