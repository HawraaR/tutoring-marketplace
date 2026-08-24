import dotenv from "dotenv";
dotenv.config(); // MUST BE AT THE VERY TOP

import express from "express";
import cors from "cors";

// Routes
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import tutorRoutes from "./routes/tutorRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";


const app = express();
app.use(express.json());


app.use(cors({ origin: "http://localhost:5173" })); // Allows Vite frontend

app.use((req, res, next) => {
  console.log(`🌐 REAL-TIME INCOMING REQUEST: ${req.method} ${req.url}`);
  next();
});

// Attach routes under /api
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/subjects", subjectRoutes);

// Mount AFTER all app.use() routes
app.use((err: any, req: any, res: any, next: any) => {
  console.error("🔥 GLOBAL UNCAUGHT ERROR:", err);
  res.status(500).json({ error: "Unhandled Exception", details: err.message });
});

const PORT = process.env.PORT || 5000;

// Export app instance so test tools can import it without launching the port server
// export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}