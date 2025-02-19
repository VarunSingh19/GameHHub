// server/local-dev.ts
import { createServer } from "http";
import app from "./index";
import { connectToDatabase } from "./db/connection";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  // Connect to MongoDB
  await connectToDatabase();

  // Create an HTTP server around the Express app
  const server = createServer(app);

  // If we're in dev, run Vite in middleware mode
  // If not, serve static files from your build
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
