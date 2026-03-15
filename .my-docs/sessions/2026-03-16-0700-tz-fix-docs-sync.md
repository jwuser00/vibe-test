# 세션 요약: KST 타임존 버그 수정 및 기획 문서 동기화

- **날짜**: 2026-03-16 07:00
- **프로젝트**: Running Manager (gpt-run)
- **브랜치**: main

## 수행 작업

### 1. 기획 문서 Implementation Status 전수 점검 및 업데이트
- `.my-docs/planning/` 내 6개 문서의 Implementation Status를 실제 코드와 비교하여 동기화
- 총 30개 항목을 Not Implemented / Partially Implemented → Implemented로 업데이트
- 현재 모든 기획 항목이 Implemented 상태로 확인됨

### 2. ActivePlanCard 오늘 날짜 판단 KST 타임존 버그 수정
- `new Date().toISOString().split("T")[0]`이 UTC 기준으로 날짜를 계산하여 KST 오전 9시 이전에는 전날로 판단되는 버그
- 로컬 타임존 기반(`getFullYear/getMonth/getDate`)으로 변경

### 3. LLM 계획 프롬프트에 캘린더 참조 추가
- LLM이 날짜/요일을 직접 계산하지 않도록 오늘부터 21일간 날짜+요일 목록을 프롬프트에 제공
- 프롬프트에 오늘 요일 명시, "캘린더에서 골라 사용하세요" 규칙 추가
- `plan_graph.py`에서 `today_weekday`, `calendar_lines` 생성 로직 추가

## 변경 파일

| 타입 | 파일 | 설명 |
|------|------|------|
| Modified | `.my-docs/planning/00-overview.md` | Feature Matrix 7개 항목 Implemented로 업데이트 |
| Modified | `.my-docs/planning/01-auth.md` | 13개 항목 Implemented로 업데이트 |
| Modified | `.my-docs/planning/03-activities.md` | 2개 항목 Implemented로 업데이트 |
| Modified | `.my-docs/planning/04-activity-detail.md` | 5개 항목 Implemented로 업데이트 |
| Modified | `.my-docs/planning/07-profile.md` | 4개 항목 Implemented로 업데이트 |
| Modified | `.my-docs/planning/08-llm-coaching.md` | 3개 항목 Partially → Implemented 업데이트 |
| Modified | `frontend-ts/components/plan/ActivePlanCard.tsx` | toISOString(UTC) → 로컬 타임존 날짜 계산 |
| Modified | `backend/prompts/plan.txt` | 캘린더 참조 섹션 및 요일 정보 추가 |
| Modified | `backend/services/llm/plan_graph.py` | 21일 캘린더 라인 생성 로직 추가 |

## Git 커밋

| 해시 | 메시지 |
|------|--------|
| 947c82f | fix: 오늘 날짜 판단 KST 타임존 버그 수정 및 기획 문서 Implementation Status 동기화 |

## 남은 작업

- 없음
