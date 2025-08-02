import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { calculateAttendance } from "@/lib/attendance-utils";
import type { Subject } from "@shared/schema";

export function QuickCalculator() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [attended, setAttended] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const handleCalculate = () => {
    const attendedNum = parseInt(attended);
    const totalNum = parseInt(total);
    
    if (isNaN(attendedNum) || isNaN(totalNum) || totalNum === 0) {
      return;
    }
    
    const subject = subjects.find((s: Subject) => s.id === selectedSubject);
    const requiredPercentage = subject?.requiredPercentage || 75;
    
    const calculation = calculateAttendance(attendedNum, totalNum, requiredPercentage);
    setResult(calculation);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    if (subject) {
      setAttended(subject.attendedLectures.toString());
      setTotal(subject.totalLectures.toString());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-title">Quick Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="attended">Attended</Label>
              <Input
                id="attended"
                type="number"
                placeholder="20"
                value={attended}
                onChange={(e) => setAttended(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                type="number"
                placeholder="25"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            onClick={handleCalculate}
            disabled={!attended || !total}
          >
            Calculate
          </Button>
          
          {result && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.currentPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Current Attendance
                </div>
              </div>
              <div className="flex justify-between text-sm mt-3">
                <div className="text-center">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {result.canBunk}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Can Bunk</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600 dark:text-red-400">
                    {result.mustAttend}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Must Attend</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
