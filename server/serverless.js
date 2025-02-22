import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./index";
import { connectToDatabase } from "./db/connection";

let isDBConnected = false;

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (!isDBConnected) {
    await connectToDatabase();
    isDBConnected = true;
  }
  await new Promise < void> ((resolve) => {
    app(req as any, res as any, resolve as any);
  });
};

export default handler;
