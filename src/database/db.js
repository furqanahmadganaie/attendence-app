import mysql from "mysql2/promise";
import { env } from "../config/env.js";

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
  const connection = await db.getConnection(); // takes connecton from pool and checks if db is alive or not

  try {
    await connection.ping(); // checks db is alive or not 
    console.log("MySQL connected successfully");
  } finally {
    connection.release(); // gives connection back to pool
  }
};
  // this function is used to close the database connection when the application is shutting down.
  //  It ensures that all connections in the pool are properly closed and resources are released
export const closeDatabaseConnection = async () => {
  await db.end();
};

export default db;
