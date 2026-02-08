"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import AppLayout from "@/components/layout/AppLayout";
import RaceImageUpload from "@/components/race/RaceImageUpload";
import ActivitySelector from "@/components/race/ActivitySelector";
import Toast from "@/components/common/Toast";
import { getRace, updateRaceResult, uploadRaceTcx } from "@/lib/api/races";
import { useToast } from "@/lib/hooks/useToast";
import { Race, RaceStatus, RaceResultFormData } from "@/lib/types";
import { formatPace, formatTimeFromSeconds } from "@/lib/utils/format";

const STATUS_OPTIONS: { value: RaceStatus; label: string }[] = [
  { value: "예정", label: "예정" },
  { value: "완주", label: "완주" },
  { value: "DNS", label: "DNS (Did Not Start)" },
  { value: "DNF", label: "DNF (Did Not Finish)" },
];

export default function RaceResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tcxUploading, setTcxUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activityTab, setActivityTab] = useState(0); // 0: TCX upload, 1: select existing
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [status, setStatus] = useState<RaceStatus>("예정");
  const [actualH, setActualH] = useState("");
  const [actualM, setActualM] = useState("");
  const [actualS, setActualS] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [review, setReview] = useState("");

  const { toast, showToast, closeToast } = useToast();

  const loadRace = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getRace(id);
      setRace(data);
      // Initialize form from existing data
      setStatus(data.status);
      if (data.actual_time) {
        setActualH(String(Math.floor(data.actual_time / 3600)));
        setActualM(String(Math.floor((data.actual_time % 3600) / 60)));
        setActualS(String(Math.floor(data.actual_time % 60)));
      }
      setSelectedActivityId(data.activity_id);
      setReview(data.review ?? "");
    } catch {
      // handled by auth interceptor
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRace();
  }, [loadRace]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const h = parseInt(actualH) || 0;
      const m = parseInt(actualM) || 0;
      const s = parseInt(actualS) || 0;
      const actualTime = h * 3600 + m * 60 + s;

      const data: Partial<RaceResultFormData> & { status: RaceStatus } = {
        status,
        actual_time: actualTime > 0 ? actualTime : null,
        activity_id: selectedActivityId,
        review: review || "",
      };

      await updateRaceResult(id, data);
      showToast("결과가 저장되었습니다", "success");
      setTimeout(() => router.push(`/races/${id}`), 800);
    } catch {
      showToast("저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTcxFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".tcx")) {
      showToast("TCX 파일만 업로드할 수 있습니다", "error");
      return;
    }
    setTcxUploading(true);
    try {
      const updatedRace = await uploadRaceTcx(id, file);
      showToast("TCX 파일이 업로드되었습니다. 활동이 연결되었습니다.", "success");
      setRace(updatedRace);
      setSelectedActivityId(updatedRace.activity_id);
    } catch {
      showToast("TCX 업로드에 실패했습니다", "error");
    } finally {
      setTcxUploading(false);
    }
  };

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
    if (file) handleTcxFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleTcxFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUnlinkActivity = async () => {
    setSelectedActivityId(null);
    // Will be saved when user clicks "결과 저장"
    showToast("활동 연결이 해제됩니다. 저장 버튼을 눌러주세요.", "info");
  };

  if (loading || !race) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/races/${id}`)}
        sx={{ mb: 2 }}
      >
        대회 상세로
      </Button>

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        결과 입력
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {race.race_name}
      </Typography>

      {/* Status & Time */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            결과
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>상태</InputLabel>
              <Select
                value={status}
                label="상태"
                onChange={(e) => setStatus(e.target.value as RaceStatus)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                완주 시간
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  label="시"
                  type="number"
                  value={actualH}
                  onChange={(e) => setActualH(e.target.value)}
                  size="small"
                  sx={{ width: 80 }}
                  slotProps={{ htmlInput: { min: "0" } }}
                />
                <Typography>:</Typography>
                <TextField
                  label="분"
                  type="number"
                  value={actualM}
                  onChange={(e) => setActualM(e.target.value)}
                  size="small"
                  sx={{ width: 80 }}
                  slotProps={{ htmlInput: { min: "0", max: "59" } }}
                />
                <Typography>:</Typography>
                <TextField
                  label="초"
                  type="number"
                  value={actualS}
                  onChange={(e) => setActualS(e.target.value)}
                  size="small"
                  sx={{ width: 80 }}
                  slotProps={{ htmlInput: { min: "0", max: "59" } }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Activity Link */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            활동 연결
          </Typography>

          {/* Connected activity info */}
          {race.activity && selectedActivityId === race.activity_id && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "success.50", borderRadius: 1, border: "1px solid", borderColor: "success.200" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="body2" fontWeight={600}>
                  활동이 연결되어 있습니다
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 3, ml: 3.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {(race.activity.total_distance / 1000).toFixed(2)}km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatTimeFromSeconds(race.activity.total_time)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPace(race.activity.avg_pace)} /km
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                startIcon={<LinkOffIcon />}
                onClick={handleUnlinkActivity}
                sx={{ mt: 1, ml: 2.5, textTransform: "none" }}
              >
                연결 해제
              </Button>
            </Box>
          )}

          <Tabs
            value={activityTab}
            onChange={(_, v) => setActivityTab(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="TCX 파일 업로드" sx={{ textTransform: "none" }} />
            <Tab label="기존 활동 선택" sx={{ textTransform: "none" }} />
          </Tabs>

          {activityTab === 0 && (
            <Box
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 3,
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
                disabled={tcxUploading}
              />
              {tcxUploading ? (
                <CircularProgress size={32} />
              ) : (
                <CloudUploadIcon sx={{ fontSize: 32, color: "primary.main" }} />
              )}
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  TCX 파일 업로드
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  여기를 클릭하거나 TCX 파일을 드래그앤드롭 해주세요.
                  {race.activity ? " 다시 업로드하면 활동이 교체됩니다." : ""}
                </Typography>
              </Box>
            </Box>
          )}

          {activityTab === 1 && (
            <ActivitySelector
              value={selectedActivityId}
              onChange={(activityId) => setSelectedActivityId(activityId)}
            />
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            사진
          </Typography>
          <RaceImageUpload
            raceId={race.id}
            images={race.images}
            onImagesChange={loadRace}
            onError={(msg) => showToast(msg, "error")}
          />
        </CardContent>
      </Card>

      {/* Review */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            후기
          </Typography>
          <TextField
            multiline
            minRows={4}
            maxRows={12}
            placeholder="대회 후기를 작성해주세요..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            fullWidth
          />
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleSave}
        disabled={saving}
        sx={{ textTransform: "none" }}
      >
        {saving ? "저장 중..." : "결과 저장"}
      </Button>

      <Toast toast={toast} onClose={closeToast} />
    </AppLayout>
  );
}
