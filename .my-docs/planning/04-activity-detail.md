# 04. Activity Detail - 활동 상세

## Screenshots

| Screen | File |
|--------|------|
| 활동 상세 | ![](../images/06-activity-detail.png) |

## Page: `/activity/[id]`

개별 러닝 활동의 상세 정보를 확인하는 페이지.

**네비게이션:**
- "← 내 활동으로 돌아가기" 링크 → `/activities`

## Sections

### 1. 활동 요약 (ActivityStats)

5개의 주요 지표를 카드 형태로 표시.

| Metric | Label | Unit | Example |
|--------|-------|------|---------|
| Total Distance | Total Distance | km | 7.82 km |
| Total Time | Total Time | h:mm:ss | 44:09 |
| Avg Pace | Avg Pace | /km | 5:38 /km |
| Avg HR | Avg HR | bpm | 159 bpm |
| Avg Cadence | Avg Cadence | spm | 84 spm |

### 2. 랩 분석 (LapTable)

각 랩의 상세 데이터를 테이블로 표시.

| Column | Unit |
|--------|------|
| Lap (번호) | # |
| Distance | km |
| Time | mm:ss |
| Pace | /km |
| Avg HR | bpm |
| Max HR | bpm |
| Cadence | spm |

### 3. 페이스 & 심박수 차트 (PaceHRChart)

Recharts 이중축 라인 차트.

**구성:**
- X축: 랩 번호
- 좌측 Y축: Pace (sec/km) — 파란색 라인, 값이 낮을수록 빠름 (역전 스케일)
- 우측 Y축: HR (bpm) — 빨간색 라인
- 툴팁: 랩 번호, 페이스, 심박수

## Backend API

| Endpoint | Method | Auth | Response |
|----------|--------|------|----------|
| `/activities/{id}` | GET | Yes | `Activity` (with laps) |

**Activity 응답 구조:**
```json
{
  "id": 1,
  "user_id": 1,
  "start_time": "2025-11-16T00:00:00",
  "total_distance": 7820.0,
  "total_time": 2649.0,
  "avg_pace": 338.0,
  "avg_hr": 159.0,
  "avg_cadence": 84.0,
  "laps": [
    {
      "id": 1,
      "activity_id": 1,
      "lap_number": 1,
      "distance": 2050.0,
      "time": 720.0,
      "pace": 351.0,
      "avg_hr": 151,
      "max_hr": 165,
      "avg_cadence": 84
    },
    ...
  ]
}
```

## Data Units

| Field | Storage Unit | Display Unit |
|-------|-------------|-------------|
| distance | meters | km (÷1000) |
| time | seconds | h:mm:ss or mm:ss |
| pace | seconds/km | m:ss /km |
| hr | bpm | bpm |
| cadence | spm | spm |
