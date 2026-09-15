/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import type { DashboardData } from "../types/dashboard";
import { api } from "../api/axios";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        
        // TODO: Get token from localStorage, context, or cookies depending on your auth setup
        // const token = localStorage.getItem("token"); 
        
        const response = await api.get<DashboardData>("/students/dashboard");
        const json = response.data;
        
        if (isMounted) setData(json);
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.status === 401
              ? "Session expired. Please log in again."
              : err.message || "Failed to fetch dashboard data",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}