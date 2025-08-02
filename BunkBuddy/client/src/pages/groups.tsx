import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime } from "@/lib/date-utils";
import { 
  Plus, 
  Users, 
  Copy, 
  UserPlus, 
  Settings,
  Calendar,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import type { Group, GroupMember, User } from "@shared/schema";

interface GroupFormData {
  name: string;
  description: string;
  code: string;
}

interface JoinGroupData {
  code: string;
}

export default function Groups() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    code: ""
  });
  const [joinCode, setJoinCode] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["/api/groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: Omit<GroupFormData, 'code'>) => {
      const groupData = {
        ...data,
        code: generateGroupCode()
      };
      return apiRequest("POST", "/api/groups", groupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setShowCreateForm(false);
      setFormData({ name: "", description: "", code: "" });
      toast({ title: "Group created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create group", variant: "destructive" });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: (data: JoinGroupData) => apiRequest("POST", "/api/groups/join", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setShowJoinForm(false);
      setJoinCode("");
      toast({ title: "Joined group successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to join group. Check the code and try again.", variant: "destructive" });
    },
  });

  const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGroup = () => {
    if (!formData.name.trim()) {
      toast({ title: "Please enter a group name", variant: "destructive" });
      return;
    }
    createGroupMutation.mutate({
      name: formData.name,
      description: formData.description
    });
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      toast({ title: "Please enter a group code", variant: "destructive" });
      return;
    }
    joinGroupMutation.mutate({ code: joinCode.toUpperCase() });
  };

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Group code copied to clipboard!" });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar 
          title="Group Planning" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-white">
                  Group Planning
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Collaborate with friends to plan bunks and share attendance
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowJoinForm(true)}
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Group
                </Button>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>

            {/* Create Group Form */}
            {showCreateForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., CS Final Year 2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupDescription">Description (Optional)</Label>
                      <Textarea
                        id="groupDescription"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your group's purpose..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleCreateGroup}
                      disabled={createGroupMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Group
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Join Group Form */}
            {showJoinForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Join Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="joinCode">Group Code</Label>
                      <Input
                        id="joinCode"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character group code"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleJoinGroup}
                      disabled={joinGroupMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Join Group
                    </Button>
                    <Button variant="outline" onClick={() => setShowJoinForm(false)}>
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
            ) : groups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first group or join an existing one to start collaborating
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                    <Button 
                      onClick={() => setShowJoinForm(true)}
                      variant="outline"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group: Group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: Group;
}

function GroupCard({ group }: GroupCardProps) {
  const { data: members = [] } = useQuery({
    queryKey: ["/api/groups", group.id, "members"],
  });

  const { toast } = useToast();

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Group code copied to clipboard!" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <Badge variant="secondary" className="font-mono">
            {group.code}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-4 w-4 p-0"
              onClick={() => copyGroupCode(group.code)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {group.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
              <Button size="sm" variant="outline">
                <UserPlus className="h-3 w-3 mr-1" />
                Invite
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {members.map((member: GroupMember & { user: User }) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.user.avatar} alt={member.user.name} />
                    <AvatarFallback className="text-xs">
                      {member.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.user.name}</span>
                  {member.userId === group.createdBy && (
                    <Badge variant="outline" className="text-xs">Owner</Badge>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="plans" className="space-y-3">
            <div className="text-center py-4">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No bunk plans yet
              </p>
              <Button size="sm" variant="outline" className="mt-2">
                Plan Bunk
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-3">
            <div className="text-center py-4">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chat feature coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
