import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import clerkWebhooks from "./controllers/webhook.js";

// initialization
const app = express();

// connect to database
await connectDB();

// middleware
app.use(cors());

// ✅ WEBHOOK ROUTE — MUST COME BEFORE express.json()
app.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// ✅ normal JSON middleware for rest of the app
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.status(200).send("API WORKING!");
});

// port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
