# 기능 요구 사항

## 핵심 기능 (초기 요구 사항)
- 러닝 매니저먼트 앱이야.
- 회원 가입을 받아줘. 이메일 / 패스 워드 정도만 받으면 되.
    - 패스워드는 2개 입력해서 확인해줘. ⚠️ **미구현** — 현재 단일 패스워드 입력만 존재
- tcx 파일을 업로드 할 수 있도록 해줘. 해당 tcx 받으면 ✅
    - 해당 러닝 정보에 대해서, 시간, 거리, 평균 페이스, 평균 심박수를 보여줘. ✅
    - 1km 단위 또는 Lap 단위로 시간, 거리, 페이스, 케이던시, 평균 심박수, 최대 심박수를 보여줘. ✅
- 모든 정보는 DB에 저장해줘 ✅

## 추가 구현된 기능 (초기 요구 사항 외)
- **드래그 앤 드롭 업로드**: 파일을 끌어다 놓아 TCX 업로드 가능 ✅
- **중복 업로드 방지**: (user_id, start_time) 기준 중복 감지 → 409 Conflict ✅
- **활동 삭제**: 개별 활동 삭제 (확인 모달 포함), 연관 랩 데이터 Cascade 삭제 ✅
- **연/월 필터**: 대시보드에서 연도, 월별로 활동 필터링 ✅
- **차트 시각화**: Recharts 라인 차트로 랩별 페이스/심박수 추이 표시 (이중 Y축) ✅
- **세션 만료 처리**: 401 응답 시 Portal 기반 모달로 안내 후 로그인 페이지로 이동 ✅
- **토스트 알림**: 업로드 성공/경고/에러 토스트 메시지 (2.5초 자동 소멸) ✅
- **시간대 변환**: UTC → KST (+9시간) 변환하여 표시 ✅
- ~~**AI 운동 분석**: LangGraph + Google Gemini로 한국어 운동 분석/코칭 피드백~~ ❌ **삭제됨**

# 구현 요구 사항

## 기술 스택 ✅
- 코드를 제외한 모든 산출물 문서는 한글로 작성해줘. ✅
- 프론트는 react, Backend는 fast api로 만들어줘. ✅
    - Frontend: React 19, Vite, React Router v7, Axios, Recharts, Lucide React
    - Backend: FastAPI, SQLAlchemy, python-jose (JWT), bcrypt, lxml
- Docker로 실행 시킬 수 있도록 해줘. ✅
- Docker가 아닌 로컬에서도 실행할 거야. ✅

## Node 관련 ✅
- 버전은 24.11.1로 해줘 ✅ (.node-version 파일)
- 로컬에서는 fnm으로 관리 되도록 해줘. fnm은 이미 깔려 있어. ✅
- 실제 배포시에는 적당한 도커 이미지를 선택하고 굳이 fnm으로 node 버전을 관리할 필요가 없어. ✅ (node:24-alpine)
- node package 관리는 npm으로 해줘. ✅

## Python 관련 ✅
- python version은 3.11.14 해줘. ✅ (.python-version 파일)
- 로컬에는 pyenv, poetry로 관리 되도록 해줘. pyenv 및 3.11.14는 이미 깔려 있어. ✅
- 로컬에는 pyenv, poetry가 이미 설치 되어져 있어. ✅
- 실제 배포시에는 적당한 도커 이미지를 선택하고, 기본 pip(requirements.txt)를 사용해줘. ✅ (python:3.11-slim)

## 기타 ✅
- 내가 Docker로 바로 실행 하는 방법을 알 수 있게 README를 작성해줘. ✅
- DB는 SQLite를 사용해줘. ✅ (backend/sql_app.db)

# 현재 아키텍처 요약

## Backend 구조 (`backend/`)
| 파일 | 역할 |
|------|------|
| `main.py` | 앱 초기화, CORS, 라우터 등록, DB 테이블 생성 |
| `database.py` | SQLAlchemy 엔진 + 세션 팩토리 (SQLite) |
| `models.py` | ORM 모델: User → Activity → Lap (Cascade 삭제) |
| `schemas.py` | Pydantic 요청/응답 스키마 |
| `auth.py` | JWT 인증 (HS256, 30분 만료), bcrypt 해싱 |
| `tcx_parser.py` | lxml 기반 TCX XML 파서 |
| `routers/users.py` | 회원가입, 로그인 엔드포인트 |
| `routers/activities.py` | TCX 업로드, 활동 목록/조회/삭제 |

## Frontend 구조 (`frontend/src/`)
| 파일 | 역할 |
|------|------|
| `App.jsx` | 라우트 정의 + PrivateRoute 인증 가드 |
| `api.js` | Axios 인스턴스, 토큰 인터셉터, 401 처리 |
| `pages/Login.jsx` | 로그인 폼 |
| `pages/Register.jsx` | 회원가입 폼 |
| `pages/Dashboard.jsx` | 활동 목록, TCX 업로드, 연/월 필터 |
| `pages/ActivityDetail.jsx` | 활동 상세, 랩 테이블, 차트 |
| `components/Layout.jsx` | 사이드바 네비게이션 앱 셸 |
| `components/ActivityCard.jsx` | 활동 카드 컴포넌트 |
| `components/AuthErrorModal.jsx` | 세션 만료 모달 (Portal) |

## UI/테마
- SB Admin 2 (Bootstrap 기반 라이트 테마)
- CSS 커스텀 속성 기반 테마링
- Bootstrap CDN (`index.html`)

## Docker 구성
- Backend: `python:3.11-slim`, requirements.txt, uvicorn :8000
- Frontend: Node 24-alpine 빌드 → nginx-alpine 서빙 :80 (→ :3000 매핑)
- `docker-compose up --build` 로 전체 스택 실행

---

# 25.2.7 react converting

- 현재 있는 front를 type-script로 컨버팅해야되.
- 기존 프로젝트는 그대로 두고 frontend-ts으로 하나 프로젝트를 생성해서 만들어줘.
- front-ts에 컨버팅해서 만들어줘. 추후에는 frontend 폴더는 지울 거니까. frontend를 참조하지 않게 해줘.
- react / typescript / nextjs를 사용해서 만들어줘.
- docker-compose에 (frontend-ts / backend)로도 동작 할 수 있도록 만들어줘.
- 기존 ui kit은 무시하고 MUI 기반 + props 중심 API으로 만들어줘. mui 기본 템플릿 UI여도 좋아.
- 요구한 기술 스택의 디자인, 구현 원칙을 지키되. 쉬운 코드로 작성해줘.

# 25.2.8 기능 추가

## 대회 데이터 입력

### 요구 사항
- 마라톤 대회의 계획 및 결과를 입력 할 수 있는 메뉴 및 기능을 추가
- 앞으로 있을 대회에 대한 데이터 입력
    - 대회명
    - 일자 일시, 지역
    - 거리( full, half, 10km, 5km, 직접 입력)
    - 목표 시간
- 완주한 대회에 대한 데이터 입력
    - Activity와 동일하게 tcx 파일 업로드
    - 완주증을 비롯한 png, jpeg 이미지 1~5장
    - 개인 리뷰

## My Activities

### 요구 사항
- 현재 `대시보드`에 있는 있는 My Activities를 Activities에 메뉴로 분리
- 아래 별도의 대시 보드를 페이지를 생성

## 대시 보드

### 요구 사항
- 전체적인 내용을 볼 수 있는 대시 보드
- 앞으로 다가오는 대회 2개 요약본 표시
- 이번달 달리기 그래프 표시 (x축 - 날짜 / y축 거리, 평균 페이스)
    - 거리 및 페이스는 데이터를 가장 잘 보여 주도록 표시, 굳이 0~100km 이렇게 하지 말고, 만약 5, 10, 20, 15 뛰었다면 0~25km 이렇게..
- 최근 activity 5개 표시

# 25.2.8 요구 사항 수정 #1

## 대시 보드
- 대회 클릭 하면 대회 상세 페이지로 이동
- 이번달 그래프에는 모든 날짜가 표시 되고 내가 달린 날이 표시 되게 해줘. 안 달린 날이 명시적으로 보여야지 자극 받지.
- 그리고 그래프 하단에 최근 activity 5개 표시 안 되고 있어. 리스트로 표시 되게 해줘.

## 대회 데이터 입력
- 등록 할 때는 활동 연결, 후기가 있을 수가 없지.. 이제 막 등록하는 건데..
- 대회 상세 페이지 들어가면, 일단 모든 데이터가 다 보이고, "수정" / "결과 입력"을 할 수 있도록 해줘.
- "수정" - 처음 등록 할 때, 그 화면.
- "결과 입력" - 상태 입력, 결과 시간 입력, 사진 입력, tcx 등록(activity에도 올라감, 만약 올린 파일이 activity에 있으면 바로 연결), 후기 입력 - 수정도 가능

# 25.2.8 요구 사항 수정 #2

## 결과 입력 페이지 - 활동 연결 개선
- TCX 파일 업로드를 Activity 페이지와 동일하게 드래그앤드롭으로 구현
- TCX 업로드 외에 기존 Activity를 선택하여 대회에 연결할 수 있도록 구현
- 탭으로 "TCX 파일 업로드" / "기존 활동 선택" 전환

## 연결된 활동 상세 표시
- 대회 상세 페이지에서 연결된 활동의 모든 정보를 표시 (활동 요약, 랩 분석, 페이스&심박수 차트)
- Activity 상세 페이지와 동일한 정보를 보여주도록 공통 컴포넌트(ActivityDetailView)로 분리하여 양쪽에서 재사용
