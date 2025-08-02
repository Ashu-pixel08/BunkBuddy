import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getBunkometerStatus } from "@/lib/attendance-utils";
import type { Subject } from "@shared/schema";

export function Bunkometer() {
  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-title">Bunkometer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-title">Bunkometer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjects.map((subject: Subject) => {
            const totalLecs = subject.totalLectures || 0;
            const attendedLecs = subject.attendedLectures || 0;
            const requiredPerc = subject.requiredPercentage || 75;
            const percentage = totalLecs > 0 ? (attendedLecs / totalLecs) * 100 : 0;
            const { status, color, bgColor } = getBunkometerStatus(percentage, requiredPerc);
            
            return (
              <div key={subject.id} className={`p-4 ${bgColor} rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color || "#7341ff" }}
                    ></div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subject.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${color}`}>
                      {percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {status}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {subjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No subjects added yet. Add some subjects to see your bunkometer!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
