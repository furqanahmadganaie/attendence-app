import express from "express";
import cors from "cors";
import { closeDatabaseConnection, testDatabaseConnection } from "./src/database/db.js";
import { env } from "./src/config/env.js";
import authRoutes from "./src/routes/auth.routes.js";
import adminLeaveRoutes from "./src/routes/admin-leave.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import leaveRoutes from "./src/routes/leave.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import holidaysRoutes from "./src/routes/holidays.routes.js";

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
app.use("/api/admin/leaves", adminLeaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/holidays", holidaysRoutes);


app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON body"
    });
  }

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    error
  );

  return res.status(500).json({
    message: "Internal server error"
  });
});

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
