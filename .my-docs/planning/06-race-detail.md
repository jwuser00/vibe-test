# 06. Race Detail & Result - 대회 상세 / 결과 입력

## Screenshots

| Screen | File |
|--------|------|
| 대회 상세 | ![](../images/08-race-detail.png) |
| 결과 입력 | ![](../images/10-race-result.png) |

## Page: `/races/[id]`

개별 대회의 상세 정보를 조회, 수정, 삭제하는 페이지.

**네비게이션:**
- "← 대회 목록으로" 링크 → `/races`

### View Mode (기본)

**Header:**
- 대회명
- 상태 칩 (RaceStatusChip)
- 일시
- 장소

**Action Buttons:**
- "수정" → Edit Mode 전환
- "결과 입력" → `/races/[id]/result`
- "삭제" → ConfirmDialog → `DELETE /races/{id}` → `/races`로 이동

### 대회 정보 카드

| Field | Description |
|-------|-------------|
| 거리 | 풀마라톤/하프마라톤/10km/5km/커스텀 (km) |
| 목표 시간 | Nh Nm Ns 형식 (설정 시) |
| 완주 시간 | h:mm:ss (완주 시) |

### 연결된 활동 (Linked Activity)

대회에 활동이 연결되어 있을 경우 (`race.activity_id` 존재):
- `ActivityDetailView` 컴포넌트 전체 표시
  - 활동 요약 (거리, 시간, 페이스, HR, 케이던스)
  - 랩 분석 테이블
  - 페이스 & 심박수 차트

### 후기 (Review)

- 후기가 있을 경우 텍스트 표시

### 사진 갤러리

- 업로드된 이미지가 있을 경우 읽기 전용 갤러리 표시

### Edit Mode

- "수정" 버튼 클릭 시 `RaceForm` 컴포넌트로 전환 (initialData 전달)
- `PUT /races/{id}` (JSON)
- 수정 완료 후 View Mode로 복귀

---

## Page: `/races/[id]/result`

대회 결과를 입력하는 페이지.

**네비게이션:**
- "← 대회 상세로" 링크 → `/races/[id]`

### Sections

#### 1. 결과 (Status & Time)

| Field | Type | Description |
|-------|------|-------------|
| 상태 | select | 예정 / 완주 (Finished) / DNS (Did Not Start) / DNF (Did Not Finish) |
| 완주 시간 | h:m:s inputs | 시/분/초 개별 입력 |

#### 2. 활동 연결 (Activity Link)

두 가지 방법으로 활동을 연결:

**Tab 1: TCX 파일 업로드**
- 드래그앤드롭 영역
- `POST /races/{id}/upload-tcx` → 활동 자동 생성 + 연결
- 이미 연결된 활동이 있으면 재업로드 시 교체

**Tab 2: 기존 활동 선택**
- `ActivitySelector` 드롭다운
- 사용자의 전체 활동 목록에서 선택
- "연결 해제" 옵션

**연결 상태 표시:**
- 활동 연결 시: "활동이 연결되어 있습니다" + 거리/시간/페이스 요약 + "연결 해제" 링크

#### 3. 사진 (Race Images)

- `RaceImageUpload` 드래그앤드롭 컴포넌트
- 제한: 최대 5장, 각 5MB, PNG/JPG/JPEG만
- `POST /races/{id}/images` (multipart)
- 개별 삭제: `DELETE /races/{id}/images/{imageId}`
- UUID 기반 파일명으로 저장 (`uploads/races/{race_id}/{uuid}.{ext}`)

#### 4. 후기 (Review)

- 멀티라인 텍스트 영역
- placeholder: "대회 후기를 작성해주세요..."

### 저장

- "결과 저장" 버튼
- `PUT /races/{id}/result` (JSON: status, actual_time, activity_id, review)

## Backend API

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/races/{id}` | GET | Yes | - | `RaceOut` |
| `/races/{id}` | PUT | Yes | `RaceUpdate` JSON | `RaceOut` |
| `/races/{id}/result` | PUT | Yes | `RaceResultUpdate` JSON | `RaceOut` |
| `/races/{id}/upload-tcx` | POST | Yes | TCX file (multipart) | `RaceOut` |
| `/races/{id}` | DELETE | Yes | - | `{message}` |
| `/races/{id}/images` | POST | Yes | Image file (multipart) | `RaceImageOut` |
| `/races/{id}/images/{imageId}` | DELETE | Yes | - | `{message}` |
| `/races/{id}/images/{imageId}/file` | GET | No | - | FileResponse |

## DB Models

### Race
```
id, user_id(FK→User), race_name, race_date, location?,
distance_type(full/half/10km/5km/custom), distance_custom?,
target_time?, actual_time?, status(예정/완주/DNS/DNF),
activity_id(FK→Activity, nullable, SET NULL), review?
```

### RaceImage
```
id, race_id(FK→Race, CASCADE), filename(UUID), original_name, uploaded_at
```
