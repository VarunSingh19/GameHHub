import type { IStorage } from "./types";
import type { User, InsertUser, GameScore } from "@shared/schema";
import { UserModel } from "./db/models/user";
import { GameScoreModel } from "./db/models/game-score";
import session from "express-session";
import MongoStore from "connect-mongo";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? user.toObject() : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? user.toObject() : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return user.toObject();
  }

  async createScore(score: Omit<GameScore, "id" | "playedAt">): Promise<GameScore> {
    const gameScore = await GameScoreModel.create(score);
    return gameScore.toObject();
  }

  async getScoresByGame(game: string): Promise<GameScore[]> {
    const scores = await GameScoreModel.find({ game })
      .populate('userId', 'username')
      .sort({ score: -1 })
      .limit(100);
    return scores.map(score => ({
      ...score.toObject(),
      username: (score.userId as any)?.username
    }));
  }

  async getUserScores(userId: string): Promise<GameScore[]> {
    const scores = await GameScoreModel.find({ userId })
      .sort({ playedAt: -1 });
    return scores.map(score => score.toObject());
  }
}

export const storage = new MongoDBStorage();