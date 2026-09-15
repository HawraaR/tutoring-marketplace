import dotenv from "dotenv";
dotenv.config(); // MUST BE AT THE VERY TOP

import express from "express";
import cors from "cors";
import http from "http";
import { initSocket } from "./socket"; // Import initSocket from your socket.ts

// Routes
import userRoutes from "./routes/UserRoutes";
import authRoutes from "./routes/authRoutes";
import tutorRoutes from "./routes/tutorRoutes";
import studentRoutes from "./routes/studentRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";
import messageRoutes from "./routes/messageRoutes";
import adminRoutes from "./routes/adminRoutes";
import reviewRoute from "./routes/reviewRoutes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Enable CORS for local dev and production frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use((req, res, next) => {
  console.log(`🌐 REAL-TIME INCOMING REQUEST: ${req.method} ${req.url}`);
  next();
});

// Root Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "Tutorium API is running successfully!" });
});

// Attach routes under /api
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", messageRoutes);
app.use("/api/reviews", reviewRoute);

// Global Error Middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("🔥 GLOBAL UNCAUGHT ERROR:", err);
  res.status(500).json({ error: "Unhandled Exception", details: err.message });
});

// 1. Wrap Express with HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io on the HTTP Server
const io = initSocket(server);
app.set("io", io); // <--- Add this so Express controllers can access io!

const PORT = process.env.PORT || 5000;

// 3. Listen using the HTTP server (not app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on port ${PORT}`);
});

server.on("error", (err: any) => {
  console.error("🔥 Server failed to start:", err);
});

// import dotenv from "dotenv";
// dotenv.config(); // MUST BE AT THE VERY TOP

// import express from "express";
// import cors from "cors";
// import http from "http";
// import { Server } from "socket.io";

// // Routes
// import userRoutes from "./routes/UserRoutes";
// import authRoutes from "./routes/authRoutes";
// import tutorRoutes from "./routes/tutorRoutes";
// import studentRoutes from "./routes/studentRoutes";
// import subjectRoutes from "./routes/subjectRoutes";
// import bookingRoutes from "./routes/bookingRoutes";
// import availabilityRoutes from "./routes/availabilityRoutes";
// import messageRoutes from "./routes/messageRoutes";
// import adminRoutes from './routes/adminRoutes'
// import reviewRoute from "./routes/reviewRoutes";

// const app = express();
// app.use(express.json());

// // Enable CORS for local dev and production frontend
// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use((req, res, next) => {
//   console.log(`🌐 REAL-TIME INCOMING REQUEST: ${req.method} ${req.url}`);
//   next();
// });

// // Root Health Check Route
// app.get("/", (req, res) => {
//   res.json({ message: "Tutorium API is running successfully!" });
// });

// // Attach routes under /api
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/tutors", tutorRoutes);
// app.use("/api/students", studentRoutes);
// app.use("/api/availability", availabilityRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/subjects", subjectRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api", messageRoutes);
// app.use("/api/reviews", reviewRoute);

// // Mount AFTER all app.use() routes
// app.use((err: any, req: any, res: any, next: any) => {
//   console.error("🔥 GLOBAL UNCAUGHT ERROR:", err);
//   res.status(500).json({ error: "Unhandled Exception", details: err.message });
// });

// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// server.on("error", (err: any) => {
//   console.error("🔥 Server failed to start:", err);
// });
