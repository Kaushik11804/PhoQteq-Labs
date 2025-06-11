import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertReminderSchema, TaskCategory, TaskPriority, TaskStatus } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/today", async (req, res) => {
    try {
      const tasks = await storage.getTodaysTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's tasks" });
    }
  });

  app.get("/api/tasks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const tasks = await storage.searchTasks(query);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // AI assistance route
  app.post("/api/tasks/ai-assist", upload.single('image'), async (req, res) => {
    try {
      const { description, category, priority } = req.body;
      const image = req.file;

      // Simulate Gemini AI response (replace with actual API call)
      const aiResponse = await generateAIResponse(description, category, image);
      
      res.json({ response: aiResponse });
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI assistance" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;
      let reminders;
      
      if (taskId) {
        reminders = await storage.getRemindersByTask(taskId);
      } else {
        reminders = await storage.getPendingReminders();
      }
      
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create reminder" });
      }
    }
  });

  // Email notification route
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      
      // Simulate email sending (replace with actual Gmail API integration)
      const result = await sendEmail(to, subject, body);
      
      res.json({ success: true, messageId: result });
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const allTasks = await storage.getAllTasks();
      const now = new Date();
      
      const completed = allTasks.filter(task => task.status === "completed").length;
      const pending = allTasks.filter(task => task.status === "pending").length;
      const overdue = allTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== "completed"
      ).length;
      
      const total = completed + pending;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      res.json({
        completed,
        pending,
        overdue,
        progressPercent
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulate AI response generation (replace with actual Gemini API integration)
async function generateAIResponse(description: string, category: string, image?: Express.Multer.File): Promise<string> {
  // This would be replaced with actual Gemini API call
  const responses = {
    plumbing: "I can help you with that plumbing issue! Here's a step-by-step guide:\n\n1. **Safety First**: Turn off the water supply\n2. **Identify the problem**: Check for leaks or blockages\n3. **Gather tools**: You'll need basic plumbing tools\n4. **Follow the repair steps**: Detailed instructions based on your specific issue\n5. **Test the repair**: Turn water back on and check for leaks\n\n💡 **Pro Tip**: Take photos before disassembly to remember the order!",
    carpentry: "Let me help you with this carpentry task! Here's what you need to do:\n\n1. **Measure twice, cut once**: Ensure accurate measurements\n2. **Safety gear**: Wear protective equipment\n3. **Tools needed**: Based on your specific task\n4. **Step-by-step process**: Detailed instructions\n5. **Finishing touches**: Sanding and finishing tips\n\n🔨 **Pro Tip**: Use quality materials for lasting results!",
    electrical: "⚠️ **Safety Warning**: If you're not comfortable with electrical work, please consult a professional.\n\nFor basic electrical tasks:\n1. **Turn off power**: Always turn off the circuit breaker\n2. **Test circuits**: Use a voltage tester\n3. **Follow codes**: Ensure compliance with local electrical codes\n4. **Professional help**: Consider hiring an electrician for complex work",
    default: "I'm here to help with your home task! Please provide more details about what you need assistance with, and I'll give you step-by-step guidance tailored to your specific situation."
  };
  
  return responses[category as keyof typeof responses] || responses.default;
}

// Simulate email sending (replace with actual Gmail API integration)
async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  // This would be replaced with actual Gmail API integration
  console.log(`Sending email to ${to}: ${subject}`);
  return `msg-${Date.now()}`;
}