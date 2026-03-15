# 세션 요약: 러닝 계획 세션 카드 UI + LLM 버그 수정

- **날짜**: 2026-03-15 22:30
- **프로젝트**: gpt-run (Running Manager)
- **브랜치**: main

## 수행 작업

### 1. LLM max_tokens 부족 버그 수정
- `get_llm("high")` 호출 시 `max_tokens`가 500으로 설정되어 7일 러닝 계획 JSON이 잘리는 문제 해결
- high tier는 2048, low tier는 500으로 분리 설정
- JSON 파싱 fallback 강화: `{}`~`}` 범위 추출, list 타입 content 처리
- 상세 로깅 추가로 파싱 과정 디버깅 용이하게 개선

### 2. 러닝 계획 세션 카드 UI 변경
- `PlanCard`, `PlanSessionList` 삭제 → `PlanSessionCard` 신규 생성
- 세션 하나하나를 개별 카드로 표시 (ActivityCard와 유사한 Grid 레이아웃)
- `/plans` 페이지: `getPlans()` → `getActivePlan()`으로 변경, 세션 카드 그리드 직접 표시
- `/plans/[id]` 페이지: `llm_plan_text` "AI 코칭" 카드 제거, 세션 카드 그리드로 변경

### 3. Docker 환경 변수 전달 누락 수정
- `docker-compose.yml`에 LLM 관련 환경 변수 7개 추가 (ANTHROPIC_API_KEY, LLM 모델, Langfuse 등)
- 프로덕션에서만 AI 분석이 실패하던 근본 원인 해결

### 4. 프로덕션 배포
- `deploy.sh`로 OCI ARM 서버에 배포 완료

## 변경 파일

| 타입 | 파일 | 설명 |
|------|------|------|
| Modified | `backend/services/llm/models.py` | get_llm에 max_tokens 파라미터 추가, high=2048 |
| Modified | `backend/services/llm/plan_graph.py` | JSON 파싱 fallback 강화, list content 처리, 상세 로깅 |
| Modified | `frontend-ts/app/plans/page.tsx` | 세션 카드 그리드로 전면 변경 |
| Modified | `frontend-ts/app/plans/[id]/page.tsx` | llm_plan_text 제거, 세션 카드 그리드 |
| Added | `frontend-ts/components/plan/PlanSessionCard.tsx` | 개별 세션 카드 컴포넌트 |
| Deleted | `frontend-ts/components/plan/PlanCard.tsx` | 계획 요약 카드 (대체됨) |
| Deleted | `frontend-ts/components/plan/PlanSessionList.tsx` | 세션 리스트 (대체됨) |
| Modified | `docker-compose.yml` | LLM 환경 변수 7개 추가 |
| Modified | `.my-docs/planning/08-llm-coaching.md` | 구현 상태 업데이트 |

## Git 커밋

| 해시 | 메시지 |
|------|--------|
| 2a3c27c | fix: Docker에 LLM 환경 변수 전달 누락 수정 |
| 13e92c9 | feat: 러닝 계획 세션 카드 UI + LLM max_tokens 버그 수정 |

## 남은 작업

- [ ] 프로덕션에서 계획 생성 후 세션 카드가 정상 표시되는지 확인
- [ ] 서버 로그로 JSON 파싱 성공 여부 검증
