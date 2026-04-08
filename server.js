import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/config/db.js"; 
import authRoutes from "./src/routes/auth.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to the database
// db.connect((err) => {
//   if (err) {
//     console.error(" DB Connection Failed:", err);
//   } else {
//     console.log("✅ MySQL Connected");
//   }
// });

//routes 
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Backend running ");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});