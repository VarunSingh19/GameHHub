import type { IStorage } from "./types";
import type { User, InsertUser, GameScore } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scores: Map<number, GameScore>;
  private currentUserId: number;
  private currentScoreId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.scores = new Map();
    this.currentUserId = 1;
    this.currentScoreId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScore(score: Omit<GameScore, "id" | "playedAt">): Promise<GameScore> {
    const id = this.currentScoreId++;
    const newScore: GameScore = {
      ...score,
      id,
      playedAt: new Date(),
    };
    this.scores.set(id, newScore);
    return newScore;
  }

  async getScoresByGame(game: string): Promise<GameScore[]> {
    return Array.from(this.scores.values())
      .filter((score) => score.game === game)
      .sort((a, b) => b.score - a.score);
  }

  async getUserScores(userId: number): Promise<GameScore[]> {
    return Array.from(this.scores.values())
      .filter((score) => score.userId === userId)
      .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
  }
}

export const storage = new MemStorage();
