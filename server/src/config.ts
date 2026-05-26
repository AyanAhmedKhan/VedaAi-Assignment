import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/vedaai",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
};

export const QUEUE_NAME = "assignment-generation";
