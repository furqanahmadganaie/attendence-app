import express from "express";
import cors from "cors";
import { closeDatabaseConnection, testDatabaseConnection } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import authRoutes from "./src/routes/auth.routes.js";
import { ensureAuthInfrastructure } from "./src/services/auth.service.js";
import { errorHandler, notFoundHandler} from "./src/middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

let server;

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server gracefully...`);

  if (server) {
    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });

    return;
  }

  await closeDatabaseConnection();
  process.exit(0);
};

const startServer = async () => {
  try {
    await testDatabaseConnection();
    await ensureAuthInfrastructure();

    server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};


process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error("Error during shutdown", error);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error("Error during shutdown", error);
    process.exit(1);
  });
});

startServer();
