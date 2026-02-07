export interface Lap {
  id: number;
  lap_number: number;
  distance: number;
  time: number;
  pace: number;
  avg_hr: number | null;
  max_hr: number | null;
  avg_cadence: number | null;
}

export interface Activity {
  id: number;
  start_time: string;
  total_distance: number;
  total_time: number;
  avg_pace: number;
  avg_hr: number | null;
  avg_cadence: number | null;
  laps: Lap[];
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "warning" | "info";
}
