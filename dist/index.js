// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// server/db/models/user.ts
import mongoose from "mongoose";
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement"
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
var UserModel = mongoose.model("User", userSchema);

// server/db/models/game-score.ts
import mongoose2 from "mongoose";
var gameScoreSchema = new mongoose2.Schema({
  userId: {
    type: mongoose2.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  game: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});
gameScoreSchema.index({ game: 1, score: -1 });
gameScoreSchema.index({ userId: 1, playedAt: -1 });
var GameScoreModel = mongoose2.model("GameScore", gameScoreSchema);

// server/storage.ts
import MongoStore from "connect-mongo";
import "dotenv/config";
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}
var MongoDBStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60
      // 14 days
    });
  }
  async getUser(id) {
    const user = await UserModel.findById(id);
    return user ? user.toObject() : void 0;
  }
  async getUserByUsername(username) {
    const user = await UserModel.findOne({ username });
    return user ? user.toObject() : void 0;
  }
  async createUser(insertUser) {
    const user = await UserModel.create(insertUser);
    return user.toObject();
  }
  async createScore(score) {
    const gameScore = await GameScoreModel.create(score);
    return gameScore.toObject();
  }
  async getScoresByGame(game) {
    const scores = await GameScoreModel.find({ game }).populate("userId", "username").sort({ score: -1 }).limit(100);
    return scores.map((score) => ({
      ...score.toObject(),
      username: score.userId?.username
    }));
  }
  async getUserScores(userId) {
    const scores = await GameScoreModel.find({ userId }).sort({ playedAt: -1 });
    return scores.map((score) => score.toObject());
  }
};
var storage = new MongoDBStorage();

// server/auth.ts
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user._id || user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// shared/schema.ts
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull()
});
var gameScores = pgTable("game_scores", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  game: text("game").notNull(),
  score: integer("score").notNull(),
  playedAt: timestamp("played_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true
});
var insertScoreSchema = createInsertSchema(gameScores).pick({
  game: true,
  score: true
});

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.post("/api/scores", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const result = insertScoreSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    const score = await storage.createScore({
      ...result.data,
      userId: req.user._id || req.user.id
      // Handle both MongoDB _id and regular id
    });
    res.json(score);
  });
  app2.get("/api/scores/:game", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const scores = await storage.getScoresByGame(req.params.game);
    res.json(scores);
  });
  app2.get("/api/user/scores", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const scores = await storage.getUserScores(req.user._id || req.user.id);
    res.json(scores);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/db/connection.ts
import mongoose3 from "mongoose";
import "dotenv/config";
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}
async function connectToDatabase() {
  try {
    await mongoose3.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
mongoose3.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
mongoose3.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
process.on("SIGINT", async () => {
  await mongoose3.connection.close();
  process.exit(0);
});

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await connectToDatabase();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
var server_default = app;
export {
  server_default as default
};
