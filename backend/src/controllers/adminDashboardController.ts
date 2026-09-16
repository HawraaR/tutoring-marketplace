import type { Request, Response } from "express";
import { exportReport, getDashboardData } from "./adminActions";

export async function getAdminDashboard(_req: Request, res: Response) {
  try {
    const dashboard = await getDashboardData();
    return res.status(200).json(dashboard);
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return res.status(500).json({ error: "Failed to load admin dashboard data." });
  }
}

export async function exportAdminReport(req: Request, res: Response) {
  try {
    const type = typeof req.query.type === "string" ? req.query.type : "";
    const supportedTypes = [
      "ALL_USERS",
      "SUBJECT_DEMAND",
      "TUTOR_PERFORMANCE",
      "RECENT_ACTIVITY",
      "TUTOR_APPROVALS",
    ];

    if (!supportedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid report type." });
    }

    const csv = await exportReport(type);
    res.status(200);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${type.toLowerCase()}.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error("Failed to export admin report:", error);
    return res.status(500).json({ error: "Failed to export report." });
  }
}
