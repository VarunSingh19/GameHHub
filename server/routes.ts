import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertScoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game scores endpoints
  app.post("/api/scores", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertScoreSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const score = await storage.createScore({
      ...result.data,
      userId: req.user._id || req.user.id, // Handle both MongoDB _id and regular id
    });
    res.json(score);
  });

  app.get("/api/scores/:game", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const scores = await storage.getScoresByGame(req.params.game);
    res.json(scores);
  });

  app.get("/api/user/scores", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const scores = await storage.getUserScores(req.user._id || req.user.id);
    res.json(scores);
  });

  const httpServer = createServer(app);
  return httpServer;
}