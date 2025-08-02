import { 
  type User, type InsertUser,
  type Subject, type InsertSubject,
  type Group, type InsertGroup,
  type GroupMember, type InsertGroupMember,
  type Event, type InsertEvent,
  type Notification, type InsertNotification,
  type BunkPlan, type InsertBunkPlan,
  type Timetable, type InsertTimetable
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subjects
  getSubjects(userId: string): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;
  
  // Groups
  getGroups(userId: string): Promise<Group[]>;
  getGroup(id: string): Promise<Group | undefined>;
  getGroupByCode(code: string): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  joinGroup(groupId: string, userId: string): Promise<GroupMember>;
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  leaveGroup(groupId: string, userId: string): Promise<boolean>;
  
  // Events
  getEvents(userId: string): Promise<Event[]>;
  getUpcomingEvents(userId: string, limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<boolean>;
  
  // Bunk Plans
  getBunkPlans(userId: string): Promise<BunkPlan[]>;
  getGroupBunkPlans(groupId: string): Promise<BunkPlan[]>;
  createBunkPlan(plan: InsertBunkPlan): Promise<BunkPlan>;
  updateBunkPlan(id: string, updates: Partial<BunkPlan>): Promise<BunkPlan | undefined>;
  
  // Timetables
  getTimetables(userId: string): Promise<Timetable[]>;
  getActiveTimetable(userId: string): Promise<Timetable | undefined>;
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;
  updateTimetable(id: string, updates: Partial<Timetable>): Promise<Timetable | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private subjects: Map<string, Subject> = new Map();
  private groups: Map<string, Group> = new Map();
  private groupMembers: Map<string, GroupMember> = new Map();
  private events: Map<string, Event> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private bunkPlans: Map<string, BunkPlan> = new Map();
  private timetables: Map<string, Timetable> = new Map();

  constructor() {
    // Initialize with demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "johndoe",
      email: "john@example.com",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Initialize demo subjects
    const demoSubjects: Subject[] = [
      {
        id: "subject-1",
        userId: "demo-user-1",
        name: "Mathematics",
        totalLectures: 30,
        attendedLectures: 26,
        requiredPercentage: 75,
        color: "#10b981",
        createdAt: new Date(),
      },
      {
        id: "subject-2",
        userId: "demo-user-1",
        name: "Physics",
        totalLectures: 25,
        attendedLectures: 19,
        requiredPercentage: 75,
        color: "#f59e0b",
        createdAt: new Date(),
      },
      {
        id: "subject-3",
        userId: "demo-user-1",
        name: "Chemistry",
        totalLectures: 28,
        attendedLectures: 19,
        requiredPercentage: 75,
        color: "#ef4444",
        createdAt: new Date(),
      },
    ];
    demoSubjects.forEach(subject => this.subjects.set(subject.id, subject));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      avatar: insertUser.avatar ?? null
    };
    this.users.set(id, user);
    return user;
  }

  // Subjects
  async getSubjects(userId: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(subject => subject.userId === userId);
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { 
      ...insertSubject, 
      id, 
      createdAt: new Date(),
      color: insertSubject.color ?? null,
      totalLectures: insertSubject.totalLectures ?? null,
      attendedLectures: insertSubject.attendedLectures ?? null,
      requiredPercentage: insertSubject.requiredPercentage ?? null
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;
    
    const updatedSubject = { ...subject, ...updates };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Groups
  async getGroups(userId: string): Promise<Group[]> {
    const userGroups = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => this.groups.get(member.groupId))
      .filter(Boolean) as Group[];
    return userGroups;
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getGroupByCode(code: string): Promise<Group | undefined> {
    return Array.from(this.groups.values()).find(group => group.code === code);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const group: Group = { 
      ...insertGroup, 
      id, 
      createdAt: new Date(),
      description: insertGroup.description ?? null
    };
    this.groups.set(id, group);
    
    // Auto-join creator to group
    await this.joinGroup(id, insertGroup.createdBy);
    
    return group;
  }

  async joinGroup(groupId: string, userId: string): Promise<GroupMember> {
    const id = randomUUID();
    const member: GroupMember = { id, groupId, userId, joinedAt: new Date() };
    this.groupMembers.set(id, member);
    return member;
  }

  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    const members = Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
    
    return members.map(member => ({
      ...member,
      user: this.users.get(member.userId)!
    }));
  }

  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    const member = Array.from(this.groupMembers.entries())
      .find(([_, member]) => member.groupId === groupId && member.userId === userId);
    
    if (member) {
      return this.groupMembers.delete(member[0]);
    }
    return false;
  }

  // Events
  async getEvents(userId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.userId === userId);
  }

  async getUpcomingEvents(userId: string, limit = 10): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => event.userId === userId && event.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: new Date(),
      description: insertEvent.description ?? null,
      subjectId: insertEvent.subjectId ?? null,
      priority: insertEvent.priority ?? null,
      completed: insertEvent.completed ?? null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date(),
      read: insertNotification.read ?? null,
      relatedEntityId: insertNotification.relatedEntityId ?? null,
      relatedEntityType: insertNotification.relatedEntityType ?? null
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Bunk Plans
  async getBunkPlans(userId: string): Promise<BunkPlan[]> {
    return Array.from(this.bunkPlans.values()).filter(plan => plan.userId === userId);
  }

  async getGroupBunkPlans(groupId: string): Promise<BunkPlan[]> {
    return Array.from(this.bunkPlans.values()).filter(plan => plan.groupId === groupId);
  }

  async createBunkPlan(insertPlan: InsertBunkPlan): Promise<BunkPlan> {
    const id = randomUUID();
    const plan: BunkPlan = { 
      ...insertPlan, 
      id, 
      createdAt: new Date(),
      status: insertPlan.status ?? null,
      groupId: insertPlan.groupId ?? null,
      reason: insertPlan.reason ?? null
    };
    this.bunkPlans.set(id, plan);
    return plan;
  }

  async updateBunkPlan(id: string, updates: Partial<BunkPlan>): Promise<BunkPlan | undefined> {
    const plan = this.bunkPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.bunkPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  // Timetables
  async getTimetables(userId: string): Promise<Timetable[]> {
    return Array.from(this.timetables.values()).filter(timetable => timetable.userId === userId);
  }

  async getActiveTimetable(userId: string): Promise<Timetable | undefined> {
    return Array.from(this.timetables.values())
      .find(timetable => timetable.userId === userId && timetable.isActive);
  }

  async createTimetable(insertTimetable: InsertTimetable): Promise<Timetable> {
    const id = randomUUID();
    const timetable: Timetable = { 
      ...insertTimetable, 
      id, 
      createdAt: new Date(),
      isActive: insertTimetable.isActive ?? null
    };
    this.timetables.set(id, timetable);
    return timetable;
  }

  async updateTimetable(id: string, updates: Partial<Timetable>): Promise<Timetable | undefined> {
    const timetable = this.timetables.get(id);
    if (!timetable) return undefined;
    
    const updatedTimetable = { ...timetable, ...updates };
    this.timetables.set(id, updatedTimetable);
    return updatedTimetable;
  }
}

export const storage = new MemStorage();
