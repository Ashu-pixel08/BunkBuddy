import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Bunkometer } from "@/components/dashboard/bunkometer";
import { QuickCalculator } from "@/components/dashboard/quick-calculator";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { GroupActivity } from "@/components/dashboard/group-activity";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar 
          title="Dashboard" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Bunkometer />
            <QuickCalculator />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <UpcomingEvents />
            <GroupActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
