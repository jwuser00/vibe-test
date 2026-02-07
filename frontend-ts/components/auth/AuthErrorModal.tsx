"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AuthErrorModal() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleAuthError = () => {
      setOpen(true);
    };

    window.addEventListener("auth-error", handleAuthError);
    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <Dialog open={open} onClose={handleConfirm}>
      <DialogTitle>알림</DialogTitle>
      <DialogContent>
        <DialogContentText>
          세션이 만료되었습니다. 다시 로그인해주세요.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} variant="contained" fullWidth>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
