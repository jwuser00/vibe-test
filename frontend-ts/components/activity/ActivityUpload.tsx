"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ActivityUploadProps {
  uploading: boolean;
  onUpload: (file: File) => void;
}

export default function ActivityUpload({
  uploading,
  onUpload,
}: ActivityUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        border: "2px dashed",
        borderColor: isDragging ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: isDragging ? "action.hover" : "background.paper",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
        },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".tcx"
        hidden
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading ? (
        <CircularProgress size={32} />
      ) : (
        <CloudUploadIcon sx={{ fontSize: 32, color: "primary.main" }} />
      )}
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          TCX 파일 업로드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          여기를 클릭하거나 여기에 TCX 파일을 드래그앤 드롭 해 주세요.
        </Typography>
      </Box>
    </Box>
  );
}
