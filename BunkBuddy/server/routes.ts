import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSubjectSchema, insertGroupSchema, insertEventSchema, 
  insertNotificationSchema, insertBunkPlanSchema, insertTimetableSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const currentUserId = "demo-user-1"; // For demo purposes

  // Users
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(currentUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects(currentUserId);
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subject = insertSubjectSchema.parse({
        ...req.body,
        userId: currentUserId
      });
      const newSubject = await storage.createSubject(subject);
      res.status(201).json(newSubject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedSubject = await storage.updateSubject(id, updates);
      if (!updatedSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(updatedSubject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSubject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Groups
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups(currentUserId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const group = insertGroupSchema.parse({
        ...req.body,
        createdBy: currentUserId
      });
      const newGroup = await storage.createGroup(group);
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.post("/api/groups/join", async (req, res) => {
    try {
      const { code } = req.body;
      const group = await storage.getGroupByCode(code);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const member = await storage.joinGroup(group.id, currentUserId);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.get("/api/groups/:id/members", async (req, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getGroupMembers(id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents(currentUserId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getUpcomingEvents(currentUserId, limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const event = insertEventSchema.parse({
        ...req.body,
        userId: currentUserId,
        date: new Date(req.body.date)
      });
      const newEvent = await storage.createEvent(event);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.date) {
        updates.date = new Date(updates.date);
      }
      const updatedEvent = await storage.updateEvent(id, updates);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(currentUserId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications(currentUserId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Bunk Plans
  app.get("/api/bunk-plans", async (req, res) => {
    try {
      const plans = await storage.getBunkPlans(currentUserId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bunk plans" });
    }
  });

  app.post("/api/bunk-plans", async (req, res) => {
    try {
      const plan = insertBunkPlanSchema.parse({
        ...req.body,
        userId: currentUserId,
        plannedDate: new Date(req.body.plannedDate)
      });
      const newPlan = await storage.createBunkPlan(plan);
      res.status(201).json(newPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bunk plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bunk plan" });
    }
  });

  // Timetables
  app.get("/api/timetables", async (req, res) => {
    try {
      const timetables = await storage.getTimetables(currentUserId);
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetables" });
    }
  });

  app.get("/api/timetables/active", async (req, res) => {
    try {
      const timetable = await storage.getActiveTimetable(currentUserId);
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active timetable" });
    }
  });

  app.post("/api/timetables", async (req, res) => {
    try {
      const timetable = insertTimetableSchema.parse({
        ...req.body,
        userId: currentUserId
      });
      const newTimetable = await storage.createTimetable(timetable);
      res.status(201).json(newTimetable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timetable data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timetable" });
    }
  });

  app.post("/api/timetables/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString();
      // Simple CSV parsing (in production, use a proper CSV parser)
      const lines = fileContent.split('\n').filter(line => line.trim());
      const schedule: any = {};

      // Basic CSV structure: Day,Time,Subject
      for (let i = 1; i < lines.length; i++) { // Skip header
        const [day, time, subject] = lines[i].split(',');
        if (day && time && subject) {
          if (!schedule[day.trim()]) {
            schedule[day.trim()] = [];
          }
          schedule[day.trim()].push({
            time: time.trim(),
            subject: subject.trim()
          });
        }
      }

      const timetable = await storage.createTimetable({
        userId: currentUserId,
        name: req.file.originalname || "Uploaded Timetable",
        schedule,
        isActive: true
      });

      res.status(201).json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload timetable" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const subjects = await storage.getSubjects(currentUserId);
      const events = await storage.getUpcomingEvents(currentUserId, 5);
      const groups = await storage.getGroups(currentUserId);
      
      // Calculate overall attendance
      const totalLectures = subjects.reduce((sum, subject) => sum + (subject.totalLectures || 0), 0);
      const totalAttended = subjects.reduce((sum, subject) => sum + (subject.attendedLectures || 0), 0);
      const overallAttendance = totalLectures > 0 ? (totalAttended / totalLectures * 100) : 0;
      
      // Calculate safe to bunk
      const safeToBunk = subjects.reduce((sum, subject) => {
        const totalLecs = subject.totalLectures || 0;
        const attendedLecs = subject.attendedLectures || 0;
        const requiredPerc = subject.requiredPercentage || 75;
        const required = Math.ceil(requiredPerc / 100 * totalLecs);
        return sum + Math.max(0, attendedLecs - required);
      }, 0);
      
      const stats = {
        overallAttendance: overallAttendance.toFixed(1),
        safeToBunk,
        upcomingEvents: events.length,
        groupMembers: groups.length * 8 // Mock multiplier
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
