import mysql from "mysql2/promise";
import { env } from "./env.js";

const db = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: env.dbConnectionLimit,
  queueLimit: 0
});

export const testDatabaseConnection = async () => {
  const connection = await db.getConnection();

  try {
    await connection.ping();
    console.log("MySQL connected successfully");
  } finally {
    connection.release();
  }
};

export const closeDatabaseConnection = async () => {
  await db.end();
};

export default db;
