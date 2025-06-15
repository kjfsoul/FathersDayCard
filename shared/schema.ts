import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  created_at: timestamp("created_at").defaultNow(),
  stripe_customer_id: varchar("stripe_customer_id"),
  stripe_subscription_id: varchar("stripe_subscription_id"),
  subscription_status: varchar("subscription_status", { enum: ['free', 'active', 'canceled', 'past_due'] }).default('free'),
  cards_generated: integer("cards_generated").default(0),
  games_played: integer("games_played").default(0),
  total_score: integer("total_score").default(0),
});

export const father_cards = pgTable("father_cards", {
  id: varchar("id").primaryKey(),
  user_id: varchar("user_id").references(() => users.id),
  dad_name: varchar("dad_name").notNull(),
  dad_info: jsonb("dad_info").notNull(),
  card_content: jsonb("card_content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  view_count: integer("view_count").default(0),
});

export const game_sessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey(),
  user_id: varchar("user_id").references(() => users.id),
  game_type: varchar("game_type", { enum: ['emoji-match', 'emoji-memory', 'trivia', 'catch-ball'] }).notNull(),
  score: integer("score").default(0),
  duration_seconds: integer("duration_seconds"),
  completed: boolean("completed").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
