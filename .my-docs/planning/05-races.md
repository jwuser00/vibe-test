# 05. Races - 대회 관리

## Screenshots

| Screen | File |
|--------|------|
| 대회 목록 | ![](../images/07-races-list.png) |
| 새 대회 등록 | ![](../images/09-race-new.png) |

## Page: `/races`

대회 목록을 조회하고 새 대회를 등록하는 페이지.

### 상태 필터

대회 상태별 토글 버튼으로 필터링.

| Status | Label | Color |
|--------|-------|-------|
| (all) | 전체 | default |
| 예정 | 예정 | primary (blue) |
| 완주 | 완주 | success (green) |
| DNS | DNS | warning (orange) |
| DNF | DNF | error (red) |

**동작:**
- 필터 선택 시 `GET /races/?status={status}` 호출
- "전체" 선택 시 파라미터 없이 호출
- 대회 없을 시 필터별 빈 상태 메시지 표시

### 대회 카드 (RaceCard)

**UI 구성:**
- 반응형 그리드: xs=12, sm=6, md=4
- 각 카드 표시 항목:
  - 대회명
  - 상태 칩 (RaceStatusChip: 색상별 구분)
  - 일시 (YYYY년 M월 D일)
  - 장소
  - 거리 타입 (풀마라톤/하프마라톤/10km/5km/커스텀)
- 카드 클릭 → `/races/[id]`

**정렬:** race_date 내림차순

### 새 대회 등록 버튼

- 우측 상단 "+ 새 대회 등록" 버튼 → `/races/new`

---

## Page: `/races/new`

새 대회를 등록하는 폼 페이지.

**네비게이션:**
- "← 대회 목록으로" 링크 → `/races`

### RaceForm 필드

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| 대회명 | text | Yes | 대회 이름 |
| 대회 일시 | datetime-local | Yes | 대회 날짜/시간 |
| 장소 | text | No | 대회 장소 |
| 거리 | select | Yes | 풀마라톤/하프마라톤/10km/5km/커스텀 |
| 커스텀 거리 | number | (if custom) | 커스텀 선택 시 표시, 미터 단위 |
| 목표 시간 | h:m:s inputs | No | 시/분/초 개별 입력 |

**동작:**
1. 폼 입력 후 "등록" 클릭
2. `POST /races/` (JSON)
3. 성공 → `/races/[id]`로 리다이렉트
4. 실패 → 에러 표시

## Backend API

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/races/` | GET | Yes | `status` (optional query) | `List[RaceOut]` |
| `/races/` | POST | Yes | `RaceCreate` JSON | `RaceOut` |

**DistanceType Enum:** `full`, `half`, `10km`, `5km`, `custom`

**RaceStatus Enum:** `예정`, `완주`, `DNS`, `DNF`
