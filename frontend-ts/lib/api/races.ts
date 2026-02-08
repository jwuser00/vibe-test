import client from "./client";
import { Race, RaceFormData, RaceResultFormData } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getRaces = async (status?: string): Promise<Race[]> => {
  const params = status ? { status } : {};
  const response = await client.get("/races/", { params });
  return response.data;
};

export const getRace = async (id: number): Promise<Race> => {
  const response = await client.get(`/races/${id}`);
  return response.data;
};

export const createRace = async (data: RaceFormData): Promise<Race> => {
  const response = await client.post("/races/", data);
  return response.data;
};

export const updateRace = async (id: number, data: Partial<RaceFormData>): Promise<Race> => {
  const response = await client.put(`/races/${id}`, data);
  return response.data;
};

export const updateRaceResult = async (id: number, data: Partial<RaceResultFormData>): Promise<Race> => {
  const response = await client.put(`/races/${id}/result`, data);
  return response.data;
};

export const uploadRaceTcx = async (raceId: number, file: File): Promise<Race> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await client.post(`/races/${raceId}/upload-tcx`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteRace = async (id: number): Promise<void> => {
  await client.delete(`/races/${id}`);
};

export const uploadRaceImages = async (raceId: number, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await client.post(`/races/${raceId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteRaceImage = async (raceId: number, imageId: number): Promise<void> => {
  await client.delete(`/races/${raceId}/images/${imageId}`);
};

export const getRaceImageUrl = (raceId: number, imageId: number): string => {
  return `${API_URL}/races/${raceId}/images/${imageId}/file`;
};
