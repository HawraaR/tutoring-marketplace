import express from "express";
import userRoutes from "./routes/UserRoutes";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:5173" })); // Allows Vite frontend
app.use(express.json());

// Attach user routes under /api/users
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

// Export app instance so test tools can import it without launching the port server
export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}