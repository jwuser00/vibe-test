"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ToastState } from "@/lib/types";

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const titleMap: Record<ToastState["type"], string> = {
    success: "성공",
    warning: "안내",
    error: "오류",
    info: "알림",
  };

  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={2500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={toast.type}
        variant="filled"
        sx={{ width: "100%" }}
      >
        <strong>{titleMap[toast.type]}</strong> — {toast.message}
      </Alert>
    </Snackbar>
  );
}
