import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const gameScores = pgTable("game_scores", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  game: text("game").notNull(),
  score: integer("score").notNull(),
  playedAt: timestamp("played_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertScoreSchema = createInsertSchema(gameScores).pick({
  game: true,
  score: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;