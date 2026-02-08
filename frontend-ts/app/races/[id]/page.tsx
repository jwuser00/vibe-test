"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AppLayout from "@/components/layout/AppLayout";
import RaceForm from "@/components/race/RaceForm";
import RaceStatusChip from "@/components/race/RaceStatusChip";
import ActivityDetailView from "@/components/activity/ActivityDetailView";
import Toast from "@/components/common/Toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getRace, updateRace, deleteRace, getRaceImageUrl } from "@/lib/api/races";
import { useToast } from "@/lib/hooks/useToast";
import { Race, RaceFormData } from "@/lib/types";
import { toKST, distanceTypeLabel, formatTargetTime } from "@/lib/utils/format";

export default function RaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [race, setRace] = useState<Race | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const loadRace = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getRace(id);
      setRace(data);
    } catch {
      // handled by auth interceptor
    }
  }, [id]);

  useEffect(() => {
    loadRace();
  }, [loadRace]);

  const handleUpdate = async (data: RaceFormData) => {
    setSaving(true);
    try {
      await updateRace(id, data);
      showToast("대회 정보가 수정되었습니다", "success");
      setEditing(false);
      await loadRace();
    } catch {
      showToast("수정에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRace(id);
      showToast("대회가 삭제되었습니다", "success");
      router.push("/races");
    } catch {
      showToast("삭제에 실패했습니다", "error");
    }
    setConfirmDelete(false);
  };

  if (!race) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  const kstDate = toKST(race.race_date);

  return (
    <AppLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/races")}
        sx={{ mb: 2 }}
      >
        대회 목록으로
      </Button>

      {editing ? (
        <>
          <Typography variant="h4" sx={{ mb: 3 }}>
            대회 수정
          </Typography>
          <Card>
            <CardContent>
              <RaceForm
                initialData={{
                  race_name: race.race_name,
                  race_date: race.race_date,
                  location: race.location ?? "",
                  distance_type: race.distance_type,
                  distance_custom: race.distance_custom,
                  target_time: race.target_time,
                }}
                onSubmit={handleUpdate}
                loading={saving}
                submitLabel="수정"
              />
              <Button onClick={() => setEditing(false)} sx={{ mt: 1 }}>
                취소
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Typography variant="h4">{race.race_name}</Typography>
                <RaceStatusChip status={race.status} />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {kstDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
                {race.location ? ` · ${race.location}` : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
                sx={{ textTransform: "none" }}
              >
                수정
              </Button>
              <Button
                variant="contained"
                startIcon={<EmojiEventsIcon />}
                onClick={() => router.push(`/races/${race.id}/result`)}
                sx={{ textTransform: "none" }}
              >
                결과 입력
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
                sx={{ textTransform: "none" }}
              >
                삭제
              </Button>
            </Box>
          </Box>

          {/* Race Info Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                대회 정보
              </Typography>

              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">거리</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {distanceTypeLabel(race.distance_type)}
                    {race.distance_type === "custom" && race.distance_custom
                      ? ` (${(race.distance_custom / 1000).toFixed(1)}km)`
                      : ""}
                  </Typography>
                </Box>
                {race.target_time && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">목표 시간</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatTargetTime(race.target_time)}
                    </Typography>
                  </Box>
                )}
                {race.actual_time && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">완주 시간</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatTargetTime(race.actual_time)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Linked Activity */}
          {race.activity_id && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                연결된 활동
              </Typography>
              <ActivityDetailView activityId={race.activity_id} />
            </Box>
          )}

          {/* Review */}
          {race.review && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  후기
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {race.review}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Images (read-only gallery) */}
          {race.images.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  사진
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {race.images.map((img) => (
                    <Box
                      key={img.id}
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getRaceImageUrl(race.id, img.id)}
                        alt={img.original_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Toast toast={toast} onClose={closeToast} />

      <ConfirmDialog
        open={confirmDelete}
        title="대회를 삭제할까요?"
        message="삭제하면 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppLayout>
  );
}
