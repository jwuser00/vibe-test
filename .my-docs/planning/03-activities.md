# 03. Activities - 내 활동

## Screenshots

| Screen | File |
|--------|------|
| 활동 목록 | ![](../images/05-activities-list.png) |

## Page: `/activities`

TCX 파일 업로드와 활동 목록 조회를 제공하는 메인 활동 관리 페이지.

## Sections

### 1. TCX 파일 업로드 (ActivityUpload)

GPS 워치에서 추출한 TCX 파일을 드래그앤드롭 또는 클릭으로 업로드.

**UI 구성:**
- 드래그앤드롭 영역 (클릭 가능)
- "TCX 파일 업로드" 라벨
- 업로드 중 프로그레스 스피너 표시

**동작:**
1. TCX 파일 선택 또는 드래그앤드롭
2. `.tcx` 확장자 검증
3. `POST /activities/upload` (multipart/form-data)
4. 성공 → 성공 토스트 + 목록 새로고침
5. 중복 (409) → 경고 토스트 "이미 업로드된 활동입니다"
6. 실패 → 에러 토스트

### 2. 활동 필터 (ActivityFilters)

연도와 월로 활동을 필터링.

**UI 구성:**
- 연도 칩: "전체", 2024, 2025, 2026 등 (활동이 존재하는 연도)
- 월 칩: "전체", 1~12월 (선택된 연도에 활동이 존재하는 월)
- 연도 선택 시 월 필터 초기화 (cascading)

**동작:**
- 전체 활동을 프론트엔드에서 필터링 (API는 전체 반환)
- 연도 선택 → 해당 연도의 활동만 표시 + 월 칩 갱신
- 월 선택 → 해당 월의 활동만 표시

### 3. 활동 카드 그리드 (ActivityCard)

필터링된 활동을 카드 형태로 표시.

**UI 구성:**
- 반응형 그리드: xs=12, sm=6, md=4
- 각 카드 표시 항목:
  - 날짜/시간 (KST 변환)
  - 총 거리 (km)
  - 총 시간 (h:mm:ss)
  - 평균 페이스 (/km)
  - 평균 심박수 (bpm)
  - 평균 케이던스 (spm)
- 삭제 버튼 → ConfirmDialog → `DELETE /activities/{id}`
- 카드 클릭 → `/activity/[id]`

**정렬:** start_time 내림차순 (최신 순)

## Backend API

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/activities/upload` | POST | Yes | TCX file (multipart) | `List[Activity]` |
| `/activities/` | GET | Yes | `skip`, `limit` (query) | `List[Activity]` |
| `/activities/{id}` | DELETE | Yes | - | `{message}` |

## TCX Parsing Logic

**지원 포맷:** Garmin TrainingCenterDatabase v2 XML

**추출 항목:**
- Activity: start_time, total_distance(m), total_time(s), avg_pace(s/km), avg_hr(bpm), avg_cadence
- Lap: lap_number, distance(m), time(s), pace(s/km), avg_hr, max_hr, avg_cadence

**중복 감지:** `(user_id, start_time)` 조합으로 판단 → 409 Conflict

**Garmin Extensions:** ns3 RunCadence 지원 (표준 Cadence 우선, 없으면 Extensions 사용)
