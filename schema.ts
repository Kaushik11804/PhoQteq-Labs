import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  aiResponse: text("ai_response"),
  imageUrl: text("image_url"),
  voiceTranscript: text("voice_transcript"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  reminderTime: timestamp("reminder_time").notNull(),
  sent: boolean("sent").default(false).notNull(),
  type: text("type").notNull(), // email, notification
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export const TaskCategory = z.enum([
  "plumbing",
  "carpentry", 
  "electrical",
  "painting",
  "cleaning",
  "gardening",
  "general"
]);

export const TaskPriority = z.enum(["low", "medium", "high"]);
export const TaskStatus = z.enum(["pending", "in_progress", "completed", "cancelled"]);
