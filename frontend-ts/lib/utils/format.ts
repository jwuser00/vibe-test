import { DistanceType } from "../types";

export const toKST = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const formatPace = (secondsPerKm: number): string => {
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatTimeFromSeconds = (totalSeconds: number): string => {
  return new Date(totalSeconds * 1000).toISOString().substring(11, 19);
};

export const validateTCXFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith(".tcx");
};

export const formatTargetTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}시간 ${m.toString().padStart(2, "0")}분 ${s.toString().padStart(2, "0")}초`;
  }
  return `${m}분 ${s.toString().padStart(2, "0")}초`;
};

export const parseTargetTime = (h: number, m: number, s: number): number => {
  return h * 3600 + m * 60 + s;
};

export const distanceTypeLabel = (type: DistanceType): string => {
  const labels: Record<DistanceType, string> = {
    full: "풀마라톤",
    half: "하프마라톤",
    "10km": "10km",
    "5km": "5km",
    custom: "커스텀",
  };
  return labels[type] || type;
};

export const daysUntil = (dateString: string): number => {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
