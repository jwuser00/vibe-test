import client from "./client";
import { DashboardData } from "../types";

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await client.get("/dashboard/");
  return response.data;
};
