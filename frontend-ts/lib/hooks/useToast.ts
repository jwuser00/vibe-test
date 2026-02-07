"use client";

import { useState, useCallback } from "react";
import { ToastState } from "../types";

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 2500);
    },
    []
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
}
