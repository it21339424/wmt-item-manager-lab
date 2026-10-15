import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config({ path: fileURLToPath(new URL(".env", import.meta.url)) });

const uri = process.env.MONGO_URI?.trim();
if (!uri || uri.includes("YOUR_NEW_PASSWORD") || uri.includes("<db_password>")) {
  console.error("Set MONGO_URI in backend/.env using Connect > Drivers in Atlas. Replace the password placeholder with your database user password.");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Item Manager API is running..." });
});

app.use("/api/items", itemRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(uri, { dbName: "WMTItemManager", serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    if (error.code === 18 || /auth/i.test(error.message)) {
      console.error("MongoDB authentication failed. Check the database user in the SAME Atlas project as the cluster. Reset that user's password, URL-encode special characters in the password, save backend/.env, then restart npm run dev. Your Atlas account login password is different.");
    } else {
      console.error("MongoDB connection failed. Check the Atlas cluster hostname, network access list, and internet connection. Credentials have not been printed.");
    }
    process.exit(1);
  });