"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { RaceImage } from "@/lib/types";
import { uploadRaceImages, deleteRaceImage, getRaceImageUrl } from "@/lib/api/races";

interface RaceImageUploadProps {
  raceId: number;
  images: RaceImage[];
  onImagesChange: () => void;
  onError: (msg: string) => void;
}

export default function RaceImageUpload({ raceId, images, onImagesChange, onError }: RaceImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      if (images.length + i >= 5) {
        onError("이미지는 최대 5장까지 업로드할 수 있습니다");
        break;
      }
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        onError("이미지 파일만 업로드할 수 있습니다");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        onError("파일 크기는 5MB 이하여야 합니다");
        continue;
      }

      setUploading(true);
      try {
        await uploadRaceImages(raceId, file);
        onImagesChange();
      } catch {
        onError("이미지 업로드에 실패했습니다");
      } finally {
        setUploading(false);
      }
    }
  }, [raceId, images.length, onImagesChange, onError]);

  const handleDelete = async (imageId: number) => {
    try {
      await deleteRaceImage(raceId, imageId);
      onImagesChange();
    } catch {
      onError("이미지 삭제에 실패했습니다");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <Box>
      {/* Drop zone */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s",
          "&:hover": { borderColor: "primary.main" },
          mb: 2,
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/png,image/jpeg";
          input.multiple = true;
          input.onchange = () => handleFiles(input.files);
          input.click();
        }}
      >
        {uploading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 32, color: "text.secondary", mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              이미지를 드래그하거나 클릭하여 업로드 (최대 5장, 5MB)
            </Typography>
          </>
        )}
      </Box>

      {/* Image gallery */}
      {images.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {images.map((img) => (
            <Box
              key={img.id}
              sx={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getRaceImageUrl(raceId, img.id)}
                alt={img.original_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <IconButton
                size="small"
                onClick={() => handleDelete(img.id)}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  width: 24,
                  height: 24,
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
