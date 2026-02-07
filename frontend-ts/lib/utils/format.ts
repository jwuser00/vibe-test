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
